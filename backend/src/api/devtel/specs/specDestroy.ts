import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * DELETE /tenant/{tenantId}/devtel/projects/:projectId/specs/:specId
 * @summary Delete a spec document
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberDestroy)

    const { specId, projectId } = req.params

    const spec = await req.database.devtelSpecDocuments.findOne({
        where: {
            id: specId,
            projectId,
            deletedAt: null,
        },
    })

    if (!spec) {
        throw new Error400(req.language, 'devtel.spec.notFound')
    }

    await spec.update({
        deletedAt: new Date(),
        updatedById: req.currentUser.id,
    })

    await req.responseHandler.success(req, res, { success: true })
}
