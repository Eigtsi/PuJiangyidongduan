<template>
  <Teleport defer to="#app-shell-topbar">
    <div v-show="isActive" class="shell-header-portal">
      <slot />
    </div>
  </Teleport>
</template>

<script setup>
import { onActivated, onBeforeUnmount, onDeactivated, ref } from 'vue'

const isActive = ref(true)

onActivated(() => {
  isActive.value = true
})

onDeactivated(() => {
  isActive.value = false
})

onBeforeUnmount(() => {
  isActive.value = false
})
</script>
