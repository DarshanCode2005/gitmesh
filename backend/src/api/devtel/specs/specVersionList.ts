import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/specs/:specId/versions
 * @summary Get version history for a spec
 * @tag DevTel Specs
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { specId } = req.params

    const versions = await req.database.devtelSpecVersions.findAll({
        where: { specId },
        include: [
            {
                model: req.database.user,
                as: 'author',
                attributes: ['id', 'fullName', 'email', 'firstName', 'lastName'],
            },
        ],
        order: [['createdAt', 'DESC']],
    })

    await req.responseHandler.success(req, res, versions)
}
