import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * PATCH /tenant/{tenantId}/devtel/projects/:projectId/issues/bulk
 * @summary Bulk update issues
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { issueIds, ...updateData } = req.body

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
        return req.responseHandler.error(req, res, { message: 'issueIds array is required' }, 400)
    }

    const service = new DevtelIssueService(req)
    const results = await service.bulkUpdate(req.params.projectId, issueIds, updateData)

    await req.responseHandler.success(req, res, results)
}
