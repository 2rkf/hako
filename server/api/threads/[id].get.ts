import { ThreadModel } from "~/models/thread";
import { Thread } from "~/types/thread";

export default defineEventHandler(async (event) => {
    const threadID = getRouterParam(event, "id");

    const thread = await ThreadModel.findOne({ id: threadID });

    return thread as Thread;
});
