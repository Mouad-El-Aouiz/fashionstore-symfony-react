import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { clearCart } from '../store/slices/cartSlice'
import { clearWishlist } from '../store/slices/wishlistSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user, profile, loading, logoutLoading } = useSelector(state => state.auth)

  const handleLogout = async () => {
    await dispatch(logout()).unwrap()
    dispatch(clearCart())
    dispatch(clearWishlist())
    navigate('/', { replace: true })
  }

  return {
    isAuthenticated,
    user,
    profile,
    loading,
    logoutLoading,
    logout: handleLogout,
  }
}