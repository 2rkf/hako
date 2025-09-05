<script setup>
const { locale, locales, setLocale } = useI18n();
</script>

<template>
  <div class="absolute right-4 sm:right-12 top-4 sm:top-8">
    <UPopover>
      <UButton
        icon="i-lucide-menu"
        :label="$t('menu')"
        size="xl"
        color="neutral"
        variant="ghost"
        class="text-brick-red-500 dark:text-brick-red-200"
      />

      <template #content>
        <div
          class="flex flex-col items-center justify-center space-y-3 p-3 min-w-[160px]"
        >
          <UColorModeSelect />
          <ULocaleSelect
            v-model="locale"
            :locales="locales"
            @update:model-value="setLocale($event)"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>
