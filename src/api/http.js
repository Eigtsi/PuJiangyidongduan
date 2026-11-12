import axios from 'axios'
import { showFailToast } from 'vant'
import { useAppStore } from '@/store/app'
import { getToken } from '@/utils/storage'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.loading === true) {
    useAppStore().setLoading(true)
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    if (response.config.loading === true) {
      useAppStore().setLoading(false)
    }
    const result = response.data
    if (Array.isArray(result)) {
      return result
    }
    if (result.code !== 200) {
      showFailToast(result.msg || result.message || '请求失败')
      return Promise.reject(new Error(result.msg || result.message))
    }
    // 普通接口返回 { data }，RuoYi 分页接口返回 { total, rows }（无 data 字段）
    return result.data !== undefined ? result.data : result
  },
  (error) => {
    useAppStore().setLoading(false)
    showFailToast(error.response?.data?.message || error.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  },
)

/**
 * @param {import('axios').AxiosRequestConfig} config
 * @returns {Promise<any>}
 */
export function request(config) {
  return http.request(config)
}

export default http
