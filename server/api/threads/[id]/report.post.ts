import { Response } from "~/types/response";
import { ThreadReport } from "~/types/thread";
import { ThreadModel } from "~/models/thread";

export default defineEventHandler(async (event) => {
    const threadID = event.context.params?.id;

    if (!threadID) {
        return {
            message: "Thread ID is required",
            status: 400,
        } as Response;
    }

    const formData = await readMultipartFormData(event);

    if (!formData) {
        return {
            message: "No form data provided",
            status: 400,
        } as Response;
    }

    const reason = formData.find((f) => f.name === "reason")?.data?.toString();
    const reporter = formData.find((f) => f.name === "reporter")?.data?.toString();

    if (!reason || !reporter) {
        return {
            message: "Reason and reporter are required",
            status: 400,
        } as Response;
    }

    const reportedAt = new Date();

    const report: ThreadReport = {
        reason,
        reporter,
        reportedAt
    };

    const thread = await ThreadModel.findOne({ id: threadID });

    if (!thread) {
        return {
            message: "Thread not found",
            status: 404,
        } as Response;
    }

    thread.reports = thread.reports || [];
    thread.reports.push(report);

    await thread.save();

    return { message: "Report submitted successfully", report };
});