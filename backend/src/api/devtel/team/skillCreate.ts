import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'
import { Error400 } from '@gitmesh/common'

/**
 * POST /tenant/{tenantId}/devtel/team/:userId/skills
 * @summary Add a skill to a team member
 * @tag DevTel Team
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { userId } = req.params
    const { skill, level = 'intermediate' } = req.body

    if (!skill || typeof skill !== 'string') {
        throw new Error400(req.language, 'devtel.skill.nameRequired')
    }

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    // Check if skill already exists
    const existing = await req.database.devtelUserSkills.findOne({
        where: {
            userId,
            workspaceId: workspace.id,
            skill,
        },
    })

    if (existing) {
        throw new Error400(req.language, 'devtel.skill.alreadyExists')
    }

    const userSkill = await req.database.devtelUserSkills.create({
        userId,
        workspaceId: workspace.id,
        skill,
        level,
    })

    await req.responseHandler.success(req, res, userSkill)
}
