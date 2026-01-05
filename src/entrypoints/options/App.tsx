import { useState } from 'react'
import type { Rule } from '@/utils/rule'
import {
  getSettings,
  updateAutoRequests,
  updateRules,
  type AutoRequestFlags,
} from '@/utils/settings'
import { AutoRequests, Rules } from '@/components'
import './App.css'
import { extractError } from '@/utils/error'

function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRequests, setAutoRequests] = useState<AutoRequestFlags | null>(null)
  const [rules, setRules] = useState<Rule[] | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await getSettings()
        setLoading(false)
        setAutoRequests(settings.autoRequests)
        setRules(settings.autoVoteRules)
      } catch (e) {
        setLoading(false)
        setError(extractError(e))
      }
    }
    loadData()
  }, [])

  const saveAutoRequests = async (autoRequests: AutoRequestFlags) => {
    setAutoRequests(autoRequests)
    await updateAutoRequests(autoRequests)
  }

  const saveRules = async (rules: Rule[]) => {
    setRules(rules)
    await updateRules(rules)
  }

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      {rules && <Rules rules={rules} save={saveRules} />}
      {autoRequests && <AutoRequests autoRequests={autoRequests} save={saveAutoRequests} />}
    </>
  )
}

export default App
