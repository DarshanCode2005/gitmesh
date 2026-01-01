import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelProjectService from '../../../services/devtel/devtelProjectService'

/**
 * DELETE /tenant/{tenantId}/devtel/projects/:projectId
 * @summary Delete a project
 * @tag DevTel Projects
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberDestroy)

    const service = new DevtelProjectService(req)
    await service.destroy(req.params.projectId)

    await req.responseHandler.success(req, res, { success: true })
}
