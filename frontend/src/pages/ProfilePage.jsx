import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProfile } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import api from '../services/api'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { profile, isAuthenticated } = useSelector(state => state.auth)
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Maroc',
  })
  const [loading, setLoading] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Charger le profil si nécessaire
  useEffect(() => {
    if (isAuthenticated && !profile) {
      dispatch(fetchProfile())
    }
  }, [isAuthenticated, profile, dispatch])

  // Remplir le formulaire quand le profil est chargé
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'Maroc',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await api.put('/auth/profile/', formData)
      await dispatch(fetchProfile())
      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de la mise à jour'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas')
      return
    }
    
    setPasswordLoading(true)
    
    try {
      await api.post('/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      })
      toast.success('Mot de passe changé avec succès !')
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      setShowPasswordForm(false)
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors du changement de mot de passe'
      toast.error(errorMsg)
    } finally {
      setPasswordLoading(false)
    }
  }

  // Affichage du chargement
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600">Chargement de votre profil...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <div className="text-center mb-4">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">
                    {profile.user?.first_name?.[0] || profile.user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="font-semibold">{profile.user?.first_name} {profile.user?.last_name}</h3>
              <p className="text-sm text-gray-500">@{profile.user?.username}</p>
              <p className="text-sm text-gray-500">{profile.user?.email}</p>
            </div>
            
            <div className="border-t pt-4">
              <nav className="space-y-2">
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md bg-indigo-50 text-indigo-600 font-medium"
                >
                  Informations personnelles
                </Link>
                <Link 
                  to="/orders" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Mes commandes
                </Link>
                <Link 
                  to="/wishlist" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Mes favoris
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Profile Form */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">Informations personnelles</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profile.user?.first_name || ''}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profile.user?.last_name || ''}
                    disabled
                    className="input-field bg-gray-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.user?.email || ''}
                  disabled
                  className="input-field bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0612345678"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Rue de la Mode"
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Casablanca"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="20000"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Maroc"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="btn-secondary"
                >
                  {showPasswordForm ? 'Annuler' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>

            {/* Formulaire de changement de mot de passe */}
            {showPasswordForm && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ancien mot de passe
                    </label>
                    <input
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 8 caractères, pas trop commun
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage