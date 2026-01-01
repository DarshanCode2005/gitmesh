import Layout from '@/modules/layout/components/layout.vue';

// Lazy-loaded page components
const DevtelLayout = () => import('@/modules/devspace/pages/DevtelLayout.vue');
const TelemetryPage = () => import('@/modules/devspace/pages/TelemetryPage.vue');
const BoardPage = () => import('@/modules/devspace/pages/BoardPage.vue');
const BacklogPage = () => import('@/modules/devspace/pages/BacklogPage.vue');
const CyclesPage = () => import('@/modules/devspace/pages/CyclesPage.vue');
const CapacityPage = () => import('@/modules/devspace/pages/CapacityPage.vue');
const SpecsPage = () => import('@/modules/devspace/pages/SpecsPage.vue');
const TeamPage = () => import('@/modules/devspace/pages/TeamPage.vue');
const SettingsPage = () => import('@/modules/devspace/pages/SettingsPage.vue');

export default [
    {
        path: '/',
        component: Layout,
        meta: { auth: true },
        children: [
            {
                path: '',
                component: DevtelLayout,
                children: [
                    {
                        name: 'overview',
                        path: 'overview',
                        component: TelemetryPage,
                        meta: { auth: true, title: 'Project Overview' },
                    },
                    {
                        name: 'board',
                        path: 'board',
                        component: BoardPage,
                        meta: { auth: true, title: 'Issues Board' },
                    },
                    {
                        name: 'backlog',
                        path: 'backlog',
                        component: BacklogPage,
                        meta: { auth: true, title: 'Backlog' },
                    },
                    {
                        name: 'cycles',
                        path: 'cycles',
                        component: CyclesPage,
                        meta: { auth: true, title: 'Cycles' },
                    },
                    {
                        name: 'capacity',
                        path: 'capacity',
                        component: CapacityPage,
                        meta: { auth: true, title: 'Capacity' },
                    },
                    {
                        name: 'specs',
                        path: 'specs',
                        component: SpecsPage,
                        meta: { auth: true, title: 'Specs' },
                    },
                    {
                        name: 'team',
                        path: 'team',
                        component: TeamPage,
                        meta: { auth: true, title: 'Team' },
                    },
                    {
                        name: 'project-settings',
                        path: 'project-settings',
                        component: SettingsPage,
                        meta: { auth: true, title: 'Project Settings' },
                    },
                ],
            },
        ],
    },
];
