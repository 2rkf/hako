// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  appConfig: {
    AwsAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
    AwsBucket: process.env.AWS_BUCKET,
    AwsEndpoint: process.env.AWS_ENDPOINT,
    AwsRegion: process.env.AWS_REGION,
    AwsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Mongo: process.env.MONGO,
    Web: process.env.WEB || "http://localhost:3000",
  },
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
    AwsAccessKeyID: process.env.AWS_ACCESS_KEY_ID,
    AwsBucket: process.env.AWS_BUCKET,
    AwsEndpoint: process.env.AWS_ENDPOINT,
    AwsRegion: process.env.AWS_REGION,
    AwsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    Mongo: process.env.MONGO,
    Web: process.env.WEB || "http://localhost:3000",
  }
});