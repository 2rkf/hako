<script setup>
import { parseBBCode } from "~~/server/utils/bbcode";
import { fibonacci } from "~~/server/utils/fibonacci";
import { captchaStorage } from "~~/server/utils/storage";
import * as z from "zod";

const { triggerReload } = useThreadStore();
const props = defineProps(["thread"]);
const toast = useToast();
const captcha = ref();
const submission = ref({
  captcha: "",
  uuid: "",
});

const cooldownGenerateUntil = useCookie("captcha_generate_until");
const cooldownRefreshUntil = useCookie("captcha_refresh_until");

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

const form = ref({
  author: "",
  content: "",
  file: null,
  replyTo: "",
});

const state = reactive({
  file: undefined,
});

const reportReason = ref("");
const reportThreadOpen = ref(false);

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const schema = z.object({
  file: z
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${formatBytes(MAX_FILE_SIZE)}`,
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png and .webp formats are supported",
    })
    .refine(
      (file) =>
        !file ||
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const isValid =
                img.width >= MIN_DIMENSIONS.width &&
                img.height >= MIN_DIMENSIONS.height &&
                img.width <= MAX_DIMENSIONS.width &&
                img.height <= MAX_DIMENSIONS.height;
              resolve(isValid);
            };
            img.src = e.target?.result;
          };
          reader.readAsDataURL(file);
        }),
      {
        message: `Image dimensions must be between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels`,
      }
    ),
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

function createObjectUrl(file) {
  return URL.createObjectURL(file);
}

function formatDate(date) {
  return new Date(date).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function submitReply() {
  if (!form.value.content || !submission.value.captcha) {
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

  const payload = new FormData();
  payload.append("author", form.value.author || "Anonymous");
  payload.append("content", form.value.content);
  payload.append("replyTo", form.value.replyTo || props.thread.id);

  if (form.value.file) {
    payload.append("file", form.value.file);
  }

  try {
    await $fetch(`/api/threads/${props.thread.id}/reply`, {
      method: "POST",
      body: payload,
    });

    toast.add({
      color: "success",
      description: "Reply posted successfully",
    });

    form.value = { author: "", content: "", file: null };
    submission.value.captcha = "";
    state.file = undefined;
    captcha.value = undefined;
    triggerReload();
  } catch (error) {
    console.error("Failed to post reply:", error);
    toast.add({
      color: "error",
      description: "Failed to post reply",
    });
  }
}

async function reportThread(threadID) {
  if (reportReason.value.length === 0) {
    toast.add({
      color: "error",
      description: "Please provide a reason for reporting",
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
      description: "Thread reported successfully",
    });

    reportReason.value = "";
    reportThreadOpen.value = false;
  } catch (error) {
    console.error("Report submission failed:", error);
    toast.add({
      color: "error",
      description: "Failed to report thread",
    });
  }
}

const replyFormSection = ref(null);

const scrollToForm = (replyID) => {
  form.value.replyTo = replyID;

  nextTick(() => {
    replyFormSection.value?.scrollIntoView({ behavior: "smooth" });
    document.querySelector("textarea")?.focus();
  });
};

const highlightedCards = ref(new Set());

function highlightCard(id) {
  highlightedCards.value.add(id);
}

function unhighlightCard(id) {
  highlightedCards.value.delete(id);
}

onMounted(() => {
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

  if (window.location.hash) {
    setTimeout(() => {
      const element = document.getElementById(
        window.location.hash.substring(1)
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 1000);
  }
});
</script>

<template>
  <div class="space-y-6 mt-6">
    <UCard class="bg-midnight-50 dark:bg-midnight-900 transition-colors">
      <template #header>
        <div class="flex items-center gap-2">
          <Back />
          <h2 class="text-xl font-semibold text-primary noselect">
            {{ $t("thread") }} #{{ thread.id }}
          </h2>
        </div>
      </template>

      <UCard
        class="hover:shadow-lg transition-color bg-midnight-50 dark:bg-midnight-900 mb-6 duration-300"
        :class="[
          highlightedCards.has(thread.id) ? 'ring-2 ring-brick-red-400' : '',
        ]"
        :id="thread.id"
        :ui="{ body: { padding: 'p-4' } }"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="tag in [...thread.tags].sort((a, b) => a.localeCompare(b))"
              :key="tag"
              color="primary"
              variant="subtle"
              class="noselect"
            >
              #{{ tag }}
            </UBadge>
          </div>

          <div class="space-x-2">
            <UButton
              variant="ghost"
              color="neutral"
              size="xs"
              icon="i-lucide-reply"
              :padded="false"
              class="cursor-pointer"
              @click="scrollToForm(thread.id)"
            />
            <UButton
              variant="ghost"
              color="error"
              size="xs"
              icon="i-lucide-flag"
              :padded="false"
              disabled
              @click="reportThreadOpen = true"
            />
          </div>
        </div>

        <h3 class="text-xl font-semibold text-primary noselect">
          {{ thread.title }}
        </h3>

        <p class="text-xs text-midnight-500 dark:text-midnight-600 mb-1">
          <span class="noselect">ID: </span>
          <code
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
          >
            {{ thread.id }}
          </code>
        </p>
        <hr class="mt-4 mb-4 text-midnight-300 dark:text-midnight-700" />
        <div v-html="parseBBCode(thread.content)" />

        <div v-if="thread.file" class="my-2">
          <img
            :src="thread.file.url"
            :alt="thread.file.name"
            class="rounded-md max-h-96 object-contain"
          />
        </div>

        <div
          class="text-sm text-midnight-900 dark:text-midnight-400 flex justify-between mt-4 noselect"
        >
          <span
            >{{ $t("by") }}
            <span
              class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
            >
              {{ thread.author }}
            </span>
          </span>
          <span
            class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
          >
            {{ formatDate(thread.createdAt) }}
          </span>
        </div>
      </UCard>

      <div class="space-y-4 mb-6">
        <h3 class="text-lg font-semibold text-primary noselect">
          {{ $t("replies") }} ({{ thread.replies?.length || 0 }})
        </h3>

        <UCard
          v-for="reply in thread.replies"
          :key="reply.id"
          :id="reply.id"
          class="hover:shadow-lg transition-color bg-midnight-50 dark:bg-midnight-900 mb-6 duration-300"
          :class="[
            highlightedCards.has(reply.id) ? 'ring-2 ring-brick-red-400' : '',
          ]"
          :ui="{ body: { padding: 'p-4' } }"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex flex-wrap gap-2">
              <h3 class="text-xl font-semibold text-primary noselect">
                {{ $t("reply") }} #{{ reply.id }}
              </h3>
            </div>

            <div class="space-x-2">
              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-lucide-reply"
                :padded="false"
                class="cursor-pointer"
                @click="scrollToForm(reply.id)"
              />
              <UButton
                variant="ghost"
                color="error"
                size="xs"
                icon="i-lucide-flag"
                :padded="false"
                disabled
                @click="reportThreadOpen = true"
              />
            </div>
          </div>

          <p class="text-xs text-midnight-500 dark:text-midnight-600 mb-1">
            <span class="noselect">ID: </span>
            <code
              class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
            >
              {{ reply.id }}
            </code>
            <span v-if="reply.replyTo" class="inline-flex items-center">
              <UIcon
                name="i-lucide-chevrons-right"
                class="w-3 h-3 text-midnight-400 dark:text-midnight-500 mx-0.5"
              />
              <code
                @click="navigateTo(`#${reply.replyTo}`)"
                @mouseenter="highlightCard(reply.replyTo)"
                @mouseleave="unhighlightCard(reply.replyTo)"
                class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded cursor-pointer hover:bg-midnight-200 dark:hover:bg-midnight-700 transition-colors"
              >
                {{ reply.replyTo }}
              </code>
            </span>
          </p>
          <hr class="mt-4 mb-4 text-midnight-300 dark:text-midnight-700" />

          <div
            v-html="parseBBCode(reply.content)"
            class="mt-1 text-midnight-700 dark:text-midnight-300"
          />

          <div v-if="reply.file" class="my-2">
            <img
              :src="reply.file.url"
              :alt="reply.file.name"
              class="rounded-md max-h-64 object-contain"
            />
          </div>

          <div
            class="text-sm text-midnight-900 dark:text-midnight-400 flex justify-between mt-4 noselect"
          >
            <span
              >{{ $t("by") }}
              <span
                class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
              >
                {{ reply.author }}
              </span>
            </span>
            <span
              class="bg-midnight-100 text-brick-red-300 dark:text-brick-red-200 dark:bg-midnight-800 px-1 rounded"
            >
              {{ formatDate(reply.createdAt) }}
            </span>
          </div>
        </UCard>
      </div>
    </UCard>
    <div ref="replyFormSection">
      <UCard class="mb-8 bg-midnight-50 dark:bg-midnight-900">
        <h2
          class="text-xl font-semibold mb-4 text-brick-red-400 px-4 pt-4 noselect"
        >
          {{ $t("thread.reply") }}
        </h2>

        <form @submit.prevent="submitReply" class="space-y-4 px-4 pb-4">
          <UFormField class="noselect" :label="$t('thread.content')" required>
            <UTextarea
              :ui="{ base: 'bg-white dark:bg-midnight-800' }"
              v-model="form.content"
              class="w-full"
              maxlength="10000"
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

          <UFormField :label="$t('thread.replyingTo')" class="noselect">
            <UInput
              :ui="{
                base: 'bg-white dark:bg-midnight-800',
              }"
              v-model="form.replyTo"
              readonly
              class="mb-2 md:w-2/5 w-full"
            />

            <div
              v-if="form.replyTo"
              class="flex items-center gap-2 text-sm mt-2"
            >
              <span class="text-midnight-500 dark:text-midnight-400">
                {{ $t("thread.replyingTo.check") }}
              </span>
              <NuxtLink
                :to="`/thread/${thread.id}#${form.replyTo}`"
                class="text-brick-red-400 hover:underline flex items-center gap-1"
              >
                <span>{{
                  $t("thread.replyingTo.check.reply", { id: form.replyTo })
                }}</span>
              </NuxtLink>
            </div>

            <div class="text-sm mt-2">
              <span class="text-midnight-500 dark:text-midnight-400">{{
                $t("thread.replyingTo.mainOr")
              }}</span>
              <NuxtLink
                :to="`/thread/${thread.id}`"
                class="text-brick-red-400 hover:underline"
                @click.prevent="form.replyTo = thread.id"
              >
                {{ $t("thread.replyingTo.main") }}
              </NuxtLink>
            </div>
          </UFormField>

          <UFormField :label="$t('thread.author')" class="noselect">
            <UInput
              :ui="{ base: 'bg-white dark:bg-midnight-800' }"
              v-model="form.author"
              placeholder="Anonymous"
              maxlength="50"
            />
          </UFormField>

          <UForm :schema="schema" :state="state" class="noselect">
            <UFormField
              name="file"
              :label="$t('thread.file')"
              :description="$t('thread.file.description')"
            >
              <UFileUpload
                v-slot="{ open, removeFile }"
                v-model="state.file"
                accept="image/*"
                @update:modelValue="
                  (file) => {
                    form.file = file;
                  }
                "
              >
                <div class="flex flex-wrap items-center gap-3">
                  <UAvatar
                    size="lg"
                    :src="state.file ? createObjectUrl(state.file) : undefined"
                    icon="i-lucide-image"
                    class="rounded-sm"
                  />
                  <UButton
                    :label="
                      state.file
                        ? $t('thread.file.change')
                        : $t('thread.file.upload')
                    "
                    color="neutral"
                    variant="outline"
                    @click="open()"
                  />
                </div>

                <p v-if="state.file" class="text-xs text-muted mt-1.5">
                  {{ state.file.name }}
                  <UButton
                    :label="$t('thread.file.remove')"
                    color="error"
                    variant="link"
                    size="xs"
                    class="p-0"
                    @click="
                      removeFile();
                      form.file = undefined;
                    "
                  />
                </p>
              </UFileUpload>
            </UFormField>
          </UForm>

          <div class="flex justify-end">
            <UButton
              type="submit"
              variant="outline"
              color="primary"
              class="text-gray-700 dark:text-gray-300 px-4 py-2 rounded transition-colors noselect cursor-pointer"
            >
              {{ $t("reply") }}
            </UButton>
          </div>
        </form>
      </UCard>
    </div>

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
              @click="reportThreadOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
