import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/specs/:specId/comments
 * @summary Add a comment to a spec
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberCreate)

    const { specId } = req.params
    const { content, textReference } = req.body

    if (!content || typeof content !== 'string') {
        throw new Error400(req.language, 'devtel.comment.contentRequired')
    }

    const comment = await req.database.devtelSpecComments.create({
        specId,
        authorId: req.currentUser.id,
        content,
        textReference,
        resolved: false,
    })

    const result = await req.database.devtelSpecComments.findOne({
        where: { id: comment.id },
        include: [
            {
                model: req.database.user,
                as: 'author',
                attributes: ['id', 'fullName', 'email'],
            },
        ],
    })

    await req.responseHandler.success(req, res, result)
}
