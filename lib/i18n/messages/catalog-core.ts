import { authErrorMessages } from "./auth-errors";
import { commonMessages } from "./common";

export const coreMessages = {
  en: {
    ...commonMessages.en,
    ...authErrorMessages.en,
  },
  vi: {
    ...commonMessages.vi,
    ...authErrorMessages.vi,
  },
} as const;

export type CoreMessages = typeof coreMessages;
