import { addMessageListener, sendMessage, type SettingsPayload } from '@/utils/message-bridge'
import { applyRule, type Rule } from '@/utils/rule'
import type { Settings } from '@/utils/settings'
import type { WebSocketMessage, Song, AlreadyVoted } from '@/utils/rainwave-types'
import {
  clearRequests,
  deleteRequest,
  fetchInfo,
  requestFave,
  requestUnrated,
  voteSong,
} from '@/utils/api'

let autoRequestsRunning = false
let autoVotingRunning = false

const processMessage = async (jsonMsg: string) => {
  const msg = parseJson<WebSocketMessage>(jsonMsg)

  if (msg == null) return
  if (msg.user == null || msg.user.tuned_in !== true) return

  let settings: Settings
  try {
    settings = await getSettings()
  } catch (e) {
    console.error(e)
    return
  }

  if (isPlayingOnWebsite(settings)) return

  if (msg.sched_current == null) {
    console.debug('Fetching info')
    fetchInfo()
    return
  }

  if (!autoRequestsRunning) {
    autoRequestsRunning = true
    runAutoRequests(settings, msg)
      .catch((e) => console.error('Error running auto requests', e))
      .finally(() => (autoRequestsRunning = false))
  }

  if (!autoVotingRunning) {
    autoVotingRunning = true
    runAutoVoting(settings, msg)
      .catch((e) => console.error('Error running auto voting', e))
      .finally(() => (autoVotingRunning = false))
  }
}

const parseJson = <T>(json: string): T | null => {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error('Cannot parse json', e)
    return null
  }
}

const runAutoRequests = async (settings: Settings, msg: WebSocketMessage) => {
  if (!msg.user || msg.user.id === 1 || msg.user.requests_paused) return
  if (!Array.isArray(msg.requests)) return

  console.debug('Running auto requests')

  const requests = msg.requests
  const autoRequestSettings = settings.autoRequests

  let updatedRequests = requests

  if (requests.length > 0 && autoRequestSettings.clear) {
    const requestsToDelete = requests.filter((r) => r.cool || !r.good)
    if (requestsToDelete.length > 0) {
      if (requestsToDelete.length === requests.length) {
        console.debug('Clearing requests')
        updatedRequests = await clearRequests()
      } else {
        console.debug(`Deleting ${requestsToDelete.length} requests`)
        for (const r of requestsToDelete) {
          updatedRequests = await deleteRequest(r.id)
        }
      }
    }
  }
  if (updatedRequests.length === 0 && autoRequestSettings.fave) {
    console.debug('Requesting faves')
    updatedRequests = await requestFave()
  }
  if (updatedRequests.length === 0 && autoRequestSettings.unrated) {
    console.debug('Requesting unrated')
    await requestUnrated()
  }
}
export const _runAutoRequests = runAutoRequests

const runAutoVoting = async (settings: Settings, msg: WebSocketMessage) => {
  if (!msg.sched_next || msg.sched_next.length === 0) return

  const rules = settings.autoVoteRules
  if (rules.length === 0) return

  const songToVote = findSongToVote(rules, msg)
  if (songToVote != null && songToVote.entry_id != null) {
    console.debug(`Voting for '${songToVote.title}'`)
    await voteSong(songToVote.entry_id)
  }
}
export const _runAutoVoting = runAutoVoting

const findSongToVote = (rules: Rule[], msg: WebSocketMessage): Song | null => {
  if (!msg.user || !msg.sched_next?.[0]) return null
  const userId = msg.user.id
  const event = msg.sched_next[0]

  let songToVote: Song | null = null
  for (const r of rules) {
    songToVote = applyRule(r, event.songs, { userId })
    if (songToVote != null) break
  }

  if (isSongVoted(userId, event.id, msg.already_voted, songToVote)) {
    return null
  }
  return songToVote
}

const isSongVoted = (
  userId: number,
  eventId: number,
  alreadyVoted: AlreadyVoted | undefined,
  song: Song | null,
) => {
  if (!userId || !eventId || !alreadyVoted || !song) return false

  if (song.elec_request_user_id === userId) return true

  const alreadyVotedMap = new Map(alreadyVoted)
  if (alreadyVotedMap.get(eventId) === song.entry_id) return true

  return false
}

const getSettings = (): Promise<Settings> => {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()

    const removeListener = addMessageListener((msg) => {
      if (msg.type !== 'SETTINGS') return
      const payload = msg.payload as SettingsPayload
      if (!payload || payload.id !== id) return

      removeListener()
      if (payload.settings) {
        resolve(payload.settings)
      } else {
        reject(payload.error)
      }
    })

    sendMessage('SETTINGS_GET', { id })
  })
}

const isPlayingOnWebsite = (settings: Settings): boolean => {
  if (!settings.behavior.playingOnWebsite) return true

  const elements = Array.from(document.querySelectorAll('audio'))
  return elements.some((e) => !e.paused)
}

type WebSocketArgs = ConstructorParameters<typeof WebSocket>
type WebSocketConstructor = new (...args: WebSocketArgs) => WebSocket

const WebSocketProxy = new Proxy(window.WebSocket, {
  construct: function (
    target: typeof WebSocket,
    args: WebSocketArgs,
    newTarget: WebSocketConstructor,
  ) {
    const instance = Reflect.construct(target, args, newTarget)

    const messageHandler = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        processMessage(event.data)
      }
    }

    instance.addEventListener('message', messageHandler)
    instance.addEventListener(
      'close',
      () => {
        instance.removeEventListener('message', messageHandler)
      },
      { once: true },
    )

    return instance
  },
})

export default defineUnlistedScript(() => {
  window.WebSocket = WebSocketProxy
})
