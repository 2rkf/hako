<script setup>
import { parseBBCode } from "~~/server/utils/bbcode";

useHead({
  title: "FAQ - Hako",
  meta: [
    { property: "og:title", content: "FAQ - Hako" },
    { property: "og:site_name", content: "2rkf" },
    {
      property: "og:description",
      content: "Frequently Asked Questions about Hako.",
    },
    { property: "og:image", content: "/hako.png" },
    { property: "og:image:type", content: "image/png" },
    { name: "theme-color", content: "#cc536e" },
    { "http-equiv": "x-ua-compatible", content: "IE=edge" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
  ],
});

const g_faqs = [
  { q: "faq_g_q1", a: "faq_g_a1" },
  { q: "faq_g_q2", a: "faq_g_a2", hasRuleLink: true },
  { q: "faq_g_q3", a: "faq_g_a3" },
];

const p_faqs = [
  { q: "faq_p_q1", a: "faq_p_a1", hasRuleLink: true },
  { q: "faq_p_q2", a: "faq_p_a2" },
  { q: "faq_p_q3", a: "faq_p_a3" },
  { q: "faq_p_q4", a: "faq_p_a4" },
  { q: "faq_p_q5", a: "faq_p_a5" },
  { q: "faq_p_q6", a: "faq_p_a6" },
  { q: "faq_p_q7", a: "faq_p_a7" },
  { q: "faq_p_q8", a: "faq_p_a8" },
];

const t_faqs = [{ q: "faq_t_q1", a: "faq_t_a1" }];
</script>

<template>
  <div
    class="min-h-screen bg-midnight-100 dark:bg-midnight-950 transition-colors font-sans"
  >
    <div class="max-w-4xl mx-auto px-4 pt-16 pb-6">
      <div class="flex items-center gap-3 mb-12 animate-slide-up">
        <NuxtLink class="flex items-center gap-3" to="/">
          <img
            src="/assets/img/hako.png"
            class="w-12 sm:w-14 h-auto noselect"
            draggable="false"
            alt="Hako Logo"
          />
          <h1
            class="font-sans font-bold text-4xl text-brick-red-400 tracking-widest noselect"
          >
            {{ $t("title") }}
          </h1>
        </NuxtLink>
      </div>

      <div class="space-y-6">
        <UCard class="bg-midnight-50 dark:bg-midnight-900 noselect">
          <template #header>
            <h2 class="text-lg font-semibold text-primary noselect">
              {{ $t("faq_long") }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 noselect">
              {{ $t("faq_description") }}
            </p>
          </template>
        </UCard>

        <UCard class="bg-midnight-50 dark:bg-midnight-900 noselect">
          <template #header>
            <h2 class="text-lg font-semibold text-primary noselect">
              {{ $t("faq_questions") }}
            </h2>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 class="text-base font-semibold text-primary mb-2">
                {{ $t("faq_general") }}
              </h3>
              <ul class="list-disc list-inside space-y-1">
                <li
                  class="ml-4"
                  v-for="(item, index) in g_faqs"
                  :key="`g_${index}`"
                >
                  <NuxtLink
                    :to="`#general_${index + 1}`"
                    class="text-brick-red-400 hover:underline"
                  >
                    {{ $t(item.q) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="text-base font-semibold text-primary mb-2">
                {{ $t("faq_posting") }}
              </h3>
              <ul class="list-disc list-inside space-y-1">
                <li
                  class="ml-4"
                  v-for="(item, index) in p_faqs"
                  :key="`t_${index}`"
                >
                  <NuxtLink
                    :to="`#posting_${index + 1}`"
                    class="text-brick-red-400 hover:underline"
                  >
                    {{ $t(item.q) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="text-base font-semibold text-primary mb-2">
                {{ $t("faq_tagging") }}
              </h3>
              <ul class="list-disc list-inside space-y-1">
                <li
                  class="ml-4"
                  v-for="(item, index) in t_faqs"
                  :key="`tg_${index}`"
                >
                  <NuxtLink
                    :to="`#tagging_${index + 1}`"
                    class="text-brick-red-400 hover:underline"
                  >
                    {{ $t(item.q) }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </UCard>

        <UCard class="bg-midnight-50 dark:bg-midnight-900 noselect">
          <template #header>
            <h2
              id="general"
              class="text-lg font-semibold text-primary noselect"
            >
              {{ $t("faq_general") }}
            </h2>
          </template>

          <div class="space-y-6">
            <div
              v-for="(item, index) in g_faqs"
              :key="index"
              class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            >
              <h3
                :id="`general_${index + 1}`"
                class="text-base font-semibold text-primary"
              >
                {{ $t(item.q) }}
              </h3>

              <p
                v-if="!item.hasRuleLink"
                class="text-base text-gray-700 dark:text-gray-300 mt-2"
                v-html="parseBBCode($t(item.a))"
              />

              <p v-else class="text-base text-gray-700 dark:text-gray-300 mt-2">
                <i18n-t :keypath="item.a" tag="span">
                  <template #rule_link>
                    <NuxtLink
                      to="/rules"
                      class="text-brick-red-400 hover:underline"
                    >
                      {{ $t("rule") }}
                    </NuxtLink>
                  </template>
                </i18n-t>
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="bg-midnight-50 dark:bg-midnight-900 noselect">
          <template #header>
            <h2
              id="posting"
              class="text-lg font-semibold text-primary noselect"
            >
              {{ $t("faq_posting") }}
            </h2>
          </template>

          <div class="space-y-6">
            <div
              v-for="(item, index) in p_faqs"
              :key="index"
              class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            >
              <h3
                :id="`posting_${index + 1}`"
                class="text-base font-semibold text-primary"
              >
                {{ $t(item.q) }}
              </h3>

              <p
                v-if="!item.hasRuleLink"
                class="text-base text-gray-700 dark:text-gray-300 mt-2"
                v-html="parseBBCode($t(item.a))"
              />

              <p v-else class="text-base text-gray-700 dark:text-gray-300 mt-2">
                <i18n-t :keypath="item.a" tag="span">
                  <template #rule_link>
                    <NuxtLink
                      to="/rules"
                      class="text-brick-red-400 hover:underline"
                    >
                      {{ $t("rule") }}
                    </NuxtLink>
                  </template>
                </i18n-t>
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="bg-midnight-50 dark:bg-midnight-900 noselect">
          <template #header>
            <h2
              id="tagging"
              class="text-lg font-semibold text-primary noselect"
            >
              {{ $t("faq_tagging") }}
            </h2>
          </template>

          <div class="space-y-6">
            <div
              v-for="(item, index) in t_faqs"
              :key="index"
              class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            >
              <h3
                :id="`tagging_${index + 1}`"
                class="text-base font-semibold text-primary"
              >
                {{ $t(item.q) }}
              </h3>

              <p
                v-if="!item.hasRuleLink"
                class="text-base text-gray-700 dark:text-gray-300 mt-2"
                v-html="parseBBCode($t(item.a))"
              />

              <p v-else class="text-base text-gray-700 dark:text-gray-300 mt-2">
                <i18n-t :keypath="item.a" tag="span">
                  <template #rule_link>
                    <NuxtLink
                      to="/rules"
                      class="text-brick-red-400 hover:underline"
                    >
                      {{ $t("rule") }}
                    </NuxtLink>
                  </template>
                </i18n-t>
              </p>
            </div>
          </div>
        </UCard>
      </div>

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
