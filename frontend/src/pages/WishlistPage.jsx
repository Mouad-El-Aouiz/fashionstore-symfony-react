import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/outline'
import { removeFromWishlist } from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import api from '../services/api'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const { items: wishlist, loading } = useSelector(state => state.wishlist)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [addingToCart, setAddingToCart] = useState({})
  const [productVariants, setProductVariants] = useState({}) // Stocker les variants

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Charger les variants pour tous les produits de la wishlist
  useEffect(() => {
    const controller = new AbortController()

    const loadVariants = async () => {
      if (!wishlist || wishlist.length === 0) return

      const entries = await Promise.all(wishlist.map(async (item) => {
        try {
          const response = await api.get(`/products/products/${item.product_slug}/`, {
            signal: controller.signal,
          })
          return [item.product, response.data.variants || []]
        } catch {
          return [item.product, []]
        }
      }))

      if (!controller.signal.aborted) {
        setProductVariants(Object.fromEntries(entries))
      }
    }
    
    loadVariants()
    return () => controller.abort()
  }, [wishlist])

  const handleAddToCart = async (wishlistItem) => {
    const productId = wishlistItem.product
    const productName = wishlistItem.product_name
    const variants = productVariants[productId] || []
    
    setAddingToCart(prev => ({ ...prev, [productId]: true }))
    
    try {
      if (variants.length === 0) {
        toast.error('Ce produit n\'a pas de taille/couleur disponible')
        return
      }
      
      const defaultVariant = variants[0]
      
      if (defaultVariant.stock <= 0) {
        toast.error('Ce produit est en rupture de stock')
        return
      }
      
      await dispatch(addToCart({ variantId: defaultVariant.id, quantity: 1 })).unwrap()
      toast.success(`${productName} ajouté au panier!`)
      
    } catch {
      toast.error('Erreur lors de l\'ajout au panier')
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }))
    }
  }

  const handleRemove = async (productId, productName) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap()
      toast.success(`${productName} retiré des favoris`)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Connectez-vous</h2>
        <p className="text-gray-600 mb-8">Connectez-vous pour voir vos favoris</p>
        <Link to="/login" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes favoris</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">Votre liste de favoris est vide</p>
          <Link to="/shop" className="btn-primary inline-block">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${item.product_slug}`}>
                <img
                  src={item.product_image || 'https://via.placeholder.com/300'}
                  alt={item.product_name}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.product_slug}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-indigo-600 transition-colors">
                    {item.product_name}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-2">{item.product_price} MAD</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingToCart[item.product]}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart[item.product] ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCartIcon className="w-4 h-4" />
                    )}
                    Ajouter
                  </button>
                  <button
                    onClick={() => handleRemove(item.product, item.product_name)}
                    className="p-2 border border-red-300 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default WishlistPage