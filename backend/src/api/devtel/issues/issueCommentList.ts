import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/issues/:issueId/comments
 * @summary List comments for an issue
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { issueId } = req.params

    const comments = await req.database.devtelIssueComments.findAll({
        where: {
            issueId,
            deletedAt: null,
        },
        include: [
            {
                model: req.database.user,
                as: 'author',
                attributes: ['id', 'fullName', 'email', 'firstName', 'lastName'],
            },
        ],
        order: [['createdAt', 'ASC']],
    })

    await req.responseHandler.success(req, res, comments)
}
