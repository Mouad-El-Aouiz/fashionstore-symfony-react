import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Récupérer la liste des favoris
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    const response = await api.get('/auth/wishlist/')
    return response.data
  },
  {
    condition: (_, { getState }) => !getState().wishlist.loading,
  },
)

// Ajouter aux favoris
export const addToWishlist = createAsyncThunk('wishlist/addToWishlist', async (productId) => {
  const response = await api.post('/auth/wishlist/', { product_id: productId })
  return { productId, message: response.data.message }
})

// Retirer des favoris
export const removeFromWishlist = createAsyncThunk('wishlist/removeFromWishlist', async (productId) => {
  await api.delete(`/auth/wishlist/${productId}/`)
  return productId
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Add to Wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        // Le backend retourne le message, on rafraîchit la liste
        // On pourrait aussi ajouter l'item localement
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product !== action.payload)
      })
  },
})

export const { clearWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer