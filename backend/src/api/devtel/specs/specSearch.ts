import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/specs/search
 * @summary Search spec documents
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { projectId } = req.params
    const { query, status, limit = 50, offset = 0 } = req.body

    // For now, do a simple ILIKE search
    // TODO: Implement OpenSearch when ready
    const { Op } = require('sequelize')

    const where: any = {
        projectId,
        deletedAt: null,
    }

    if (query) {
        where.title = { [Op.iLike]: `%${query}%` }
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
                attributes: ['id', 'fullName', 'email'],
            },
        ],
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
    })

    await req.responseHandler.success(req, res, { rows, count })
}
