// src/store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await api.get('/cart/')
  return response.data
})

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variantId, quantity }) => {
    const response = await api.post('/cart/add/', { variant_id: variantId, quantity })
    return response.data
  },
  {
    condition: (_, { getState }) => getState().auth.isAuthenticated,
  },
)

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, quantity }) => {
  const response = await api.put(`/cart/update/${itemId}/`, { quantity })
  return response.data
})

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId) => {
  const response = await api.delete(`/cart/remove/${itemId}/`)
  return response.data
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total_items: 0,
    total_price: 0,
    loading: false,
  },
  reducers: {
    clearCart: (state) => {
      state.items = []
      state.total_items = 0
      state.total_price = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total_items = action.payload.total_items || 0
        state.total_price = parseFloat(action.payload.total_price || 0)
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.total_items = action.payload.total_items || 0
        state.total_price = parseFloat(action.payload.total_price || 0)
      })
      .addCase(addToCart.rejected, (state) => {
        state.loading = false
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.total_items = action.payload.total_items || 0
        state.total_price = parseFloat(action.payload.total_price || 0)
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || []
        state.total_items = action.payload.total_items || 0
        state.total_price = parseFloat(action.payload.total_price || 0)
      })
  },
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer