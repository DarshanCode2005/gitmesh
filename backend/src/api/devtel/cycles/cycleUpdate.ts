import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * PUT /tenant/{tenantId}/devtel/projects/:projectId/cycles/:cycleId
 * @summary Update a cycle
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const service = new DevtelCycleService(req)
    const cycle = await service.update(req.params.projectId, req.params.cycleId, req.body.data || req.body)

    await req.responseHandler.success(req, res, cycle)
}
