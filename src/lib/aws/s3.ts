// AWS S3 for file storage
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  return await getSignedUrl(client, command, { expiresIn })
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(client, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await client.send(command)
}

export function generateS3Key(userId: string, workspaceType: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `uploads/${userId}/${workspaceType}/${timestamp}-${sanitizedFileName}`
}

export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`
}
