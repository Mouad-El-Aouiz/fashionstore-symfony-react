import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useLocation } from 'react-router-dom'
import ProductList from '../components/products/ProductList'
import ProductFilter from '../components/products/ProductFilter'
import Pagination from '../components/common/Pagination'
import { fetchProducts } from '../store/slices/productSlice'

const ShopWomenPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { products, loading, total_pages, categories } = useSelector(state => state.products)
  
  // Initialisation des filtres - FORCER gender = 'F'
  const [filters, setFilters] = useState({
    gender: 'F',  // ← FORCÉ à Femme
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    size: searchParams.get('size') || '',
    color: searchParams.get('color') || '',
    sort: searchParams.get('sort') || '-created_at',
    page: parseInt(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
  })

  // Keep the filters synchronized when the query string changes.
  useEffect(() => {
    const newFilters = {
      gender: 'F',
      category: searchParams.get('category') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      size: searchParams.get('size') || '',
      color: searchParams.get('color') || '',
      sort: searchParams.get('sort') || '-created_at',
      page: parseInt(searchParams.get('page')) || 1,
      search: searchParams.get('search') || '',
    }

    setFilters(current => (
      JSON.stringify(current) === JSON.stringify(newFilters) ? current : newFilters
    ))
  }, [location.search])

  // Keep the URL synchronized without rewriting an unchanged query string.
  useEffect(() => {
    const params = {}
    Object.keys(filters).forEach(key => {
      if (key !== 'gender' && key !== 'page' && filters[key] && filters[key] !== '') {
        params[key] = filters[key]
      }
    })
    if (filters.page > 1) params.page = filters.page

    if (new URLSearchParams(params).toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true })
    }
  }, [filters, searchParams, setSearchParams])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchProducts(filters))
      window.scrollTo(0, 0)
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [dispatch, filters])

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo(0, 0)
  }, [])

  const handleSortChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      gender: 'F',
      category: '',
      min_price: '',
      max_price: '',
      size: '',
      color: '',
      sort: '-created_at',
      page: 1,
      search: '',
    })
  }, [])

  const getPageTitle = () => {
    const category = categories?.find(c => c.slug === filters.category)
    
    if (filters.search) return `Résultats femme pour "${filters.search}"`
    if (category) return `${category.name} - Femme`
    return 'Collection Femme'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bannière Femme */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 rounded-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Collection Femme</h1>
        <p className="text-pink-100">Élégance, tendances et féminité</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <ProductFilter 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onClear={clearFilters}
            hideGenderFilter={true}
          />
        </aside>

        <main className="lg:w-3/4">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {products?.length || 0} produits
              </span>
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="-created_at">Nouveautés</option>
                <option value="price">Prix croissant</option>
                <option value="-price">Prix décroissant</option>
                <option value="name">Nom A-Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
              <button onClick={clearFilters} className="btn-primary mt-4">
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <ProductList products={products} />
              {total_pages > 1 && (
                <Pagination
                  currentPage={filters.page}
                  totalPages={total_pages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default ShopWomenPage