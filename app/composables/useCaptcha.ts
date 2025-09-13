import { captchaStorage } from "~~/server/utils/storage";
import { fibonacci } from "~~/server/utils/fibonacci";
import type { CaptchaSubmission, CaptchaType } from "~/types/captcha";

export function useCaptcha(key: CaptchaType) {
    const captcha = ref<any>(null);
    const submission = ref<CaptchaSubmission>({
        captcha: "",
        uuid: "",
    });

    const refreshCount = ref(0);
    const cooldown = ref(0);
    const cooldownInterval = ref<NodeJS.Timeout | null>(null);

    const cooldownGenerateUntil = ref<number | null>(null);
    const cooldownRefreshUntil = ref<number | null>(null);

    const loadCooldowns = () => {
        cooldownGenerateUntil.value =
            Number(localStorage.getItem(`captcha:${key}_generate`)) || null;
        cooldownRefreshUntil.value =
            Number(localStorage.getItem(`captcha:${key}_refresh`)) || null;
    };

    const saveCooldowns = () => {
        if (cooldownGenerateUntil.value)
            localStorage.setItem(`captcha:${key}_generate`, cooldownGenerateUntil.value.toString());
        if (cooldownRefreshUntil.value)
            localStorage.setItem(`captcha:${key}_refresh`, cooldownRefreshUntil.value.toString());
    };

    const startCooldown = (type: "generate" | "refresh") => {
        const now = Date.now();
        const cooldownTime = type === "generate" ? 60 : fibonacci(refreshCount.value) * 5;

        if (type === "generate") {
            cooldownGenerateUntil.value = now + cooldownTime * 1000;
        } else {
            cooldownRefreshUntil.value = now + cooldownTime * 1000;
            refreshCount.value++;
        }
        saveCooldowns();

        cooldown.value = cooldownTime;

        if (cooldownInterval.value) clearInterval(cooldownInterval.value);
        cooldownInterval.value = setInterval(() => {
            const target =
                type === "generate" ? cooldownGenerateUntil.value : cooldownRefreshUntil.value;
            if (!target) return;

            const diff = Math.max(0, Math.ceil((target - Date.now()) / 1000));
            cooldown.value = diff;

            if (diff <= 0 && cooldownInterval.value) {
                if (cooldownInterval.value) {
                    clearInterval(cooldownInterval.value);
                    cooldownInterval.value = null;
                }
            }
        }, 1000);
    };

    const updateCooldown = () => {
        const now = Date.now();
        const generateLeft = cooldownGenerateUntil.value ? cooldownGenerateUntil.value - now : 0;
        const refreshLeft = cooldownRefreshUntil.value ? cooldownRefreshUntil.value - now : 0;

        const isGenerate = generateLeft > refreshLeft;
        cooldown.value = Math.max(0, isGenerate ? generateLeft : refreshLeft) / 1000;

        if (cooldown.value <= 0 && cooldownInterval) {
            if (cooldownInterval.value) {
                clearInterval(cooldownInterval.value);
                cooldownInterval.value = null;
            }
        }
    };

    const getCaptcha = async () => {
        const now = Date.now();
        const generateLeft = cooldownGenerateUntil.value ? cooldownGenerateUntil.value - now : 0;
        const refreshLeft = cooldownRefreshUntil.value ? cooldownRefreshUntil.value - now : 0;

        const isGenerate = !captcha.value;
        const isOnCooldown = isGenerate ? generateLeft > 0 : refreshLeft > 0;

        if (isOnCooldown) return;
        if (isGenerate) refreshCount.value = 0;

        const previousUUID = submission.value.uuid;
        captcha.value = await $fetch("/api/captcha/generate");
        submission.value.uuid = captcha.value.uuid;
        submission.value.captcha = "";

        if (previousUUID && previousUUID !== submission.value.uuid) {
            captchaStorage.delete(previousUUID);
        }

        startCooldown(isGenerate ? "generate" : "refresh");
    };

    const validateCaptcha = async () => {
        if (!submission.value.captcha || !captcha.value?.uuid) return false;

        const response = await $fetch("/api/captcha/submit", {
            method: "POST",
            body: submission.value,
        });

        if (response.status !== 200) {
            submission.value.captcha = "";
            await getCaptcha();
            return false;
        }

        return true;
    };

    const resetCaptcha = () => {
        captcha.value = null;
        submission.value = { captcha: "", uuid: "" };
    };


    onMounted(() => {
        loadCooldowns();
        const now = Date.now();
        const remaining = Math.max(
            cooldownGenerateUntil.value ? cooldownGenerateUntil.value - now : 0,
            cooldownRefreshUntil.value ? cooldownRefreshUntil.value - now : 0
        );

        if (remaining > 0) {
            cooldown.value = remaining / 1000;
            cooldownInterval.value = setInterval(updateCooldown, 1000);
        }
    });

    onUnmounted(() => {
        if (cooldownInterval.value) {
            clearInterval(cooldownInterval.value);
            cooldownInterval.value = null;
        }
    });

    return {
        captcha,
        submission,
        cooldown,
        getCaptcha,
        validateCaptcha,
        resetCaptcha,
    };
}
