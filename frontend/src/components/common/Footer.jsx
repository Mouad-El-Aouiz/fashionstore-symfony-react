import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">FashionStore</h3>
            <p className="text-gray-400 text-sm">
              Votre destination mode préférée pour les vêtements tendance pour hommes et femmes.
            </p>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: contact@fashionstore.com</li>
              <li>Tél: +212 5XX XXX XXX</li>
              <li>Lun-Ven: 9h - 18h</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 FashionStore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer