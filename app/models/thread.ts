import { model, Schema } from "mongoose";
import type { Thread, ReplyThread, ThreadFile, ThreadReport } from "~/types/thread";

const threadSchema = new Schema<Thread>({
    author: { type: String, required: true },
    closed: { type: Boolean, default: false },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    file: { type: Schema.Types.Mixed as unknown as ThreadFile, default: null },
    hidden: { type: Boolean, default: false },
    id: { type: String, required: true, unique: true },
    locale: { type: String, enum: ["en", "ja"], default: "en" },
    pinned: { type: Boolean, default: false },
    replies: { type: [Schema.Types.Mixed] as unknown as ReplyThread[], default: [] },
    reports: { type: [Schema.Types.Mixed] as unknown as ThreadReport, default: [] },
    tags: { type: [String], default: [] },
    title: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

export const ThreadModel = model<Thread>("Thread", threadSchema);
