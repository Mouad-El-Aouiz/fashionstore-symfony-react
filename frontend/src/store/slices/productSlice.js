// src/store/slices/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params) => {
    const response = await api.get('/products/products/', { params })
    return response.data
  },
  {
    condition: (params, { getState }) => {
      const { productsRequestId, productsQueryKey } = getState().products
      return !productsRequestId || productsQueryKey !== JSON.stringify(params || {})
    },
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (slug) => {
    const response = await api.get(`/products/products/${slug}/`)
    return response.data
  },
  {
    condition: (slug, { getState }) => (
      getState().products.productRequestSlug !== slug
      || !getState().products.productRequestId
    ),
  }
)

export const fetchFeatured = createAsyncThunk(
  'products/fetchFeatured',
  async () => {
    const response = await api.get('/products/products/featured/')
    return response.data
  },
  {
    condition: (_, { getState }) => {
      const { featuredLoading, featuredLoaded } = getState().products
      return !featuredLoading && !featuredLoaded
    },
  }
)

export const fetchNewArrivals = createAsyncThunk(
  'products/fetchNewArrivals',
  async () => {
    const response = await api.get('/products/products/new_arrivals/')
    return response.data
  },
  {
    condition: (_, { getState }) => {
      const { newArrivalsLoading, newArrivalsLoaded } = getState().products
      return !newArrivalsLoading && !newArrivalsLoaded
    },
  }
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const response = await api.get('/products/categories/')
    if (response.data.results) {
      return response.data.results
    }
    return response.data
  },
  {
    condition: (_, { getState }) => {
      const { categoriesLoading, categoriesLoaded } = getState().products
      return !categoriesLoading && !categoriesLoaded
    },
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    categories: [],
    featured: [],
    newArrivals: [],
    featuredLoading: false,
    featuredLoaded: false,
    newArrivalsLoading: false,
    newArrivalsLoaded: false,
    categoriesLoading: false,
    categoriesLoaded: false,
    loading: false,
    productRequestId: null,
    productRequestSlug: null,
    productsRequestId: null,
    productsQueryKey: null,
    error: null,
    total_count: 0,
    total_pages: 0,
    current_page: 1,
  },
  reducers: {
    clearProduct: (state) => {
      state.product = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true
        state.error = null
        state.productsRequestId = action.meta.requestId
        state.productsQueryKey = JSON.stringify(action.meta.arg || {})
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.productsRequestId) return

        state.loading = false
        state.products = action.payload.results || action.payload
        state.total_count = action.payload.count || 0
        state.total_pages = Math.ceil((action.payload.count || 0) / 12)
        state.productsRequestId = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.meta.requestId !== state.productsRequestId) return

        state.loading = false
        state.productsRequestId = null
        if (action.error.name !== 'AbortError') {
          state.error = action.error.message
        }
      })
      // Fetch Single Product
      .addCase(fetchProduct.pending, (state, action) => {
        state.loading = true
        state.productRequestId = action.meta.requestId
        state.productRequestSlug = action.meta.arg
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.productRequestId) return

        state.loading = false
        state.product = action.payload
        state.productRequestId = null
        state.productRequestSlug = null
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        if (action.meta.requestId !== state.productRequestId) return

        state.loading = false
        state.productRequestId = null
        state.productRequestSlug = null
      })
      // Fetch Featured
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload
        state.featuredLoading = false
        state.featuredLoaded = true
      })
      .addCase(fetchFeatured.pending, (state) => {
        state.featuredLoading = true
      })
      .addCase(fetchFeatured.rejected, (state) => {
        state.featuredLoading = false
      })
      // Fetch New Arrivals
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload
        state.newArrivalsLoading = false
        state.newArrivalsLoaded = true
      })
      .addCase(fetchNewArrivals.pending, (state) => {
        state.newArrivalsLoading = true
      })
      .addCase(fetchNewArrivals.rejected, (state) => {
        state.newArrivalsLoading = false
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
        state.categoriesLoading = false
        state.categoriesLoaded = true
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesLoading = false
      })
  },
})

export const { clearProduct } = productSlice.actions
export default productSlice.reducer