// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest'
import { _runAutoRequests, _runAutoVoting } from '../main-world'
import type { Settings } from '@/utils/settings'
import type { WebSocketMessage, Event, VoteResponse } from '@/utils/rainwave-types'
import type { Rule } from '@/utils/rule'
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
      behavior: { playingOnWebsite: true },
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
    expect(clearRequestsSpy).not.toHaveBeenCalled()
    expect(deleteRequestSpy).not.toHaveBeenCalled()
    expect(requestFaveSpy).not.toHaveBeenCalled()
    expect(requestUnratedSpy).not.toHaveBeenCalled()
  })
  it('does not run when user requests is paused', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
      behavior: { playingOnWebsite: true },
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
    expect(clearRequestsSpy).not.toHaveBeenCalled()
    expect(deleteRequestSpy).not.toHaveBeenCalled()
    expect(requestFaveSpy).not.toHaveBeenCalled()
    expect(requestUnratedSpy).not.toHaveBeenCalled()
  })
  it('clears all requests when all are cool, and then request fave and unrated', async () => {
    const clearRequestsSpy = vi.spyOn(api, 'clearRequests').mockResolvedValue([])
    const deleteRequestSpy = vi.spyOn(api, 'deleteRequest').mockResolvedValue([])
    const requestFaveSpy = vi.spyOn(api, 'requestFave').mockResolvedValue([])
    const requestUnratedSpy = vi.spyOn(api, 'requestUnrated').mockResolvedValue([])

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
      behavior: { playingOnWebsite: true },
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
    expect(clearRequestsSpy).toHaveBeenCalled()
    expect(deleteRequestSpy).not.toHaveBeenCalled()
    expect(requestFaveSpy).toHaveBeenCalled()
    expect(requestUnratedSpy).toHaveBeenCalled()
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
      behavior: { playingOnWebsite: true },
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
    expect(clearRequestsSpy).not.toHaveBeenCalled()
    expect(deleteRequestSpy).toHaveBeenCalledTimes(3)
    expect(deleteRequestSpy).toHaveBeenCalledWith(1)
    expect(deleteRequestSpy).toHaveBeenCalledWith(2)
    expect(deleteRequestSpy).toHaveBeenCalledWith(4)
    expect(requestFaveSpy).not.toHaveBeenCalled()
    expect(requestUnratedSpy).not.toHaveBeenCalled()
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
      behavior: { playingOnWebsite: true },
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
    expect(clearRequestsSpy).not.toHaveBeenCalled()
    expect(deleteRequestSpy).not.toHaveBeenCalled()
    expect(requestFaveSpy).toHaveBeenCalled()
    expect(requestUnratedSpy).not.toHaveBeenCalled()
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
      behavior: { playingOnWebsite: true },
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).not.toHaveBeenCalled()
    expect(voteSongSpy).not.toHaveBeenCalled()
  })
  it('does not run when there are no rules', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(null)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: [],
      behavior: { playingOnWebsite: true },
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
    expect(applyRuleSpy).not.toHaveBeenCalled()
    expect(voteSongSpy).not.toHaveBeenCalled()
  })
  it('does not vote song if it is already voted', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0]!.songs[0]!)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
      behavior: { playingOnWebsite: true },
    }
    const msg: WebSocketMessage = {
      user: {
        id: 1,
        requests_paused: true,
        tuned_in: true,
      },
      sched_next: events,
      already_voted: [[events[0]!.id, events[0]!.songs[0]!.entry_id]],
    }
    await _runAutoVoting(settings, msg)
    expect(applyRuleSpy).toHaveBeenCalled()
    expect(voteSongSpy).not.toHaveBeenCalled()
  })
  it('does not vote song if it is a requested song', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0]!.songs[1]!)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(false))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
      behavior: { playingOnWebsite: true },
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
    expect(applyRuleSpy).toHaveBeenCalled()
    expect(voteSongSpy).not.toHaveBeenCalled()
  })
  it('votes a song', async () => {
    const applyRuleSpy = vi.spyOn(rule, 'applyRule').mockReturnValue(events[0]!.songs[0]!)
    const voteSongSpy = vi.spyOn(api, 'voteSong').mockResolvedValue(voteResult(true))

    const settings: Settings = {
      autoRequests: { clear: true, fave: true, unrated: true },
      autoVoteRules: rules,
      behavior: { playingOnWebsite: true },
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
    expect(applyRuleSpy).toHaveBeenCalled()
    expect(voteSongSpy).toHaveBeenCalled()
    expect(voteSongSpy).toHaveBeenCalledWith(events[0]!.songs[0]!.entry_id)
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
