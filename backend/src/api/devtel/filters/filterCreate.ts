import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/filters
 * @summary Create a saved filter
 * @tag DevTel Filters
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberCreate)

    const { name, filterType, config } = req.body

    if (!name) {
        throw new Error400(req.language, 'devtel.filter.nameRequired')
    }

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    const filter = await req.database.devtelUserSavedFilters.create({
        userId: req.currentUser.id,
        workspaceId: workspace.id,
        name,
        filterType: filterType || 'issues',
        config: config || {},
    })

    await req.responseHandler.success(req, res, filter)
}
