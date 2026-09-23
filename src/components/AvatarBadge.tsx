import { User } from '../types'

interface AvatarBadgeProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AvatarBadge({ user, size = 'sm', className = '' }: AvatarBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  }

  const emoji = user === 'ronald' ? '👨' : '👩'
  const bgColor = user === 'ronald' ? 'bg-blue-500' : 'bg-pink-500'

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center shadow-sm ${className}`}
      title={user === 'ronald' ? 'Ronald' : 'Kerry'}
    >
      <span className="leading-none">{emoji}</span>
    </div>
  )
}
