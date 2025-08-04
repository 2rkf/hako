<script setup>
import * as z from "zod";
import { captchaStorage } from "~~/server/utils/storage";

const { triggerReload } = useThreadStore();
const toast = useToast();
const captcha = ref();
const submission = ref({
  captcha: "",
  uuid: "",
});
const languages = ref([
  {
    label: "English",
    value: "en",
  },
  {
    label: "日本語",
    value: "ja",
  },
]);

const cooldownGenerateUntil = useCookie("captcha_generate_until");
const cooldownRefreshUntil = useCookie("captcha_refresh_until");

const refreshCount = ref(0);
const cooldown = ref(0);
let cooldownInterval = null;

const newThread = ref({
  title: "",
  tags: [],
  content: "",
  author: "",
  language: "",
  file: undefined,
});

const startCooldown = (type = "generate") => {
  const now = Date.now();
  const cooldownTime = type === "generate" ? 60 : 10 * (refreshCount.value + 1);
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

const createThread = async () => {
  if (
    !newThread.value.title ||
    !newThread.value.content ||
    !submission.value.captcha ||
    !newThread.value.language ||
    newThread.value.tags.length === 0
  ) {
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

  const formData = new FormData();
  formData.append("title", newThread.value.title);
  formData.append("content", newThread.value.content);
  formData.append("author", newThread.value.author || "Anonymous");
  formData.append("tags", JSON.stringify(newThread.value.tags));
  if (newThread.value.file) {
    formData.append("file", newThread.value.file);
  }

  toast.add({
    color: "success",
    description: $t("thread.created"),
  });

  newThread.value = {
    title: "",
    tags: [],
    content: "",
    author: "",
    file: undefined,
  };
  state.file = undefined;
  submission.value.captcha = "";
  captcha.value = undefined;

  await $fetch("/api/threads", {
    method: "POST",
    body: formData,
  });

  triggerReload();
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_DIMENSIONS = { width: 200, height: 200 };
const MAX_DIMENSIONS = { width: 4096, height: 4096 };
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
};

const schema = z.object({
  file: z
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: $t("thread.file.error", { limit: formatBytes(MAX_FILE_SIZE) }),
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: $t("thread.file.error.type"),
    })
    .refine(
      (file) =>
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
        message: $t("thread.file.error.pixel", {
          limit: `${MIN_DIMENSIONS.width}-${MIN_DIMENSIONS.height}`,
        }),
      }
    ),
});

const state = reactive({
  file: undefined,
});

function createObjectUrl(file) {
  return URL.createObjectURL(file);
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
});
</script>

<template>
  <UCard class="mb-8 bg-midnight-50 dark:bg-midnight-900">
    <h2
      class="text-xl font-semibold mb-4 text-brick-red-400 px-4 pt-4 noselect"
    >
      {{ $t("thread.create") }}
    </h2>

    <form @submit.prevent="createThread" class="space-y-4 px-4 pb-4">
      <UFormField class="noselect" :label="$t('thread.title')" required>
        <UInput
          :ui="{ base: 'bg-white dark:bg-midnight-800' }"
          v-model="newThread.title"
          class="w-full"
          maxlength="125"
        />
      </UFormField>

      <UFormField class="noselect" :label="$t('thread.tags')" required>
        <UInputTags
          :ui="{ base: 'bg-white dark:bg-midnight-800' }"
          v-model="newThread.tags"
        />
      </UFormField>

      <UFormField class="noselect" :label="$t('thread.language')" required>
        <USelect
          :ui="{ base: 'bg-white dark:bg-midnight-800' }"
          v-model="newThread.language"
          :items="languages"
          :placeholder="$t('thread.languageSelect')"
        />
      </UFormField>

      <UFormField class="noselect" :label="$t('thread.content')" required>
        <UTextarea
          :ui="{ base: 'bg-white dark:bg-midnight-800' }"
          v-model="newThread.content"
          class="w-full"
          maxlength="2000"
        />
      </UFormField>

      <UFormField class="noselect" :label="$t('captcha')" required>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <span
              v-if="cooldown > 0"
              class="text-center text-sm text-brick-red-400 font-semibold py-3 px-6 border-2 border-midnight-400 dark:border-midnight-600 rounded"
            >
              {{ Math.ceil(cooldown) }}s
            </span>

            <span
              v-else-if="captcha"
              class="border-midnight-400 dark:border-midnight-600 border-2"
              v-html="captcha.svg"
            />

            <UButton :disabled="cooldown > 0" @click="getCaptcha()" variant="outline" color="secondary">
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

      <UFormField :label="$t('thread.author')" class="noselect">
        <UInput
          :ui="{ base: 'bg-white dark:bg-midnight-800' }"
          v-model="newThread.author"
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
                newThread.file = file;
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
                  newThread.file = undefined;
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
          {{ $t("thread.post") }}
        </UButton>
      </div>
    </form>
  </UCard>
</template>
