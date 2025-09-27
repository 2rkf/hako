import { Response } from "~/types/response";
import { ThreadReport } from "~/types/thread";
import { ThreadModel } from "~/models/thread";

export default defineEventHandler(async (event) => {
  const threadID = event.context.params?.id;
  const body = await readBody(event) as { reason?: string };

  if (!threadID) {
    return {
      message: "Thread ID is required",
      status: 400,
    } as Response;
  }

  const reason = body.reason;
  const reporter = getRequestIP(event, { xForwardedFor: true }) || "Unknown";

  if (!reason || !reporter) {
    return {
      message: "Reason and reporter are required",
      status: 400,
    } as Response;
  }

  const report: ThreadReport = {
    reason,
    reporter,
    reportedAt: new Date(),
  };

  const updatedThread = await ThreadModel.findOneAndUpdate(
    { id: threadID },
    { $push: { reports: report } },
    { new: true }
  );

  if (updatedThread) {
    return {
      message: "Report submitted successfully (thread)",
      report,
    };
  }

  const updatedReplyThread = await ThreadModel.findOneAndUpdate(
    { "replies.id": threadID },
    { $push: { "replies.$.reports": report } },
    { new: true }
  );

  if (updatedReplyThread) {
    return {
      message: "Report submitted successfully (reply)",
      report,
    };
  }

  return {
    message: "Thread or reply not found",
    status: 404,
  } as Response;
});
