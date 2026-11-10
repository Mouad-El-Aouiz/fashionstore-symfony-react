// src/store/slices/filterSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  gender: '',
  category: '',
  min_price: '',
  max_price: '',
  size: '',
  color: '',
  sort: '-created_at',
  search: '',
}

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      return { ...state, ...action.payload }
    },
    clearFilters: () => initialState,
    setGender: (state, action) => {
      state.gender = action.payload
    },
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setPriceRange: (state, action) => {
      state.min_price = action.payload.min
      state.max_price = action.payload.max
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
  },
})

export const { setFilters, clearFilters, setGender, setCategory, setPriceRange, setSort } = filterSlice.actions
export default filterSlice.reducer