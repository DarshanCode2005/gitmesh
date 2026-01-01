/**
 * DevTel Service - Core service for DevTel workspace management
 */

import { Error400 } from '@gitmesh/common'
import { LoggerBase } from '@gitmesh/logging'
import { IServiceOptions } from '../IServiceOptions'
import SequelizeRepository from '../../database/repositories/sequelizeRepository'

export default class DevtelWorkspaceService extends LoggerBase {
    options: IServiceOptions

    constructor(options: IServiceOptions) {
        super(options.log)
        this.options = options
    }

    /**
     * Get or create the DevTel workspace for the current tenant
     * Workspaces are 1:1 with tenants
     */
    async getOrCreate() {
        const transaction = await SequelizeRepository.createTransaction(this.options)

        try {
            const tenantId = this.options.currentTenant.id

            // Check if workspace exists
            let workspace = await this.options.database.devtelWorkspaces.findOne({
                where: {
                    tenantId,
                    deletedAt: null,
                },
                transaction,
            })

            if (!workspace) {
                // Create default workspace
                workspace = await this.options.database.devtelWorkspaces.create(
                    {
                        tenantId,
                        name: this.options.currentTenant.name || 'Default Workspace',
                        settings: {},
                        createdById: this.options.currentUser?.id,
                    },
                    { transaction },
                )

                // Create default workspace settings
                await this.options.database.devtelWorkspaceSettings.create(
                    {
                        workspaceId: workspace.id,
                        defaultCycleLength: 14,
                        workingHoursPerDay: 8.0,
                        issueTypes: ['story', 'bug', 'task', 'epic'],
                        priorities: ['urgent', 'high', 'medium', 'low'],
                        statuses: ['backlog', 'todo', 'in_progress', 'review', 'done'],
                        customFields: [],
                    },
                    { transaction },
                )

                // Create default agent settings
                await this.options.database.devtelAgentSettings.create(
                    {
                        workspaceId: workspace.id,
                        enabledAgents: ['prioritize', 'breakdown', 'suggest-assignee'],
                        temperature: 0.7,
                        approvalRequired: true,
                        customPrompts: {},
                    },
                    { transaction },
                )
            }

            await SequelizeRepository.commitTransaction(transaction)

            return this.findById(workspace.id)
        } catch (error) {
            await SequelizeRepository.rollbackTransaction(transaction)
            throw error
        }
    }

    /**
     * Find workspace by ID with settings
     */
    async findById(id: string) {
        const workspace = await this.options.database.devtelWorkspaces.findOne({
            where: {
                id,
                tenantId: this.options.currentTenant.id,
                deletedAt: null,
            },
            include: [
                {
                    model: this.options.database.devtelWorkspaceSettings,
                    as: 'workspaceSettings',
                },
                {
                    model: this.options.database.devtelAgentSettings,
                    as: 'agentSettings',
                },
            ],
        })

        if (!workspace) {
            throw new Error400(this.options.language, 'devtel.workspace.notFound')
        }

        return workspace
    }

    /**
     * Update workspace
     */
    async update(id: string, data: any) {
        const transaction = await SequelizeRepository.createTransaction(this.options)

        try {
            const workspace = await this.options.database.devtelWorkspaces.findOne({
                where: {
                    id,
                    tenantId: this.options.currentTenant.id,
                    deletedAt: null,
                },
                transaction,
            })

            if (!workspace) {
                throw new Error400(this.options.language, 'devtel.workspace.notFound')
            }

            // Update workspace
            if (data.name !== undefined) {
                workspace.name = data.name
            }
            if (data.settings !== undefined) {
                workspace.settings = { ...workspace.settings, ...data.settings }
            }
            workspace.updatedById = this.options.currentUser?.id
            await workspace.save({ transaction })

            // Update workspace settings if provided
            if (data.workspaceSettings) {
                await this.options.database.devtelWorkspaceSettings.update(data.workspaceSettings, {
                    where: { workspaceId: id },
                    transaction,
                })
            }

            // Update agent settings if provided
            if (data.agentSettings) {
                await this.options.database.devtelAgentSettings.update(data.agentSettings, {
                    where: { workspaceId: id },
                    transaction,
                })
            }

            await SequelizeRepository.commitTransaction(transaction)

            return this.findById(id)
        } catch (error) {
            await SequelizeRepository.rollbackTransaction(transaction)
            throw error
        }
    }

    /**
     * Get workspace for current tenant
     */
    async getForCurrentTenant() {
        const workspace = await this.options.database.devtelWorkspaces.findOne({
            where: {
                tenantId: this.options.currentTenant.id,
                deletedAt: null,
            },
            include: [
                {
                    model: this.options.database.devtelWorkspaceSettings,
                    as: 'workspaceSettings',
                },
                {
                    model: this.options.database.devtelAgentSettings,
                    as: 'agentSettings',
                },
            ],
        })

        if (!workspace) {
            // Auto-create if not exists
            return this.getOrCreate()
        }

        return workspace
    }
}
