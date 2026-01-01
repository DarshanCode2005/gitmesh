import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelProjectService from '../../../services/devtel/devtelProjectService'

/**
 * POST /tenant/{tenantId}/devtel/projects
 * @summary Create a new project
 * @tag DevTel Projects
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberCreate)

    const service = new DevtelProjectService(req)
    const project = await service.create(req.body.data || req.body)

    await req.responseHandler.success(req, res, project)
}
