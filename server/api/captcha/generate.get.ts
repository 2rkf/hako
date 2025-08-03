import { createCaptcha } from "kyapu";
import { captchaStorage } from "~~/server/utils/storage";
import { type Captcha } from "~/types/captcha";

export default defineEventHandler(async () => {
    const captcha = createCaptcha({
        background: "#121030",
        fontSize: Math.floor(50 * 0.9),
        noise: 6,
        size: 6
    });
    const uuid = crypto.randomUUID();
    await captchaStorage.set(uuid, captcha.text);

    return { uuid, svg: captcha.data } as Captcha;
});
