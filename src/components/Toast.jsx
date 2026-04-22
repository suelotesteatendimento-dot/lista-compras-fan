import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export default function Toast({ message, type = 'success', onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10)
    // start exit
    const t2 = setTimeout(() => setVisible(false), 3200)
    // unmount after exit animation
    const t3 = setTimeout(onDismiss, 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDismiss])

  const base = 'flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-xs w-full pointer-events-auto transition-all duration-300'
  const styles = type === 'success'
    ? 'bg-stone-900 text-white'
    : 'bg-red-500 text-white'
  const transform = visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'

  return (
    <div className={`${base} ${styles} ${transform}`}>
      {type === 'success'
        ? <CheckCircle size={16} className="flex-shrink-0 text-emerald-400" />
        : <XCircle size={16} className="flex-shrink-0 text-red-200" />
      }
      <span className="flex-1">{message}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}
