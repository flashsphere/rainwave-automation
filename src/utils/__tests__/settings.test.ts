import { describe, it, expect, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { getSettings, updateAutoRequests, updateRules } from '../settings'

const autoRequestsStorage = storage.defineItem<AutoRequestSettings>('local:autoRequests')
const autoVoteRulesStorage = storage.defineItem<Rule[]>('local:autoVoteRules')
const behaviorStorage = storage.defineItem<BehaviorSettings>('local:behavior')

describe('settings', () => {
  afterEach(() => {
    fakeBrowser.reset()
  })
  it('should return values when it exists in storage', async () => {
    const autoRequests = { fave: true, unrated: true, clear: true }
    const autoVoteRules: Rule[] = [
      {
        id: crypto.randomUUID(),
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'Request',
            requestType: 'User',
          },
        ],
      },
    ]
    const behavior = { playingOnWebsite: false }

    await updateAutoRequests(autoRequests)
    await updateRules(autoVoteRules)
    await updateBehavior(behavior)

    expect(await getSettings()).toStrictEqual({
      autoRequests,
      autoVoteRules,
      behavior,
    })
  })

  it('should return default values when it does not exist in storage', async () => {
    await autoRequestsStorage.removeValue()
    await autoVoteRulesStorage.removeValue()
    await behaviorStorage.removeValue()

    expect(await getSettings()).toStrictEqual({
      autoRequests: { fave: false, unrated: false, clear: false },
      autoVoteRules: [],
      behavior: { playingOnWebsite: true },
    })
  })
})
