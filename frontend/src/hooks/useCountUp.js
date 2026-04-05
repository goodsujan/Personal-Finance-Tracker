import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0 || isNaN(target)) {
      setValue(0)
      return
    }
    const start = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}
