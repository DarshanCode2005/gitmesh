import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/cycles/:cycleId/burndown
 * @summary Get burndown chart data for a cycle
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelCycleService(req)
    const data = await service.getBurndown(req.params.projectId, req.params.cycleId)

    await req.responseHandler.success(req, res, data)
}
