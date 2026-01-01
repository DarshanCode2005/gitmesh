import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/workspace
 * @summary Get or create DevTel workspace for current tenant
 * @tag DevTel
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelWorkspaceService(req)
    const workspace = await service.getOrCreate()

    await req.responseHandler.success(req, res, workspace)
}
