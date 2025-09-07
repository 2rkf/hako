<script setup>
import { parseBBCode } from "~~/server/utils/bbcode";

useHead({
  title: "Community Guidelines - Hako",
  meta: [
    { property: "og:title", content: "Community Guidelines - Hako" },
    { property: "og:site_name", content: "2rkf" },
    {
      property: "og:description",
      content: "Read the rules and guidelines before posting on Hako.",
    },
    { property: "og:image", content: "/hako.png" },
    { property: "og:image:type", content: "image/png" },
    { name: "theme-color", content: "#cc536e" },
    { "http-equiv": "x-ua-compatible", content: "IE=edge" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
  ],
});
</script>

<template>
  <div
    class="min-h-screen bg-midnight-100 dark:bg-midnight-950 transition-colors font-sans"
  >
    <div class="max-w-4xl mx-auto px-4 pt-16 pb-6">
      <div class="flex items-center gap-3 mb-12 animate-slide-up">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img
            src="/assets/img/hako.png"
            class="w-12 sm:w-14 h-auto noselect"
            draggable="false"
            alt="Hako Logo"
          />
          <h1
            class="font-sans font-bold text-4xl text-brick-red-400 tracking-wider noselect"
          >
            {{ $t("title") }}
          </h1>
        </NuxtLink>
      </div>

      <UCard
        id="posting-rules"
        class="mb-8 bg-midnight-50 dark:bg-midnight-900"
      >
        <template #header>
          <h2 class="text-xl font-semibold text-primary noselect">
            {{ $t("rule") }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 noselect">
            {{ $t("rule_description") }}
          </p>
        </template>

        <div class="space-y-4 noselect">
          <p class="text-base text-gray-700 dark:text-gray-300">
            {{ $t("rule_intro") }}
          </p>

          <ol
            class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300"
          >
            <li v-html="parseBBCode($t('rule_1'))" />
            <li v-html="parseBBCode($t('rule_2'))" />
            <li v-html="parseBBCode($t('rule_3'))" />
            <li v-html="parseBBCode($t('rule_4'))" />
            <li v-html="parseBBCode($t('rule_5'))" />
          </ol>

          <p class="text-base text-gray-700 dark:text-gray-300">
            {{ $t("rule_outro") }}
          </p>
        </div>
      </UCard>

      <div class="mt-10">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-brick-red-400 hover:underline noselect"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          <span>{{ $t("back") }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
