/**
 * DevTel API Service
 * HTTP client for DevTel backend endpoints
 */
import authAxios from '@/shared/axios/auth-axios';
import { store } from '@/store';

const getTenantId = () => {
    const tenant = store.getters['auth/currentTenant'];
    return tenant ? tenant.id : null;
};

export default class DevtelService {
    // ============================================
    // Workspace
    // ============================================
    static async getWorkspace() {
        const tenantId = getTenantId();
        const response = await authAxios.get(`/tenant/${tenantId}/devtel/workspace`);
        return response.data;
    }

    static async updateWorkspace(data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(`/tenant/${tenantId}/devtel/workspace`, data);
        return response.data;
    }

    // ============================================
    // Projects
    // ============================================
    static async listProjects(params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(`/tenant/${tenantId}/devtel/projects`, { params });
        return response.data;
    }

    static async getProject(projectId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(`/tenant/${tenantId}/devtel/projects/${projectId}`);
        return response.data;
    }

    static async createProject(data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(`/tenant/${tenantId}/devtel/projects`, data);
        return response.data;
    }

    static async updateProject(projectId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(`/tenant/${tenantId}/devtel/projects/${projectId}`, data);
        return response.data;
    }

    static async deleteProject(projectId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(`/tenant/${tenantId}/devtel/projects/${projectId}`);
        return response.data;
    }

    // ============================================
    // Issues
    // ============================================
    static async listIssues(projectId, params = {}) {
        const tenantId = getTenantId();
        const queryParams = { ...params };

        // Convert arrays to comma-separated strings
        if (Array.isArray(queryParams.status)) {
            queryParams.status = queryParams.status.join(',');
        }
        if (Array.isArray(queryParams.priority)) {
            queryParams.priority = queryParams.priority.join(',');
        }
        if (Array.isArray(queryParams.assigneeIds)) {
            queryParams.assigneeIds = queryParams.assigneeIds.join(',');
        }

        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues`,
            { params: queryParams }
        );
        return response.data;
    }

    static async getIssue(projectId, issueId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/${issueId}`
        );
        return response.data;
    }

    static async createIssue(projectId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues`,
            data
        );
        return response.data;
    }

    static async updateIssue(projectId, issueId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/${issueId}`,
            data
        );
        return response.data;
    }

    static async deleteIssue(projectId, issueId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/${issueId}`
        );
        return response.data;
    }

    static async bulkUpdateIssues(projectId, issueIds, data) {
        const tenantId = getTenantId();
        const response = await authAxios.patch(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/bulk`,
            { issueIds, ...data }
        );
        return response.data;
    }

    static async searchIssues(projectId, query) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/search`,
            query
        );
        return response.data;
    }

    // ============================================
    // Issue Comments
    // ============================================
    static async listIssueComments(projectId, issueId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/${issueId}/comments`
        );
        return response.data;
    }

    static async createIssueComment(projectId, issueId, content) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/issues/${issueId}/comments`,
            { content }
        );
        return response.data;
    }

    // ============================================
    // Cycles
    // ============================================
    static async listCycles(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles`,
            { params }
        );
        return response.data;
    }

    static async getCycle(projectId, cycleId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}`
        );
        return response.data;
    }

    static async createCycle(projectId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles`,
            data
        );
        return response.data;
    }

    static async updateCycle(projectId, cycleId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}`,
            data
        );
        return response.data;
    }

    static async deleteCycle(projectId, cycleId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}`
        );
        return response.data;
    }

    static async getCycleBurndown(projectId, cycleId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}/burndown`
        );
        return response.data;
    }

    static async planSprint(projectId, cycleId, issueIds) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}/plan`,
            { issueIds }
        );
        return response.data;
    }

    // ============================================
    // AI Workflows
    // ============================================
    static async prioritizeIssues(issueIds) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/ai/prioritize-issues`,
            { issueIds }
        );
        return response.data;
    }

    static async suggestSprint(data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/ai/suggest-sprint`,
            data
        );
        return response.data;
    }

    static async breakdownIssue(issueId) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/ai/breakdown-issue`,
            { issueId }
        );
        return response.data;
    }

    static async suggestAssignee(issueId) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/ai/suggest-assignee`,
            { issueId }
        );
        return response.data;
    }

    static async generateSpec(data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/ai/generate-spec`,
            data
        );
        return response.data;
    }

    // ============================================
    // Cycle Lifecycle
    // ============================================
    static async startCycle(projectId, cycleId) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}/start`
        );
        return response.data;
    }

    static async completeCycle(projectId, cycleId) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/cycles/${cycleId}/complete`
        );
        return response.data;
    }

    // ============================================
    // Capacity
    // ============================================
    static async getCapacityOverview(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/capacity`,
            { params }
        );
        return response.data;
    }

    static async getCapacityTimeline(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/capacity/timeline`,
            { params }
        );
        return response.data;
    }

    // ============================================
    // Specs
    // ============================================
    static async listSpecs(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/specs`,
            { params }
        );
        return response.data;
    }

    static async getSpec(projectId, specId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/projects/${projectId}/specs/${specId}`
        );
        return response.data;
    }

    static async createSpec(projectId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/projects/${projectId}/specs`,
            data
        );
        return response.data;
    }

    static async updateSpec(projectId, specId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(
            `/tenant/${tenantId}/devtel/projects/${projectId}/specs/${specId}`,
            data
        );
        return response.data;
    }

    static async deleteSpec(projectId, specId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(
            `/tenant/${tenantId}/devtel/projects/${projectId}/specs/${specId}`
        );
        return response.data;
    }

    // ============================================
    // Team
    // ============================================
    static async listTeamMembers(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/team`,
            { params }
        );
        return response.data;
    }

    static async getTeamAnalytics(projectId, params = {}) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/team/analytics`,
            { params }
        );
        return response.data;
    }

    // ============================================
    // Settings - Integrations
    // ============================================
    static async listIntegrations(workspaceId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/settings/integrations`
        );
        return response.data;
    }

    static async createIntegration(workspaceId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/settings/integrations`,
            data
        );
        return response.data;
    }

    static async testIntegration(workspaceId, integrationId) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/settings/integrations/${integrationId}/test`
        );
        return response.data;
    }

    static async deleteIntegration(workspaceId, integrationId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(
            `/tenant/${tenantId}/devtel/settings/integrations/${integrationId}`
        );
        return response.data;
    }

    // ============================================
    // Settings - Webhooks
    // ============================================
    static async listWebhooks(workspaceId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/settings/webhooks`
        );
        return response.data;
    }

    static async createWebhook(workspaceId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.post(
            `/tenant/${tenantId}/devtel/settings/webhooks`,
            data
        );
        return response.data;
    }

    static async updateWebhook(workspaceId, webhookId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(
            `/tenant/${tenantId}/devtel/settings/webhooks/${webhookId}`,
            data
        );
        return response.data;
    }

    static async deleteWebhook(workspaceId, webhookId) {
        const tenantId = getTenantId();
        const response = await authAxios.delete(
            `/tenant/${tenantId}/devtel/settings/webhooks/${webhookId}`
        );
        return response.data;
    }

    // ============================================
    // Settings - AI Agents
    // ============================================
    static async getAgentSettings(workspaceId) {
        const tenantId = getTenantId();
        const response = await authAxios.get(
            `/tenant/${tenantId}/devtel/settings/agents`
        );
        return response.data;
    }

    static async updateAgentSettings(workspaceId, data) {
        const tenantId = getTenantId();
        const response = await authAxios.put(
            `/tenant/${tenantId}/devtel/settings/agents`,
            data
        );
        return response.data;
    }
}

