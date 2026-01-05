export type WebSocketMessage = {
  user?: User
  sched_current?: Event
  sched_next?: Event[]
  requests?: Request[]
  already_voted?: AlreadyVoted
}
export type User = {
  id: number
  tuned_in: boolean
  requests_paused: boolean
}
export type Event = {
  id: number
  songs: Song[]
}
export type AlreadyVoted = [number, number][]
export type Album = {
  fave: boolean
}
export type Song = {
  id: number
  title: string
  entry_id: number
  elec_request_user_id: number
  rating_user: number
  rating: number
  fave: boolean
  albums: Album[]
}
export type Request = {
  id: number
  cool: boolean
  good: boolean
}
export type VoteResponse = {
  vote_result: {
    success: boolean
  }
}
export type ManageRequestsResponse = {
  requests: Request[]
}
