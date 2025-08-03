<template>
  <UApp
    :toaster="{
      position: 'top-right',
      duration: 2000,
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
