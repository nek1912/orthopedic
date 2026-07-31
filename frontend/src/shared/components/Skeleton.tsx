import styles from './Skeleton.module.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
}

export default function Skeleton({ width = '100%', height = '1rem', borderRadius = 'var(--radius-sm)' }: SkeletonProps) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}
