import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/filters
 * @summary List saved filters for current user
 * @tag DevTel Filters
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    const filters = await req.database.devtelUserSavedFilters.findAll({
        where: {
            userId: req.currentUser.id,
            workspaceId: workspace.id,
        },
        order: [['createdAt', 'DESC']],
    })

    await req.responseHandler.success(req, res, filters)
}
