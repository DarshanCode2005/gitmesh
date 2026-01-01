import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/issues/:issueId
 * @summary Get issue by ID
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelIssueService(req)
    const issue = await service.findById(req.params.projectId, req.params.issueId)

    await req.responseHandler.success(req, res, issue)
}
