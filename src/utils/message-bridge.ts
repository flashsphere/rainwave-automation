import type { Settings } from './settings'

const extensionName = 'rainwave-automation' as const

export type SettingsRequestPayload = {
  id: string
}

export type SettingsPayload =
  | {
      id: string
      settings: Settings
      error?: never
    }
  | {
      id: string
      settings?: never
      error: string
    }

export type MessagePayload = string | SettingsRequestPayload | SettingsPayload

export type Message = {
  source: typeof extensionName
  type: string
  payload: MessagePayload
}

type MessageHandler = (msg: Message) => void

export function addMessageListener(handler: MessageHandler) {
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return

    const data = event.data as Message
    if (!data || data.source !== extensionName) return

    handler(data)
  }

  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}

export function sendMessage(type: string, payload: MessagePayload) {
  const message: Message = {
    source: extensionName,
    type,
    payload,
  }
  window.postMessage(message, window.location.origin)
}
