import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      await api.post('/auth/login/', { username, password }, { timeout: 30000 })
      const { data: profile } = await api.get('/auth/profile/', { timeout: 30000 })
      return profile
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || 'Connexion impossible. Vérifiez vos identifiants et que le compte est activé.'
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/', userData, { timeout: 30000 })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: 'Erreur lors de l’inscription. Réessayez.' }
      )
    }
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile/', { timeout: 30000 })
      return response.data
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.detail || 'Impossible de vérifier la session. Vérifiez votre connexion.',
      })
    }
  },
  {
    condition: (_, { getState }) => !getState().auth.sessionCheckInProgress,
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout/', {}, { timeout: 30000 })
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    isAuthenticated: false,
    sessionStatus: 'checking',
    sessionCheckError: null,
    sessionCheckComplete: false,
    sessionCheckInProgress: false,
    profileRequestId: null,
    loading: false,
    logoutLoading: false,
    error: null,
  },
  reducers: {
    sessionUnauthenticated: (state) => {
      state.profile = null
      state.user = null
      state.isAuthenticated = false
      state.sessionStatus = 'unauthenticated'
      state.sessionCheckError = null
      state.sessionCheckComplete = true
      state.sessionCheckInProgress = false
      state.profileRequestId = null
    },
    sessionExpired: (state) => {
      state.profile = null
      state.user = null
      state.isAuthenticated = false
      state.sessionStatus = 'unauthenticated'
      state.sessionCheckError = null
      state.sessionCheckComplete = true
      state.sessionCheckInProgress = false
      state.profileRequestId = null
      state.logoutLoading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.profile = action.payload
        state.user = action.payload.user
        state.isAuthenticated = true
        state.sessionStatus = 'authenticated'
        state.sessionCheckError = null
        state.sessionCheckComplete = true
        state.loading = false
        state.profileRequestId = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.profileRequestId) return

        state.profile = action.payload
        state.user = action.payload.user
        state.isAuthenticated = true
        state.sessionStatus = 'authenticated'
        state.sessionCheckError = null
        state.sessionCheckComplete = true
        state.sessionCheckInProgress = false
        state.profileRequestId = null
      })
      .addCase(fetchProfile.pending, (state, action) => {
        if (!state.isAuthenticated) {
          state.sessionStatus = 'checking'
        }
        state.sessionCheckError = null
        state.sessionCheckInProgress = true
        state.profileRequestId = action.meta.requestId
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        if (action.meta.requestId !== state.profileRequestId) return

        const status = action.payload?.status
        const authenticationRejected = status === 401

        if (authenticationRejected) {
          state.profile = null
          state.user = null
          state.isAuthenticated = false
          state.sessionStatus = 'unauthenticated'
        } else {
          state.sessionStatus = state.isAuthenticated ? 'authenticated' : 'error'
        }
        state.sessionCheckError = action.payload?.message || action.error.message
        state.sessionCheckComplete = true
        state.sessionCheckInProgress = false
        state.profileRequestId = null
      })
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true
        state.error = null
        state.sessionCheckInProgress = false
        state.profileRequestId = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.profile = null
        state.user = null
        state.isAuthenticated = false
        state.sessionStatus = 'unauthenticated'
        state.sessionCheckError = null
        state.logoutLoading = false
        state.profileRequestId = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.logoutLoading = false
        state.error = action.error.message
      })
      .addCase(register.pending, (state) => {
        state.loading = true
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.detail || action.error.message
      })
  },
})

export const { sessionExpired, sessionUnauthenticated } = authSlice.actions
export default authSlice.reducer