<script setup>
const { locale, locales, setLocale } = useI18n();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});
</script>

<template>
  <div
    class="absolute top-4 right-4 sm:top-8 sm:right-10 flex items-center space-x-1"
  >
    <!-- Colour Mode Switcher -->
    <UColorModeButton />
    
    <!-- Language Switcher -->
    <div v-for="locale in availableLocales" :key="locale.code">
      <UButton
        class="text-brick-red-500 dark:text-brick-red-200 noselect font-semibold text-lg sm:text-xl"
        color="neutral"
        variant="ghost"
        @click="setLocale(locale.code)"
      >
        {{ locale.name }}
      </UButton>
    </div>
  </div>
</template>
