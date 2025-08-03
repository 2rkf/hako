import { ThreadModel } from "~/models/thread";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData) {
    throw new Error("No form data provided");
  }

  const title = formData.find((f) => f.name === "title")?.data?.toString();
  const content = formData.find((f) => f.name === "content")?.data?.toString();
  const author = formData.find((f) => f.name === "author")?.data?.toString();
  const tagsRaw = formData.find((f) => f.name === "tags")?.data?.toString();

  const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

  const id = crypto.randomUUID();
  const createdAt = new Date();
  const updatedAt = new Date();

  const thread = {
    id,
    title,
    content,
    author,
    tags,
    createdAt,
    updatedAt,
    threads: [],
    file: null,
  };

  const newThread = new ThreadModel(thread);
  await newThread.save();
});
