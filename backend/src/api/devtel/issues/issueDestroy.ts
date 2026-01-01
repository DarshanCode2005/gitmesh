import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * DELETE /tenant/{tenantId}/devtel/projects/:projectId/issues/:issueId
 * @summary Delete an issue
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberDestroy)

    const service = new DevtelIssueService(req)
    await service.destroy(req.params.projectId, req.params.issueId)

    await req.responseHandler.success(req, res, { success: true })
}
