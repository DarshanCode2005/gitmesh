import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/specs
 * @summary Create a new spec document
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberCreate)

    const { projectId } = req.params
    const { title, content, status = 'draft' } = req.body

    if (!title || typeof title !== 'string') {
        throw new Error400(req.language, 'devtel.spec.titleRequired')
    }

    const spec = await req.database.devtelSpecDocuments.create({
        projectId,
        authorId: req.currentUser.id,
        title,
        content: content || {},
        status,
        createdById: req.currentUser.id,
    })

    // Create initial version
    await req.database.devtelSpecVersions.create({
        specId: spec.id,
        authorId: req.currentUser.id,
        content: content || {},
    })

    const result = await req.database.devtelSpecDocuments.findOne({
        where: { id: spec.id },
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
