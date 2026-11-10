import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

const ConfirmEmailPage = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const hasCalled = useRef(false) 

  useEffect(() => {
    if (hasCalled.current) return
    hasCalled.current = true
    
    if (token) {
      confirmEmail()
    }
  }, [token])

  const confirmEmail = async () => {
    try {
      const response = await api.get(`/auth/confirm-email/${token}/`)
      setStatus('success')
      setMessage(response.data.message || 'Votre compte a été activé avec succès !')
    } catch (error) {
      // Si l'erreur est 400 mais que le message contient "succès" (cas étrange)
      const errorData = error.response?.data
      if (errorData?.error === 'Lien de confirmation invalide.') {
        // Le token a probablement déjà été utilisé
        setStatus('success')
        setMessage('Votre compte a déjà été activé ! Vous pouvez vous connecter.')
      } else {
        setStatus('error')
        setMessage(errorData?.error || 'Erreur lors de la confirmation')
      }
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3 text-gray-600">Activation en cours...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Compte activé !</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <Link to="/login" className="btn-primary inline-block">
          Se connecter
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold mb-4">Échec de l'activation</h1>
      <p className="text-gray-600 mb-8">{message}</p>
      <Link to="/register" className="btn-primary inline-block">
        Créer un nouveau compte
      </Link>
    </div>
  )
}

export default ConfirmEmailPage