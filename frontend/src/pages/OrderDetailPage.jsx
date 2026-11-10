import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      const { data } = await api.get(`/orders/${id}/`)
      setOrder(data)
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'En attente',
      'PROCESSING': 'En traitement',
      'CONFIRMED': 'Confirmée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée',
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
        <p className="text-gray-600 mb-8">{error || 'Commande non trouvée'}</p>
        <Link to="/orders" className="btn-primary inline-block">
          Retour à mes commandes
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-6">
        <Link to="/orders" className="text-indigo-600 hover:text-indigo-700">
          ← Retour à mes commandes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Informations commande */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Commande #{order.order_number}</h1>
              <p className="text-gray-600">
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')} à{' '}
                {new Date(order.created_at).toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Articles commandés */}
          <h2 className="text-xl font-semibold mb-4">Articles commandés</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <img
                  src={item.product_image || '/images/placeholder.svg'}
                  alt={item.product_name}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => { e.target.src = '/images/placeholder.svg' }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.product_name}</h3>
                  <p className="text-gray-600">Quantité: {item.quantity}</p>
                  <p className="text-gray-600">Prix unitaire: {item.price_at_time} MAD</p>
                  <p className="font-medium text-indigo-600">
                    Total: {item.total_price} MAD
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la commande */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Résumé</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Sous-total:</span>
                <span>{order.total_amount} MAD</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Livraison:</span>
                <span>Gratuite</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-indigo-600">{order.total_amount} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Adresse de livraison</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city} - {order.shipping_postal_code}</p>
              <p>{order.shipping_country}</p>
              <p className="mt-2">Tél: {order.phone}</p>
              <p>Email: {order.email}</p>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage