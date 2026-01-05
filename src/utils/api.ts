import type { Request, VoteResponse, ManageRequestsResponse } from '@/utils/rainwave-types'

declare const RainwaveAPI: {
  request: <T>(
    action: string,
    params: object,
    success: (response: T) => void,
    error: (err: object) => void,
  ) => void
}

const callAPI = <T>(action: string, params = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    RainwaveAPI.request(action, params, resolve, reject)
  })
}

export const fetchInfo = () => callAPI('info')

export const voteSong = async (entryId: number): Promise<VoteResponse> => {
  const params = {
    entry_id: entryId,
  }
  const response = await callAPI<VoteResponse>('vote', params)
  return response
}

export const clearRequests = async (): Promise<Request[]> => {
  const response = await callAPI<ManageRequestsResponse>('clear_requests')
  return response.requests
}

export const deleteRequest = async (songId: number): Promise<Request[]> => {
  const params = {
    song_id: songId,
  }
  const response = await callAPI<ManageRequestsResponse>('delete_request', params)
  return response.requests
}

export const requestFave = async (): Promise<Request[]> => {
  const response = await callAPI<ManageRequestsResponse>('request_favorited_songs')
  return response.requests
}

export const requestUnrated = async (): Promise<Request[]> => {
  const response = await callAPI<ManageRequestsResponse>('request_unrated_songs')
  return response.requests
}
