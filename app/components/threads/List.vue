<script setup>
import { parseBBCode } from "~~/server/utils/bbcode";
import { captchaStorage } from "~~/server/utils/storage";
import { fibonacci } from "~~/server/utils/fibonacci";

const threads = ref([]);
const loading = ref(true);
const { reloadTrigger } = useThreadStore();
const toast = useToast();
const captcha = ref();
const submission = ref({
  captcha: "",
  uuid: "",
});

const cooldownGenerateUntil = useCookie("captcha_generate_until_report");
const cooldownRefreshUntil = useCookie("captcha_refresh_until_report");

const refreshCount = ref(0);
const cooldown = ref(0);
let cooldownInterval = null;

const startCooldown = (type = "generate") => {
  const now = Date.now();
  const cooldownTime =
    type === "generate" ? 60 : fibonacci(refreshCount.value) * 5;
  const until = now + cooldownTime * 1000;

  if (type === "generate") {
    cooldownGenerateUntil.value = until;
  } else {
    cooldownRefreshUntil.value = until;
    refreshCount.value++;
  }

  updateCooldown();
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(updateCooldown, 1000);
};

const updateCooldown = () => {
  const now = Date.now();
  const generateLeft = cooldownGenerateUntil.value
    ? cooldownGenerateUntil.value - now
    : 0;
  const refreshLeft = cooldownRefreshUntil.value
    ? cooldownRefreshUntil.value - now
    : 0;

  const isGenerate = generateLeft > refreshLeft;
  cooldown.value = Math.max(0, isGenerate ? generateLeft : refreshLeft) / 1000;

  if (cooldown.value <= 0) {
    clearInterval(cooldownInterval);
  }
};

const getCaptcha = async () => {
  const now = Date.now();
  const generateLeft = cooldownGenerateUntil.value
    ? cooldownGenerateUntil.value - now
    : 0;
  const refreshLeft = cooldownRefreshUntil.value
    ? cooldownRefreshUntil.value - now
    : 0;

  const isGenerate = !captcha.value;
  const isOnCooldown = isGenerate ? generateLeft > 0 : refreshLeft > 0;

  if (isGenerate) refreshCount.value = 0;
  if (isOnCooldown) return;

  const previousUUID = submission.value.uuid;
  captcha.value = await $fetch("/api/captcha/generate");
  submission.value.uuid = captcha.value.uuid;
  submission.value.captcha = "";

  if (previousUUID && previousUUID !== submission.value.uuid) {
    captchaStorage.delete(previousUUID);
  }

  startCooldown(isGenerate ? "generate" : "refresh");
};

const reportReason = ref("");
const reportThreadOpen = ref(false);
const closeReportModal = () => {
  reportThreadOpen.value = !reportThreadOpen.value;
};
const reportThreadID = ref(null);
const reportThread = async () => {
  if (reportReason.value.length === 0) {
    toast.add({
      color: "error",
      description: $t("error.emptyFields"),
    });
    return;
  }

  if (!captcha.value || !captcha.value.svg) {
    toast.add({
      color: "error",
      description: $t("captcha.error"),
    });
    return;
  }

  if (cooldown.value > 0) {
    submission.value.captcha = "";
    toast.add({
      color: "error",
      description: $t("captcha.onCooldown"),
    });
    return;
  }

  const captchaResponse = await $fetch("/api/captcha/submit", {
    method: "POST",
    body: submission.value,
  });

  if (captchaResponse.status !== 200) {
    toast.add({
      color: "error",
      description: $t("captcha.error"),
    });
    submission.value.captcha = "";
    return getCaptcha();
  }

  try {
    await $fetch(`/api/threads/${reportThreadID.value}/report`, {
      method: "POST",
      body: { reason: reportReason.value },
    });
    toast.add({
      color: "success",
      description: $t("thread.report.success"),
    });
    reportReason.value = "";
    submission.value.captcha = "";
    captcha.value = undefined;
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

  const now = Date.now();
  const generateLeft = cooldownGenerateUntil.value
    ? cooldownGenerateUntil.value - now
    : 0;
  const refreshLeft = cooldownRefreshUntil.value
    ? cooldownRefreshUntil.value - now
    : 0;

  const remaining = Math.max(generateLeft, refreshLeft);
  if (remaining > 0) {
    cooldown.value = remaining / 1000;

    cooldownInterval = setInterval(updateCooldown, 1000);
  }
});

watch(reloadTrigger, () => {
  fetchThreads();
});

const page = ref(1);
const limit = 10;

const paginatedThreads = computed(() => {
  const start = (page.value - 1) * limit;
  const end = start + limit;
  return threads.value.slice(start, end);
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
        v-for="thread in paginatedThreads"
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
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-lucide-flag"
              :padded="false"
              class="!m-0"
              @click="
                reportThreadID = thread.id;
                reportThreadOpen = true;
              "
            />
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
            >{{ thread.replies }}</span
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
      <div class="flex justify-center pt-4">
        <UPagination
          :page="page"
          @update:page="page = $event"
          :items-per-page="limit"
          :total="threads.length"
        />
      </div>
    </div>
  </UCard>

  <UModal
    :title="$t('thread.report')"
    :description="$t('thread.report.info')"
    :close="false"
    v-model:open="reportThreadOpen"
  >
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

        <UFormField class="noselect" :label="$t('captcha')" required>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-4">
              <span
                v-if="cooldown > 0"
                class="text-center text-sm text-brick-red-400 font-semibold py-3 px-6 border-2 border-midnight-400 dark:border-midnight-600 rounded"
              >
                {{ Math.ceil(cooldown) }}{{ $t("second") }}
              </span>

              <span
                v-else-if="captcha"
                class="border-midnight-400 dark:border-midnight-600 border-2"
                v-html="captcha.svg"
              />

              <UButton
                :disabled="cooldown > 0"
                @click="getCaptcha()"
                variant="outline"
                color="secondary"
              >
                {{ captcha ? $t("captcha.refresh") : $t("captcha.generate") }}
              </UButton>
            </div>
          </div>
          <UInput
            :ui="{ base: 'bg-white dark:bg-midnight-800' }"
            maxlength="6"
            class="mt-2"
            v-model="submission.captcha"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            :label="$t('report')"
            color="error"
            variant="solid"
            @click="reportThread(reportThreadID)"
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
</template>
