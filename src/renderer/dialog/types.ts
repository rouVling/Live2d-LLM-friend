export interface DialogMessage {
  content: string,
  role: "user" | "assistant" | "system",
  voiceUrl? : undefined | string | HTMLAudioElement | AudioContext | any,
  voiceType?: "string" | "element" | "buffer",
  img?: string
}

export interface GPTResponse {
  id: string,
  object: string,
  created: number,
  model: string,
  choices: {
    index: number,
    message: {
      role: "assistant" | "user",
      content: string,
    },
    logprobs: null,
    finish_reason: "length" | "stop",
  }[],
  usage:
  {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
  }
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts?: {
        text: string
      }[],
      role: "model" | "user"
    },
    finishReason: string,
    index: number,
    safetyRatings: {
      category: string, // unknown options
      probability: string // unknown options
    }[]
  } [],
  usageMetadata: {
    promptTokenCount: number,
    candidatesTokenCount: number,
    totalTokenCount: number
  }
}

export interface SoVITSConfig {
  text_lang: string,
  ref_audio_path: string,
  aux_ref_audio_paths: string[],
  prompt_text: string,
  prompt_lang: string,
  top_k: number,
  top_p: number,
  temperature: number,
  text_split_method: string,
  batch_size: number,
  batch_threshold: number,
  split_bucket: boolean,
  return_fragment: boolean,
  speed_factor: number,
  streaming_mode: boolean,
  seed: number,
  parallel_infer: true,
  repetition_penalty: number,
  media_type: "wav" | "raw" | "ogg" | "aac"
}

export interface xfConfig {
  APPID: string,
  APIKey: string,
  APISecret: string,
}
