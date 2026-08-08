import { accountMessages } from "./account";
import { customerActivityMessages } from "./customer-activity";
import { helpMessages } from "./help";
import { salesCheckoutMessages } from "./sales-checkout";
import { salesStorefrontMessages } from "./sales-storefront";
import { shoppingMessages } from "./shopping";
import { storefrontMessages } from "./storefront";
import { testimonialMessages } from "./testimonials";

export const shopMessages = {
  en: {
    ...accountMessages.en,
    ...customerActivityMessages.en,
    ...helpMessages.en,
    ...salesCheckoutMessages.en,
    ...salesStorefrontMessages.en,
    ...shoppingMessages.en,
    ...storefrontMessages.en,
    ...testimonialMessages.en,
  },
  vi: {
    ...accountMessages.vi,
    ...customerActivityMessages.vi,
    ...helpMessages.vi,
    ...salesCheckoutMessages.vi,
    ...salesStorefrontMessages.vi,
    ...shoppingMessages.vi,
    ...storefrontMessages.vi,
    ...testimonialMessages.vi,
  },
} as const;

export type ShopMessages = typeof shopMessages;
