import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * GET /tenant/{tenantId}/devtel/projects/:projectId/issues
 * @summary List issues for a project
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    console.log('API issueList called', {
        projectId: req.params.projectId,
        query: req.query
    })

    const service = new DevtelIssueService(req)
    const result = await service.list(req.params.projectId, {
        status: req.query.status ? (req.query.status as string).split(',') : undefined,
        priority: req.query.priority ? (req.query.priority as string).split(',') : undefined,
        assigneeIds: req.query.assigneeIds ? (req.query.assigneeIds as string).split(',') : undefined,
        cycleId: req.query.cycleId as string,
        hasNoCycle: req.query.hasNoCycle === 'true',
        limit: parseInt(req.query.limit as string, 10) || 50,
        offset: parseInt(req.query.offset as string, 10) || 0,
        orderBy: req.query.orderBy as string,
        orderDirection: req.query.orderDirection as 'asc' | 'desc',
    })

    await req.responseHandler.success(req, res, result)
}
