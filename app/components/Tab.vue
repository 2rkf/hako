<script setup>
const { locale, locales, setLocale } = useI18n();
const colourMode = useColorMode();

const availableLocales = computed(() => {
  return locales.value.filter((i) => i.code !== locale.value);
});

const isDark = computed({
  get() {
    return colourMode.value === "dark";
  },
  set() {
    colourMode.preference = colourMode.value === "dark" ? "light" : "dark";
  },
});
</script>

<template>
  <div
    class="absolute top-4 right-4 sm:top-8 sm:right-10 flex items-center space-x-1"
  >
    <!-- Colour Mode Switcher -->
    <ClientOnly v-if="!colourMode?.forced">
      <UButton
        :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        color="neutral"
        variant="ghost"
        @click="isDark = !isDark"
      />

      <template #fallback>
        <div class="size-8" />
      </template>
    </ClientOnly>
    
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
