import { useEffect, useRef, useState } from 'react'

interface Options {
  threshold?: number
  rootMargin?: string
}

export default function useScrollReveal(options: Options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = options
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, visible }
}
