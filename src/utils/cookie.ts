export const supportedDomain = 'rainwave.cc'
const allowedCookies = ['r4_session_id', 'r5_prefs', 'rw_lang']

export const exportCookies = async (): Promise<string | undefined> => {
  const cookies = await browser.cookies.getAll({
    domain: supportedDomain,
  })

  const filteredCookies = cookies.filter((cookie) => allowedCookies.includes(cookie.name))
  if (filteredCookies.length === 0) {
    return
  }

  return extractCookies(filteredCookies)
}

const extractCookies = (cookies: Browser.cookies.Cookie[]): string => {
  return cookies
    .map((cookie) => {
      const parts = [`${cookie.name}=${cookie.value}`]

      if (!cookie.hostOnly) {
        parts.push(`Domain=${cookie.domain}`)
      }

      parts.push(`Path=${cookie.path}`)

      if (cookie.expirationDate) {
        parts.push(`Expires=${new Date(cookie.expirationDate * 1000).toUTCString()}`)
      }

      if (cookie.secure) {
        parts.push('Secure')
      }

      if (cookie.httpOnly) {
        parts.push('HttpOnly')
      }

      if (cookie.sameSite) {
        parts.push(`SameSite=${cookie.sameSite}`)
      }

      return parts.join('; ')
    })
    .join('\n')
}

export const importCookies = async (file: File): Promise<number> => {
  let cookiesImported = 0

  const contents = await file.text()
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)

  for (const line of lines) {
    const parts = line.split(';').map((p) => p.trim())

    const [nameValue, ...attributes] = parts

    const { name, value } = splitNameValue(nameValue)

    if (!allowedCookies.includes(name)) continue

    let domain: string | undefined
    let path = '/'
    let secure = false
    let httpOnly = false
    let sameSite: Browser.cookies.SameSiteStatus | undefined
    let expirationDate: number | undefined

    for (const attribute of attributes) {
      const { name: attrName, value: attrValue } = splitNameValue(attribute)

      switch (attrName.toLowerCase()) {
        case 'domain':
          domain = attrValue
          break

        case 'path':
          path = attrValue
          break

        case 'expires': {
          if (!Number.isNaN(attrValue)) {
            expirationDate = Date.parse(attrValue) / 1000
          }
          break
        }

        case 'secure':
          secure = true
          break

        case 'httponly':
          httpOnly = true
          break

        case 'samesite':
          sameSite = attrValue.toLowerCase() as Browser.cookies.SameSiteStatus
          break
      }
    }

    const url = new URL(
      path,
      `${secure ? 'https' : 'http'}://${domain?.replace(/^\./, '') || supportedDomain}`,
    ).toString()

    await browser.cookies.set({
      url,
      name,
      value,
      domain,
      path,
      secure,
      httpOnly,
      sameSite,
      expirationDate,
    })

    cookiesImported++
  }
  return cookiesImported
}

const splitNameValue = (cookie: string) => {
  const index = cookie.indexOf('=')

  if (index === -1) {
    return { name: cookie, value: '' }
  }

  const name = cookie.slice(0, index)
  const value = cookie.slice(index + 1)

  return { name, value }
}
