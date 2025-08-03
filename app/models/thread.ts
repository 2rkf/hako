import { model, Schema } from "mongoose";
import type { Thread, PartialThread } from "~/types/thread";

const threadSchema = new Schema<Thread>({
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    file: { type: String, default: null },
    id: { type: String, required: true, unique: true },
    tags: { type: [String], default: [] },
    threads: { type: [Schema.Types.Mixed] as unknown as PartialThread[], default: [] },
    title: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export const ThreadModel = model<Thread>("Thread", threadSchema);
