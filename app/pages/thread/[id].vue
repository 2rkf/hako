<script setup>
const { reloadTrigger } = useThreadStore();
const route = useRoute();
const threadID = route.params.id;
const thread = ref();

const fetchThread = async () => {
  thread.value = await $fetch(`/api/threads/${threadID}`);
};

onMounted(() => {
  fetchThread();
});
watch(reloadTrigger, () => {
  fetchThread();
});
</script>

<template>
  <div
    class="min-h-screen bg-midnight-100 dark:bg-midnight-950 transition-colors font-sans"
  >
    <div class="max-w-4xl mx-auto px-4 pt-16 pb-6">
      <ThreadsView v-if="thread" :thread="thread" />
      <div v-if="!thread" class="space-y-4">
        <UCard
          class="hover:shadow-lg transition-shadow bg-midnight-50 dark:bg-midnight-900 mb-4"
          :ui="{ body: { padding: 'p-4' } }"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex flex-wrap gap-2">
              <USkeleton class="h-6 w-16 rounded" v-for="i in 3" :key="i" />
            </div>
            <USkeleton class="h-6 w-6 rounded" />
          </div>

          <USkeleton class="h-8 w-3/4 mb-2 rounded" />
          <USkeleton class="h-4 w-1/4 mb-2 rounded" />

          <div class="space-y-2">
            <USkeleton class="h-4 w-full rounded" />
            <USkeleton class="h-4 w-5/6 rounded" />
            <USkeleton class="h-4 w-2/3 rounded" />
            <USkeleton class="h-4 w-3/4 rounded" />
          </div>

          <USkeleton class="h-64 w-full mt-4 rounded-md" />

          <div class="flex justify-between mt-4">
            <USkeleton class="h-4 w-24 rounded" />
            <USkeleton class="h-4 w-24 rounded" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
