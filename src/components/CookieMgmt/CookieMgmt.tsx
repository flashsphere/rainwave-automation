import { supportedDomain, exportCookies, importCookies } from '@/utils/cookie'

export function CookieMgmt() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  const onImportClick = () => {
    setMsg('')
    fileInputRef.current?.click()
  }

  const onImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imported = await importCookies(file)
      setMsg(`${imported} cookie${imported === 1 ? '' : 's'} imported.`)
    } catch (err) {
      setMsg(`Failed to import cookies: ${extractError(err)}`)
    } finally {
      event.target.value = ''
    }
  }

  const onExportClick = async () => {
    setMsg('')
    try {
      const contents = await exportCookies()
      if (contents == null) {
        setMsg(`No supported cookies found for ${supportedDomain}.`)
        return
      }
      await downloadFile(contents)
    } catch (err) {
      setMsg(`Failed to export cookies: ${extractError(err)}`)
    }
  }

  const downloadFile = async (contents: string) => {
    const blob = new Blob([contents], {
      type: 'text/plain;charset=utf-8',
    })

    const url = URL.createObjectURL(blob)
    try {
      const a = document.createElement('a')
      a.href = url
      a.download = 'rainwave-cookies.txt'
      a.click()

      setMsg('Check your Downloads folder for a "rainwave-cookies.txt" file.')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const openOptionsPage = () => {
    browser.runtime.openOptionsPage()
    window.close()
  }

  if (window.location.pathname.includes('/popup')) {
    return (
      <div>
        <h2>Cookies</h2>

        <div>
          <button onClick={openOptionsPage}>Open Options Page</button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <h2>Cookies</h2>

        <div>
          <button onClick={onImportClick}>Import</button>
          &nbsp;
          <button onClick={onExportClick}>Export</button>
          &nbsp;
          {msg}
        </div>

        <input ref={fileInputRef} type="file" hidden accept=".txt" onChange={onImportChange} />
      </div>
    )
  }
}
