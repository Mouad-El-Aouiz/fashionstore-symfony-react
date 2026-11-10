import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@heroicons/react/outline'
import { fetchCategories } from '../../store/slices/productSlice'

const ProductFilter = ({ filters, onFilterChange, onClear }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { categories } = useSelector(state => state.products)
  
  // Déterminer le genre en fonction de l'URL
  const isMenPage = location.pathname.includes('/homme')
  const currentGender = isMenPage ? 'M' : 'F'
  const genderLabel = isMenPage ? 'Homme' : 'Femme'
  
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    size: true,
    color: true,
  })

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Filtrer les catégories par genre
  const getFilteredCategories = () => {
    // Catégories à filtrer
    const excludePatterns = isMenPage 
      ? ['Femme', 'Women'] 
      : ['Homme', 'Men']
    
    return categories.filter(cat => {
      // Garder les catégories du genre actuel
      if (cat.gender === currentGender) return true
      // Garder les unisexe
      if (cat.gender === 'U') return true
      // Exclure les catégories de l'autre genre
      const hasExcludePattern = excludePatterns.some(pattern => 
        cat.name.includes(pattern)
      )
      return !hasExcludePattern
    })
  }

  // Regrouper les catégories par parent
  const getGroupedCategories = () => {
    const filtered = getFilteredCategories()
    const grouped = {}
    
    filtered.forEach(cat => {
      const parentName = cat.parent?.name || 'Autres'
      if (!grouped[parentName]) grouped[parentName] = []
      grouped[parentName].push(cat)
    })
    
    return grouped
  }

  const groupedCategories = getGroupedCategories()
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const colors = [
    { value: 'BLACK', label: 'Noir', class: 'bg-black', border: 'border-gray-300' },
    { value: 'WHITE', label: 'Blanc', class: 'bg-white', border: 'border-gray-300' },
    { value: 'RED', label: 'Rouge', class: 'bg-red-600', border: 'border-red-600' },
    { value: 'BLUE', label: 'Bleu', class: 'bg-blue-600', border: 'border-blue-600' },
    { value: 'GREEN', label: 'Vert', class: 'bg-green-600', border: 'border-green-600' },
    { value: 'YELLOW', label: 'Jaune', class: 'bg-yellow-400', border: 'border-yellow-400' },
    { value: 'PINK', label: 'Rose', class: 'bg-pink-400', border: 'border-pink-400' },
    { value: 'GRAY', label: 'Gris', class: 'bg-gray-500', border: 'border-gray-500' },
    { value: 'NAVY', label: 'Bleu Marine', class: 'bg-blue-900', border: 'border-blue-900' },
    { value: 'BROWN', label: 'Marron', class: 'bg-amber-800', border: 'border-amber-800' },
  ]

  const toggleSection = (section) => {
    setOpenSections({ ...openSections, [section]: !openSections[section] })
  }

  const handlePriceChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value })
  }

  const handleCheckboxChange = (type, value) => {
    const currentValue = filters[type]
    if (currentValue === value) {
      onFilterChange({ [type]: '' })
    } else {
      onFilterChange({ [type]: value })
    }
  }

  const hasActiveFilters = () => {
    return filters.category || filters.min_price || filters.max_price || 
           filters.size || filters.color || filters.search
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
      {/* En-tête avec titre et bouton clear */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
          <p className="text-xs text-gray-400 mt-0.5">{genderLabel}</p>
        </div>
        {hasActiveFilters() && (
          <button 
            onClick={onClear} 
            className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <XIcon className="w-3 h-3" />
            Effacer tout
          </button>
        )}
      </div>

      {/* Section Catégories */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('categories')}
          className="flex justify-between items-center w-full py-2 group"
        >
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Catégories</span>
          {openSections.categories ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          )}
        </button>
        
        {openSections.categories && (
          <div className="mt-3 space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(groupedCategories).map(([parentName, cats]) => (
              <div key={parentName}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {parentName}
                </div>
                <div className="space-y-1.5">
                  {cats.map(category => (
                    <label 
                      key={category.id} 
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.category === category.slug}
                          onChange={() => handleCheckboxChange('category', category.slug)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                          {category.name.replace(` ${genderLabel}`, '')}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Prix */}
      <div className="mb-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => toggleSection('price')}
          className="flex justify-between items-center w-full py-2 group"
        >
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Prix</span>
          {openSections.price ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          )}
        </button>
        
        {openSections.price && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Min (MAD)</label>
                <input
                  type="number"
                  name="min_price"
                  value={filters.min_price}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">Max (MAD)</label>
                <input
                  type="number"
                  name="max_price"
                  value={filters.max_price}
                  onChange={handlePriceChange}
                  placeholder="1000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Tailles */}
      <div className="mb-4 pt-2 border-t border-gray-100">
        <button
          onClick={() => toggleSection('size')}
          className="flex justify-between items-center w-full py-2 group"
        >
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Tailles</span>
          {openSections.size ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          )}
        </button>
        
        {openSections.size && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => handleCheckboxChange('size', size)}
                  className={`
                    w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200
                    ${filters.size === size 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Couleurs */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => toggleSection('color')}
          className="flex justify-between items-center w-full py-2 group"
        >
          <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Couleurs</span>
          {openSections.color ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
          )}
        </button>
        
        {openSections.color && (
          <div className="mt-3">
            <div className="grid grid-cols-5 gap-2">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => handleCheckboxChange('color', color.value)}
                  className={`
                    w-full aspect-square rounded-xl transition-all duration-200
                    ${color.class} ${color.border}
                    ${filters.color === color.value 
                      ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105' 
                      : 'hover:scale-105'
                    }
                  `}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductFilter