import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/ai/breakdown-issue
 * @summary AI-powered issue breakdown into subtasks
 * @tag DevTel AI
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

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

    // TODO: Call CrewAI for intelligent breakdown
    // For now, generate mock subtasks based on issue type

    const subtasks = generateMockSubtasks(issue)

    // Log the AI tool call
    await req.database.devtelMcpToolCalls.create({
        agentId: 'breakdown-agent',
        toolName: 'breakdown_issue',
        arguments: { issueId },
        resultSummary: `Generated ${subtasks.length} subtask suggestions`,
        status: 'completed',
        duration: 200,
        createdAt: new Date(),
    })

    await req.responseHandler.success(req, res, {
        parentIssue: {
            id: issue.id,
            title: issue.title,
            storyPoints: issue.storyPoints,
        },
        suggestedSubtasks: subtasks,
    })
}

function generateMockSubtasks(issue: any): any[] {
    const title = issue.title.toLowerCase()
    const subtasks = []

    // Generic development subtasks
    subtasks.push({
        title: `Research and planning for: ${issue.title}`,
        suggestedPoints: 1,
        type: 'bug',
    })

    subtasks.push({
        title: `Implementation: ${issue.title}`,
        suggestedPoints: Math.ceil((issue.storyPoints || 2) * 0.6),
        type: 'story',
    })

    subtasks.push({
        title: `Testing: ${issue.title}`,
        suggestedPoints: Math.ceil((issue.storyPoints || 2) * 0.3),
        type: 'bug',
    })

    subtasks.push({
        title: `Documentation update for: ${issue.title}`,
        suggestedPoints: 1,
        type: 'chore',
    })

    return subtasks
}
