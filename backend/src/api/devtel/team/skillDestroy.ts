import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * DELETE /tenant/{tenantId}/devtel/team/:userId/skills/:skillId
 * @summary Remove a skill from a team member
 * @tag DevTel Team
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberEdit)

    const { skillId } = req.params

    const skill = await req.database.devtelUserSkills.findByPk(skillId)

    if (!skill) {
        throw new Error400(req.language, 'devtel.skill.notFound')
    }

    await skill.destroy()

    await req.responseHandler.success(req, res, { success: true })
}
