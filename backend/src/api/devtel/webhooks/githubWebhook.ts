import { Error400 } from '@gitmesh/common'
import crypto from 'crypto'

/**
 * POST /webhook/devtel/github/:workspaceId
 * @summary GitHub webhook handler for DevSpace
 * @tag DevSpace Webhooks
 * @public (signature validated)
 */
export default async (req, res) => {
    const { workspaceId } = req.params
    const signature = req.headers['x-hub-signature-256']
    const event = req.headers['x-github-event']
    const deliveryId = req.headers['x-github-delivery']

    req.log.info({ workspaceId, event, deliveryId }, 'Received GitHub webhook')

    // Get workspace and integration
    const workspace = await req.database.devtelWorkspaces.findByPk(workspaceId)
    if (!workspace) {
        req.log.error({ workspaceId }, 'Workspace not found for GitHub webhook')
        throw new Error400(req.language, 'devtel.webhook.workspaceNotFound')
    }

    req.log.info({ workspaceId, tenantId: workspace.tenantId }, 'Found workspace for webhook')

    const integration = await req.database.devtelIntegrations.findOne({
        where: {
            workspaceId,
            provider: 'github',
            status: 'active',
        },
    })

    if (!integration) {
        req.log.error({ workspaceId }, 'No active GitHub integration found for workspace')
        throw new Error400(req.language, 'devtel.webhook.integrationNotFound')
    }

    req.log.info({ integrationId: integration.id, workspaceId }, 'Found active GitHub integration')

    // Validate signature
    const webhookSecret = integration.credentials?.webhookSecret
    if (webhookSecret && signature) {
        req.log.info({ workspaceId, event }, 'Validating webhook signature')
        const payload = JSON.stringify(req.body)
        const expectedSignature = `sha256=${crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('hex')}`

        if (signature !== expectedSignature) {
            req.log.error({ workspaceId, event, deliveryId }, 'Webhook signature validation failed')
            // Log failed attempt
            await req.database.devtelGithubWebhookLogs.create({
                workspaceId,
                event,
                deliveryId,
                payload: req.body,
                status: 'signature_failed',
                processedAt: new Date(),
            })
            throw new Error400(req.language, 'devtel.webhook.invalidSignature')
        }
        req.log.info({ workspaceId, event }, 'Webhook signature validated successfully')
    } else {
        req.log.warn({ workspaceId, event, hasSecret: !!webhookSecret, hasSignature: !!signature }, 
                 'Webhook signature validation skipped')
    }

    // Log the webhook
    req.log.info({ workspaceId, event, deliveryId }, 'Creating webhook log entry')
    const webhookLog = await req.database.devtelGithubWebhookLogs.create({
        workspaceId,
        event,
        deliveryId,
        payload: req.body,
        status: 'received',
        processedAt: new Date(),
    })

    // Process based on event type
    try {
        req.log.info({ workspaceId, event, deliveryId }, 'Processing webhook event')
        switch (event) {
            case 'issues':
                await handleIssuesEvent(req, workspace, integration, req.body)
                break
            case 'pull_request':
                await handlePullRequestEvent(req, workspace, integration, req.body)
                break
            case 'push':
                await handlePushEvent(req, workspace, integration, req.body)
                break
            default:
                req.log.info({ workspaceId, event }, 'Unhandled event type, skipping processing')
                break
        }

        await webhookLog.update({ status: 'processed' })
        req.log.info({ workspaceId, event, deliveryId }, 'Webhook processed successfully')
    } catch (error) {
        req.log.error({ error, workspaceId, event, deliveryId }, 'Error processing webhook')
        await webhookLog.update({
            status: 'error',
            error: error.message,
        })
        throw error
    }

    await req.responseHandler.success(req, res, { received: true })
}

async function handleIssuesEvent(req: any, workspace: any, integration: any, payload: any) {
    const { action, issue, repository } = payload

    req.log.info({ 
        workspaceId: workspace.id, 
        action, 
        issueNumber: issue.number,
        repository: repository.full_name 
    }, 'Processing GitHub issues event')

    // Create external link for tracking
    if (action === 'opened') {
        req.log.info({ issueUrl: issue.html_url, issueTitle: issue.title }, 'GitHub issue opened')
        // TODO: Create a DevTel issue linked to GitHub
        // await req.database.devtelIssues.create({
        //   workspaceId: workspace.id,
        //   title: issue.title,
        //   description: issue.body,
        //   status: 'open',
        //   priority: 'medium',
        //   source: 'github',
        // })
        // await req.database.devtelExternalLinks.create({
        //   issueId: devtelIssue.id,
        //   externalId: issue.id.toString(),
        //   externalUrl: issue.html_url,
        //   provider: 'github',
        // })
    } else if (action === 'closed') {
        req.log.info({ issueUrl: issue.html_url }, 'GitHub issue closed')
        // TODO: Update linked DevTel issue status
    } else if (action === 'reopened') {
        req.log.info({ issueUrl: issue.html_url }, 'GitHub issue reopened')
        // TODO: Update linked DevTel issue status
    } else {
        req.log.info({ action }, 'Unhandled issue action')
    }
}

async function handlePullRequestEvent(req: any, workspace: any, integration: any, payload: any) {
    const { action, pull_request, repository } = payload

    req.log.info({ 
        workspaceId: workspace.id, 
        action, 
        prNumber: pull_request.number,
        repository: repository.full_name 
    }, 'Processing GitHub pull request event')

    if (action === 'opened' || action === 'closed' || action === 'merged') {
        req.log.info({ 
            prUrl: pull_request.html_url, 
            prTitle: pull_request.title,
            merged: pull_request.merged 
        }, `PR ${action}`)
        // TODO: Could update linked DevTel issues when PR references them
        // Parse PR body for issue references like "Fixes #123"
        // Update those DevTel issues with PR link and status
    } else {
        req.log.info({ action }, 'Unhandled PR action')
    }
}

async function handlePushEvent(req: any, workspace: any, integration: any, payload: any) {
    const { commits, ref, repository } = payload

    req.log.info({ 
        workspaceId: workspace.id, 
        ref, 
        commitCount: commits?.length || 0,
        repository: repository.full_name 
    }, 'Processing GitHub push event')

    // Track commits for velocity/activity metrics
    if (commits && commits.length > 0) {
        req.log.info({ 
            commitCount: commits.length,
            firstCommit: commits[0]?.message,
            author: commits[0]?.author?.name 
        }, 'Push contains commits')
        // TODO: Create activity entries for DevTel analytics
        // Track commit velocity, code changes, author activity
    }
}
