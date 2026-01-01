import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * PUT /tenant/{tenantId}/devtel/workspace
 * @summary Update DevTel workspace settings
 * @tag DevTel
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const service = new DevtelWorkspaceService(req)
    const workspace = await service.getForCurrentTenant()
    const updated = await service.update(workspace.id, req.body.data || req.body)

    await req.responseHandler.success(req, res, updated)
}
