// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: any[]
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
}

// Group types
export interface Group {
  id: string
  name: string
  description?: string
  currency: string
  ownerId: string
  owner: User
  members: GroupMember[]
  expenses: Expense[]
  createdAt: string
  updatedAt: string
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  user: User
  joinedAt: string
}

export interface CreateGroupRequest {
  name: string
  description?: string
  currency: string
}

// Expense types
export interface Expense {
  id: string
  groupId: string
  payerId: string
  amount: number
  currency: string
  description: string
  category?: string
  date: string
  receipt?: string
  payer: User
  splits: ExpenseSplit[]
  createdAt: string
  updatedAt: string
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  userId: string
  amount: number
  percentage?: number
  user: User
}

export interface CreateExpenseRequest {
  amount: number
  currency: string
  description: string
  category?: string
  date?: string
  splits: {
    userId: string
    amount?: number
    percentage?: number
  }[]
}

// Balance types
export interface UserBalance {
  userId: string
  user: User
  balance: number
  owes: number
  owed: number
}

export interface Settlement {
  from: User
  to: User
  amount: number
  currency: string
}

// Form types
export interface FormError {
  field: string
  message: string
}

// UI types
export interface Toast {
  id: string
  title?: string
  description?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}
