import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid'
import { addToCart } from '../../store/slices/cartSlice'
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../store/slices/wishlistSlice'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)
  const { items: wishlistItems } = useSelector(state => state.wishlist)
  
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Vérifier si le produit est dans la wishlist
  useEffect(() => {
    if (wishlistItems && product) {
      const exists = wishlistItems.some(item => item.product === product.id)
      setIsInWishlist(exists)
    }
  }, [wishlistItems, product])

  // Récupérer l'image principale
  const getPrimaryImage = () => {
    if (imageError) return null
    
    // Priorité 1: primary_image du serializer
    if (product?.primary_image) {
      return product.primary_image
    }
    
    // Priorité 2: première image du tableau images
    if (product?.images && product.images.length > 0) {
      return product.images[0]?.image
    }
    
    return null
  }

  const primaryImage = getPrimaryImage()
  const discountPercent = product?.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  const getDefaultVariant = () => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants[0]
    }
    return null
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier')
      return
    }
    
    const defaultVariant = getDefaultVariant()
    
    if (!defaultVariant) {
      toast.error('Ce produit n\'a pas de taille/couleur disponible')
      return
    }
    
    if (defaultVariant.stock <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }
    
    setIsAddingToCart(true)
    
    try {
      await dispatch(addToCart({ variantId: defaultVariant.id, quantity: 1 })).unwrap()
      toast.success('Ajouté au panier!')
    } catch {
      toast.error('Erreur lors de l\'ajout au panier')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris')
      return
    }

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap()
        toast.success('Retiré des favoris')
      } else {
        await dispatch(addToWishlist(product.id)).unwrap()
        toast.success('Ajouté aux favoris')
      }
      dispatch(fetchWishlist())
    } catch {
      toast.error('Une erreur est survenue')
    }
  }

  if (!product) return null

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Bouton favori */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
        aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isInWishlist ? (
          <HeartSolidIcon className="w-5 h-5 text-red-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
        )}
      </button>

      <Link to={`/product/${product.slug}`}>
        <div className="relative overflow-hidden aspect-square">
          {/* Image principale */}
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                setImageError(true)
              }}
            />
          ) : (
            // Fallback si pas d'image
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {discountPercent > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
              -{discountPercent}%
            </span>
          )}
          {getDefaultVariant()?.stock <= 0 && (
            <span className="absolute bottom-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
              Rupture
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category_name}</p>
          
          <div className="flex items-center justify-between">
            <div>
              {product.discount_price ? (
                <>
                  <span className="text-xl font-bold text-red-600">
                    {product.discount_price} MAD
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {product.price} MAD
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-800">
                  {product.price} MAD
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !getDefaultVariant() || getDefaultVariant()?.stock <= 0}
              className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Ajouter au panier"
            >
              {isAddingToCart ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCartIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard