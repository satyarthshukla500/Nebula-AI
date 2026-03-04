// AWS Transcribe for audio transcription
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe'

const client = new TranscribeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function startTranscription(
  s3Uri: string,
  jobName: string,
  languageCode: string = 'en-US'
): Promise<string> {
  try {
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: languageCode as any, // Type assertion for language code
      MediaFormat: 'mp4', // or 'wav', 'mp3', etc.
      Media: {
        MediaFileUri: s3Uri,
      },
      OutputBucketName: process.env.AWS_S3_BUCKET_NAME,
    })

    const response = await client.send(command)
    return response.TranscriptionJob?.TranscriptionJobName || ''
  } catch (error) {
    console.error('Transcription start error:', error)
    throw new Error('Failed to start transcription')
  }
}

export async function getTranscriptionResult(jobName: string) {
  try {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName,
    })
    const response = await client.send(command)

    const job = response.TranscriptionJob

    if (job?.TranscriptionJobStatus === 'COMPLETED') {
      // Fetch transcript from S3 URL
      const transcriptUri = job.Transcript?.TranscriptFileUri
      if (transcriptUri) {
        const transcriptResponse = await fetch(transcriptUri)
        const transcriptData = await transcriptResponse.json()
        return {
          status: 'completed',
          transcript: transcriptData.results.transcripts[0].transcript,
        }
      }
    } else if (job?.TranscriptionJobStatus === 'IN_PROGRESS') {
      return { status: 'processing' }
    } else {
      return { status: 'failed' }
    }
  } catch (error) {
    console.error('Transcription result error:', error)
    throw new Error('Failed to get transcription result')
  }
}
