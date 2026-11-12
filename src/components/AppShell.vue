<template>
  <div class="app-shell">
    <header id="app-shell-topbar" class="app-topbar">
      <button class="switch-btn" aria-label="切换身份" @click="showSwitch = true">
        <van-icon name="exchange" />
      </button>
    </header>

    <main ref="mainRef" class="app-main">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <van-tabbar :model-value="activeTab" fixed placeholder class="app-tabbar">
      <van-tabbar-item v-for="t in tabs" :key="t.name" replace :to="t.to" :name="t.name">
        <template #icon><van-icon :name="t.icon" /></template>
        {{ t.label }}
      </van-tabbar-item>
    </van-tabbar>

    <!-- 切换身份弹层 -->
    <van-popup v-model:show="showSwitch" position="bottom" round class="switch-popup">
      <div class="switch-panel">
        <div class="sp-title">切换身份</div>
        <div class="sp-sub">选择身份进入对应工作台</div>
        <div
          v-for="o in roleOptions"
          :key="o.role"
          class="sp-item"
          :class="{ active: o.role === userStore.role }"
          @click="switchTo(o.role)"
        >
          <van-icon :name="o.icon" />
          <div class="sp-body">
            <div class="sp-name">{{ o.label }}</div>
          </div>
          <span v-if="o.role === userStore.role" class="sp-current">当前</span>
          <van-icon v-else name="arrow" class="sp-arrow" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const mainRef = ref(null)
const showSwitch = ref(false)

const isEnterprise = computed(() => userStore.isEnterprise)

const adminTabs = [
  { name: 'archive', label: '档案', to: '/archive', icon: 'records' },
  { name: 'operation', label: '运营', to: '/operation', icon: 'chart-trending-o' },
  { name: 'environment', label: '环保', to: '/environment', icon: 'shield-o' },
  { name: 'service', label: '服务', to: '/service', icon: 'apps-o' },
]

const enterpriseTabs = [
  { name: 'recruitment', label: '招工', to: '/enterprise/recruitment', icon: 'friends-o' },
  { name: 'bills', label: '账单', to: '/enterprise/bills', icon: 'bill-o' },
  { name: 'contract', label: '合同', to: '/enterprise/contract', icon: 'description' },
  { name: 'archive', label: '档案', to: '/enterprise/archive', icon: 'records' },
]

const roleOptions = [
  { role: 'admin', label: '管理端', icon: 'manager-o' },
  { role: 'enterprise', label: '企业端', icon: 'shop-o' },
]

const tabs = computed(() => (isEnterprise.value ? enterpriseTabs : adminTabs))
const activeTab = computed(() => route.meta.tab || (isEnterprise.value ? 'recruitment' : 'archive'))

function switchTo(role) {
  if (role === userStore.role) {
    showSwitch.value = false
    return
  }
  const enterpriseName = role === 'enterprise' ? '浦江水晶工艺品有限公司' : ''
  userStore.login({ role, enterpriseName })
  showSwitch.value = false
  router.replace(role === 'enterprise' ? '/enterprise/recruitment' : '/archive')
}

// 切换 tab 时重置滚动位置到顶部
watch(
  () => route.path,
  () => {
    if (mainRef.value) {
      mainRef.value.scrollTop = 0
    }
  },
)
</script>

<style scoped>
/* 右上角“切换身份”图标（类通知入口） */
.switch-btn {
  position: absolute;
  top: calc(var(--app-nav-height) / 2 + env(safe-area-inset-top));
  right: 0.24rem;
  z-index: 2;
  display: grid;
  width: 0.66rem;
  height: 0.66rem;
  place-items: center;
  color: #1677ff;
  background: #f0f5ff;
  border: none;
  border-radius: 50%;
  transform: translateY(-50%);
}

.switch-btn:active {
  opacity: 0.72;
}

.switch-btn :deep(.van-icon) {
  font-size: 0.38rem;
}

/* 切换身份弹层 */
.switch-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.switch-panel {
  padding: 0.32rem;
}

.sp-title {
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.sp-sub {
  margin: 0.08rem 0 0.24rem;
  color: #8c98a8;
  font-size: 0.22rem;
}

.sp-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.16rem;
  padding: 0.24rem;
  background: #f7f8fa;
  border: 1px solid transparent;
  border-radius: 0.14rem;
}

.sp-item:last-child {
  margin-bottom: 0;
}

.sp-item.active {
  background: #eaf3ff;
  border-color: #1677ff;
}

.sp-item > :deep(.van-icon) {
  flex-shrink: 0;
  color: #8c98a8;
  font-size: 0.44rem;
}

.sp-item.active > :deep(.van-icon) {
  color: #1677ff;
}

.sp-body {
  flex: 1;
  min-width: 0;
}

.sp-name {
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
}

.sp-item.active .sp-name {
  color: #1677ff;
}

.sp-current {
  flex-shrink: 0;
  padding: 0.04rem 0.14rem;
  color: #1677ff;
  font-size: 0.2rem;
  background: #fff;
  border-radius: 0.08rem;
}

.sp-arrow {
  flex-shrink: 0;
  color: #c3cbd6;
  font-size: 0.24rem;
}
</style>
