import { ThreadModel } from "~/models/thread";
import { Thread } from "~/types/thread";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw new Error("No form data provided");
  }

  const title = formData.find((f) => f.name === "title")?.data?.toString();
  const content = formData.find((f) => f.name === "content")?.data?.toString();
  const author = formData.find((f) => f.name === "author")?.data?.toString();
  const locale = formData.find((f) => f.name === "locale")?.data?.toString();
  const tagsRaw = formData.find((f) => f.name === "tags")?.data?.toString();

  const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

  const id = crypto.randomUUID();
  const createdAt = new Date();
  const updatedAt = new Date();

  const thread = {
    author,
    content,
    createdAt,
    id,
    locale,
    title,
    tags,
    updatedAt,
    closed: false,
    deleted: false,
    deletedAt: null,
    file: null,
    hidden: false,
    pinned: false,
    replies: [],
    reported: false,
    reportCount: 0,
  } as Thread;

  const newThread = new ThreadModel(thread);
  await newThread.save();
});
