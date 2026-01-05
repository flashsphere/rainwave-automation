import { describe, it, expect, afterEach } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { getSettings, updateAutoRequests, updateRules } from '../settings'

const autoRequestsStorage = storage.defineItem<AutoRequestFlags>('local:autoRequests')
const autoVoteRulesStorage = storage.defineItem<Rule[]>('local:autoVoteRules')

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
    await updateAutoRequests(autoRequests)
    await updateRules(autoVoteRules)

    expect(await getSettings()).toStrictEqual({
      autoRequests,
      autoVoteRules,
    })
  })

  it('should return default values when it does not exist in storage', async () => {
    await autoRequestsStorage.removeValue()
    await autoVoteRulesStorage.removeValue()

    expect(await getSettings()).toStrictEqual({
      autoRequests: { fave: false, unrated: false, clear: false },
      autoVoteRules: [],
    })
  })
})
