// frontend/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { sessionStatus } = useSelector(state => state.auth)
  const from = location.state?.from
  const returnTo = from?.pathname?.startsWith('/')
    && !from.pathname.startsWith('//')
    ? `${from.pathname}${from.search || ''}${from.hash || ''}`
    : '/'
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  // ✅ Afficher un message si l'utilisateur vient de s'inscrire
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success(
        'Compte créé avec succès ! Un email de confirmation vous a été envoyé. '
      )
    }
  }, [searchParams])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      navigate(returnTo, { replace: true })
    }
  }, [navigate, returnTo, sessionStatus])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (sessionStatus === 'checking') return
    setLoading(true)
    
    try {
      await dispatch(login(formData)).unwrap()
      toast.success('Connexion réussie !')
    } catch (error) {
      const errorMsg = typeof error === 'string'
        ? error
        : error.message || 'Connexion impossible. Vérifiez vos identifiants.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              créez un compte
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nom d'utilisateur ou e-mail"
                disabled={loading || sessionStatus === 'checking'}
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                disabled={loading || sessionStatus === 'checking'}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Mot de passe oublié?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || sessionStatus === 'checking'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Connexion...'
                : sessionStatus === 'checking'
                  ? 'Vérification de la session...'
                  : 'Se connecter'}
            </button>
          </div>
        </form>
        
      </div>
    </div>
  )
}

export default LoginPage