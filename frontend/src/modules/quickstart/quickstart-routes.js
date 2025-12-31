import Layout from '@/modules/layout/components/layout.vue';

const QuickstartPage = () => import('@/modules/quickstart/pages/quickstart-page.vue');

export default [
  {
    path: '/welcome-aboard',
    component: Layout,
    meta: {
      auth: true,
      title: 'Onboarding',
    },
    children: [
      {
        name: 'welcomeaboard',
        path: '/welcome-aboard',
        component: QuickstartPage,
        exact: true,
        meta: {
          auth: true,
        },
      },
    ],
  },
];
