<template>
  <footer
    class="noselect w-full py-6 px-4 sm:px-6 bg-midnight-100 dark:bg-midnight-950 border-t border-midnight-300 dark:border-midnight-700"
  >
    <div
      class="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <p class="text-sm text-midnight-800 dark:text-midnight-100">
        &copy; {{ new Date().getFullYear() }}
        <span class="text-brick-red-600 dark:text-brick-red-500">2rkf</span
        >. All rights reserved.
      </p>
      <div class="flex gap-4">
        <NuxtLink
          to="https://twitter.com/reinacchi_"
          target="_blank"
          aria-label="Twitter"
        >
          <UIcon
            name="i-line-md:twitter"
            class="w-5 h-5 text-midnight-700 dark:text-midnight-300 hover:text-blue-500 transition"
          />
        </NuxtLink>
        <NuxtLink
          to="https://github.com/2rkf/hako"
          target="_blank"
          aria-label="GitHub"
        >
          <UIcon
            name="i-line-md:github"
            class="w-5 h-5 text-midnight-700 dark:text-midnight-300 hover:text-midnight-300 dark:hover:text-white transition"
          />
        </NuxtLink>
        <NuxtLink
          to="https://discord.com"
          target="_blank"
          aria-label="Discord"
        >
          <UIcon
            name="i-line-md:discord"
            class="w-5 h-5 text-midnight-700 dark:text-midnight-300 hover:text-[#5865f2] transition"
          />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>