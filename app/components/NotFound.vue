<template>
  <div class="flex flex-col items-center text-center">
    <UError
      :error="{
        statusCode: 404,
        statusMessage: $t('notfound.title'),
        message: $t('notfound.desc'),
      }"
      :clear="{
        label: $t('notfound.home'),
      }"
    />
  </div>
</template>
