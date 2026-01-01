/**
 * DevTel AI Service - Orchestrates AI workflows via CrewAI
 */

import { LoggerBase } from '@gitmesh/logging'
import { IServiceOptions } from '../IServiceOptions'
import axios from 'axios'

const CREWAI_URL = process.env.CREWAI_SERVICE_URL || 'http://localhost:8001'
const CREWAI_TOKEN = process.env.CREWAI_SERVICE_TOKEN || 'dev-token'

export default class DevtelAiService extends LoggerBase {
    options: IServiceOptions
    client: any

    constructor(options: IServiceOptions) {
        super(options.log)
        this.options = options
        this.client = axios.create({
            baseURL: CREWAI_URL,
            timeout: 120000,
            headers: {
                'X-Service-Token': CREWAI_TOKEN,
                'Content-Type': 'application/json',
            },
        })
    }

    /**
     * Prioritize issues using AI
     */
    async prioritizeIssues(issueIds: string[]) {
        const issues = await this.options.database.devtelIssues.findAll({
            where: { id: issueIds, deletedAt: null },
            attributes: ['id', 'title', 'priority', 'storyPoints', 'type'],
        })

        const response = await this.callWorkflow('prioritize', {
            issues: issues.map((i: any) => i.get({ plain: true })),
        })

        // Log the call
        await this.logToolCall('prioritize-agent', 'prioritize_issues', { issueIds }, response)

        return response
    }

    /**
     * Suggest issues for a sprint based on capacity
     */
    async suggestSprint(data: { projectId: string; targetCapacity: number }) {
        const backlog = await this.options.database.devtelIssues.findAll({
            where: {
                projectId: data.projectId,
                status: 'backlog',
                cycleId: null,
                deletedAt: null,
            },
            attributes: ['id', 'title', 'priority', 'storyPoints', 'type'],
            order: [['priority', 'ASC']],
            limit: 50,
        })

        const response = await this.callWorkflow('suggest-sprint', {
            backlog: backlog.map((i: any) => i.get({ plain: true })),
            targetCapacity: data.targetCapacity,
        })

        await this.logToolCall('sprint-planner', 'suggest_sprint', data, response)

        return response
    }

    /**
     * Break down an issue into subtasks
     */
    async breakdownIssue(issueId: string) {
        const issue = await this.options.database.devtelIssues.findOne({
            where: { id: issueId, deletedAt: null },
        })

        if (!issue) {
            throw new Error('Issue not found')
        }

        const response = await this.callWorkflow('breakdown', {
            issue: {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                type: issue.type,
                storyPoints: issue.storyPoints,
            },
        })

        await this.logToolCall('breakdown-agent', 'breakdown_issue', { issueId }, response)

        return response
    }

    /**
     * Suggest best team member for an issue
     */
    async suggestAssignee(issueId: string, projectId: string) {
        const issue = await this.options.database.devtelIssues.findOne({
            where: { id: issueId, deletedAt: null },
        })

        if (!issue) {
            throw new Error('Issue not found')
        }

        const team = await this.options.database.devtelTeamMembers.findAll({
            where: { projectId, deletedAt: null },
            include: [
                {
                    model: this.options.database.user,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email'],
                },
            ],
        })

        const response = await this.callWorkflow('suggest-assignee', {
            issue: {
                id: issue.id,
                title: issue.title,
                type: issue.type,
            },
            team: team.map((m: any) => ({
                id: m.user?.id,
                name: m.user?.fullName,
                currentWorkload: m.currentWorkload || 0,
            })),
        })

        await this.logToolCall('assignee-agent', 'suggest_assignee', { issueId }, response)

        return response
    }

    /**
     * Generate a product spec/PRD using AI
     */
    async generateSpec(data: { title: string; description?: string; projectId?: string }) {
        const response = await this.callWorkflow('generate-spec', {
            title: data.title,
            description: data.description || '',
        })

        await this.logToolCall('spec-generator', 'generate_spec', data, response)

        // Optionally save as a new spec
        if (data.projectId && response.content) {
            const spec = await this.options.database.devtelSpecs.create({
                projectId: data.projectId,
                title: data.title,
                content: response.content,
                status: 'draft',
                authorId: this.options.currentUser?.id,
            })
            response.specId = spec.id
        }

        return response
    }

    // ============================================
    // Helper methods
    // ============================================

    private async callWorkflow(workflow: string, input: any) {
        try {
            const response = await this.client.post(`/workflows/${workflow}`, {
                workspaceId: this.options.currentTenant?.id || 'unknown',
                userId: this.options.currentUser?.id || 'unknown',
                input,
            })
            return response.data
        } catch (error: any) {
            this.log.error(`AI workflow ${workflow} failed:`, error.message)
            throw new Error(`AI workflow failed: ${error.message}`)
        }
    }

    private async logToolCall(agentId: string, toolName: string, args: any, result: any) {
        try {
            await this.options.database.devtelMcpToolCalls.create({
                agentId,
                toolName,
                arguments: args,
                resultSummary: JSON.stringify(result).substring(0, 500),
                status: 'completed',
                duration: 0,
                createdAt: new Date(),
            })
        } catch (e) {
            // Don't fail if logging fails
            this.log.warn('Failed to log AI tool call:', e)
        }
    }
}
