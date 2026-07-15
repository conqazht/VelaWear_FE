import { adminShellMessages } from "./admin-shell";
import { adminCommerceUiMessages } from "./admin-commerce-ui";
import { adminCommunicationsMessages } from "./admin-communications";
import { adminDashboardsAMessages } from "./admin-dashboards-a";
import { adminDashboardsBMessages } from "./admin-dashboards-b";
import { adminWorkflowsMessages } from "./admin-workflows";
import { accountMessages } from "./account";
import { authErrorMessages } from "./auth-errors";
import { commonMessages } from "./common";
import { customerActivityMessages } from "./customer-activity";
import { helpMessages } from "./help";
import { shoppingMessages } from "./shopping";
import { storefrontMessages } from "./storefront";
import { testimonialMessages } from "./testimonials";

export const messages = {
  en: {
    ...adminShellMessages.en,
    ...adminCommerceUiMessages.en,
    ...adminCommunicationsMessages.en,
    ...adminDashboardsAMessages.en,
    ...adminDashboardsBMessages.en,
    ...adminWorkflowsMessages.en,
    ...accountMessages.en,
    ...authErrorMessages.en,
    ...commonMessages.en,
    ...customerActivityMessages.en,
    ...helpMessages.en,
    ...shoppingMessages.en,
    ...storefrontMessages.en,
    ...testimonialMessages.en,
  },
  vi: {
    ...adminShellMessages.vi,
    ...adminCommerceUiMessages.vi,
    ...adminCommunicationsMessages.vi,
    ...adminDashboardsAMessages.vi,
    ...adminDashboardsBMessages.vi,
    ...adminWorkflowsMessages.vi,
    ...accountMessages.vi,
    ...authErrorMessages.vi,
    ...commonMessages.vi,
    ...customerActivityMessages.vi,
    ...helpMessages.vi,
    ...shoppingMessages.vi,
    ...storefrontMessages.vi,
    ...testimonialMessages.vi,
  },
} as const;

export type TranslationKey = keyof (typeof messages)["en"];
