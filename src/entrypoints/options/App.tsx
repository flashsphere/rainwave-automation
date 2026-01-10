import { useState } from 'react'
import type { Rule } from '@/utils/rule'
import {
  BehaviorSettings,
  getSettings,
  updateAutoRequests,
  updateRules,
  type AutoRequestSettings,
} from '@/utils/settings'
import { AutoRequests, Behavior, Rules } from '@/components'
import './App.css'
import { extractError } from '@/utils/error'

function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRequests, setAutoRequests] = useState<AutoRequestSettings | null>(null)
  const [rules, setRules] = useState<Rule[] | null>(null)
  const [behavior, setBehavior] = useState<BehaviorSettings | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await getSettings()
        setLoading(false)
        setAutoRequests(settings.autoRequests)
        setRules(settings.autoVoteRules)
        setBehavior(settings.behavior)
      } catch (e) {
        setLoading(false)
        setError(extractError(e))
      }
    }
    loadData()
  }, [])

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
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {rules && <Rules rules={rules} save={saveRules} />}
      {autoRequests && <AutoRequests autoRequests={autoRequests} save={saveAutoRequests} />}
      {behavior && <Behavior behavior={behavior} save={saveBehavior} />}
    </>
  )
}

export default App
