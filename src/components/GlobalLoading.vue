<template>
  <van-overlay :show="appStore.loading" z-index="1000" class="loading-overlay">
    <div class="loading-content">
      <van-loading color="#1677ff" size="0.44rem" />
      <span>{{ appStore.loadingText }}</span>
    </div>
  </van-overlay>
</template>

<script setup>
import { useAppStore } from '@/store/app'

const appStore = useAppStore()
</script>
