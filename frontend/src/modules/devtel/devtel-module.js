/**
 * DevSpace Module Configuration
 * 
 * This module contains the DevSpace project management functionality:
 * - Project/workspace management (boards, backlogs, cycles, issues, etc.)
 * - Store namespaces: devspace, issues, cycles
 * 
 * The folder contains one analytics page called "Devtel" (Developer Telemetry)
 * which shows engineering metrics like team capacity, active work, and contributions.
 * 
 * Naming Convention:
 * - Use "devspace" for all project management features
 * - Use "devtel" ONLY for the Developer Telemetry analytics page
 */
import routes from '@/modules/devtel/devtel-routes';
import devspace from '@/modules/devtel/store/modules/devspace';
import issues from '@/modules/devtel/store/modules/issues';
import cycles from '@/modules/devtel/store/modules/cycles';

export default {
    routes,
    store: {
        devspace,
        issues,
        cycles,
    },
};
