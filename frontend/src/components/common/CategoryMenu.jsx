import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const CategoryMenu = ({ title, categories, gender, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!categories || categories.length === 0) return null

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-gray-700 hover:text-indigo-600 flex items-center gap-1 transition">
        {Icon && <Icon className="w-4 h-4" />}
        {title}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-20 border">
          {categories.map((cat, index) => (
            <React.Fragment key={cat.id || index}>
              <Link
                to={`/shop?gender=${gender}&category=${cat.slug || cat.toLowerCase().replace(' ', '-')}`}
                className="block px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                {cat.name || cat}
              </Link>
              {(index === 1 || index === 3) && <div className="border-t my-1"></div>}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryMenu