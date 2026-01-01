import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelProjectService from '../../../services/devtel/devtelProjectService'

/**
 * PUT /tenant/{tenantId}/devtel/projects/:projectId
 * @summary Update a project
 * @tag DevTel Projects
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const service = new DevtelProjectService(req)
    const project = await service.update(req.params.projectId, req.body.data || req.body)

    await req.responseHandler.success(req, res, project)
}
