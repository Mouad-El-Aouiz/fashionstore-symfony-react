import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { StarIcon, ShoppingCartIcon, HeartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/solid'
import { fetchProduct } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../store/slices/wishlistSlice'
import ProductCard from '../components/products/ProductCard'
import toast from 'react-hot-toast'

const ProductPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { product, loading } = useSelector(state => state.products)
  const { isAuthenticated } = useSelector(state => state.auth)
  const { items: wishlistItems } = useSelector(state => state.wishlist)
  
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  // Charger le produit
  useEffect(() => {
    dispatch(fetchProduct(slug))
    window.scrollTo(0, 0)
  }, [dispatch, slug])

  // Initialiser le variant par défaut
  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])

  // Vérifier si le produit est dans la wishlist
  useEffect(() => {
    if (wishlistItems && product && product.id) {
      const exists = wishlistItems.some(item => item.product === product.id)
      setIsInWishlist(exists)
    }
  }, [wishlistItems, product])

  // Gestion de l'ajout au panier
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier')
      return
    }

    if (!selectedVariant) {
      toast.error('Veuillez sélectionner une taille et une couleur')
      return
    }
    
    if (selectedVariant.stock <= 0) {
      toast.error('Ce produit n\'est pas disponible')
      return
    }
    
    dispatch(addToCart({ variantId: selectedVariant.id, quantity }))
    toast.success('Produit ajouté au panier!')
  }

  // Gestion de la wishlist
  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter aux favoris')
      return
    }

    if (!product || !product.id) {
      toast.error('Produit non trouvé')
      return
    }

    setIsWishlistLoading(true)

    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(product.id)).unwrap()
        setIsInWishlist(false)
        toast.success('Retiré des favoris')
      } else {
        await dispatch(addToWishlist(product.id)).unwrap()
        setIsInWishlist(true)
        toast.success('Ajouté aux favoris')
      }
      // Rafraîchir la liste des favoris
      dispatch(fetchWishlist())
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsWishlistLoading(false)
    }
  }

  // Affichage du chargement
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Affichage si produit non trouvé
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
        <Link to="/shop" className="btn-primary">
          Retour à la boutique
        </Link>
      </div>
    )
  }

  const finalPrice = selectedVariant 
    ? (product.discount_price || product.price) + (selectedVariant.price_adjustment || 0)
    : product.discount_price || product.price

  const sizes = [...new Set(product.variants?.map(v => v.size))]
  const colors = [...new Set(product.variants?.map(v => v.color))]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Fil d'Ariane */}
      <div className="mb-6 text-sm text-gray-600">
        <Link to="/" className="hover:text-indigo-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-indigo-600">Boutique</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Images du produit */}
        <div className="lg:w-1/2">
          <div className="relative">
            <img
              src={product.images?.[selectedImage]?.image || product.primary_image}
              alt={product.name}
              className="w-full rounded-lg shadow-md"
            />
            {product.images?.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          
          {/* Miniatures */}
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img src={image.image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informations produit */}
        <div className="lg:w-1/2">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
          
          {/* Étoiles */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-gray-500 text-sm">(12 avis)</span>
          </div>

          {/* Prix */}
          <div className="mb-6">
            {product.discount_price ? (
              <>
                <span className="text-3xl font-bold text-red-600">{finalPrice} MAD</span>
                <span className="text-lg text-gray-500 line-through ml-3">{product.price} MAD</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-gray-800">{finalPrice} MAD</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

          {/* Tailles */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Taille</h3>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      const variant = product.variants.find(v => v.size === size && v.color === selectedVariant?.color)
                      if (variant) setSelectedVariant(variant)
                    }}
                    className={`px-4 py-2 border rounded-md transition ${
                      selectedVariant?.size === size
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Couleurs */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Couleur</h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      const variant = product.variants.find(v => v.color === color && v.size === selectedVariant?.size)
                      if (variant) setSelectedVariant(variant)
                    }}
                    className={`px-4 py-2 border rounded-md transition ${
                      selectedVariant?.color === color
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 hover:border-indigo-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {selectedVariant?.stock > 0 ? (
              <span className="text-green-600">✓ En stock ({selectedVariant.stock} disponibles)</span>
            ) : (
              <span className="text-red-600">✗ Rupture de stock</span>
            )}
          </div>

          {/* Quantité et boutons */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Ajouter au panier
            </button>

            {/* BOUTON FAVORI - CORRIGÉ */}
            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`p-3 rounded-full border transition-all duration-200 ${
                isInWishlist 
                  ? 'border-red-500 bg-red-50 text-red-500' 
                  : 'border-gray-300 hover:border-red-500 hover:text-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              {isWishlistLoading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
              ) : isInWishlist ? (
                <HeartSolidIcon className="w-6 h-6" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage