import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/cycles/:cycleId/plan
 * @summary Plan sprint - move issues into a cycle
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { issueIds } = req.body

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        throw new Error400(req.language, 'devtel.cycle.issueIdsRequired')
    }

    const service = new DevtelCycleService(req)
    const cycle = await service.planSprint(req.params.projectId, req.params.cycleId, issueIds)

    await req.responseHandler.success(req, res, cycle)
}
