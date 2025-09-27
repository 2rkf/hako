import { ThreadModel } from "~/models/thread";
import { Thread } from "~/types/thread";

export default defineEventHandler(async (event) => {
    const threadID = getRouterParam(event, "id");

    const thread = await ThreadModel.findOne({ id: threadID });

    return {
        author: thread?.author,
        closed: thread?.closed,
        content: thread?.content,
        createdAt: thread?.createdAt,
        deleted: thread?.deleted,
        deletedAt: thread?.deletedAt,
        file: thread?.file,
        hidden: thread?.hidden,
        id: thread?.id,
        locale: thread?.locale,
        pinned: thread?.pinned,
        replies: thread?.replies,
        tags: thread?.tags,
        title: thread?.title,
        updatedAt: thread?.updatedAt,
    };
});
