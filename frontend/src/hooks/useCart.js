import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice'
import toast from 'react-hot-toast'

export const useCart = () => {
  const dispatch = useDispatch()
  const { items, total_items, total_price, loading } = useSelector(state => state.cart)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  const addItem = async (variantId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour ajouter au panier')
      return
    }

    try {
      await dispatch(addToCart({ variantId, quantity })).unwrap()
      toast.success('Ajouté au panier')
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      await dispatch(updateCartItem({ itemId, quantity })).unwrap()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const removeItem = async (itemId) => {
    try {
      await dispatch(removeFromCart(itemId)).unwrap()
      toast.success('Produit retiré')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  return {
    items,
    total_items,
    total_price,
    loading,
    addItem,
    updateItem,
    removeItem,
  }
}