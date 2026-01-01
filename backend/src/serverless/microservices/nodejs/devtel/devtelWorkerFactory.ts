/**
 * DevTel Worker Factory
 * Dispatches DevTel background jobs to appropriate handlers
 */
import { getServiceChildLogger } from '@gitmesh/logging'
import {
    DevtelWorkerMessage,
    DevtelSyncExternalDataMessage,
    DevtelIndexToOpensearchMessage,
    DevtelCalculateMetricsMessage,
    DevtelAgentTaskMessage,
    DevtelCycleSnapshotMessage,
} from './messageTypes'

import { syncExternalDataWorker } from './workers/syncExternalDataWorker'
import { indexToOpensearchWorker } from './workers/indexToOpensearchWorker'
import { calculateMetricsWorker } from './workers/calculateMetricsWorker'
import { agentTaskWorker } from './workers/agentTaskWorker'
import { cycleSnapshotWorker } from './workers/cycleSnapshotWorker'

const log = getServiceChildLogger('DevtelWorkerFactory')

export async function devtelWorkerFactory(message: DevtelWorkerMessage): Promise<any> {
    const { service } = message

    log.info({ service }, 'Processing DevTel worker message')

    switch (service) {
        case 'devtel-sync-external':
            return syncExternalDataWorker(message as DevtelSyncExternalDataMessage)

        case 'devtel-index-opensearch':
            return indexToOpensearchWorker(message as DevtelIndexToOpensearchMessage)

        case 'devtel-calculate-metrics':
            return calculateMetricsWorker(message as DevtelCalculateMetricsMessage)

        case 'devtel-agent-task':
            return agentTaskWorker(message as DevtelAgentTaskMessage)

        case 'devtel-cycle-snapshot':
            return cycleSnapshotWorker(message as DevtelCycleSnapshotMessage)

        default:
            throw new Error(`Unknown DevTel service: ${service}`)
    }
}

export default devtelWorkerFactory
