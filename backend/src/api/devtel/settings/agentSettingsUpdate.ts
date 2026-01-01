import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * PUT /tenant/{tenantId}/devtel/settings/agents
 * @summary Update AI agent settings
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const { enabledAgents, temperature, approvalRequired, customPrompts } = req.body

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    const updateData: any = {}
    if (enabledAgents !== undefined) updateData.enabledAgents = enabledAgents
    if (temperature !== undefined) updateData.temperature = temperature
    if (approvalRequired !== undefined) updateData.approvalRequired = approvalRequired
    if (customPrompts !== undefined) updateData.customPrompts = customPrompts

    await req.database.devtelAgentSettings.update(updateData, {
        where: { workspaceId: workspace.id },
    })

    const agentSettings = await req.database.devtelAgentSettings.findOne({
        where: { workspaceId: workspace.id },
    })

    await req.responseHandler.success(req, res, agentSettings)
}
