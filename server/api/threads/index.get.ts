import { ThreadModel } from "~/models/thread";
import type { Thread } from "~/types/thread";

export default defineEventHandler(async () => {
    const threads = await ThreadModel.find().sort({ updatedAt: -1 }).lean<Thread[]>();
    
    const objectThreads = threads.map(thread => ({
        ...thread,
        createdAt: thread.createdAt.toISOString(),
        replies: thread.replies?.length || 0,
        reports: thread.reports?.length || 0,
        updatedAt: thread.updatedAt.toISOString()
    }));

    return objectThreads;
});
