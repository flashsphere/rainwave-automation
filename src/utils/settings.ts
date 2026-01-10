import type { Rule } from './rule'

export type AutoRequestSettings = {
  fave: boolean
  unrated: boolean
  clear: boolean
}

export type BehaviorSettings = {
  playingOnWebsite: boolean
}

export type Settings = {
  autoRequests: AutoRequestSettings
  autoVoteRules: Rule[]
  behavior: BehaviorSettings
}

const autoRequests = storage.defineItem<AutoRequestSettings>('local:autoRequests', {
  version: 1,
  fallback: { fave: false, unrated: false, clear: false },
})

const autoVoteRules = storage.defineItem<Rule[]>('local:autoVoteRules', {
  version: 1,
  fallback: [],
})

const behavior = storage.defineItem<BehaviorSettings>('local:behavior', {
  version: 1,
  fallback: { playingOnWebsite: true },
})

export const updateAutoRequests = (flags: AutoRequestSettings): Promise<void> => {
  return autoRequests.setValue(flags)
}

export const updateRules = (rules: Rule[]): Promise<void> => {
  return autoVoteRules.setValue(rules)
}

export const updateBehavior = (settings: BehaviorSettings): Promise<void> => {
  return behavior.setValue(settings)
}

export const getSettings = async (): Promise<Settings> => ({
  autoRequests: await autoRequests.getValue(),
  autoVoteRules: await autoVoteRules.getValue(),
  behavior: await behavior.getValue(),
})
