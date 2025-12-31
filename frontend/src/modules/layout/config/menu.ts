import { MenuLink } from '@/modules/layout/types/MenuLink';
import home from './links/home';
import contacts from './links/contacts';
import organizations from './links/organizations';
import activities from './links/activities';
import reports from './links/reports';
import chat from './links/chat';
import automations from './links/automations';
import integrations from './links/integrations';
import shareFeedback from './links/share-feedback';
import documentation from './links/documentation';
import changelog from './links/changelog';
import community from './links/community';
import usersPermissions from './links/users-permissions';
import apiKeys from './links/api-keys';
import plansBilling from './links/plans-billing';

// Signals (default) main menu: everything except DevTel (reports)
export const signalsMainMenu: MenuLink[] = [
  home,
  contacts,
  organizations,
  activities,
];

// Signals bottom menu: everything except chat
export const signalsBottomMenu: MenuLink[] = [
  automations,
  integrations,
];

// Chat-only menu
export const chatMenu: MenuLink[] = [
  chat,
];

// DevTel-only menu (reports)
export const devtelMenu: MenuLink[] = [
  reports,
];

// Backwards-compatible exports (default to Signals menus)
export const mainMenu: MenuLink[] = signalsMainMenu;
export const bottomMenu: MenuLink[] = signalsBottomMenu;

// Support menu
export const supportMenu: MenuLink[] = [
  shareFeedback,
  documentation,
  changelog,
  community,
];

// Tenant menu
export const tenantMenu: MenuLink[] = [
  usersPermissions,
  apiKeys,
  plansBilling,
];
