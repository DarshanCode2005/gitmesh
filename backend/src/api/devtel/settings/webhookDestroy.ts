import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * DELETE /tenant/{tenantId}/devtel/settings/webhooks/:webhookId
 * @summary Delete a webhook
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const { webhookId } = req.params

    const webhook = await req.database.devtelWebhooks.findByPk(webhookId)

    if (!webhook) {
        throw new Error400(req.language, 'devtel.webhook.notFound')
    }

    await webhook.destroy()

    await req.responseHandler.success(req, res, { success: true })
}
