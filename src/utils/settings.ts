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

const autoRequestsSettings = storage.defineItem<AutoRequestSettings>('local:autoRequests', {
  version: 1,
  fallback: { fave: false, unrated: false, clear: false },
})

const autoVoteRulesSettings = storage.defineItem<Rule[]>('local:autoVoteRules', {
  version: 1,
  fallback: [],
})

const behaviorSettings = storage.defineItem<BehaviorSettings>('local:behavior', {
  version: 1,
  fallback: { playingOnWebsite: true },
})

export const updateAutoRequests = (flags: AutoRequestSettings): Promise<void> => {
  return autoRequestsSettings.setValue(flags)
}

export const updateRules = (rules: Rule[]): Promise<void> => {
  return autoVoteRulesSettings.setValue(rules)
}

export const updateBehavior = (settings: BehaviorSettings): Promise<void> => {
  return behaviorSettings.setValue(settings)
}

export const getSettings = async (): Promise<Settings> => {
  const [autoRequests, autoVoteRules, behavior] = await Promise.all([
    autoRequestsSettings.getValue(),
    autoVoteRulesSettings.getValue(),
    behaviorSettings.getValue(),
  ])

  return { autoRequests, autoVoteRules, behavior }
}
