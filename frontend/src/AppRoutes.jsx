import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile } from './store/slices/authSlice'

const HomePage = lazy(() => import('./pages/HomePage'))
const ShopMenPage = lazy(() => import('./pages/ShopMenPage'))
const ShopWomenPage = lazy(() => import('./pages/ShopWomenPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'))
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const ConfirmEmailPage = lazy(() => import('./pages/ConfirmEmailPage'))


const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, sessionStatus, sessionCheckError } = useSelector(state => state.auth)

  if (sessionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-busy="true">
        Vérification de votre session…
      </div>
    )
  }

  if (sessionStatus === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4" role="alert">
        <p>{sessionCheckError || 'La session n’a pas pu être vérifiée.'}</p>
        <button
          type="button"
          onClick={() => dispatch(fetchProfile())}
          className="btn-primary"
        >
          Réessayer
        </button>
        <Link to="/login" state={{ from: location }} className="font-medium text-indigo-600 hover:text-indigo-500">
          Aller à la connexion
        </Link>
      </div>
    )
  }

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop/homme" element={<ShopMenPage />} />
        <Route path="/shop/femme" element={<ShopWomenPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/confirm-email/:token/" element={<ConfirmEmailPage />} />


        {/* Ancienne route shop (optionnel, redirection) */}
        <Route path="/shop" element={<Navigate to="/shop/homme" replace />} />

        {/* Routes protégées */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes