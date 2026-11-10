import React, { useEffect } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import AppRoutes from './AppRoutes'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import { fetchCart } from './store/slices/cartSlice'
import { fetchProfile, sessionExpired, sessionUnauthenticated } from './store/slices/authSlice'
import { clearWishlist, fetchWishlist } from './store/slices/wishlistSlice'
import { Toaster, toast } from 'react-hot-toast'
import { hasSessionHint, SESSION_EXPIRED_EVENT } from './services/api'

function App() {
  const dispatch = useDispatch()
  const store = useStore()
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  useEffect(() => {
    if (hasSessionHint()) {
      dispatch(fetchProfile())
    } else {
      dispatch(sessionUnauthenticated())
    }
  }, [dispatch])

  useEffect(() => {
    const handleSessionExpired = () => {
      if (!store.getState().auth.isAuthenticated) return

      dispatch(sessionExpired())
      dispatch(clearCart())
      dispatch(clearWishlist())
      toast.error('Votre session a expiré. Veuillez vous reconnecter.')
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [dispatch, store])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
      dispatch(fetchWishlist())
    }
  }, [dispatch, isAuthenticated])

  return (
    <>
      <Toaster position="top-right" />
      <Navbar />
      <main className="min-h-screen">
        <AppRoutes />
      </main>
      <Footer />
    </>
  )
}

export default App