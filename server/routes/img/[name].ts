import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Response } from "~/types/response";

const config = useRuntimeConfig();
const client = new S3Client({
    region: config.AwsRegion,
    endpoint: config.AwsEndpoint,
    credentials: {
        accessKeyId: config.AwsAccessKeyID,
        secretAccessKey: config.AwsSecretAccessKey,
    },
    forcePathStyle: true,
});

export default defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");

    if (!name) {
        setResponseStatus(event, 400);
        return {
            status: 400,
            message: "Missing image filename.",
        } satisfies Response;
    }

    try {
        const command = new GetObjectCommand({
            Bucket: config.AwsBucket,
            Key: name
        });

        const { Body, ContentType } = await client.send(command);
        
        if (!Body) {
            setResponseStatus(event, 404);
            return {
                status: 404,
                message: "Image not found.",
            } satisfies Response;
        }

        setResponseHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
        if (ContentType) {
            setResponseHeader(event, "Content-Type", ContentType);
        } else {
            setResponseHeader(event, "Content-Type", "application/octet-stream");
        }

        return sendStream(event, Body as any);

    } catch (error: unknown) {
        console.error("Error fetching image:", error);
        
        const status = (error as { name?: string })?.name === "NoSuchKey" ? 404 : 500;
        setResponseStatus(event, status);
        
        return {
            status,
            message: status === 404 ? "Image not found." : "Error fetching image.",
        } satisfies Response;
    }
});