import type { Song } from './rainwave-types'

export type RuleParams = {
  userId: number
}

export const conditionTypes = ['Request', 'Rating', 'FaveSong', 'FaveAlbum'] as const
export type ConditionType = (typeof conditionTypes)[number]
export const conditionLabels: Record<ConditionType, string> = {
  Request: 'Song request',
  Rating: 'Song rating',
  FaveSong: 'Favorite song',
  FaveAlbum: 'Favorite album',
}

export const requestTypes = ['User', 'Others'] as const
export type RequestType = (typeof requestTypes)[number]
export const requestTypeLabels: Record<RequestType, string> = {
  User: 'Yours',
  Others: 'Others',
}

export const operatorTypes = ['GreaterEqual', 'Greater', 'LesserEqual', 'Lesser'] as const
export type Operator = (typeof operatorTypes)[number]
export const operatorLabels: Record<Operator, string> = {
  GreaterEqual: '>=',
  Greater: '>',
  LesserEqual: '<=',
  Lesser: '<',
}

function applyOperator(operator: Operator, left: number, right: number): boolean {
  switch (operator) {
    case 'GreaterEqual':
      return left >= right
    case 'Greater':
      return left > right
    case 'LesserEqual':
      return left <= right
    case 'Lesser':
      return left < right
  }
}

export type RequestCondition = { id: string; type: 'Request'; requestType: RequestType }
export type RatingCondition = { id: string; type: 'Rating'; operator: Operator; rating: number }
export type FaveSongCondition = { id: string; type: 'FaveSong' }
export type FaveAlbumCondition = { id: string; type: 'FaveAlbum' }

export type Condition = RequestCondition | RatingCondition | FaveSongCondition | FaveAlbumCondition

function applyCondition(
  condition: Condition,
  songs: Song[],
  params: RuleParams,
): Map<Song, number> {
  switch (condition.type) {
    case 'Request': {
      return songs.reduce((map, song) => {
        switch (condition.requestType) {
          case 'User':
            if (song.elec_request_user_id === params.userId) map.set(song, 1)
            break
          case 'Others':
            if (song.elec_request_user_id !== 0 && song.elec_request_user_id !== params.userId)
              map.set(song, 1)
            break
        }
        return map
      }, new Map<Song, number>())
    }
    case 'Rating': {
      const filteredSongs = songs.reduce((map, song) => {
        const r = song.rating_user > 0 ? song.rating_user : song.rating
        if (applyOperator(condition.operator, r, condition.rating)) {
          map.set(song, r)
        }
        return map
      }, new Map<Song, number>())

      const sortedRatings = Array.from(new Set(filteredSongs.values())).sort((a, b) =>
        condition.operator === 'GreaterEqual' || condition.operator === 'Greater' ? a - b : b - a,
      )

      const weights = sortedRatings.reduce((map, r, i) => {
        map.set(r, i + 1)
        return map
      }, new Map<number, number>())

      return Array.from(filteredSongs.entries()).reduce((map, [song, r]) => {
        map.set(song, weights.get(r) ?? 0)
        return map
      }, new Map<Song, number>())
    }
    case 'FaveSong':
      return songs.reduce((map, song) => {
        if (song.fave) map.set(song, 1)
        return map
      }, new Map<Song, number>())
    case 'FaveAlbum':
      return songs.reduce((map, song) => {
        if (song.albums[0]?.fave) map.set(song, 1)
        return map
      }, new Map<Song, number>())
  }
}

export type Rule = {
  id: string
  conditions: Condition[]
}

export function applyRule(rule: Rule, songs: Song[], params: RuleParams): Song | null {
  if (!Array.isArray(rule.conditions) || rule.conditions.length === 0) return null

  const combined: Map<Song, number> = rule.conditions
    .map((c) => applyCondition(c, songs, params))
    .reduce<Map<Song, number>>((acc, map) => {
      if (acc.size === 0) return new Map(map)
      const result = new Map<Song, number>()
      for (const [song, v] of acc.entries()) {
        const w = map.get(song)
        if (w != null) result.set(song, v + w)
      }
      return result
    }, new Map())

  return maxByOrNull(combined, ([, value]) => value)?.[0] ?? null
}

const maxByOrNull = <K, V>(map: Map<K, V>, selector: (entry: [K, V]) => number): [K, V] | null => {
  if (!map || map.size === 0) return null

  let max: [K, V] | null = null
  for (const entry of map) {
    if (!max || selector(entry) > selector(max)) {
      max = entry
    }
  }
  return max
}

export function ruleToJson(rule: Rule): string {
  return JSON.stringify(rule)
}

export function conditionsFromJson(json: string): Condition[] {
  return JSON.parse(json)
}
