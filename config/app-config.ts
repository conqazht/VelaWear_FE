import packageJson from "../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Vela Wear Admin",
  version: packageJson.version,
  copyright: `© ${currentYear}, Vela Wear.`,
  meta: {
    title: "Vela Wear Admin",
    description:
      "Administration workspace for Vela Wear commerce operations.",
  },
};
