// AWS Rekognition for image and video analysis
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
  DetectFacesCommand,
  DetectModerationLabelsCommand,
  StartLabelDetectionCommand,
  GetLabelDetectionCommand,
} from '@aws-sdk/client-rekognition'

const client = new RekognitionClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export interface ImageAnalysisResult {
  labels: Array<{ name: string; confidence: number }>
  text: Array<{ text: string; confidence: number }>
  faces: Array<{ confidence: number; emotions: string[] }>
  moderationLabels: Array<{ name: string; confidence: number }>
}

export async function analyzeImage(s3Key: string): Promise<ImageAnalysisResult> {
  const bucket = process.env.AWS_S3_BUCKET_NAME!

  try {
    // Detect labels
    const labelsCommand = new DetectLabelsCommand({
      Image: { S3Object: { Bucket: bucket, Name: s3Key } },
      MaxLabels: 10,
      MinConfidence: 70,
    })
    const labelsResponse = await client.send(labelsCommand)

    // Detect text
    const textCommand = new DetectTextCommand({
      Image: { S3Object: { Bucket: bucket, Name: s3Key } },
    })
    const textResponse = await client.send(textCommand)

    // Detect faces
    const facesCommand = new DetectFacesCommand({
      Image: { S3Object: { Bucket: bucket, Name: s3Key } },
      Attributes: ['ALL'],
    })
    const facesResponse = await client.send(facesCommand)

    // Detect moderation labels (for deepfake/AI detection)
    const moderationCommand = new DetectModerationLabelsCommand({
      Image: { S3Object: { Bucket: bucket, Name: s3Key } },
      MinConfidence: 60,
    })
    const moderationResponse = await client.send(moderationCommand)

    return {
      labels: (labelsResponse.Labels || []).map(label => ({
        name: label.Name || '',
        confidence: label.Confidence || 0,
      })),
      text: (textResponse.TextDetections || [])
        .filter(detection => detection.Type === 'LINE')
        .map(detection => ({
          text: detection.DetectedText || '',
          confidence: detection.Confidence || 0,
        })),
      faces: (facesResponse.FaceDetails || []).map(face => ({
        confidence: face.Confidence || 0,
        emotions: (face.Emotions || [])
          .filter(emotion => (emotion.Confidence || 0) > 50)
          .map(emotion => emotion.Type || ''),
      })),
      moderationLabels: (moderationResponse.ModerationLabels || []).map(label => ({
        name: label.Name || '',
        confidence: label.Confidence || 0,
      })),
    }
  } catch (error) {
    console.error('Rekognition analysis error:', error)
    throw new Error('Failed to analyze image')
  }
}

export async function startVideoAnalysis(s3Key: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET_NAME!

  try {
    const command = new StartLabelDetectionCommand({
      Video: { S3Object: { Bucket: bucket, Name: s3Key } },
      MinConfidence: 70,
    })
    const response = await client.send(command)
    return response.JobId || ''
  } catch (error) {
    console.error('Video analysis start error:', error)
    throw new Error('Failed to start video analysis')
  }
}

export async function getVideoAnalysisResults(jobId: string) {
  try {
    const command = new GetLabelDetectionCommand({ JobId: jobId })
    const response = await client.send(command)

    if (response.JobStatus === 'SUCCEEDED') {
      return {
        status: 'completed',
        labels: (response.Labels || []).map(label => ({
          timestamp: label.Timestamp || 0,
          name: label.Label?.Name || '',
          confidence: label.Label?.Confidence || 0,
        })),
      }
    } else if (response.JobStatus === 'IN_PROGRESS') {
      return { status: 'processing' }
    } else {
      return { status: 'failed' }
    }
  } catch (error) {
    console.error('Video analysis results error:', error)
    throw new Error('Failed to get video analysis results')
  }
}
