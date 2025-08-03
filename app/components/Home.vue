<script setup>
useHead({
  title: "Hako",
  meta: [
    { property: "og:title", content: "Hako" },
    { property: "og:site_name", content: "2rkf" },
    {
      property: "og:description",
      content: "A bulletin board website.",
    },
    { property: "og:image", content: "/hako.png" },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
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
      </div>

      <UCard class="mb-8 bg-midnight-50 dark:bg-midnight-900">
        <template #header>
          <h2 class="text-xl font-semibold text-primary noselect">
            {{ $t("whatis") }}
          </h2>
        </template>

        <div class="space-y-4 noselect">
          <p class="text-base text-gray-700 dark:text-gray-300">
            {{ $t("description") }}
          </p>
          <p class="text-base text-gray-700 dark:text-gray-300">
            {{ $t("description2") }}
          </p>
        </div>
      </UCard>

      <ThreadsCreate />
      <ThreadsList />
    </div>
  </div>
</template>
