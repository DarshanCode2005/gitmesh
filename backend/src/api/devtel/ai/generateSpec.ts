import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelAiService from '../../../services/devtel/devtelAiService'

/**
 * POST /tenant/{tenantId}/devtel/ai/generate-spec
 * @summary Generate a product spec/PRD using AI
 * @tag DevTel AI
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.memberRead)

    const { title, description, projectId } = req.body

    const service = new DevtelAiService(req)
    const result = await service.generateSpec({
        title,
        description,
        projectId,
    })

    await req.responseHandler.success(req, res, result)
}
