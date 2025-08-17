export type Locale = "en" | "ja";
export type ReplyThread = Omit<Thread, "closed" | "locale" | "pinned" | "replies" | "tags" | "title" | "updatedAt"> & {
    replyTo: string;
};

export interface Thread {
    author: string;
    closed?: boolean;
    content: string;
    createdAt: Date;
    deleted?: boolean;
    deletedAt?: Date | null;
    file?: ThreadFile | null;
    hidden?: boolean;
    id: string;
    locale: Locale;
    pinned?: boolean;
    replies: ReplyThread[];
    reports?: ThreadReport[];
    tags: string[];
    title: string;
    updatedAt: Date;
};

export interface ThreadFile {
    name: string;
    size: number;
    type: string;
    url: string;
};

export interface ThreadReport {
    reason: string;
    reporter: string;
    reportedAt: Date;
}
