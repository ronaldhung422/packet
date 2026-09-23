import { FilterType, FilterChip } from '../types'

interface FilterChipsProps {
  filters: FilterChip[]
  selected: FilterType
  onSelect: (filter: FilterType) => void
}

export function FilterChips({ filters, selected, onSelect }: FilterChipsProps) {
  return (
    <div className="filter-chips-container">
      <div className="filter-chips">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`filter-chip ${selected === filter.id ? 'active' : ''}`}
          >
            <span className="filter-chip-emoji">{filter.emoji}</span>
            <span className="filter-chip-label">{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
