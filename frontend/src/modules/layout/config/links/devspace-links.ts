import { MenuLink } from '@/modules/layout/types/MenuLink';

export const overview: MenuLink = {
    id: 'overview',
    label: 'Overview',
    icon: 'ri-dashboard-line',
    routeName: 'overview',
    path: '/overview',
    display: () => true,
    disable: () => false,
};

export const board: MenuLink = {
    id: 'board',
    label: 'Issues Board',
    icon: 'ri-layout-grid-line',
    routeName: 'board',
    path: '/board',
    display: () => true,
    disable: () => false,
};


export const backlog: MenuLink = {
    id: 'backlog',
    label: 'Backlog',
    icon: 'ri-list-check-2',
    routeName: 'backlog',
    path: '/backlog',
    display: () => true,
    disable: () => false,
};

export const cycles: MenuLink = {
    id: 'cycles',
    label: 'Cycles',
    icon: 'ri-refresh-line',
    routeName: 'cycles',
    path: '/cycles',
    display: () => true,
    disable: () => false,
};

export const capacity: MenuLink = {
    id: 'capacity',
    label: 'Capacity',
    icon: 'ri-group-line',
    routeName: 'capacity',
    path: '/capacity',
    display: () => true,
    disable: () => false,
};

export const specs: MenuLink = {
    id: 'specs',
    label: 'Specs',
    icon: 'ri-file-text-line',
    routeName: 'specs',
    path: '/specs',
    display: () => true,
    disable: () => false,
};

export const team: MenuLink = {
    id: 'team',
    label: 'Team',
    icon: 'ri-team-line',
    routeName: 'team',
    path: '/team',
    display: () => true,
    disable: () => false,
};

export const devtel: MenuLink = {
    id: 'devtel',
    label: 'Devtel',
    icon: 'ri-bar-chart-line',
    routeName: 'report',
    path: '/devtel',
    display: () => true,
    disable: () => false,
};

export const projectSettings: MenuLink = {
    id: 'project-settings',
    label: 'Project Settings',
    icon: 'ri-settings-3-line',
    routeName: 'project-settings',
    path: '/project-settings',
    display: () => true,
    disable: () => false,
};
