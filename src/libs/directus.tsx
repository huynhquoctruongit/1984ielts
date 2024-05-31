import { createDirectus, authentication, rest } from "@directus/sdk";
export const directus = createDirectus(import.meta.env.VITE_CMS)
  .with(authentication("cookie", { credentials: "include" }))
  .with(rest());
