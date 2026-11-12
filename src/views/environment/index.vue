<template>
  <div class="page environment-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>环保管理</h1>
        <span class="page-header-park">浦江中国水晶产业园</span>
      </div>
    </ShellHeaderPortal>

    <div class="content-padding" v-if="ov.recentAlerts !== undefined">
      <!-- 在线监测入口（置顶） -->
      <section class="card">
        <div class="card-title">在线监测</div>
        <div class="entry-grid">
          <div v-for="e in entries" :key="e.label" class="entry-item" @click="e.go">
            <div class="entry-icon"><van-icon :name="e.icon" /></div>
            <div class="entry-body">
              <div class="entry-name">{{ e.label }}</div>
              <div v-if="e.desc" class="entry-desc">{{ e.desc }}</div>
            </div>
            <van-icon name="arrow" class="entry-arrow" />
          </div>
        </div>
      </section>

      <!-- 预警快报 -->
      <section class="card">
        <div class="card-title">实时预警记录</div>
        <div class="filter-bar">
          <div class="status-chips">
            <span v-for="s in statusOptions" :key="s" class="filter-chip" :class="{ active: statusFilter === s }" @click="statusFilter = s">{{ s }}</span>
          </div>
          <div class="time-filter" @click="showFilterCalendar = true">
            <van-icon name="calendar-o" class="time-filter-icon" />
            <span class="time-filter-value">{{ dateRange.length === 2 ? dateRange[0] + ' ~ ' + dateRange[1] : '全部时间' }}</span>
            <van-icon v-if="dateRange.length" name="clear" class="time-filter-clear" @click.stop="dateRange = []" />
          </div>
        </div>
        <div class="alert-list">
          <div v-for="a in filteredAlerts" :key="a.id" class="alert-item" @click="gotoAlert(a)">
            <div class="alert-head">
              <span class="status-tag tag-blue">{{ a.source }}</span>
              <span v-if="a.level" class="status-tag" :class="levelClass(a.level)">{{ a.level }}</span>
            </div>
            <div class="alert-title">{{ a.point }} · {{ a.indicator }}</div>
            <div class="alert-meta">
              <span>实测 {{ a.value }}{{ a.unit }}（标准 {{ a.standardValue }}）</span>
              <span class="status-tag" :class="statusClass(a.status)">{{ a.status }}</span>
            </div>
          </div>
          <van-empty v-if="!filteredAlerts.length" description="暂无匹配的预警记录" image-size="64" />
        </div>
      </section>
    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>

    <!-- 预警记录时间筛选 -->
    <van-popup v-model:show="showFilterCalendar" position="bottom" round class="date-range-popup">
      <div class="drp">
        <div class="drp-title">选择预警时间范围</div>
        <div class="drp-body">
          <div class="drp-col">
            <span class="drp-tag">开始</span>
            <select v-model.number="filterStartYear" class="drp-select">
              <option v-for="y in ALERT_YEARS" :key="y" :value="y">{{ y }}年</option>
            </select>
            <select v-model.number="filterStartMonth" class="drp-select">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select v-model.number="filterStartDay" class="drp-select">
              <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
          <div class="drp-col">
            <span class="drp-tag">结束</span>
            <select v-model.number="filterEndYear" class="drp-select">
              <option v-for="y in ALERT_YEARS" :key="y" :value="y">{{ y }}年</option>
            </select>
            <select v-model.number="filterEndMonth" class="drp-select">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select v-model.number="filterEndDay" class="drp-select">
              <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
        </div>
        <div class="drp-actions">
          <button class="drp-btn cancel" @click="showFilterCalendar = false">取消</button>
          <button class="drp-btn confirm" @click="onFilterDateConfirm">确定</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getEnvOverview } from '@/api/environment'

const router = useRouter()
const ov = ref({})

// 实时预警记录筛选：状态 + 时间（水/大气用 待处置/处理中/已处理，企业源头用 未处置/处置中/已处置，统一映射）
const statusOptions = ['全部', '待处置', '处理中', '已处理']
const statusFilter = ref('全部')
const dateRange = ref([])
const showFilterCalendar = ref(false)
const ALERT_YEARS = [2024, 2025, 2026, 2027]
const filterStartYear = ref(2025)
const filterStartMonth = ref(1)
const filterStartDay = ref(1)
const filterEndYear = ref(2025)
const filterEndMonth = ref(12)
const filterEndDay = ref(31)

const filteredAlerts = computed(() => {
  let list = ov.value.recentAlerts || []
  if (statusFilter.value === '待处置') list = list.filter((a) => a.status === '待处置' || a.status === '未处置')
  else if (statusFilter.value === '处理中') list = list.filter((a) => a.status === '处理中' || a.status === '处置中')
  else if (statusFilter.value === '已处理') list = list.filter((a) => a.status === '已处理' || a.status === '已处置')
  if (dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter((a) => (a.occurTime || '').slice(0, 10) >= start && (a.occurTime || '').slice(0, 10) <= end)
  }
  return list
})

function pad2(s) {
  return String(s).padStart(2, '0')
}

function onFilterDateConfirm() {
  dateRange.value = [
    `${filterStartYear.value}-${pad2(filterStartMonth.value)}-${pad2(filterStartDay.value)}`,
    `${filterEndYear.value}-${pad2(filterEndMonth.value)}-${pad2(filterEndDay.value)}`,
  ]
  showFilterCalendar.value = false
}

const entries = [
  { label: '水环境监测', desc: '', icon: 'location-o', go: () => router.push('/environment/water') },
  { label: '大气环境监测', desc: '2 个监测站实时数据', icon: 'guide-o', go: () => router.push('/environment/air') },
  { label: '固废处置', desc: '', icon: 'delete-o', go: () => router.push('/environment/waste') },
  { label: '企业源头管控', desc: '环保设备功率监控', icon: 'shop-o', go: () => router.push('/environment/source') },
]

const alertPageMap = { 水环境: '/environment/water', 大气环境: '/environment/air', 企业源头: '/environment/source' }

function levelClass(level) {
  return level === '红色' ? 'tag-red' : 'tag-orange'
}

function statusClass(status) {
  if (status === '待处置' || status === '未处置') return 'tag-red'
  if (status === '处理中' || status === '处置中') return 'tag-orange'
  return 'tag-green'
}

function gotoAlert(a) {
  const path = alertPageMap[a.source]
  if (path) router.push({ path, query: { alert: a.id } })
}

onMounted(async () => {
  ov.value = (await getEnvOverview()) || {}
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  margin-bottom: 0.16rem;
}

.status-chips {
  display: flex;
  gap: 0.12rem;
}

.filter-chip {
  flex: 1;
  padding: 0.1rem 0;
  color: #4a5568;
  font-size: 0.22rem;
  text-align: center;
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 0.08rem;
}

.filter-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #eaf3ff;
  border-color: #1677ff;
}

.time-filter {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.12rem 0.16rem;
  background: #fff;
  border-radius: 0.08rem;
}

.time-filter-icon {
  color: #1677ff;
  font-size: 0.26rem;
}

.time-filter-value {
  flex: 1;
  color: #182230;
  font-size: 0.22rem;
}

.time-filter-clear {
  color: #c3cbd6;
  font-size: 0.26rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.alert-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.alert-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert-title {
  margin-top: 0.12rem;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.alert-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
  margin-top: 0.1rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.alert-meta > span:first-child {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-meta .status-tag {
  flex-shrink: 0;
  white-space: nowrap;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.16rem;
}

.entry-item {
  display: flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.entry-icon {
  display: grid;
  width: 0.72rem;
  height: 0.72rem;
  flex-shrink: 0;
  place-items: center;
  color: #1677ff;
  font-size: 0.36rem;
  background: #eaf3ff;
  border-radius: 0.16rem;
}

.entry-body {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 0.12rem;
}

.entry-name {
  flex-shrink: 0;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.entry-desc {
  min-width: 0;
  overflow: hidden;
  color: #8c98a8;
  font-size: 0.2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-arrow {
  color: #c3cbd6;
  font-size: 0.24rem;
}

.loading-block {
  padding: 1.2rem 0;
}

.date-range-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.drp-title {
  padding: 0.26rem 0.32rem 0.1rem;
  color: #182230;
  font-size: 0.3rem;
  font-weight: 700;
  text-align: center;
}

.drp-body {
  display: flex;
  gap: 0.2rem;
  padding: 0.08rem 0.32rem 0.16rem;
}

.drp-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 0.14rem;
  min-width: 0;
}

.drp-tag {
  color: #8c98a8;
  font-size: 0.24rem;
  text-align: center;
}

.drp-select {
  width: 100%;
  padding: 0.16rem 0.12rem;
  color: #182230;
  font-size: 0.26rem;
  text-align: center;
  text-align-last: center;
  background: #f5f7fa;
  border: 1px solid #edf0f4;
  border-radius: 0.1rem;
  outline: none;
}

.drp-actions {
  display: flex;
  gap: 0.16rem;
  padding: 0.16rem 0.32rem 0.28rem;
}

.drp-btn {
  flex: 1;
  padding: 0.18rem 0;
  font-size: 0.28rem;
  border: none;
  border-radius: 0.12rem;
}

.drp-btn.cancel {
  color: #4a5568;
  background: #f0f2f5;
}

.drp-btn.confirm {
  color: #fff;
  background: #1677ff;
}
</style>
