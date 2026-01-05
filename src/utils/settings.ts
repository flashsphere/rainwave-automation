import type { Rule } from './rule'

export type AutoRequestFlags = {
  fave: boolean
  unrated: boolean
  clear: boolean
}

export type Settings = {
  autoRequests: AutoRequestFlags
  autoVoteRules: Rule[]
}

const autoRequests = storage.defineItem<AutoRequestFlags>('local:autoRequests', {
  version: 1,
  fallback: { fave: false, unrated: false, clear: false },
})

const autoVoteRules = storage.defineItem<Rule[]>('local:autoVoteRules', {
  version: 1,
  fallback: [],
})

export const updateAutoRequests = (flags: AutoRequestFlags): Promise<void> => {
  return autoRequests.setValue(flags)
}

export const updateRules = (rules: Rule[]): Promise<void> => {
  return autoVoteRules.setValue(rules)
}

export const getSettings = async (): Promise<Settings> => ({
  autoRequests: await autoRequests.getValue(),
  autoVoteRules: await autoVoteRules.getValue(),
})
