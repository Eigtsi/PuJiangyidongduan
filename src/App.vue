<template>
  <van-config-provider :theme-vars="themeVars">
    <router-view />
    <GlobalLoading />
  </van-config-provider>
</template>

<script setup>
import GlobalLoading from '@/components/GlobalLoading.vue'

const themeVars = {
  primaryColor: '#1677ff',
  successColor: '#16a46b',
  warningColor: '#f39b24',
  dangerColor: '#e6535a',
  borderRadiusMd: '0.16rem',
  fontSizeMd: '0.28rem',
}
</script>
