import { describe, it, expect, vi, afterEach } from 'vitest'
import { applyRule, Rule } from '@/utils/rule'
import { Song } from '@/utils/rainwave-types'

describe('rule', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })
  it('fave song and >= rating', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        rating: 4,
      }),
      createSong({
        id: 2,
        fave: true,
        rating: 4,
        rating_user: 4.2,
      }),
      createSong({
        id: 3,
        fave: true,
        rating: 4,
        rating_user: 4.8,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'FaveSong',
        },
        {
          id: crypto.randomUUID(),
          type: 'Rating',
          operator: 'GreaterEqual',
          rating: 4,
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[2].id)
  })
  it('fave album and >= rating', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        rating: 4,
      }),
      createSong({
        id: 2,
        albums: [{ fave: true }],
        rating: 4.2,
      }),
      createSong({
        id: 3,
        albums: [{ fave: true }],
        rating: 4,
        rating_user: 3.8,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'FaveAlbum',
        },
        {
          id: crypto.randomUUID(),
          type: 'Rating',
          operator: 'GreaterEqual',
          rating: 4,
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[1].id)
  })
  it('fave song and <= rating', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        rating: 3,
      }),
      createSong({
        id: 2,
        fave: true,
        rating: 4,
        rating_user: 1,
      }),
      createSong({
        id: 3,
        fave: false,
        rating: 4,
        rating_user: 1,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'FaveSong',
        },
        {
          id: crypto.randomUUID(),
          type: 'Rating',
          operator: 'LesserEqual',
          rating: 4,
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[1].id)
  })
  it('fave album and <= rating', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        rating: 1,
      }),
      createSong({
        id: 2,
        albums: [{ fave: true }],
        rating: 2.2,
      }),
      createSong({
        id: 3,
        albums: [{ fave: true }],
        rating: 4,
        rating_user: 1,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'FaveAlbum',
        },
        {
          id: crypto.randomUUID(),
          type: 'Rating',
          operator: 'LesserEqual',
          rating: 4,
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[2].id)
  })
  it('user request', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
      }),
      createSong({
        id: 2,
        elec_request_user_id: 1,
      }),
      createSong({
        id: 3,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'Request',
          requestType: 'User',
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[1].id)
  })
  it('others request and fave song', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        elec_request_user_id: 1,
      }),
      createSong({
        id: 2,
        fave: true,
        elec_request_user_id: 2,
      }),
      createSong({
        id: 3,
        fave: true,
      }),
    ]
    const rule: Rule = {
      id: crypto.randomUUID(),
      conditions: [
        {
          id: crypto.randomUUID(),
          type: 'Request',
          requestType: 'Others',
        },
        {
          id: crypto.randomUUID(),
          type: 'FaveSong',
        },
      ],
    }
    const song = applyRule(rule, songs, { userId: 1 })

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[1].id)
  })
  it('multiple rules', () => {
    const songs: Song[] = [
      createSong({
        id: 1,
        fave: true,
        albums: [{ fave: true }],
        elec_request_user_id: 3,
        rating_user: 5,
        rating: 4.8,
      }),
      createSong({
        id: 2,
        fave: true,
        rating: 4.3,
      }),
      createSong({
        id: 3,
        rating: 4.3,
      }),
    ]
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
      {
        id: crypto.randomUUID(),
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'FaveSong',
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'FaveAlbum',
          },
          {
            id: crypto.randomUUID(),
            type: 'Rating',
            operator: 'GreaterEqual',
            rating: 4,
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        conditions: [
          {
            id: crypto.randomUUID(),
            type: 'Rating',
            operator: 'GreaterEqual',
            rating: 4,
          },
        ],
      },
    ]

    let song: Song | null = null

    for (const r of rules) {
      song = applyRule(r, songs, { userId: 1 })
      if (song != null) break
    }

    expect(song).not.toBeNull()
    expect(song?.id).toBe(songs[0].id)
  })

  const createSong = (props: Partial<Song>): Song => ({
    id: 1,
    title: `Song ${props.id || 1}`,
    entry_id: 1111,
    elec_request_user_id: 0,
    rating_user: 0,
    rating: 4,
    fave: false,
    albums: [
      {
        fave: false,
      },
    ],
    ...props,
  })
})
