import { adminCommerceUiMessages } from "./admin-commerce-ui";
import { adminCommunicationsMessages } from "./admin-communications";
import { adminContentGenerationMessages } from "./admin-content-generation";
import { adminDashboardsAMessages } from "./admin-dashboards-a";
import { adminDashboardsBMessages } from "./admin-dashboards-b";
import { adminShellMessages } from "./admin-shell";
import { adminWorkflowsMessages } from "./admin-workflows";
import { salesAdminEditorMessages } from "./sales-admin-editor";
import { salesAdminManagementMessages } from "./sales-admin-management";

export const adminMessages = {
  en: {
    ...adminCommerceUiMessages.en,
    ...adminCommunicationsMessages.en,
    ...adminContentGenerationMessages.en,
    ...adminDashboardsAMessages.en,
    ...adminDashboardsBMessages.en,
    ...adminShellMessages.en,
    ...adminWorkflowsMessages.en,
    ...salesAdminEditorMessages.en,
    ...salesAdminManagementMessages.en,
  },
  vi: {
    ...adminCommerceUiMessages.vi,
    ...adminCommunicationsMessages.vi,
    ...adminContentGenerationMessages.vi,
    ...adminDashboardsAMessages.vi,
    ...adminDashboardsBMessages.vi,
    ...adminShellMessages.vi,
    ...adminWorkflowsMessages.vi,
    ...salesAdminEditorMessages.vi,
    ...salesAdminManagementMessages.vi,
  },
} as const;

export type AdminMessages = typeof adminMessages;
