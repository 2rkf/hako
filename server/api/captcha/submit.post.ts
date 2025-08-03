import { type Submission } from "~/types/captcha";
import { type Response } from "~/types/response";
import { captchaStorage } from "~~/server/utils/storage";

export default defineEventHandler(async (event) => {
    const body = await readBody<Submission>(event);
    const entry = await captchaStorage.get(body.uuid);

    if (!entry || entry !== body.captcha) {
        return {
            message: "Invalid captcha",
            status: 400
        } as Response;
    } else {
        await captchaStorage.delete(body.uuid);

        return {
            message: "Captcha submitted successfully",
            status: 200
        } as Response;
    }
});
