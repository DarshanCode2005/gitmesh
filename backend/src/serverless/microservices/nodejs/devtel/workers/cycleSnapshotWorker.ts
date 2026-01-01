/**
 * Cycle Snapshot Worker
 * Takes daily snapshots for burndown charts
 */
import { getServiceChildLogger } from '@gitmesh/logging'
import { DevtelCycleSnapshotMessage } from '../messageTypes'

const log = getServiceChildLogger('CycleSnapshotWorker')

export async function cycleSnapshotWorker(
    message: DevtelCycleSnapshotMessage
): Promise<any> {
    const { tenant, cycleId, projectId } = message

    log.info({ cycleId, projectId }, 'Creating cycle snapshot')

    try {
        // Get current cycle stats
        const stats = await getCycleStats(tenant, cycleId)

        // Create snapshot record
        const snapshot = await createSnapshot(tenant, cycleId, stats)

        log.info({ cycleId, snapshot }, 'Cycle snapshot created')

        return snapshot
    } catch (error) {
        log.error({ error, cycleId }, 'Cycle snapshot failed')
        throw error
    }
}

interface CycleStats {
    totalPoints: number
    remainingPoints: number
    completedPoints: number
    issueCount: number
    completedIssueCount: number
    inProgressIssueCount: number
}

async function getCycleStats(tenant: string, cycleId: string): Promise<CycleStats> {
    // TODO: Query devtelIssues for cycle stats

    // Sample query:
    // SELECT
    //   COUNT(*) as issueCount,
    //   SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completedIssueCount,
    //   SUM(CASE WHEN status IN ('in_progress', 'review') THEN 1 ELSE 0 END) as inProgressIssueCount,
    //   SUM(COALESCE(storyPoints, 0)) as totalPoints,
    //   SUM(CASE WHEN status = 'done' THEN COALESCE(storyPoints, 0) ELSE 0 END) as completedPoints
    // FROM devtelIssues
    // WHERE cycleId = :cycleId AND deletedAt IS NULL

    return {
        totalPoints: 0,
        remainingPoints: 0,
        completedPoints: 0,
        issueCount: 0,
        completedIssueCount: 0,
        inProgressIssueCount: 0,
    }
}

async function createSnapshot(
    tenant: string,
    cycleId: string,
    stats: CycleStats
): Promise<any> {
    const today = new Date().toISOString().split('T')[0]

    // TODO: Create devtelCycleSnapshots record
    // Upsert to avoid duplicates for same day

    const snapshot = {
        cycleId,
        snapshotDate: today,
        totalPoints: stats.totalPoints,
        remainingPoints: stats.remainingPoints,
        completedPoints: stats.completedPoints,
        issueCount: stats.issueCount,
    }

    log.debug({ snapshot }, 'Snapshot record created')

    return snapshot
}
