import { useEffect, useRef } from 'react'

/** Fades a block in on scroll. */
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('in'), delay)
          io.unobserve(el)
        }
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    )
    io.observe(el)
    // Safety net: never leave content invisible just because the observer
    // did not fire (fast scroll, background tab, JS hiccup).
    const t = setTimeout(() => el.classList.add('in'), 1200 + delay)
    return () => { clearTimeout(t); io.disconnect() }
  }, [delay])
  return <div ref={ref} className={`rv ${className}`}>{children}</div>
}

/** Counts up to `to` when scrolled into view. Renders the single <b> element. */
export function Counter({ to, suffix = '', prefix = '', className = '', prefixClass = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // threshold 0 + generous rootMargin: fires even on a fast scroll that
    // jumps past the element, and never leaves the number stuck at 0.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.unobserve(el)
      const dur = 1600
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        const val = Math.round(to * eased).toLocaleString('en-MY')
        el.textContent = ''
        if (prefix) {
          const sp = document.createElement('span')
          sp.className = prefixClass
          sp.textContent = prefix
          el.appendChild(sp)
        }
        el.appendChild(document.createTextNode(val + suffix))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0, rootMargin: '0px 0px 15% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [to, prefix, suffix])
  return (
    <b ref={ref} className={className}>
      {prefix ? <span className={prefixClass}>{prefix}</span> : null}
      {`0${suffix}`}
    </b>
  )
}
