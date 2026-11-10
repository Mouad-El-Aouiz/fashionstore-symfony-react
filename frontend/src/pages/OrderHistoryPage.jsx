import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/orders/')
      // ✅ CORRECTION : Vérifier si data.results existe (pagination)
      if (data.results) {
        setOrders(data.results)
      } else if (Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
      }
    } catch (requestError) {
      setOrders([])
      setError(requestError.response?.data?.detail || 'Impossible de charger vos commandes. Veuillez réessayer.')
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>

      {error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md" role="alert">
          <p className="text-red-600 mb-4">{error}</p>
          <button type="button" onClick={fetchOrders} className="btn-primary">
            Réessayer
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg mb-4">Vous n'avez pas encore passé de commande</p>
          <Link to="/shop" className="btn-primary inline-block">
            Commencer mes achats
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Commande #{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{order.total_amount} MAD</p>
                    <Link to={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm">
                      Voir détails →
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.product_image || 'https://via.placeholder.com/60'}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60' }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                        <p className="text-sm font-medium">{item.price_at_time} MAD</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      + {order.items.length - 3} autre(s) article(s)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistoryPage