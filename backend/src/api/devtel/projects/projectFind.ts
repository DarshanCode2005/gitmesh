import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelProjectService from '../../../services/devtel/devtelProjectService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId
 * @summary Get project by ID
 * @tag DevTel Projects
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelProjectService(req)
    const project = await service.findById(req.params.projectId)

    await req.responseHandler.success(req, res, project)
}
