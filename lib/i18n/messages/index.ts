import { adminShellMessages } from "./admin-shell";
import { adminContentGenerationMessages } from "./admin-content-generation";
import { adminCommerceUiMessages } from "./admin-commerce-ui";
import { adminCommunicationsMessages } from "./admin-communications";
import { adminDashboardsAMessages } from "./admin-dashboards-a";
import { adminDashboardsBMessages } from "./admin-dashboards-b";
import { adminWorkflowsMessages } from "./admin-workflows";
import { salesAdminManagementMessages } from "./sales-admin-management";
import { salesAdminEditorMessages } from "./sales-admin-editor";
import { salesCheckoutMessages } from "./sales-checkout";
import { accountMessages } from "./account";
import { authErrorMessages } from "./auth-errors";
import { commonMessages } from "./common";
import { customerActivityMessages } from "./customer-activity";
import { helpMessages } from "./help";
import { shoppingMessages } from "./shopping";
import { salesStorefrontMessages } from "./sales-storefront";
import { storefrontMessages } from "./storefront";
import { testimonialMessages } from "./testimonials";

export const messages = {
  en: {
    ...adminShellMessages.en,
    ...adminContentGenerationMessages.en,
    ...adminCommerceUiMessages.en,
    ...adminCommunicationsMessages.en,
    ...adminDashboardsAMessages.en,
    ...adminDashboardsBMessages.en,
    ...adminWorkflowsMessages.en,
    ...salesAdminManagementMessages.en,
    ...salesAdminEditorMessages.en,
    ...salesCheckoutMessages.en,
    ...accountMessages.en,
    ...authErrorMessages.en,
    ...commonMessages.en,
    ...customerActivityMessages.en,
    ...helpMessages.en,
    ...shoppingMessages.en,
    ...salesStorefrontMessages.en,
    ...storefrontMessages.en,
    ...testimonialMessages.en,
  },
  vi: {
    ...adminShellMessages.vi,
    ...adminContentGenerationMessages.vi,
    ...adminCommerceUiMessages.vi,
    ...adminCommunicationsMessages.vi,
    ...adminDashboardsAMessages.vi,
    ...adminDashboardsBMessages.vi,
    ...adminWorkflowsMessages.vi,
    ...salesAdminManagementMessages.vi,
    ...salesAdminEditorMessages.vi,
    ...salesCheckoutMessages.vi,
    ...accountMessages.vi,
    ...authErrorMessages.vi,
    ...commonMessages.vi,
    ...customerActivityMessages.vi,
    ...helpMessages.vi,
    ...shoppingMessages.vi,
    ...salesStorefrontMessages.vi,
    ...storefrontMessages.vi,
    ...testimonialMessages.vi,
  },
} as const;

export type TranslationKey = keyof (typeof messages)["en"];
