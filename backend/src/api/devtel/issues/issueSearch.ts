import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/issues/search
 * @summary Search issues with OpenSearch
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const service = new DevtelIssueService(req)

    // For now, use the list method with search params
    // TODO: Implement OpenSearch query when ready
    const result = await service.list(req.params.projectId, {
        ...req.body,
        limit: req.body.limit || 50,
        offset: req.body.offset || 0,
    })

    await req.responseHandler.success(req, res, result)
}
