export function extractError(e: unknown): string {
  let errorMessage: string
  if (e instanceof Error) {
    errorMessage = e.message
  } else {
    errorMessage = String(e)
  }
  return errorMessage
}
