<script setup>
import { parseBBCode } from "~~/server/utils/bbcode";

const threads = ref([]);
const loading = ref(true);
const { reloadTrigger } = useThreadStore();
const toast = useToast();

const reportReason = ref("");
const reportThreadOpen = ref(false);
const closeReportModal = () => {
  reportThreadOpen.value = !reportThreadOpen.value;
};
const reportThread = async (_threadID) => {
  if (reportReason.value.length === 0) {
    toast.add({
      color: "error",
      description: $t("error.emptyFields"),
    });
    return;
  }

  try {
    // await $fetch(`/api/threads/${threadID}/report`, {
    //   method: "POST",
    //   body: { reason: reportReason.value },
    // });
    toast.add({
      color: "success",
      description: $t("thread.report.success"),
    });
    reportReason.value = "";
  } catch (error) {
    console.error("Report submission failed:", error);
    toast.add({
      color: "error",
      description: $t("thread.report.error"),
    });
  } finally {
    closeReportModal();
  }
};

const fetchThreads = async () => {
  try {
    threads.value = await $fetch("/api/threads");
  } catch (error) {
    console.error("Failed to fetch threads:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchThreads();
});

watch(reloadTrigger, () => {
  fetchThreads();
});
</script>

<template>
  <UCard class="bg-midnight-50 dark:bg-midnight-900 transition-colors">
    <template #header>
      <h2 class="text-xl font-semibold text-primary noselect">
        {{ $t("threads") }}
      </h2>
    </template>

    <div v-if="loading" class="space-y-4">
      <UCard v-for="n in 3" :key="n" :ui="{ body: { padding: 'p-4' } }">
        <div class="flex flex-wrap gap-2 mb-2">
          <USkeleton class="h-6 w-16 rounded" v-for="i in 3" :key="i" />
        </div>
        <USkeleton class="h-6 w-2/3 mb-2 rounded" />
        <USkeleton class="h-4 w-1/4 mb-2 rounded" />
        <USkeleton class="h-32 w-full rounded mb-3" />
        <USkeleton class="h-4 w-full mb-1 rounded" />
        <USkeleton class="h-4 w-5/6 mb-1 rounded" />
        <USkeleton class="h-4 w-1/2 mb-1 rounded" />
      </UCard>
    </div>

    <div v-else class="space-y-4">
      <UCard
        v-for="thread in threads.slice(0, 10)"
        :key="thread.id"
        class="hover:shadow-lg transition-shadow bg-midnight-50 dark:bg-midnight-900"
        :ui="{ body: { padding: 'p-4' } }"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex flex-wrap gap-2 justify-start sm:justify-start">
              <UBadge
                v-for="tag in [...thread.tags].sort((a, b) =>
                  a.localeCompare(b)
                )"
                :key="tag"
                color="primary"
                variant="subtle"
                class="noselect"
              >
                #{{ tag }}
              </UBadge>
            </div>
          </div>

          <div class="ml-3 shrink-0">
            <UModal
              :title="$t('thread.report')"
              :description="$t('thread.report.info')"
              :close="false"
              v-model:open="reportThreadOpen"
            >
              <UButton
                variant="ghost"
                color="error"
                size="xs"
                icon="i-lucide-flag"
                :padded="false"
                class="!m-0"
                disabled
              />

              <template #body>
                <div class="space-y-4 noselect">
                  <UFormField :label="$t('reason')" required>
                    <UInput
                      :ui="{ base: 'bg-midnight-50 dark:bg-midnight-800' }"
                      v-model="reportReason"
                      class="w-full"
                      size="lg"
                      maxlength="100"
                      variant="soft"
                    />
                  </UFormField>

                  <div class="flex justify-end gap-2">
                    <UButton
                      :label="$t('report')"
                      color="error"
                      variant="solid"
                      @click="reportThread(thread.id)"
                    />
                    <UButton
                      :label="$t('cancel')"
                      color="neutral"
                      variant="outline"
                      @click="closeReportModal"
                    />
                  </div>
                </div>
              </template>
            </UModal>
          </div>
        </div>

        <h3 class="text-xl font-semibold text-primary noselect">
          <NuxtLink class="hover:underline" :to="`/thread/${thread.id}`">
            {{ thread.title }}
          </NuxtLink>
        </h3>

        <p class="text-xs text-midnight-500 dark:text-midnight-600 mb-1">
          <span class="noselect">ID: </span>
          <code
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
            >{{ thread.id }}</code
          >
        </p>

        <div v-if="thread.file" class="my-2">
          <img
            :src="thread.file.url"
            alt="Thread Image"
            class="rounded-md max-h-64 object-cover noselect"
          />
        </div>

        <blockquote
          class="border-l-4 border-midnight-300 dark:border-midnight-600 pl-4 italic text-midnight-700 dark:text-midnight-300 text-sm sm:text-base w-full"
        >
          <div
            v-html="parseBBCode(thread.content)"
            class="whitespace-pre-warp line-clamp-10"
          />
        </blockquote>

        <div
          class="text-sm text-midnight-900 dark:text-midnight-400 flex justify-between mt-4 noselect"
        >
          <span
            >{{ $t("by") }}
            <span
              class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
              >{{ thread.author }}</span
            ></span
          >
          <span
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
          >
            {{ new Date(thread.createdAt).toLocaleDateString() }}
            {{
              new Date(thread.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </span>
        </div>

        <div
          class="text-sm text-midnight-900 dark:text-midnight-400 mt-1 noselect"
        >
          {{ $t("replies") }}:
          <span
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
            >{{ thread.replies?.length || 0 }}</span
          >
          | {{ $t("replies.last") }}:
          <span
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
          >
            {{ new Date(thread.updatedAt).toLocaleDateString() }}
            {{
              new Date(thread.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </span>
        </div>
      </UCard>
    </div>
  </UCard>
</template>
