import { useEffect, type PropsWithChildren } from 'react'
import styles from './Modal.module.css'

type ModalProps = {
  onClose: () => void
}

export function Modal({ onClose, children }: PropsWithChildren<ModalProps>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
