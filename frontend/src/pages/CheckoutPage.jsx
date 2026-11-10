import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CreditCardIcon } from '@heroicons/react/outline'

const CheckoutPage = () => {
  const { total_price, items } = useSelector(state => state.cart)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <p className="text-gray-600 mb-8">Ajoutez des produits avant de passer commande</p>
        <Link to="/shop" className="btn-primary inline-block">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Paiement</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <section className="lg:w-2/3 bg-white rounded-lg shadow-md p-8 text-center">
          <CreditCardIcon className="w-14 h-14 mx-auto mb-4 text-indigo-600" />
          <h2 className="text-2xl font-semibold mb-3">Paiement bientôt disponible</h2>
          <p className="text-gray-600 mb-6">
            Le paiement en ligne sera disponible dans une prochaine version.
          </p>
          <Link to="/cart" className="btn-primary inline-block">
            Retour au panier
          </Link>
        </section>

        <aside className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product_image || '/images/placeholder.svg'}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                    <p className="text-sm font-medium">{item.total_price} MAD</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-indigo-600">{total_price} MAD</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage
