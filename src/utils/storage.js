const TOKEN_KEY = 'pj_park_access_token'
const ROLE_KEY = 'pj_park_role'
const ENTERPRISE_KEY = 'pj_park_enterprise'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || ''
}

export function setRole(role) {
  localStorage.setItem(ROLE_KEY, role)
}

export function removeRole() {
  localStorage.removeItem(ROLE_KEY)
}

export function getEnterpriseName() {
  return localStorage.getItem(ENTERPRISE_KEY) || ''
}

export function setEnterpriseName(name) {
  localStorage.setItem(ENTERPRISE_KEY, name)
}

export function removeEnterpriseName() {
  localStorage.removeItem(ENTERPRISE_KEY)
}
