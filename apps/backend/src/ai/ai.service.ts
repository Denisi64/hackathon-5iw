import Anthropic from '@anthropic-ai/sdk'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

const VISION_SYSTEM_PROMPT = `You are a document verification system for Comutitres, a transport subscription platform in Île-de-France.

Analyze the provided document and extract the following information.
Respond ONLY with valid JSON, no text before or after.

{
  "documentType": string,
  "lastName": string | null,
  "firstName": string | null,
  "birthDate": string | null,
  "expiryDate": string | null,
  "schoolYear": string | null,
  "institution": string | null,
  "valid": boolean,
  "confidence": number,
  "issues": string[],
  "readable": boolean
}

RULES:
- If the document is blurry, poorly framed, or incomplete: readable = false, confidence < 30
- If an expiry date has passed: valid = false, add "Expired document" to issues
- Do not invent information not visible in the document
- If unsure of a value, use null rather than guessing
- Extract ONLY information visible in the document

IMPORTANT: This system is used only for pre-verification. Final validation always remains human.`

export interface VisionResult {
  documentType: string
  lastName: string | null
  firstName: string | null
  birthDate: string | null
  expiryDate: string | null
  schoolYear: string | null
  institution: string | null
  valid: boolean
  confidence: number
  issues: string[]
  readable: boolean
}

const MODEL = 'claude-sonnet-4-6'

@Injectable()
export class AiService {
  private readonly client: Anthropic

  constructor(config: ConfigService) {
    this.client = new Anthropic({ apiKey: config.get<string>('ANTHROPIC_API_KEY') })
  }

  async verifyDocument(imageBase64: string, mimeType: string): Promise<VisionResult> {
    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: imageBase64 },
            },
            { type: 'text', text: 'Analyze this document and return the requested JSON.' },
          ],
        },
      ],
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return JSON.parse(text) as VisionResult
  }
}
