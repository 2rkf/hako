export type PartialThread = Omit<Thread, "tags" | "threads" |"title" | "updatedAt">;

export interface ThreadFile {
    name: string;
    size: number;
    type: string;
    url: string;
};

export interface Thread {
    author: string;
    content: string;
    createdAt: Date;
    file?: string;
    id: string;
    tags: string[];
    threads: PartialThread[];
    title: string;
    updatedAt: Date;
};
