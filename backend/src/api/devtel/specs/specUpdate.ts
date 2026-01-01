import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * PUT /tenant/{tenantId}/devtel/projects/:projectId/specs/:specId
 * @summary Update a spec document
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { specId, projectId } = req.params
    const { title, content, status } = req.body

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

    const updateData: any = { updatedById: req.currentUser.id }
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status

    // If content changed, save a new version
    if (content !== undefined) {
        updateData.content = content

        // Get version count for comparison
        const latestVersion = await req.database.devtelSpecVersions.findOne({
            where: { specId },
            order: [['createdAt', 'DESC']],
        })

        // Only save new version if content actually changed
        if (JSON.stringify(latestVersion?.content) !== JSON.stringify(content)) {
            await req.database.devtelSpecVersions.create({
                specId,
                authorId: req.currentUser.id,
                content,
            })
        }
    }

    await spec.update(updateData)

    const result = await req.database.devtelSpecDocuments.findOne({
        where: { id: specId },
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
