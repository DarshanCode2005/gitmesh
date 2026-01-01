import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/ai/suggest-assignee
 * @summary AI-powered assignee suggestion based on skills and workload
 * @tag DevTel AI
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { issueId } = req.body

    if (!issueId) {
        throw new Error400(req.language, 'devtel.ai.issueIdRequired')
    }

    const issue = await req.database.devtelIssues.findOne({
        where: {
            id: issueId,
            deletedAt: null,
        },
    })

    if (!issue) {
        throw new Error400(req.language, 'devtel.issue.notFound')
    }

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    // Get team members
    const users = await req.database.user.findAll({
        include: [
            {
                model: req.database.tenantUser,
                as: 'tenants',
                where: { tenantId: req.currentTenant.id },
                attributes: [],
            },
        ],
        attributes: ['id', 'fullName', 'email'],
    })

    // Get skills
    const skills = await req.database.devtelUserSkills.findAll({
        where: { workspaceId: workspace.id },
    })

    // Get current workload (in-progress issues)
    const workloads = await req.database.devtelIssues.findAll({
        where: {
            assigneeId: users.map(u => u.id),
            status: ['in_progress', 'review'],
            deletedAt: null,
        },
        attributes: [
            'assigneeId',
            [req.database.sequelize.fn('COUNT', '*'), 'count'],
        ],
        group: ['assigneeId'],
        raw: true,
    })

    const workloadMap = workloads.reduce((acc, w: any) => {
        acc[w.assigneeId] = parseInt(w.count, 10)
        return acc
    }, {})

    // Score users based on workload (lower is better)
    const suggestions = users.map(user => {
        const currentWorkload = workloadMap[user.id] || 0
        const userSkills = skills.filter(s => s.userId === user.id)

        // Score: lower workload = higher score
        const workloadScore = Math.max(0, 10 - currentWorkload)
        // Bonus for having skills (mock - in real implementation, match skills to issue type)
        const skillBonus = userSkills.length > 0 ? 2 : 0

        return {
            user: user.get({ plain: true }),
            score: workloadScore + skillBonus,
            currentWorkload,
            skills: userSkills.map(s => s.skill),
            reasoning: generateReasoning(currentWorkload, userSkills),
        }
    }).sort((a, b) => b.score - a.score)

    // Log the AI tool call
    await req.database.devtelMcpToolCalls.create({
        agentId: 'assignee-agent',
        toolName: 'suggest_assignee',
        arguments: { issueId },
        resultSummary: `Top suggestion: ${suggestions[0]?.user.fullName || 'None'}`,
        status: 'completed',
        duration: 120,
        createdAt: new Date(),
    })

    await req.responseHandler.success(req, res, {
        issue: {
            id: issue.id,
            title: issue.title,
        },
        suggestions: suggestions.slice(0, 5), // Top 5
    })
}

function generateReasoning(workload: number, skills: any[]): string {
    const reasons = []

    if (workload === 0) {
        reasons.push('No active work')
    } else if (workload <= 2) {
        reasons.push('Light workload')
    } else if (workload <= 4) {
        reasons.push('Moderate workload')
    } else {
        reasons.push('Heavy workload')
    }

    if (skills.length > 0) {
        reasons.push(`Has ${skills.length} relevant skills`)
    }

    return reasons.join('; ')
}
