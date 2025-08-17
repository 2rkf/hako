import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ThreadFile } from "~/types/thread";

interface FileObject {
    filename: string;
    type: string;
    data: Buffer;
}

const config = useRuntimeConfig();
const client = new S3Client({
    endpoint: config.AwsEndpoint,
    region: config.AwsRegion,
    credentials: {
        accessKeyId: config.AwsAccessKeyID,
        secretAccessKey: config.AwsSecretAccessKey,
    },
    forcePathStyle: true,
});

const bucketName = config.AwsBucket;

export async function uploadThreadFile(file: FileObject): Promise<ThreadFile> {
    const originalName = file.filename;
    const extension = originalName.split(".").pop() || "";
    const now = new Date();
    const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
        String(now.getMilliseconds()).padStart(2, "0")
    ].join("");

    const uniqueName = `${timestamp}.${extension}`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueName,
        Body: file.data,
        ContentType: file.type,
        ACL: "public-read",
    })

    await client.send(command);

    return {
        name: originalName,
        size: file.data.byteLength,
        type: file.type,
        url: `/img/${uniqueName}`,
    }
}
