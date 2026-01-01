import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/settings/agents
 * @summary Get AI agent settings
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsRead)

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    const agentSettings = await req.database.devtelAgentSettings.findOne({
        where: { workspaceId: workspace.id },
    })

    await req.responseHandler.success(req, res, agentSettings)
}
