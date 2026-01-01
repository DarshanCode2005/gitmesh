import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelCycleService from '../../../services/devtel/devtelCycleService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/cycles
 * @summary List cycles for a project
 * @tag DevTel Cycles
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelCycleService(req)
    const result = await service.list(req.params.projectId, {
        status: req.query.status as string,
        limit: parseInt(req.query.limit as string, 10) || 50,
        offset: parseInt(req.query.offset as string, 10) || 0,
    })

    await req.responseHandler.success(req, res, result)
}
