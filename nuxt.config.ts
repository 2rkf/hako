// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  css: ["~/assets/css/style.css"],
  devtools: { enabled: true },
  i18n: {
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "ja", name: "日本語", file: "ja.json" }
    ],
    defaultLocale: "en",
    langDir: "../locales",
    strategy: "no_prefix",
  },
  modules: ["@nuxt/ui", "@nuxt/eslint", "@nuxtjs/i18n"],
  nitro: {
    plugins: ["~~/server/plugins/database.ts"],
  },
  runtimeConfig: {
    Mongo: process.env.MONGO,
    WEBS: process.env.WEBS,
  }
});