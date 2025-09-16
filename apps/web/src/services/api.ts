import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type {
  ApiResponse,
  User,
  AuthTokens,
  LoginRequest,
  SignupRequest,
  Group,
  CreateGroupRequest,
  Expense,
  CreateExpenseRequest,
  UserBalance,
  Settlement,
} from '@/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor para agregar token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor para manejar errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('partio_token')
  }

  private setToken(token: string): void {
    localStorage.setItem('partio_token', token)
  }

  private clearToken(): void {
    localStorage.removeItem('partio_token')
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/signup',
      data
    )
    if (response.data.success && response.data.data?.tokens.accessToken) {
      this.setToken(response.data.data.tokens.accessToken)
    }
    return response.data
  }

  async signin(data: LoginRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/signin',
      data
    )
    if (response.data.success && response.data.data?.tokens.accessToken) {
      this.setToken(response.data.data.tokens.accessToken)
    }
    return response.data
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>('/auth/profile')
    return response.data
  }

  async logout(): Promise<void> {
    this.clearToken()
  }

  // Groups endpoints
  async getGroups(): Promise<ApiResponse<Group[]>> {
    const response = await this.api.get<ApiResponse<Group[]>>('/groups')
    return response.data
  }

  async getGroup(id: string): Promise<ApiResponse<Group>> {
    const response = await this.api.get<ApiResponse<Group>>(`/groups/${id}`)
    return response.data
  }

  async createGroup(data: CreateGroupRequest): Promise<ApiResponse<Group>> {
    const response = await this.api.post<ApiResponse<Group>>('/groups', data)
    return response.data
  }

  async addMemberToGroup(groupId: string, email: string): Promise<ApiResponse<void>> {
    const response = await this.api.post<ApiResponse<void>>(`/groups/${groupId}/members`, {
      email,
    })
    return response.data
  }

  async getGroupBalances(groupId: string): Promise<ApiResponse<UserBalance[]>> {
    const response = await this.api.get<ApiResponse<UserBalance[]>>(`/groups/${groupId}/balances`)
    return response.data
  }

  async getSettlementSuggestions(groupId: string): Promise<ApiResponse<Settlement[]>> {
    const response = await this.api.get<ApiResponse<Settlement[]>>(
      `/groups/${groupId}/settlements`
    )
    return response.data
  }

  // Expenses endpoints
  async getGroupExpenses(groupId: string): Promise<ApiResponse<Expense[]>> {
    const response = await this.api.get<ApiResponse<Expense[]>>(`/groups/${groupId}/expenses`)
    return response.data
  }

  async createExpense(
    groupId: string,
    data: CreateExpenseRequest
  ): Promise<ApiResponse<Expense>> {
    const response = await this.api.post<ApiResponse<Expense>>(
      `/groups/${groupId}/expenses`,
      data
    )
    return response.data
  }

  async getExpense(expenseId: string): Promise<ApiResponse<Expense>> {
    const response = await this.api.get<ApiResponse<Expense>>(`/expenses/${expenseId}`)
    return response.data
  }

  async updateExpense(
    expenseId: string,
    data: Partial<CreateExpenseRequest>
  ): Promise<ApiResponse<Expense>> {
    const response = await this.api.put<ApiResponse<Expense>>(`/expenses/${expenseId}`, data)
    return response.data
  }

  async deleteExpense(expenseId: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete<ApiResponse<void>>(`/expenses/${expenseId}`)
    return response.data
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/health')
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
