import { extractError } from '@/utils/error'
import {
  addMessageListener,
  sendMessage,
  type SettingsPayload,
  type SettingsRequestPayload,
} from '@/utils/message-bridge'
import { getSettings } from '@/utils/settings'

const loadScript = (url: string) => {
  const script: HTMLScriptElement = document.createElement('script')
  script.src = url
  script.onload = function () {
    script.remove()
  }
  const element = document.head || document.documentElement
  element.appendChild(script)
}

export default defineContentScript({
  matches: ['https://rainwave.cc/*'],
  runAt: 'document_start',
  async main() {
    addMessageListener(async (msg) => {
      if (msg.type !== 'SETTINGS_GET') return

      const payload = msg.payload as SettingsRequestPayload
      const id = payload.id
      let result: SettingsPayload
      try {
        const settings = await getSettings()
        result = { id, settings }
      } catch (e) {
        result = { id, error: extractError(e) }
      }

      sendMessage('SETTINGS', result)
    })
    loadScript(browser.runtime.getURL('/main-world.js'))
  },
})
