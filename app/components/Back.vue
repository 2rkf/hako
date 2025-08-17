<template>
  <NuxtLink
    to="/"
    class="absolute top-[24px] left-4 sm:top-6 sm:left-6 text-midnight-800 dark:text-midnight-200 text-2xl sm:text-4xl z-50"
  >
    <UTooltip
      :text="$t('backward')"
      :kbds="['Alt', 'arrowleft']"
      :content="{ side: 'right' }"
    >
      <UIcon name="i-lucide-arrow-left" />
    </UTooltip>
  </NuxtLink>
</template>
