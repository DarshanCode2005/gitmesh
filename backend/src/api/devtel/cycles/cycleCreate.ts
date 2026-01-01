import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/cycles
 * @summary Create a new cycle
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberCreate)

    const service = new DevtelCycleService(req)
    const cycle = await service.create(req.params.projectId, req.body.data || req.body)

    await req.responseHandler.success(req, res, cycle)
}
