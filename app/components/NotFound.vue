<template>
  <div class="flex flex-col items-center text-center py-16">
    <h1 class="text-5xl font-bold text-red-500 mb-4">404</h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-6">
      {{ $t("notfound.desc") }}
    </p>
    <NuxtLink to="/" class="text-secondary hover:underline"
      >← {{ $t("notfound.home") }}</NuxtLink
    >
  </div>
</template>
