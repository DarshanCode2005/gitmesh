/**
 * DevTel Microservice Worker Message Types
 */

export interface DevtelSyncExternalDataMessage {
    service: 'devtel-sync-external'
    tenant: string
    workspaceId: string
    integrationId: string
    provider: 'github' | 'jira'
    syncType: 'full' | 'incremental'
}

export interface DevtelIndexToOpensearchMessage {
    service: 'devtel-index-opensearch'
    tenant: string
    entityType: 'issue' | 'spec'
    entityId: string
    action: 'index' | 'delete'
}

export interface DevtelCalculateMetricsMessage {
    service: 'devtel-calculate-metrics'
    tenant: string
    workspaceId: string
    metricType: 'velocity' | 'capacity' | 'burndown' | 'all'
    cycleId?: string
}

export interface DevtelAgentTaskMessage {
    service: 'devtel-agent-task'
    tenant: string
    workspaceId: string
    agentType: 'prioritize' | 'suggest-sprint' | 'breakdown' | 'assignee' | 'generate-spec'
    input: Record<string, any>
    userId: string
    callbackUrl?: string
}

export interface DevtelCycleSnapshotMessage {
    service: 'devtel-cycle-snapshot'
    tenant: string
    cycleId: string
    projectId: string
}

export type DevtelWorkerMessage =
    | DevtelSyncExternalDataMessage
    | DevtelIndexToOpensearchMessage
    | DevtelCalculateMetricsMessage
    | DevtelAgentTaskMessage
    | DevtelCycleSnapshotMessage
