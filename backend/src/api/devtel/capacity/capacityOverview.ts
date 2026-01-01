import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'

/**
 * GET /tenant/{tenantId}/devtel/capacity
 * @summary Get capacity overview for all team members
 * @tag DevTel Capacity
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    // Get all users with their assigned hours
    const users = await req.database.users.findAll({
        where: { tenantId: req.currentTenant.id },
        attributes: ['id', 'fullName', 'email', 'firstName', 'lastName'],
    })

    // Get assignments for each user
    const userIds = users.map(u => u.id)
    const assignments = await req.database.devtelIssueAssignments.findAll({
        where: { userId: userIds },
        include: [
            {
                model: req.database.devtelIssues,
                as: 'issue',
                where: { deletedAt: null },
                attributes: ['id', 'title', 'status', 'estimatedHours', 'cycleId'],
                include: [
                    {
                        model: req.database.devtelCycles,
                        as: 'cycle',
                        attributes: ['id', 'name', 'startDate', 'endDate', 'status'],
                    },
                ],
            },
        ],
    })

    // Group assignments by user
    const userCapacity = users.map(user => {
        const userAssignments = assignments.filter(a => a.userId === user.id)
        const totalAllocatedHours = userAssignments.reduce(
            (sum, a) => sum + (parseFloat(a.allocatedHours) || 0),
            0
        )
        const activeIssues = userAssignments.filter(
            a => a.issue?.status === 'in_progress' || a.issue?.status === 'review'
        )

        return {
            user: user.get({ plain: true }),
            totalAllocatedHours,
            activeIssuesCount: activeIssues.length,
            assignments: userAssignments.map(a => ({
                issueId: a.issue?.id,
                issueTitle: a.issue?.title,
                issueStatus: a.issue?.status,
                allocatedHours: a.allocatedHours,
                scheduledDate: a.scheduledDate,
                cycleName: a.issue?.cycle?.name,
            })),
        }
    })

    await req.responseHandler.success(req, res, {
        workspace: workspace.get({ plain: true }),
        capacity: userCapacity,
    })
}
