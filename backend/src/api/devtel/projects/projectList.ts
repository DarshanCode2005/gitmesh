import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelProjectService from '../../../services/devtel/devtelProjectService'

/**
 * GET /tenant/{tenantId}/devtel/projects
 * @summary List all projects in workspace
 * @tag DevTel Projects
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelProjectService(req)
    const result = await service.list({
        status: req.query.status,
        limit: parseInt(req.query.limit as string, 10) || 50,
        offset: parseInt(req.query.offset as string, 10) || 0,
    })

    await req.responseHandler.success(req, res, result)
}
