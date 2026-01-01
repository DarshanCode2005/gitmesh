import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/cycles/:cycleId
 * @summary Get cycle by ID with stats
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelCycleService(req)
    const cycle = await service.findById(req.params.projectId, req.params.cycleId)

    await req.responseHandler.success(req, res, cycle)
}
