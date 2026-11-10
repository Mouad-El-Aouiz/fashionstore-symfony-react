export const API_URL = import.meta.env.VITE_API_URL || '/api'

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export const COLORS = [
  { value: 'BLACK', label: 'Noir', class: 'bg-black' },
  { value: 'WHITE', label: 'Blanc', class: 'bg-white border' },
  { value: 'RED', label: 'Rouge', class: 'bg-red-600' },
  { value: 'BLUE', label: 'Bleu', class: 'bg-blue-600' },
  { value: 'GREEN', label: 'Vert', class: 'bg-green-600' },
  { value: 'YELLOW', label: 'Jaune', class: 'bg-yellow-400' },
  { value: 'PINK', label: 'Rose', class: 'bg-pink-400' },
  { value: 'GRAY', label: 'Gris', class: 'bg-gray-500' },
]

export const ORDER_STATUS = {
  PENDING: 'En attente',
  PROCESSING: 'En traitement',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
}