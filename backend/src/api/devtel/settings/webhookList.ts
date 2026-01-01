import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/settings/webhooks
 * @summary List webhooks
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsRead)

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    const webhooks = await req.database.devtelWebhooks.findAll({
        where: { workspaceId: workspace.id },
        order: [['createdAt', 'DESC']],
    })

    await req.responseHandler.success(req, res, webhooks)
}
