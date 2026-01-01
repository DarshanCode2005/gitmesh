import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import { Error400 } from '@gitmesh/common'

/**
 * PUT /tenant/{tenantId}/devtel/settings/webhooks/:webhookId
 * @summary Update a webhook
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const { webhookId } = req.params
    const { url, events, enabled } = req.body

    const webhook = await req.database.devtelWebhooks.findByPk(webhookId)

    if (!webhook) {
        throw new Error400(req.language, 'devtel.webhook.notFound')
    }

    const updateData: any = {}
    if (url !== undefined) updateData.url = url
    if (events !== undefined) updateData.events = events
    if (enabled !== undefined) updateData.enabled = enabled

    await webhook.update(updateData)

    await req.responseHandler.success(req, res, webhook)
}
