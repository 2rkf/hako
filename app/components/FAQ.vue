<script setup>
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
</script>

<template>
  <div
    class="min-h-screen bg-midnight-100 dark:bg-midnight-950 transition-colors font-sans"
  >
    <div class="max-w-4xl mx-auto px-4 pt-16 pb-6">
      <div class="flex items-center gap-3 mb-12 animate-slide-up">
        <img
          src="/assets/img/hako.png"
          class="w-12 sm:w-14 h-auto noselect"
          draggable="false"
          alt="Hako Logo"
        />
        <h1
          class="font-sans font-bold text-4xl text-brick-red-400 tracking-widest noselect"
        >
          {{ $t("faq_long") }}
        </h1>
      </div>

      <UCard class="bg-midnight-50 dark:bg-midnight-900">
        <template #header>
          <h2 class="text-lg font-semibold text-primary noselect">
            {{ $t("faq_general") }}
          </h2>
        </template>

        <div class="space-y-6">
          <div
            v-for="(item, index) in g_faqs"
            :key="index"
            class="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
          >
            <h3 class="text-base font-semibold text-primary">
              {{ $t(item.q) }}
            </h3>

            <p
              v-if="!item.hasRuleLink"
              class="text-base text-gray-700 dark:text-gray-300 mt-2"
            >
              {{ $t(item.a) }}
            </p>

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

      <div class="mt-10">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-brick-red-400 hover:underline"
        >
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          <span>{{ $t("back") }}</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
