import { useState } from 'react'
import './FilterBar.css'

const CATEGORIES = [
  'All',
  'Music',
  'Podcasts',
  'Data Structures',
  'Gaming',
  'Cooking',
  'News',
  'Sports',
  'Learning',
  'Fashion',
]

function FilterBar() {
  const [activeCategory, setActiveCategory] = useState('All')

  return (
    <div className="filter-bar-container">
      <div className="filter-bar">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`filter-chip ${activeCategory === category ? 'filter-chip-active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterBar
