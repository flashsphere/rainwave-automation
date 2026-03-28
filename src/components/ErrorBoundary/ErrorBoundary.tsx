import { Component, ReactNode } from 'react'
import { extractError } from '@/utils/error'

type Props = {
  children: ReactNode
  retry: () => void
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  handleRetry = () => {
    this.setState({ error: null }, () => {
      this.props.retry()
    })
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <div>{extractError(this.state.error)}</div>
          <br />
          <div>
            <button onClick={this.handleRetry}>Retry</button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
