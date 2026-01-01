import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/cycles/:cycleId/start
 * @summary Start a cycle (transition from planned to active)
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const service = new DevtelCycleService(req)
    const cycle = await service.start(req.params.projectId, req.params.cycleId)

    await req.responseHandler.success(req, res, cycle)
}
