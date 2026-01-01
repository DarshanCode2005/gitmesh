import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/ai/prioritize-issues
 * @summary AI-powered issue prioritization
 * @tag DevTel AI
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { issueIds } = req.body

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        throw new Error400(req.language, 'devtel.ai.issueIdsRequired')
    }

    // Get issues to prioritize
    const issues = await req.database.devtelIssues.findAll({
        where: {
            id: issueIds,
            deletedAt: null,
        },
        attributes: ['id', 'title', 'description', 'priority', 'status', 'storyPoints'],
    })

    // TODO: Call CrewAI service for actual prioritization
    // For now, return a mock implementation based on simple heuristics

    const prioritized = issues
        .map(issue => {
            const urgencyScore = calculateUrgencyScore(issue)
            return {
                issueId: issue.id,
                title: issue.title,
                currentPriority: issue.priority,
                suggestedPriority: determinePriority(urgencyScore),
                urgencyScore,
                reasoning: generateReasoning(issue, urgencyScore),
            }
        })
        .sort((a, b) => b.urgencyScore - a.urgencyScore)

    // Log the AI tool call
    await req.database.devtelMcpToolCalls.create({
        agentId: 'prioritization-agent',
        toolName: 'prioritize_issues',
        arguments: { issueIds },
        resultSummary: `Prioritized ${issues.length} issues`,
        status: 'completed',
        duration: 100, // Mock duration
        createdAt: new Date(),
    })

    await req.responseHandler.success(req, res, {
        prioritized,
        jobId: null, // No async job for now
    })
}

function calculateUrgencyScore(issue: any): number {
    let score = 0

    // Priority scoring
    switch (issue.priority) {
        case 'urgent': score += 80; break
        case 'high': score += 60; break
        case 'medium': score += 40; break
        case 'low': score += 20; break
    }

    // Story points add complexity weight
    if (issue.storyPoints) {
        score += Math.min(issue.storyPoints * 2, 20)
    }

    return score
}

function determinePriority(score: number): string {
    if (score >= 80) return 'urgent'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
}

function generateReasoning(issue: any, score: number): string {
    const reasons = []
    if (issue.priority === 'urgent' || issue.priority === 'high') {
        reasons.push('Marked as high priority')
    }
    if (issue.storyPoints > 5) {
        reasons.push('Large story point estimate')
    }
    return reasons.length ? reasons.join('; ') : 'Standard priority based on metadata'
}
