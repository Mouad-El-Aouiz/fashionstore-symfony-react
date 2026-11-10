import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/outline'
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

const CartPage = () => {
  const dispatch = useDispatch()
  const { items, total_items, total_price } = useSelector(state => state.cart)
  const { isAuthenticated, sessionStatus } = useSelector(state => state.auth)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleUpdateQuantity = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 1) {
      dispatch(removeFromCart(itemId))
      toast.success('Produit retiré du panier')
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }))
    }
  }

  const handleRemove = (itemId) => {
    dispatch(removeFromCart(itemId))
    toast.success('Produit retiré du panier')
  }

  // ✅ Fonction pour obtenir le slug du produit
  const getProductSlug = (item) => {
    // Essayer plusieurs chemins possibles
    if (item.variant_details?.product?.slug) {
      return item.variant_details.product.slug
    }
    if (item.product_slug) {
      return item.product_slug
    }
    // En dernier recours, utiliser le nom du produit pour générer un slug
    if (item.product_name) {
      return item.product_name.toLowerCase().replace(/ /g, '-').replace(/[éèê]/g, 'e')
    }
    return '#'
  }

  if (sessionStatus === 'checking') {
    return (
      <div className="flex justify-center py-12" role="status" aria-busy="true">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Connectez-vous</h2>
        <p className="text-gray-600 mb-8">Connectez-vous pour voir votre panier</p>
        <Link to="/login" state={{ from: { pathname: '/cart' } }} className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8">Découvrez nos produits et ajoutez-les à votre panier</p>
          <Link to="/shop" className="btn-primary inline-block">
            Commencer mes achats
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-sm font-semibold text-gray-600">
              <div className="col-span-6">Produit</div>
              <div className="col-span-2 text-center">Prix</div>
              <div className="col-span-2 text-center">Quantité</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="border-t first:border-t-0 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 flex gap-4">
                    <img
                      src={item.product_image || '/images/placeholder.svg'}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-md"
                      onError={(e) => { e.target.src = '/images/placeholder.svg' }}
                    />
                    <div>
                      {/* ✅ LIEN CORRIGÉ */}
                      <Link 
                        to={`/product/${getProductSlug(item)}`} 
                        className="font-semibold hover:text-indigo-600"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Taille: {item.variant_details?.size || 'N/A'} | 
                        Couleur: {item.variant_details?.color || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 text-center">
                    <span className="md:hidden text-gray-600 text-sm mr-2">Prix:</span>
                    <span className="font-medium">{item.variant_details?.final_price || 0} MAD</span>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between items-center">
                    <span className="md:hidden text-gray-600 text-sm">Total:</span>
                    <span className="font-bold text-indigo-600">{item.total_price} MAD</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Sous-total ({total_items} articles)</span>
                <span>{total_price} MAD</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-indigo-600">{total_price} MAD</span>
                </div>
              </div>
            </div>
            
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Procéder au paiement
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage