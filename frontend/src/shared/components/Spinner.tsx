import styles from './Spinner.module.css'

interface SpinnerProps {
  size?: 'small' | 'default'
}

export default function Spinner({ size = 'default' }: SpinnerProps) {
  return <span className={`${styles.spinner} ${styles[size]}`} aria-hidden="true" />
}
