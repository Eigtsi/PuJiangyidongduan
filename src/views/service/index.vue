<template>
  <div class="page service-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>企业服务</h1>
        <span class="page-header-park">浦江中国水晶产业园</span>
      </div>
    </ShellHeaderPortal>

    <div class="content-padding">
      <!-- 服务入口宫格 -->
      <section class="card">
        <div class="card-title">服务入口</div>
        <div class="entry-grid">
          <div
            v-for="e in entries"
            :key="e.key"
            class="entry-item"
            :class="{ active: active === e.key }"
            @click="active = e.key"
          >
            <div class="entry-icon"><van-icon :name="e.icon" /></div>
            <div class="entry-name">{{ e.label }}</div>
          </div>
        </div>
      </section>

      <!-- 选中模块内容 -->
      <RecruitmentPanel v-if="active === 'recruitment'" />
      <BillingPanel v-else-if="active === 'billing'" />
      <ParkServicePanel v-else-if="active === 'parkService'" />
      <ReminderPanel v-else />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import RecruitmentPanel from './recruitment.vue'
import BillingPanel from './billing.vue'
import ParkServicePanel from './park-service.vue'
import ReminderPanel from './reminder.vue'

const active = ref('recruitment')

const entries = [
  { key: 'recruitment', label: '招工管理', icon: 'friends-o' },
  { key: 'billing', label: '统一核算', icon: 'bill-o' },
  { key: 'parkService', label: '园区服务', icon: 'shop-o' },
  { key: 'reminder', label: '业务提醒', icon: 'bell' },
]
</script>

<style scoped>
.entry-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.16rem;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;
  padding: 0.24rem 0.08rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.entry-item.active {
  background: #eaf3ff;
}

.entry-icon {
  display: grid;
  width: 0.9rem;
  height: 0.9rem;
  place-items: center;
  color: #1677ff;
  font-size: 0.46rem;
  background: #eaf3ff;
  border-radius: 0.18rem;
}

.entry-item.active .entry-icon {
  background: #fff;
}

.entry-name {
  color: #182230;
  font-size: 0.24rem;
}

.entry-item.active .entry-name {
  color: #1677ff;
  font-weight: 600;
}
</style>
