<template>
  <UApp
    :toaster="{
      position: 'top-right',
      ui: {
        base: 'bg-muted dark:bg-midnight-900',
      }
    }"
  >
    <NuxtPage class="animate-slide-up" />
    <Footer />
    <Tab />
  </UApp>
</template>
