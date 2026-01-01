import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * PUT /tenant/{tenantId}/devtel/projects/:projectId/issues/:issueId
 * @summary Update an issue
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const service = new DevtelIssueService(req)
    const issue = await service.update(req.params.projectId, req.params.issueId, req.body.data || req.body)

    await req.responseHandler.success(req, res, issue)
}
