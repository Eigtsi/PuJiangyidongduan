import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    loadingText: '加载中...',
  }),
  actions: {
    setLoading(loading, loadingText = '加载中...') {
      this.loading = loading
      this.loadingText = loadingText
    },
  },
})
