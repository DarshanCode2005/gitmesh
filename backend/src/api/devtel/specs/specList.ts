import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/specs
 * @summary List spec documents for a project
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { projectId } = req.params
    const { status, limit = 50, offset = 0 } = req.query

    const where: any = {
        projectId,
        deletedAt: null,
    }

    if (status) {
        where.status = status
    }

    const { rows, count } = await req.database.devtelSpecDocuments.findAndCountAll({
        where,
        include: [
            {
                model: req.database.user,
                as: 'author',
                attributes: ['id', 'fullName', 'email', 'firstName', 'lastName'],
            },
        ],
        order: [['updatedAt', 'DESC']],
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
    })

    await req.responseHandler.success(req, res, { rows, count })
}
