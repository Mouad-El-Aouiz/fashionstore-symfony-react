import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ShoppingCartIcon, UserIcon, HeartIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { fetchProfile, logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { clearWishlist } from '../../store/slices/wishlistSlice'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false)
  const { total_items } = useSelector(state => state.cart)
  const { isAuthenticated, sessionStatus, logoutLoading } = useSelector(state => state.auth)
  const menuRef = useRef(null)
  const location = useLocation()
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMainMenuOpen(false)
    setIsMenuOpen(false)
  }, [location.pathname, location.search])

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMainMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      dispatch(clearCart())
      dispatch(clearWishlist())
      closeAllMenus()
      toast.success('Déconnexion réussie.')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error?.message || 'Impossible de confirmer la déconnexion auprès du serveur.')
    }
  }

  const closeAllMenus = () => {
    setIsMainMenuOpen(false)
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  // Fonction pour gérer la navigation et fermer le menu
  const handleNavigation = (path) => {
    closeAllMenus()
    navigate(path)
  }

  // Catégories Homme - Liens vers /shop/homme
  const menCategories = {
    nouveautes: [{ name: 'Nouveautés', link: '/shop/homme?sort=-created_at' }],
    vetements: [
      { name: 'T-shirts', link: '/shop/homme?category=t-shirts-homme' },
      { name: 'Chemises', link: '/shop/homme?category=chemises-homme' },
      { name: 'Pantalons', link: '/shop/homme?category=pantalons-homme' },
      { name: 'Jeans', link: '/shop/homme?category=jeans-homme' },
      { name: 'Shorts', link: '/shop/homme?category=shorts-homme' },
      { name: 'Vestes', link: '/shop/homme?category=vestes-homme' },
    ],
    accessoires: [
      { name: 'Sacs', link: '/shop/homme?category=sacs-homme' },
      { name: 'Ceintures', link: '/shop/homme?category=ceintures-homme' },
      { name: 'Casquettes', link: '/shop/homme?category=casquettes-chapeaux-homme' },
      { name: 'Chaussettes', link: '/shop/homme?category=chaussettes-homme' },
    ],
    sport: [
      { name: 'Tenues de sport', link: '/shop/homme?category=tenues-de-sport-homme' },
      { name: 'Baskets', link: '/shop/homme?category=baskets-homme' },
      { name: 'Maillots de bain', link: '/shop/homme?category=maillots-de-bain-homme' },
    ]
  }

  // Catégories Femme - Liens vers /shop/femme
  const womenCategories = {
    nouveautes: [{ name: 'Nouveautés', link: '/shop/femme?sort=-created_at' }],
    vetements: [
      { name: 'Robes', link: '/shop/femme?category=robes' },
      { name: 'Blouses', link: '/shop/femme?category=blouses-femme' },
      { name: 'T-shirts', link: '/shop/femme?category=t-shirts-femme' },
      { name: 'Tops & Bodies', link: '/shop/femme?category=tops-bodies-femme' },
      { name: 'Pantalons', link: '/shop/femme?category=pantalons-femme' },
      { name: 'Jeans', link: '/shop/femme?category=jeans-femme' },
      { name: 'Jupes', link: '/shop/femme?category=jupes' },
      { name: 'Vestes', link: '/shop/femme?category=vestes-femme' },
      { name: 'Blousons & Trenchs', link: '/shop/femme?category=blousons-trenchs-femme' },
    ],
    accessoires: [
      { name: 'Sacs', link: '/shop/femme?category=sacs-femme' },
      { name: 'Ceintures', link: '/shop/femme?category=ceintures-femme' },
      { name: 'Casquettes', link: '/shop/femme?category=casquettes-chapeaux-femme' },
      { name: 'Écharpes', link: '/shop/femme?category=echarpes-femme' },
    ],
    sport: [
      { name: 'Tenues de sport', link: '/shop/femme?category=tenues-de-sport-femme' },
      { name: 'Baskets', link: '/shop/femme?category=baskets-femme' },
      { name: 'Maillots de bain', link: '/shop/femme?category=maillots-de-bain-femme' },
    ]
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Menu burger à gauche */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
              aria-label="Menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Logo au centre */}
          <Link 
            to="/" 
            className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-indigo-600"
            onClick={closeAllMenus}
          >
            FashionStore
          </Link>

          {/* Icônes à droite */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="relative" onClick={closeAllMenus}>
              <HeartIcon className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
            </Link>
            
            <Link to="/cart" className="relative" onClick={closeAllMenus}>
              <ShoppingCartIcon className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
              {total_items > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {total_items}
                </span>
              )}
            </Link>

            <div className="relative">
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <UserIcon className="w-6 h-6 text-gray-600 hover:text-indigo-600" />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  {isAuthenticated ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                        Mon profil
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                        Mes commandes
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                        Favoris
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        {logoutLoading ? 'Déconnexion...' : 'Déconnexion'}
                      </button>
                    </>
                  ) : sessionStatus === 'checking' ? (
                    <span className="block px-4 py-2 text-sm text-gray-500" role="status">
                      Vérification de la session...
                    </span>
                  ) : sessionStatus === 'error' ? (
                    <button
                      type="button"
                      onClick={() => dispatch(fetchProfile())}
                      className="block w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-gray-100"
                    >
                      Session non vérifiée — réessayer
                    </button>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                        Connexion
                      </Link>
                      <Link to="/register" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={closeAllMenus}>
                        Inscription
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENU DEROULANT PRINCIPAL - SECTIONS HORIZONTALES */}
      {isMainMenuOpen && (
        <>
          {/* Overlay pour fermer en cliquant à côté */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeAllMenus}
          ></div>
          
          {/* Menu latéral large avec deux colonnes */}
          <div 
            ref={menuRef}
            className="absolute left-0 top-16 w-full max-w-5xl bg-white shadow-xl z-50 border rounded-br-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="p-6">
              {/* En-tête du menu */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-xl font-bold text-gray-800">Nos collections</h2>
                <button 
                  onClick={closeAllMenus}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Fermer"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Deux colonnes horizontales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLONNE GAUCHE - HOMME */}
                <div>
                  <div className="flex justify-between items-center border-b border-indigo-200 pb-2 mb-4">
                    <span className="font-bold text-xl text-indigo-600">Homme</span>
                    <button 
                      onClick={() => handleNavigation('/shop/homme')}
                      className="text-sm text-gray-500 hover:text-indigo-600"
                    >
                      Voir tout →
                    </button>
                  </div>
                  
                  {/* Nouveautés Homme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Nouveautés</div>
                    {menCategories.nouveautes.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigation(cat.link)}
                        className="block py-1 text-gray-700 hover:text-indigo-600"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Vêtements Homme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Vêtements</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {menCategories.vetements.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-indigo-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Accessoires Homme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Accessoires</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {menCategories.accessoires.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-indigo-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sport Homme */}
                  <div>
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Sport</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {menCategories.sport.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-indigo-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* COLONNE DROITE - FEMME */}
                <div>
                  <div className="flex justify-between items-center border-b border-pink-200 pb-2 mb-4">
                    <span className="font-bold text-xl text-pink-600">Femme</span>
                    <button 
                      onClick={() => handleNavigation('/shop/femme')}
                      className="text-sm text-gray-500 hover:text-pink-600"
                    >
                      Voir tout →
                    </button>
                  </div>
                  
                  {/* Nouveautés Femme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Nouveautés</div>
                    {womenCategories.nouveautes.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigation(cat.link)}
                        className="block py-1 text-gray-700 hover:text-pink-600"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Vêtements Femme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Vêtements</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {womenCategories.vetements.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-pink-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Accessoires Femme */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Accessoires</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {womenCategories.accessoires.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-pink-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Sport Femme */}
                  <div>
                    <div className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-2">Sport</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {womenCategories.sport.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleNavigation(cat.link)}
                          className="text-left py-1 text-gray-700 hover:text-pink-600 text-sm"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bas du menu */}
              <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-8">
                <div>
                  <button 
                    onClick={() => handleNavigation('/shop/homme?sort=-created_at')} 
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Toute la collection Homme →
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => handleNavigation('/shop/femme?sort=-created_at')} 
                    className="text-pink-600 font-medium hover:underline"
                  >
                    Toute la collection Femme →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar