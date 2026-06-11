// @vitest-environment jsdom

import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportCookies, importCookies } from '../cookie'

describe('cookies', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })
  it('should export supported cookies', async () => {
    const cookies = [
      {
        name: 'r4_session_id',
        value: 'abc123',
        domain: 'rainwave.cc',
        path: '/',
        expirationDate: 1812699896,
        secure: true,
        hostOnly: true,
        httpOnly: true,
        sameSite: 'lax',
      },
      {
        name: 'test',
        value: 'def456',
        domain: 'rainwave.cc',
        path: '/',
      },
    ] as Browser.cookies.Cookie[]

    const getAllSpy = vi.spyOn(browser.cookies, 'getAll').mockImplementation(async () => cookies)

    expect(await exportCookies()).toStrictEqual(
      'r4_session_id=abc123; Path=/; Expires=Fri, 11 Jun 2027 07:44:56 GMT; Secure; HttpOnly; SameSite=lax',
    )

    expect(getAllSpy).toHaveBeenCalledWith({
      domain: 'rainwave.cc',
    })
  })

  it('should import supported cookies from file', async () => {
    const setCookieSpy = vi.spyOn(browser.cookies, 'set').mockImplementation(async () => {})

    const text = [
      'r4_session_id=abc123; Path=/; Expires=Fri, 11 Jun 2027 07:44:56 GMT; Secure; HttpOnly; SameSite=lax',
      'r5_prefs=def456; Domain=rainwave.cc; Path=/; Expires=Fri, 11 Jun 2027 07:44:56 GMT; HttpOnly',
      'test=def456; Domain=rainwave.cc; Path=/',
    ].join('\n')

    const file = new File([text], 'cookies.txt', { type: 'text/plain' })

    expect(await importCookies(file)).toStrictEqual(2)

    expect(setCookieSpy).toHaveBeenCalledTimes(2)
    expect(setCookieSpy).toHaveBeenNthCalledWith(1, {
      url: 'https://rainwave.cc/',
      name: 'r4_session_id',
      value: 'abc123',
      domain: undefined,
      path: '/',
      expirationDate: 1812699896,
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    })
    expect(setCookieSpy).toHaveBeenNthCalledWith(2, {
      url: 'http://rainwave.cc/',
      name: 'r5_prefs',
      value: 'def456',
      domain: 'rainwave.cc',
      path: '/',
      expirationDate: 1812699896,
      secure: false,
      httpOnly: true,
      sameSite: undefined,
    })
  })
})
