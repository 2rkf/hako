import { ThreadModel } from "~/models/thread";
import { ReplyThread } from "~/types/thread";
import { Response } from "~/types/response";

export default defineEventHandler(async (event) => {
    const threadID = event.context.params?.id;

    if (!threadID) {
        return {
            message: "Thread ID is required",
            status: 400,
        } as Response;
    }

    const formData = await readMultipartFormData(event);

    if (!formData) {
        throw new Error("No form data provided");
    }

    const content = formData.find((f) => f.name === "content")?.data?.toString();
    const author = formData.find((f) => f.name === "author")?.data?.toString();
    const file = formData.find((f) => f.name === "file");
    const replyTo = formData.find((f) => f.name === "replyTo")?.data?.toString();

    let threadFile = null;

    if (file?.type?.startsWith("image/")) {
        threadFile = await uploadThreadFile(file as any);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    const replyThread = {
        author,
        content,
        createdAt,
        hidden: false,
        id,
        deleted: false,
        deletedAt: null,
        file: threadFile,
        reports: [],
        replyTo,
    } as ReplyThread;

    const thread = await ThreadModel.findOne({ id: threadID });

    if (!thread) {
        return {
            message: "Thread not found",
            status: 404,
        } as Response;
    }

    thread.replies.push(replyThread);
    thread.updatedAt = updatedAt;
    await thread.save();
});
