import { useState, use, Suspense } from 'react'
import type { Rule } from '@/utils/rule'
import {
  BehaviorSettings,
  getSettings,
  updateAutoRequests,
  updateRules,
  type AutoRequestSettings,
} from '@/utils/settings'
import { AutoRequests, Behavior, Rules, ErrorBoundary } from '@/components'
import './App.css'

const settingsPromise = getSettings()

function AppContent() {
  const settings = use(settingsPromise)

  const [autoRequests, setAutoRequests] = useState<AutoRequestSettings>(settings.autoRequests)
  const [rules, setRules] = useState<Rule[]>(settings.autoVoteRules)
  const [behavior, setBehavior] = useState<BehaviorSettings>(settings.behavior)

  const saveAutoRequests = async (autoRequests: AutoRequestSettings) => {
    setAutoRequests(autoRequests)
    await updateAutoRequests(autoRequests)
  }

  const saveRules = async (rules: Rule[]) => {
    setRules(rules)
    await updateRules(rules)
  }

  const saveBehavior = async (behavior: BehaviorSettings) => {
    setBehavior(behavior)
    await updateBehavior(behavior)
  }

  return (
    <>
      <Rules rules={rules} save={saveRules} />
      <AutoRequests autoRequests={autoRequests} save={saveAutoRequests} />
      <Behavior behavior={behavior} save={saveBehavior} />
    </>
  )
}

function App() {
  const retry = () => window.location.reload()

  return (
    <ErrorBoundary retry={retry}>
      <Suspense fallback={<div>Loading...</div>}>
        <AppContent />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
