// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest'
import { _runAutoRequests, _runAutoVoting } from '../main-world'
import { Settings } from '@/utils/settings'
import { WebSocketMessage, Event, VoteResponse } from '@/utils/rainwave-types'
import { Rule } from '@/utils/rule'
import * as api from '@/utils/api'
import * as rule from '@/utils/rule'

describe('runAutoRequests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })
  it('does not run when user is anon', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      requests: [
        {
          id: 1,
          cool: true,
          good: false,
        },
      ],
    }
    await _runAutoRequests(settings, msg)
    expect(clearRequestsSpy).not.toBeCalled()
    expect(deleteRequestSpy).not.toBeCalled()
    expect(requestFaveSpy).not.toBeCalled()
    expect(requestUnratedSpy).not.toBeCalled()
  })
  it('does not run when user requests is paused', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 2,
        requests_paused: true,
        tuned_in: true,
      },
      requests: [
        {
          id: 1,
          cool: true,
          good: false,
        },
      ],
    }
    await _runAutoRequests(settings, msg)
    expect(clearRequestsSpy).not.toBeCalled()
    expect(deleteRequestSpy).not.toBeCalled()
    expect(requestFaveSpy).not.toBeCalled()
    expect(requestUnratedSpy).not.toBeCalled()
  })
  it('clears all requests when all are cool, and then request fave and unrated', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 2,
        requests_paused: false,
        tuned_in: true,
      },
      requests: [
        {
          id: 1,
          cool: true,
          good: false,
        },
        {
          id: 2,
          cool: false,
          good: false,
        },
      ],
    }
    await _runAutoRequests(settings, msg)
    expect(clearRequestsSpy).toBeCalled()
    expect(deleteRequestSpy).not.toBeCalled()
    expect(requestFaveSpy).toBeCalled()
    expect(requestUnratedSpy).toBeCalled()
  })
  it('delete requests that are cool or not good but does not request fave / unrated', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([
      {
        id: 3,
        cool: false,
        good: true,
      },
    ])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 2,
        requests_paused: false,
        tuned_in: true,
      },
      requests: [
        {
          id: 1,
          cool: true,
          good: false,
        },
        {
          id: 2,
          cool: false,
          good: false,
        },
        {
          id: 3,
          cool: false,
          good: true,
        },
        {
          id: 4,
          cool: true,
          good: true,
        },
      ],
    }
    await _runAutoRequests(settings, msg)
    expect(clearRequestsSpy).not.toBeCalled()
    expect(deleteRequestSpy).toBeCalledTimes(3)
    expect(deleteRequestSpy).toBeCalledWith(1)
    expect(deleteRequestSpy).toBeCalledWith(2)
    expect(deleteRequestSpy).toBeCalledWith(4)
    expect(requestFaveSpy).not.toBeCalled()
    expect(requestUnratedSpy).not.toBeCalled()
  })
  it('does not request unrated when request fave has requests', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([
      {
        id: 1,
        cool: false,
        good: true,
      },
      {
        id: 2,
        cool: false,
        good: true,
      },
    ])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 2,
        requests_paused: false,
        tuned_in: true,
      },
      requests: [],
    }
    await _runAutoRequests(settings, msg)
    expect(clearRequestsSpy).not.toBeCalled()
    expect(deleteRequestSpy).not.toBeCalled()
    expect(requestFaveSpy).toBeCalled()
    expect(requestUnratedSpy).not.toBeCalled()
  })
})

describe('runAutoVoting', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })
  it('does not run when there is no next event', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(null)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).not.toBeCalled()
    expect(voteSongSpy).not.toBeCalled()
  })
  it('does not run when there are no rules', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(null)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      sched_next: events,
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).not.toBeCalled()
    expect(voteSongSpy).not.toBeCalled()
  })
  it('does not vote song if it is already voted', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0].songs[0])
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      sched_next: events,
      already_voted: [[events[0].id, events[0].songs[0].entry_id]],
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).toBeCalled()
    expect(voteSongSpy).not.toBeCalled()
  })
  it('does not vote song if it is a requested song', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0].songs[1])
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      sched_next: events,
      already_voted: [],
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).toBeCalled()
    expect(voteSongSpy).not.toBeCalled()
  })
  it('votes a song', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0].songs[0])
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(true))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      sched_next: events,
      already_voted: [],
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).toBeCalled()
    expect(voteSongSpy).toBeCalled()
    expect(voteSongSpy).toBeCalledWith(events[0].songs[0].entry_id)
  })

  const rules: Rule[] = [
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

  const events: Event[] = [
    {
      id: 1,
      songs: [
        {
          id: 1,
          title: 'Song A',
          entry_id: 1111,
          elec_request_user_id: 0,
          rating_user: 0,
          rating: 4.5,
          fave: false,
          albums: [
            {
              fave: false,
            },
          ],
        },
        {
          id: 2,
          title: 'Song B',
          entry_id: 2222,
          elec_request_user_id: 1,
          rating_user: 0,
          rating: 4,
          fave: false,
          albums: [
            {
              fave: false,
            },
          ],
        },
      ],
    },
  ]

  const voteResult = (success: boolean): VoteResponse => ({
    vote_result: {
      success,
    },
  })
})
