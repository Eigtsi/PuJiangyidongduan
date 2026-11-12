<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">固废处置</div>
        <div class="right" />
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content">
      <!-- 收运中转记录 -->
      <div class="card record-card">
        <div class="park-switch">
          <span
            v-for="p in parks"
            :key="p.key"
            class="park-chip"
            :class="{ active: parkKey === p.key }"
            @click="parkKey = p.key"
          >{{ p.name }}</span>
        </div>
        <div class="record-head">
          <div class="card-title">收运中转记录</div>
          <div class="seg-toggle small">
            <span :class="{ active: timeMode === 'recent' }" @click="timeMode = 'recent'">近7天</span>
            <span :class="{ active: timeMode === 'custom' }" @click="timeMode = 'custom'">时间</span>
          </div>
        </div>

        <div v-if="timeMode === 'custom'" class="range-bar" @click="showCalendar = true">
          <span class="range-value">{{ startDate }} ~ {{ endDate }}</span>
          <van-icon name="calendar-o" class="range-icon" />
        </div>

        <!-- 总量统计 -->
        <div class="totals-grid">
          <div class="totals-item">
            <span class="tot-label">固废总量</span>
            <span class="tot-value">{{ totals.solid.toFixed(2) }}<i>吨</i></span>
          </div>
          <div class="totals-item">
            <span class="tot-label">危废总量</span>
            <span class="tot-value danger">{{ totals.hazardous.toFixed(2) }}<i>吨</i></span>
          </div>
          <div class="totals-item">
            <span class="tot-label">废水总量</span>
            <span class="tot-value">{{ totals.wastewater.toFixed(2) }}<i>吨</i></span>
          </div>
        </div>

        <!-- 搜索 -->
        <div class="search-box">
          <van-icon name="search" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="搜索车牌号 / 流水号" />
        </div>

        <!-- 记录列表 -->
        <div class="record-list">
          <div v-if="!records.length" class="record-empty">未查询到匹配车辆</div>
          <div v-for="r in records" :key="r.serial" class="record-item">
            <div class="record-row" @click="toggleRecord(r.serial)">
              <span class="r-plate">{{ r.plate }}</span>
              <span class="r-cat" :class="catClass(r.category)">{{ r.category }}</span>
              <span class="r-time">{{ r.time }}</span>
              <van-icon name="arrow-down" class="r-arrow" :class="{ up: expandedSerial === r.serial }" />
            </div>
            <div v-if="expandedSerial === r.serial" class="record-detail">
              <div class="rd-row"><span>流水号</span><span>{{ r.serial }}</span></div>
              <div class="rd-row"><span>车牌号</span><span>{{ r.plate }}</span></div>
              <div class="rd-row"><span>园区</span><span>{{ r.park }}</span></div>
              <div class="rd-row"><span>毛重</span><span>{{ r.gross }} 吨</span></div>
              <div class="rd-row"><span>皮重</span><span>{{ r.tare }} 吨</span></div>
              <div class="rd-row"><span>净重</span><span class="rd-net">{{ r.net }} 吨</span></div>
              <div class="rd-row"><span>皮重时间</span><span>{{ r.tareTime }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-calendar v-model:show="showCalendar" type="range" :min-date="minDate" :max-date="maxDate" @confirm="onConfirmRange" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getSolidWaste } from '@/api/environment'

const router = useRouter()
const solidWaste = ref({})

// 收运中转记录：近7天 / 时间
const timeMode = ref('recent')
const showCalendar = ref(false)
const startDate = ref('2026-10-22')
const endDate = ref('2026-10-28')
const searchQuery = ref('')
const expandedSerial = ref(null)
const parkKey = ref('all')

const parks = computed(() => {
  const list = solidWaste.value.parks || ['中部园区', '东部园区', '西部园区']
  return [{ key: 'all', name: '全园区' }, ...list.map((name) => ({ key: name, name }))]
})

const RECENT_RANGE = ['2026-10-22', '2026-10-28']
const minDate = new Date(2026, 7, 1) // 2026-08-01
const maxDate = new Date(2026, 9, 28) // 2026-10-28

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function onConfirmRange(dates) {
  if (Array.isArray(dates) && dates.length >= 2) {
    startDate.value = formatDate(dates[0])
    endDate.value = formatDate(dates[1])
  }
  showCalendar.value = false
}

function toggleRecord(serial) {
  expandedSerial.value = expandedSerial.value === serial ? null : serial
}

function catClass(cat) {
  if (cat === '固废') return 'cat-solid'
  if (cat === '危废') return 'cat-hazardous'
  return 'cat-wastewater'
}

const records = computed(() => {
  const list = (solidWaste.value.transferRecords || []).filter((r) => {
    if (parkKey.value !== 'all' && r.park !== parkKey.value) return false
    if (timeMode.value === 'recent') return r.date >= RECENT_RANGE[0] && r.date <= RECENT_RANGE[1]
    return (!startDate.value || r.date >= startDate.value) && (!endDate.value || r.date <= endDate.value)
  })
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((r) => r.plate.toLowerCase().includes(q) || r.serial.toLowerCase().includes(q))
})

const totals = computed(() => {
  const [start, end] = timeMode.value === 'recent' ? RECENT_RANGE : [startDate.value, endDate.value]
  const inRange = (d) => (!start || d >= start) && (!end || d <= end)
  const inPark = (p) => parkKey.value === 'all' || p === parkKey.value
  const sumNet = (cat) =>
    (solidWaste.value.transferRecords || [])
      .filter((r) => r.category === cat && inRange(r.date) && inPark(r.park))
      .reduce((s, r) => s + (parseFloat(r.net) || 0), 0)
  const hazardous = (solidWaste.value.hazardousImports || [])
    .filter((i) => inRange(i.date) && inPark(i.park))
    .reduce((s, i) => s + (i.amount || 0), 0)
  return { solid: sumNet('固废'), hazardous, wastewater: sumNet('废水') }
})

onMounted(async () => {
  solidWaste.value = (await getSolidWaste()) || {}
})
</script>

<style scoped>
/* 撑满首屏：卡片拉伸，记录列表铺满剩余空间 */
.detail-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--app-nav-height) - env(safe-area-inset-top) - 50px - env(safe-area-inset-bottom));
}

.detail-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* 园区切换 */
.park-switch {
  display: flex;
  padding: 0.06rem;
  background: #f2f4f7;
  border-radius: 0.14rem;
}

.park-chip {
  flex: 1;
  padding: 0.12rem 0;
  color: #7a8699;
  font-size: 0.22rem;
  line-height: 1;
  text-align: center;
  border-radius: 0.1rem;
  transition: all 0.2s ease;
}

.park-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #fff;
  box-shadow: 0 0.02rem 0.08rem rgba(22, 119, 255, 0.16);
}

/* 收运中转记录 */
.record-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.record-head .card-title {
  margin-bottom: 0;
}

.seg-toggle {
  display: flex;
  padding: 0.04rem;
  background: #f5f6f8;
  border-radius: 0.08rem;
}

.seg-toggle span {
  flex: 1;
  padding: 0.06rem 0;
  color: #8c98a8;
  font-size: 0.2rem;
  text-align: center;
  border-radius: 0.06rem;
}

.seg-toggle span.active {
  color: #1677ff;
  font-weight: 600;
  background: #fff;
  box-shadow: 0 0.02rem 0.06rem rgba(22, 119, 255, 0.12);
}

.seg-toggle.small {
  width: 2.2rem;
  flex-shrink: 0;
}

.range-bar {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.14rem 0.16rem;
  background: #f5f6f8;
  border-radius: 0.1rem;
}

.range-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #182230;
  font-size: 0.22rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.range-icon {
  flex-shrink: 0;
  color: #1677ff;
  font-size: 0.26rem;
}

.totals-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.12rem;
}

.totals-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.3rem 0.08rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.tot-label {
  color: #8c98a8;
  font-size: 0.22rem;
}

.tot-value {
  margin-top: 0.12rem;
  color: #182230;
  font-size: 0.34rem;
  font-weight: 700;
}

.tot-value i {
  margin-left: 0.04rem;
  color: #8c98a8;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.tot-value.danger {
  color: #e6535a;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.12rem 0.16rem;
  background: #f5f6f8;
  border-radius: 0.1rem;
}

.search-icon {
  flex-shrink: 0;
  color: #8c98a8;
  font-size: 0.26rem;
}

.search-box input {
  flex: 1;
  min-width: 0;
  color: #182230;
  font-size: 0.22rem;
  background: transparent;
  border: none;
  outline: none;
}

.search-box input::placeholder {
  color: #c3cbd6;
}

.record-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.08rem;
  min-height: 0;
  overflow-y: auto;
}

.record-empty {
  padding: 0.2rem 0;
  color: #8c98a8;
  font-size: 0.22rem;
  text-align: center;
}

.record-item {
  border-bottom: 1px solid #f0f2f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.14rem 0;
}

.r-plate {
  color: #182230;
  font-size: 0.22rem;
  font-weight: 600;
  white-space: nowrap;
}

.r-cat {
  flex-shrink: 0;
  padding: 0.02rem 0.1rem;
  font-size: 0.18rem;
  border-radius: 0.04rem;
}

.r-cat.cat-solid {
  color: #1677ff;
  background: #eaf3ff;
}

.r-cat.cat-hazardous {
  color: #e6535a;
  background: #fdecec;
}

.r-cat.cat-wastewater {
  color: #16b364;
  background: #e6f7ef;
}

.r-time {
  flex: 1;
  min-width: 0;
  color: #8c98a8;
  font-size: 0.2rem;
  text-align: right;
}

.r-arrow {
  flex-shrink: 0;
  color: #c3cbd6;
  font-size: 0.22rem;
  transition: transform 0.2s;
}

.r-arrow.up {
  transform: rotate(180deg);
}

.record-detail {
  margin: 0.04rem 0 0.12rem 0.1rem;
  padding: 0.12rem 0.14rem;
  background: #f7f8fa;
  border-left: 2px solid #1677ff;
  border-radius: 0 0.08rem 0.08rem 0;
}

.rd-row {
  display: flex;
  justify-content: space-between;
  gap: 0.16rem;
  padding: 0.1rem 0;
  font-size: 0.26rem;
}

.rd-row span:first-child {
  flex-shrink: 0;
  color: #8c98a8;
}

.rd-row span:last-child {
  color: #182230;
  text-align: right;
}

.rd-row .rd-net {
  color: #1677ff;
  font-weight: 600;
}
</style>
