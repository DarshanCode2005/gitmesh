/**
 * DevSpace Module Configuration
 * 
 * This module contains the DevSpace project management functionality:
 * - Project/workspace management (boards, backlogs, cycles, issues, etc.)
 * - Store namespaces: devspace, issues, cycles
 * 
 * Contains one analytics page called "Devtel" (Developer Telemetry) which shows
 * engineering metrics like team capacity, active work, and contributions.
 * 
 * Naming Convention:
 * - "DevSpace" = Project management features (this module's primary purpose)
 * - "Devtel" = Developer Telemetry analytics page only (TelemetryPage.vue)
 */
import routes from '@/modules/devspace/devtel-routes';
import devspace from '@/modules/devspace/store/modules/devspace';
import issues from '@/modules/devspace/store/modules/issues';
import cycles from '@/modules/devspace/store/modules/cycles';

export default {
    routes,
    store: {
        devspace,
        issues,
        cycles,
    },
};
