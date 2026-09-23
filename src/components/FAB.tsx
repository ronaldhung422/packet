import { Plus } from 'lucide-react'

interface FABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
}

export function FAB({ onClick, icon, label }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fab"
      aria-label={label || 'Add'}
      title={label || 'Add'}
    >
      {icon || <Plus size={24} />}
    </button>
  )
}
