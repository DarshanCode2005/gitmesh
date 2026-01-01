/**
 * DevSpace Module - Exports
 * Centralized exports for DevSpace (project management) components and services
 * Note: Module folder name is 'devtel' for historical reasons but handles DevSpace functionality
 */

// Services
export { default as DevtelService } from './services/devtel-api';
export { default as devtelSocket } from './services/devtel-socket';

// Store Modules (namespace: devspace)
export { default as devspaceStore } from './store/devtel';
export { default as issuesStore } from './store/modules/issues';
export { default as cyclesStore } from './store/modules/cycles';

// Pages
export { default as DevtelLayout } from './layout/DevtelLayout.vue';
export { default as BoardPage } from './pages/BoardPage.vue';
export { default as BacklogPage } from './pages/BacklogPage.vue';
export { default as CyclesPage } from './pages/CyclesPage.vue';
export { default as CapacityPage } from './pages/CapacityPage.vue';
export { default as SpecsPage } from './pages/SpecsPage.vue';
export { default as TeamPage } from './pages/TeamPage.vue';
export { default as SettingsPage } from './pages/SettingsPage.vue';

// Components
export { default as BurndownChart } from './components/BurndownChart.vue';
export { default as VelocityChart } from './components/VelocityChart.vue';

// Routes
export { default as devtelRoutes } from './devtel-routes';
