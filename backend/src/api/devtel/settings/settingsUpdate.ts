import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * PUT /tenant/{tenantId}/devtel/settings
 * @summary Update DevTel workspace settings
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()
    const updated = await workspaceService.update(workspace.id, req.body)

    await req.responseHandler.success(req, res, updated)
}
