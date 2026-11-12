import { defineStore } from 'pinia'
import {
  getToken,
  setToken,
  removeToken,
  getRole,
  setRole,
  removeRole,
  getEnterpriseName,
  setEnterpriseName,
  removeEnterpriseName,
} from '@/utils/storage'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    role: getRole(), // 'admin' | 'enterprise'
    enterpriseName: getEnterpriseName(),
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    isEnterprise: (state) => state.role === 'enterprise',
  },
  actions: {
    // 演示登录：Mock 环境直接签发 token，不接真实 /login
    login({ role, enterpriseName }) {
      this.token = `mock-token-${Date.now()}`
      this.role = role
      this.enterpriseName = enterpriseName || ''
      setToken(this.token)
      setRole(role)
      setEnterpriseName(this.enterpriseName)
    },
    logout() {
      this.token = ''
      this.role = ''
      this.enterpriseName = ''
      removeToken()
      removeRole()
      removeEnterpriseName()
    },
  },
})
