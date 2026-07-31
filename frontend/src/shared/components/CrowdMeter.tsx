import styles from './CrowdMeter.module.css'

export default function CrowdMeter() {
  return (
    <div className={styles.meter}>
      <div className={styles.item}>
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.label}>Low (0-3)</span>
      </div>
      <div className={styles.item}>
        <span className={`${styles.dot} ${styles.orange}`} />
        <span className={styles.label}>Medium (4-7)</span>
      </div>
      <div className={styles.item}>
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={styles.label}>Full (8+)</span>
      </div>
    </div>
  )
}
