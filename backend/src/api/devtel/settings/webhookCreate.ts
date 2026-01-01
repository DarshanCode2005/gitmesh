import Permissions from '../../../security/permissions'
import PermissionChecker from '../../../services/user/permissionChecker'
import DevtelWorkspaceService from '../../../services/devtel/devtelWorkspaceService'
import { Error400 } from '@gitmesh/common'
import crypto from 'crypto'

/**
 * POST /tenant/{tenantId}/devtel/settings/webhooks
 * @summary Create a webhook
 * @tag DevTel Settings
 * @security Bearer
 */
export default async (req, res) => {
    new PermissionChecker(req).validateHas(Permissions.values.settingsEdit)

    const { url, events } = req.body

    if (!url) {
        throw new Error400(req.language, 'devtel.webhook.urlRequired')
    }

    const workspaceService = new DevtelWorkspaceService(req)
    const workspace = await workspaceService.getForCurrentTenant()

    // Generate a secret for signing
    const secret = crypto.randomBytes(32).toString('hex')

    const webhook = await req.database.devtelWebhooks.create({
        workspaceId: workspace.id,
        url,
        secret,
        events: events || ['issue.created', 'issue.updated', 'cycle.completed'],
        enabled: true,
        deliveryStats: {},
    })

    await req.responseHandler.success(req, res, {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret, // Only shown on create
        events: webhook.events,
        enabled: webhook.enabled,
    })
}
