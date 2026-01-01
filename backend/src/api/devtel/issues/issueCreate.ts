import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelIssueService from '../../../services/devtel/devtelIssueService'

/**
 * POST /tenant/{tenantId}/devtel/projects/:projectId/issues
 * @summary Create a new issue
 * @tag DevTel Issues
 * @security Bearer
 */
export default async (req, res) => {
    console.log('========== ISSUE CREATE START ==========')
    console.log('Project ID:', req.params.projectId)
    console.log('Request Body:', JSON.stringify(req.body, null, 2))
    console.log('Tenant ID:', req.currentTenant?.id)
    console.log('User ID:', req.currentUser?.id)

    try {
        console.log('Checking permissions...')
        new PermissionChecker(req).validateHas(Permissions.values.taskCreate)
        console.log('✓ Permission check passed')

        console.log('Creating service...')
        const service = new DevtelIssueService(req)
        console.log('✓ Service created')

        console.log('Calling service.create...')
        const issue = await service.create(req.params.projectId, req.body.data || req.body)
        console.log('✓ Issue created:', issue.id)

        console.log('Sending success response...')
        await req.responseHandler.success(req, res, issue)
        console.log('========== ISSUE CREATE SUCCESS ==========')
    } catch (error) {
        console.error('========== ISSUE CREATE ERROR ==========')
        console.error('Error Type:', error.constructor.name)
        console.error('Error Message:', error.message)
        console.error('Error Stack:', error.stack)
        console.error('========================================')
        await req.responseHandler.error(req, res, error)
    }
}
