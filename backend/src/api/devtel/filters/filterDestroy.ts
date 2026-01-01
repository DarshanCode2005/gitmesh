import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * DELETE /tenant/{tenantId}/devtel/filters/:filterId
 * @summary Delete a saved filter
 * @tag DevTel Filters
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberDestroy)

    const { filterId } = req.params

    const filter = await req.database.devtelUserSavedFilters.findOne({
        where: {
            id: filterId,
            userId: req.currentUser.id,
        },
    })

    if (!filter) {
        throw new Error400(req.language, 'devtel.filter.notFound')
    }

    await filter.destroy()

    await req.responseHandler.success(req, res, { success: true })
}
