// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  appConfig: {
    AwsAccessKeyID: process.env.HAKO_AWSACCESS_KEY_ID,
    AwsBucket: process.env.HAKO_AWSBUCKET,
    AwsEndpoint: process.env.HAKO_AWSENDPOINT,
    AwsRegion: process.env.HAKO_AWSREGION,
    AwsSecretAccessKey: process.env.HAKO_AWSSECRET_ACCESS_KEY,
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
    AwsAccessKeyID: process.env.HAKO_AWSACCESS_KEY_ID,
    AwsBucket: process.env.HAKO_AWSBUCKET,
    AwsEndpoint: process.env.HAKO_AWSENDPOINT,
    AwsRegion: process.env.HAKO_AWSREGION,
    AwsSecretAccessKey: process.env.HAKO_AWSSECRET_ACCESS_KEY,
    Mongo: process.env.MONGO,
    Web: process.env.WEB || "http://localhost:3000",
  }
});