import type { accountMessages } from "./account";
import type { adminCommerceUiMessages } from "./admin-commerce-ui";
import type { adminCommunicationsMessages } from "./admin-communications";
import type { adminContentGenerationMessages } from "./admin-content-generation";
import type { adminDashboardsAMessages } from "./admin-dashboards-a";
import type { adminDashboardsBMessages } from "./admin-dashboards-b";
import type { adminShellMessages } from "./admin-shell";
import type { adminWorkflowsMessages } from "./admin-workflows";
import type { authErrorMessages } from "./auth-errors";
import type { commonMessages } from "./common";
import type { customerActivityMessages } from "./customer-activity";
import type { helpMessages } from "./help";
import type { salesAdminEditorMessages } from "./sales-admin-editor";
import type { salesAdminManagementMessages } from "./sales-admin-management";
import type { salesCheckoutMessages } from "./sales-checkout";
import type { salesStorefrontMessages } from "./sales-storefront";
import type { shoppingMessages } from "./shopping";
import type { storefrontMessages } from "./storefront";
import type { testimonialMessages } from "./testimonials";

export type AllEnMessages = typeof adminShellMessages.en &
  typeof adminContentGenerationMessages.en &
  typeof adminCommerceUiMessages.en &
  typeof adminCommunicationsMessages.en &
  typeof adminDashboardsAMessages.en &
  typeof adminDashboardsBMessages.en &
  typeof adminWorkflowsMessages.en &
  typeof salesAdminManagementMessages.en &
  typeof salesAdminEditorMessages.en &
  typeof salesCheckoutMessages.en &
  typeof accountMessages.en &
  typeof authErrorMessages.en &
  typeof commonMessages.en &
  typeof customerActivityMessages.en &
  typeof helpMessages.en &
  typeof shoppingMessages.en &
  typeof salesStorefrontMessages.en &
  typeof storefrontMessages.en &
  typeof testimonialMessages.en;

export type TranslationKey = keyof AllEnMessages;
