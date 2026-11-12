<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">水环境监测</div>
        <div class="right" />
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content">
      <van-tabs v-model:active="active" shrink>
        <van-tab title="排污口监测">
          <div class="tab-body">
            <div v-for="p in waterRealtime" :key="p.point" class="card">
              <div class="point-head">
                <span class="point-name">{{ p.point }}</span>
                <span class="status-tag" :class="levelTag(p.statusLevel)">{{ p.statusLevel }}</span>
              </div>
              <div class="factor-grid">
                <div v-for="ind in waterIndicators" :key="ind.field" class="factor">
                  <span class="f-name">{{ ind.name }}</span>
                  <span class="f-value">{{ p[ind.field] }}<i>{{ ind.unit }}</i></span>
                </div>
              </div>
              <div class="point-foot">
                <span class="point-time">监测时间 {{ p.monitorTime }}</span>
                <button class="history-btn" @click="openHistory(p)">历史数据</button>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="雨排口">
          <div class="tab-body">
            <div v-for="r in rainMonitors" :key="r.id" class="card rain-card" @click="openRainVideo(r)">
              <div class="rain-head">
                <div class="rain-info">
                  <van-icon name="video-o" class="rain-icon" />
                  <span class="rain-name">{{ r.name }}</span>
                </div>
                <span v-if="r.online" class="rain-live">
                  <i class="rain-dot" />
                  实时监控
                </span>
                <span v-else class="rain-offline">设备离线</span>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="预警记录">
          <div class="tab-body">
            <!-- 筛选：状态 + 时间 -->
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
            <div v-for="a in filteredAlerts" :key="a.id" :id="'alert-' + a.id" class="card alert-card" :class="{ 'is-target': a.id === highlightId }">
              <div class="alert-head">
                <span class="status-tag" :class="levelTag(a.level)">{{ a.level }}</span>
                <span class="status-tag" :class="statusTag(a.status)">{{ a.status }}</span>
              </div>
              <div class="alert-title">{{ a.point }} · {{ a.indicator }}</div>
              <div class="alert-desc">实测 {{ a.value }}{{ a.unit }}（标准 {{ a.standardValue }}）</div>
              <div class="log-list" v-if="showProcess(a)">
                <div v-for="(log, i) in a.processLog" :key="i" class="log-item">
                  <div class="log-head">
                    <span class="log-action">{{ log.action }}</span>
                    <span class="log-meta">{{ log.operator }} · {{ log.time }}</span>
                  </div>
                  <div class="log-remark" v-if="log.remark">{{ log.remark }}</div>
                  <div class="log-images" v-if="log.images && log.images.length">
                    <img v-for="(img, j) in log.images" :key="j" :src="img" class="log-img" @click="previewImage(img)" />
                  </div>
                </div>
              </div>
              <button v-if="a.status === '已处理'" class="view-process-btn" @click="toggleProcess(a.id)">
                {{ expandedProcess[a.id] ? '收起流程' : '查看流程' }}
              </button>
              <button v-else class="handle-btn" @click="openAdvance(a)">
                {{ a.status === '待处置' ? '开始处置' : '完成处置' }}
              </button>
            </div>
            <van-empty v-if="!filteredAlerts.length" description="暂无匹配的预警记录" image-size="64" />
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 雨排口视频监控弹窗（占位） -->
    <van-popup v-model:show="rainVideo" round position="center" class="rain-video-popup">
      <div class="video-head">
        <span class="video-title">{{ currentRain?.name }} · 视频监控</span>
        <van-icon name="cross" @click="rainVideo = false" />
      </div>
      <div class="video-body">
        <van-icon name="video-o" class="video-placeholder-icon" />
        <span class="video-placeholder-text">视频监控（占位）</span>
      </div>
    </van-popup>

    <!-- 推进处置弹窗（处置人 + 处置说明 + 现场照片，对齐 PC 端） -->
    <van-popup v-model:show="advanceOpen" round position="bottom" class="advance-popup">
      <div class="advance-title">{{ advanceTitle }}</div>
      <div class="advance-body">
        <div class="af-label">处置人</div>
        <input v-model="advanceForm.operator" class="af-input" type="text" placeholder="请输入处置人" />
        <div class="af-label">处置说明</div>
        <textarea v-model="advanceForm.remark" class="af-textarea" rows="3" :placeholder="advancePlaceholder" />
        <div class="af-label">现场照片</div>
        <div class="photo-grid">
          <div v-for="(img, i) in advanceForm.images" :key="i" class="photo-item">
            <img :src="img" class="photo-img" @click="previewImage(img)" />
            <span class="photo-del" @click="advanceForm.images.splice(i, 1)">×</span>
          </div>
          <label class="photo-add">
            <input type="file" accept="image/*" multiple class="photo-input" @change="onPickImages" />
            <van-icon name="plus" />
          </label>
        </div>
        <div class="af-unit">支持上传多张现场照片</div>
      </div>
      <div class="advance-actions">
        <button class="aa-btn" @click="advanceOpen = false">取消</button>
        <button class="aa-btn primary" @click="submitAdvance">提交</button>
      </div>
    </van-popup>

    <!-- 现场照片预览 -->
    <van-popup v-model:show="previewOpen" round position="center" class="img-preview-popup">
      <img :src="previewUrl" class="img-preview" />
    </van-popup>

    <!-- 预警记录时间筛选 -->
    <van-calendar v-model:show="showFilterCalendar" type="range" :min-date="filterMinDate" :max-date="filterMaxDate" @confirm="onFilterDateConfirm" />

    <!-- 排污口历史数据（全屏，可下滑查看） -->
    <van-popup
      v-model:show="historyOpen"
      position="top"
      :style="{
        top: 'calc(var(--app-nav-height) + env(safe-area-inset-top))',
        height: 'calc(100% - var(--app-nav-height) - env(safe-area-inset-top) - 50px - env(safe-area-inset-bottom))',
      }"
    >
      <div class="history-panel">
        <div class="history-head">
          <span class="history-title">历史数据 · {{ currentPoint?.point }}</span>
          <van-icon name="cross" class="history-close" @click="historyOpen = false" />
        </div>
        <div class="history-filter">
          <div class="time-filter" @click="showHistoryCalendar = true">
            <van-icon name="calendar-o" class="time-filter-icon" />
            <span class="time-filter-value">{{ historyRange.length === 2 ? historyRange[0] + ' ~ ' + historyRange[1] : '近 7 天' }}</span>
            <van-icon v-if="historyRange.length" name="clear" class="time-filter-clear" @click.stop="historyRange = []" />
          </div>
        </div>
        <div class="history-body">
          <div class="history-inner">
            <div class="chart-card" v-if="filteredHistory.length">
              <div class="chart-legend">
                <span
                  v-for="ind in waterIndicators"
                  :key="ind.field"
                  class="legend-chip"
                  :class="{ active: chartIndicators.includes(ind.field) }"
                  @click="toggleChartIndicator(ind.field)"
                >
                  <i :style="{ background: chartColor(ind.field) }" />
                  {{ ind.name }}
                </span>
              </div>
              <svg ref="chartSvg" class="trend-svg" :viewBox="`0 0 ${chart.w} ${chart.h}`" @click="onChartClick" @touchstart="onChartTouch" @touchmove.prevent="onChartTouch">
                <line v-for="(y, i) in chart.gridY" :key="'g' + i" :x1="chart.padL" :y1="y" :x2="chart.w - chart.padR" :y2="y" class="grid-line" />
                <text v-for="(t, i) in chart.yTicks" :key="'yt' + i" :x="chart.padL - 4" :y="t.y + 3" class="axis-text" text-anchor="end">{{ t.text }}</text>
                <text v-for="(t, i) in chart.xTicks" :key="'xt' + i" :x="t.x" :y="chart.h - chart.padB + 14" class="axis-text" :text-anchor="t.anchor">{{ t.text }}</text>
                <polyline v-for="s in chart.series" :key="s.field" :points="s.points" :stroke="s.color" fill="none" class="trend-line" />
                <g v-if="tooltip">
                  <line :x1="tooltip.x" :y1="chart.padT" :x2="tooltip.x" :y2="chart.h - chart.padB" class="crosshair" />
                  <circle v-for="d in tooltip.dots" :key="'dot' + d.field" :cx="d.x" :cy="d.y" r="3" :fill="d.color" stroke="#fff" stroke-width="1" />
                  <g :transform="`translate(${tooltip.boxX}, ${tooltip.boxY})`">
                    <text x="8" y="13" class="tip-time">{{ tooltip.timeText }}</text>
                    <g v-for="(d, i) in tooltip.dots" :key="'d' + i">
                      <circle :cx="11" :cy="25 + i * 15" r="3" :fill="d.color" />
                      <text x="20" :y="29 + i * 15" class="tip-line">{{ d.name }} {{ d.value }}{{ d.unit }}</text>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div class="table-wrap">
              <table class="history-table">
                <thead>
                  <tr>
                    <th class="th-time">时间</th>
                    <th v-for="ind in waterIndicators" :key="ind.field">
                      <div class="th-name">{{ ind.name }}</div>
                      <div v-if="ind.unit" class="th-unit">{{ ind.unit }}</div>
                    </th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in filteredHistory" :key="h.time">
                    <td class="td-time">{{ h.time.slice(5, 16) }}</td>
                    <td v-for="ind in waterIndicators" :key="ind.field">{{ h[ind.field] }}</td>
                    <td class="td-status"><span class="status-tag" :class="levelTag(h.statusLevel)">{{ h.statusLevel }}</span></td>
                  </tr>
                </tbody>
                <tfoot v-if="historyAvg">
                  <tr>
                    <td class="td-time">平均值</td>
                    <td v-for="ind in waterIndicators" :key="ind.field">{{ historyAvg[ind.field] }}</td>
                    <td class="td-status">—</td>
                  </tr>
                </tfoot>
              </table>
              <van-empty v-if="!filteredHistory.length" description="该时间段暂无历史数据" image-size="64" />
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 排污口历史数据时间筛选 -->
    <van-calendar v-model:show="showHistoryCalendar" type="range" :min-date="filterMinDate" :max-date="filterMaxDate" @confirm="onHistoryDateConfirm" />
  </div>
</template>

<script setup>
import { computed, nextTick, onActivated, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getWaterRealtime, getWaterIndicators, getRainMonitors, getWaterAlerts, getWaterHistory, advanceAlert } from '@/api/environment'

const router = useRouter()
const route = useRoute()
const active = ref(0)
const waterRealtime = ref([])
const waterIndicators = ref([])
const rainMonitors = ref([])
const waterAlerts = ref([])
const highlightId = ref('')
const rainVideo = ref(false)
const currentRain = ref(null)

// 排污口历史数据
const historyOpen = ref(false)
const currentPoint = ref(null)
const historyData = ref([])
const historyRange = ref([])
const showHistoryCalendar = ref(false)

// 推进处置弹窗（对齐 PC 端：处置人 + 处置说明 + 现场照片）
const advanceOpen = ref(false)
const advanceIsStart = ref(true)
const advanceTitle = ref('')
const advancePlaceholder = ref('')
const currentAdvanceId = ref(null)
const advanceForm = ref({ operator: '园区运维员', remark: '', images: [] })

// 现场照片预览
const previewUrl = ref('')
const previewOpen = ref(false)

// 已处理预警：默认收起处置流程，点「查看流程」展开
const expandedProcess = ref({})
function toggleProcess(id) {
  expandedProcess.value[id] = !expandedProcess.value[id]
}
function showProcess(a) {
  if (a.status !== '已处理') return true
  return !!expandedProcess.value[a.id]
}

// 预警记录筛选：状态 + 时间
const statusOptions = ['全部', '待处置', '处理中', '已处理']
const statusFilter = ref('全部')
const dateRange = ref([])
const showFilterCalendar = ref(false)
const filterMinDate = new Date(2025, 0, 1)
const filterMaxDate = new Date(2025, 11, 31)

const filteredAlerts = computed(() => {
  let list = waterAlerts.value || []
  if (statusFilter.value !== '全部') list = list.filter((a) => a.status === statusFilter.value)
  if (dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter((a) => (a.occurTime || '').slice(0, 10) >= start && (a.occurTime || '').slice(0, 10) <= end)
  }
  return list
})

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function onFilterDateConfirm(dates) {
  if (Array.isArray(dates) && dates.length >= 2) {
    dateRange.value = [formatDate(dates[0]), formatDate(dates[1])]
  }
  showFilterCalendar.value = false
}

// 排污口历史数据
const filteredHistory = computed(() => {
  let list = historyData.value || []
  if (historyRange.value.length === 2) {
    const [start, end] = historyRange.value
    list = list.filter((h) => (h.time || '').slice(0, 10) >= start && (h.time || '').slice(0, 10) <= end)
  }
  return list
})

const AVG_DECIMALS = {
  phValue: 2,
  codValue: 0,
  ammoniaNitrogen: 1,
  totalNitrogen: 1,
  totalPhosphorus: 2,
  fluorideValue: 1,
  flowRate: 0,
}

// 表格最后一行：各指标平均值
const historyAvg = computed(() => {
  const rows = filteredHistory.value || []
  if (!rows.length) return null
  const avg = {}
  waterIndicators.value.forEach((ind) => {
    const sum = rows.reduce((s, r) => s + (Number(r[ind.field]) || 0), 0)
    const dec = AVG_DECIMALS[ind.field] ?? 1
    avg[ind.field] = +(sum / rows.length).toFixed(dec)
  })
  return avg
})

async function openHistory(p) {
  currentPoint.value = p
  historyRange.value = []
  historyData.value = (await getWaterHistory(p.point)) || []
  historyOpen.value = true
}

function onHistoryDateConfirm(dates) {
  if (Array.isArray(dates) && dates.length >= 2) {
    historyRange.value = [formatDate(dates[0]), formatDate(dates[1])]
  }
  showHistoryCalendar.value = false
}

// 历史数据曲线图
const IND_COLORS = {
  phValue: '#1677ff',
  codValue: '#f56c6c',
  ammoniaNitrogen: '#16b364',
  totalNitrogen: '#e6a23c',
  totalPhosphorus: '#9b59b6',
  fluorideValue: '#00bcd4',
  flowRate: '#ff9800',
}
const chartIndicators = ref(['codValue', 'fluorideValue', 'phValue'])

function chartColor(field) {
  return IND_COLORS[field] || '#1677ff'
}

function toggleChartIndicator(field) {
  const i = chartIndicators.value.indexOf(field)
  if (i > -1) chartIndicators.value.splice(i, 1)
  else chartIndicators.value.push(field)
}

const CHART_W = 700
const CHART_H = 190
const CHART_PAD = { l: 34, r: 10, t: 10, b: 26 }

function buildGeometry(rows, sel) {
  const plotW = CHART_W - CHART_PAD.l - CHART_PAD.r
  const plotH = CHART_H - CHART_PAD.t - CHART_PAD.b
  let min = Infinity
  let max = -Infinity
  sel.forEach((ind) => rows.forEach((r) => {
    const v = Number(r[ind.field])
    if (Number.isFinite(v)) { if (v < min) min = v; if (v > max) max = v }
  }))
  if (!Number.isFinite(min)) { min = 0; max = 1 }
  if (min === max) { min -= 1; max += 1 }
  const pad = (max - min) * 0.1
  min -= pad
  max += pad
  const xAt = (i) => CHART_PAD.l + (rows.length <= 1 ? plotW / 2 : (i / (rows.length - 1)) * plotW)
  const yAt = (v) => CHART_PAD.t + (1 - (v - min) / (max - min)) * plotH
  return { min, max, xAt, yAt, plotW, plotH }
}

const chart = computed(() => {
  const rows = filteredHistory.value || []
  const sel = waterIndicators.value.filter((i) => chartIndicators.value.includes(i.field))
  const geo = buildGeometry(rows, sel)
  const series = sel.map((ind) => ({
    field: ind.field,
    color: chartColor(ind.field),
    points: rows.map((r, i) => `${geo.xAt(i).toFixed(1)},${geo.yAt(Number(r[ind.field])).toFixed(1)}`).join(' '),
  }))
  const yTicks = []
  const gridY = []
  for (let t = 0; t <= 3; t++) {
    const v = geo.max - (t / 3) * (geo.max - geo.min)
    const y = geo.yAt(v)
    gridY.push(y)
    yTicks.push({ y, text: v >= 100 ? Math.round(v) : +v.toFixed(1) })
  }
  const xTicks = []
  let lastDay = ''
  rows.forEach((r, i) => {
    const day = (r.time || '').slice(0, 10)
    if (day && day !== lastDay) {
      lastDay = day
      xTicks.push({ x: geo.xAt(i), text: day.slice(5), anchor: 'middle' })
    }
  })
  if (xTicks.length > 1) {
    xTicks[0].anchor = 'start'
    xTicks[xTicks.length - 1].anchor = 'end'
  }
  return { w: CHART_W, h: CHART_H, padL: CHART_PAD.l, padR: CHART_PAD.r, padT: CHART_PAD.t, padB: CHART_PAD.b, series, yTicks, gridY, xTicks }
})

// 点击/滑动曲线图显示对应时间点具体数据
const hoverIdx = ref(null)
const chartSvg = ref(null)

function clientXToIdx(clientX) {
  const svg = chartSvg.value
  if (!svg) return null
  const rect = svg.getBoundingClientRect()
  if (!rect.width) return null
  const vx = ((clientX - rect.left) / rect.width) * CHART_W
  const rows = filteredHistory.value || []
  if (!rows.length) return null
  let idx = 0
  if (rows.length > 1) {
    const ratio = (vx - CHART_PAD.l) / (CHART_W - CHART_PAD.l - CHART_PAD.r)
    idx = Math.round(ratio * (rows.length - 1))
    idx = Math.max(0, Math.min(rows.length - 1, idx))
  }
  return idx
}

function onChartClick(e) {
  const idx = clientXToIdx(e.clientX)
  if (idx != null) hoverIdx.value = idx
}

function onChartTouch(e) {
  const t = e.touches && e.touches[0]
  if (!t) return
  const idx = clientXToIdx(t.clientX)
  if (idx != null) hoverIdx.value = idx
}

const tooltip = computed(() => {
  const rows = filteredHistory.value || []
  if (hoverIdx.value == null || !rows.length) return null
  const i = Math.min(Math.max(hoverIdx.value, 0), rows.length - 1)
  const row = rows[i]
  const sel = waterIndicators.value.filter((ind) => chartIndicators.value.includes(ind.field))
  const geo = buildGeometry(rows, sel)
  const x = geo.xAt(i)
  const dots = sel.map((ind) => ({
    field: ind.field,
    name: ind.name,
    value: row[ind.field],
    unit: ind.unit,
    color: chartColor(ind.field),
    x,
    y: geo.yAt(Number(row[ind.field])),
  }))
  const boxW = 120
  const boxH = 24 + dots.length * 15
  let boxX = x + 8
  if (boxX + boxW > CHART_W - CHART_PAD.r) boxX = x - boxW - 8
  if (boxX < CHART_PAD.l) boxX = CHART_PAD.l
  const boxY = CHART_PAD.t + 2
  return { x, dots, timeText: (row.time || '').slice(5, 16), boxX, boxY, boxW, boxH }
})

function openRainVideo(r) {
  currentRain.value = r
  rainVideo.value = true
}

function previewImage(url) {
  previewUrl.value = url
  previewOpen.value = true
}

function levelTag(level) {
  return level === '红色' || level === '红色预警' ? 'tag-red' : level === '黄色' || level === '黄色预警' ? 'tag-orange' : 'tag-green'
}

function statusTag(status) {
  if (status === '待处置') return 'tag-red'
  if (status === '处理中') return 'tag-orange'
  return 'tag-green'
}

function openAdvance(a) {
  currentAdvanceId.value = a.id
  advanceIsStart.value = a.status === '待处置'
  advanceForm.value = { operator: '园区运维员', remark: '', images: [] }
  advanceTitle.value = advanceIsStart.value ? '开始处置' : '完成处置'
  advancePlaceholder.value = advanceIsStart.value ? '请填写处置措施，如：已通知企业减排、到场核查等' : '请填写处置结果，如：复测达标、问题已解决等'
  advanceOpen.value = true
}

function onPickImages(e) {
  const files = Array.from(e.target.files || [])
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => { advanceForm.value.images.push(reader.result) }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

async function submitAdvance() {
  if (!advanceForm.value.operator.trim()) { showToast('请填写处置人'); return }
  if (!advanceForm.value.remark.trim()) { showToast('请填写处置说明'); return }
  const res = await advanceAlert('water', currentAdvanceId.value, {
    operator: advanceForm.value.operator.trim(),
    remark: advanceForm.value.remark.trim(),
    images: advanceForm.value.images,
  })
  if (res) {
    showSuccessToast('处置流程已推进')
    advanceOpen.value = false
    waterAlerts.value = (await getWaterAlerts()) || []
  }
}

// 从首页实时预警记录跳转：切到预警记录 Tab 并定位到对应那条
function locateAlert() {
  const alertId = route.query.alert
  highlightId.value = alertId ? String(alertId) : ''
  if (alertId) {
    active.value = 2
    nextTick(() => {
      setTimeout(() => {
        const el = document.getElementById('alert-' + highlightId.value)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    })
  }
}

onMounted(async () => {
  const [rt, ind, rain, alerts] = await Promise.all([
    getWaterRealtime(),
    getWaterIndicators(),
    getRainMonitors(),
    getWaterAlerts(),
  ])
  waterRealtime.value = rt || []
  waterIndicators.value = ind || []
  rainMonitors.value = rain || []
  waterAlerts.value = alerts || []
  locateAlert()
})

// keep-alive 缓存下再次进入时 onMounted 不重跑，用 onActivated 兜底定位
onActivated(locateAlert)
</script>

<style scoped>
.tab-body {
  padding-top: 0.16rem;
}

/* 预警记录筛选栏 */
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

.point-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.point-name {
  color: #182230;
  font-size: 0.3rem;
  font-weight: 700;
}

.factor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.2rem 0.16rem;
  margin-top: 0.2rem;
}

.factor {
  display: flex;
  flex-direction: column;
}

.f-name {
  color: #8c98a8;
  font-size: 0.2rem;
}

.f-value {
  margin-top: 0.04rem;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.f-value i {
  margin-left: 0.04rem;
  color: #8c98a8;
  font-size: 0.18rem;
  font-style: normal;
  font-weight: 400;
}

.point-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.16rem;
  padding-top: 0.14rem;
  border-top: 1px solid #f0f2f5;
}

.point-time {
  color: #8c98a8;
  font-size: 0.2rem;
}

.history-btn {
  padding: 0.06rem 0.24rem;
  color: #1677ff;
  font-size: 0.22rem;
  background: #eaf3ff;
  border: none;
  border-radius: 0.24rem;
}

/* ===== 排污口历史数据 ===== */
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.history-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.2rem;
  padding: 0.28rem 0.28rem 0.16rem;
}

.history-title {
  flex: 1;
  overflow: hidden;
  color: #182230;
  font-size: 0.3rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-close {
  color: #8c98a8;
  font-size: 0.36rem;
}

.history-filter {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
  padding: 0 0.28rem 0.08rem;
}

.history-body {
  flex: 1;
  min-height: 0;
  padding: 0 0.28rem calc(0.28rem + env(safe-area-inset-bottom));
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.history-inner {
  min-width: 14rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-wrap {
  flex: 1;
  min-height: 0;
  max-height: 4.6rem;
  overflow-y: auto;
}

.history-table {
  width: 100%;
  min-width: 14rem;
  border-collapse: collapse;
  font-size: 0.22rem;
  white-space: nowrap;
}

.history-table th,
.history-table td {
  padding: 0.16rem 0.14rem;
  text-align: center;
  border: 1px solid #e5e9ef;
}

.history-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: #4a5568;
  font-weight: 600;
  background: #f5f6f8;
}

.history-table td {
  color: #182230;
  background: #fff;
}

.history-table tfoot td {
  position: sticky;
  bottom: 0;
  z-index: 2;
  color: #1677ff;
  font-weight: 600;
  background: #eef5ff;
}

.th-time,
.td-time {
  text-align: left;
}

.td-time {
  color: #4a5568;
  font-weight: 500;
}

.td-status .status-tag {
  display: inline-block;
}

.th-name {
  font-weight: 600;
}

.th-unit {
  margin-top: 0.02rem;
  color: #a8b0bd;
  font-size: 0.18rem;
  font-weight: 400;
}

/* ===== 历史数据曲线图 ===== */
.chart-card {
  flex-shrink: 0;
  min-width: 14rem;
  margin-bottom: 0.2rem;
  padding: 0.24rem 0.2rem 0.16rem;
  background: #fff;
  border-radius: 0.12rem;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.12rem;
}

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.06rem;
  padding: 0.06rem 0.2rem;
  color: #8c98a8;
  font-size: 0.2rem;
  background: #f5f6f8;
  border-radius: 0.24rem;
}

.legend-chip i {
  width: 0.16rem;
  height: 0.16rem;
  border-radius: 50%;
}

.legend-chip.active {
  color: #182230;
  font-weight: 600;
  background: #fff;
  border: 1px solid #e5e9ef;
}

.trend-svg {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 0.16rem;
}

.grid-line {
  stroke: #eef1f5;
  stroke-width: 1;
}

.axis-text {
  fill: #8c98a8;
  font-size: 10px;
}

.trend-line {
  stroke-width: 1.6;
}

.crosshair {
  stroke: #c3cbd6;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.tip-time {
  fill: #182230;
  font-size: 10px;
  font-weight: 600;
}

.tip-line {
  fill: #4a5568;
  font-size: 10px;
}

/* ===== 雨排口视频监控 ===== */
.rain-card {
  cursor: pointer;
}

.rain-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rain-info {
  display: flex;
  align-items: center;
  gap: 0.14rem;
  min-width: 0;
}

.rain-icon {
  color: #1677ff;
  font-size: 0.4rem;
}

.rain-name {
  color: #182230;
  font-size: 0.3rem;
  font-weight: 700;
}

.rain-live {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  color: #16b364;
  font-size: 0.22rem;
}

.rain-dot {
  width: 0.14rem;
  height: 0.14rem;
  border-radius: 50%;
  background: #16b364;
  animation: rain-pulse 1.4s ease-in-out infinite;
}

@keyframes rain-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.rain-offline {
  color: #c3cbd6;
  font-size: 0.22rem;
}

.rain-video-popup {
  width: 84%;
  overflow: hidden;
}

.video-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.24rem 0.28rem;
  border-bottom: 1px solid #f0f2f5;
}

.video-title {
  color: #182230;
  font-size: 0.28rem;
  font-weight: 700;
}

.video-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.16rem;
  aspect-ratio: 16 / 9;
  color: #8c98a8;
  background: #f5f7fa;
}

.video-placeholder-icon {
  font-size: 0.72rem;
  color: #c3cbd6;
}

.video-placeholder-text {
  font-size: 0.24rem;
  letter-spacing: 0.04rem;
}

.alert-card {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.alert-card.is-target {
  outline: 2px solid #1677ff;
  outline-offset: 2px;
  background: #f0f7ff;
}

.alert-head {
  display: flex;
  align-items: center;
  gap: 0.12rem;
}

.alert-title {
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
}

.alert-desc {
  color: #4a5568;
  font-size: 0.22rem;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  margin-top: 0.1rem;
  padding: 0.16rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.log-item {
  padding-left: 0.16rem;
  border-left: 2px solid #1677ff;
}

.log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.log-action {
  color: #182230;
  font-size: 0.22rem;
  font-weight: 600;
}

.log-meta {
  color: #8c98a8;
  font-size: 0.18rem;
}

.log-remark {
  margin-top: 0.04rem;
  color: #4a5568;
  font-size: 0.2rem;
  line-height: 1.6;
}

.handle-btn {
  align-self: flex-end;
  margin-top: 0.12rem;
  padding: 0.1rem 0.28rem;
  color: #fff;
  font-size: 0.22rem;
  background: #1677ff;
  border: none;
  border-radius: 0.24rem;
}

.view-process-btn {
  align-self: flex-end;
  margin-top: 0.12rem;
  padding: 0.1rem 0.28rem;
  color: #1677ff;
  font-size: 0.22rem;
  background: #eaf3ff;
  border: none;
  border-radius: 0.24rem;
}

.log-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.12rem;
  margin-top: 0.1rem;
}

.log-img {
  width: 1.6rem;
  height: 1.2rem;
  object-fit: cover;
  border-radius: 0.08rem;
}

/* 推进处置弹窗 */
.advance-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.advance-title {
  padding: 0.28rem 0.28rem 0.16rem;
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
  text-align: center;
}

.advance-body {
  padding: 0 0.28rem;
}

.af-label {
  margin: 0.16rem 0 0.08rem;
  color: #4a5568;
  font-size: 0.24rem;
}

.af-input {
  width: 100%;
  padding: 0.16rem 0.2rem;
  color: #182230;
  font-size: 0.26rem;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  outline: none;
}

.af-textarea {
  width: 100%;
  padding: 0.16rem 0.2rem;
  color: #182230;
  font-size: 0.24rem;
  line-height: 1.6;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  outline: none;
  resize: none;
}

.af-input:focus,
.af-textarea:focus {
  border-color: #1677ff;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.16rem;
  margin-top: 0.12rem;
}

.photo-item {
  position: relative;
  width: 1.6rem;
  height: 1.6rem;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.08rem;
}

.photo-del {
  position: absolute;
  top: -0.12rem;
  right: -0.12rem;
  display: grid;
  width: 0.4rem;
  height: 0.4rem;
  place-items: center;
  color: #fff;
  font-size: 0.3rem;
  line-height: 1;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
}

.photo-add {
  display: grid;
  width: 1.6rem;
  height: 1.6rem;
  place-items: center;
  color: #c3cbd6;
  font-size: 0.6rem;
  background: #f5f6f8;
  border: 1px dashed #d5dbe3;
  border-radius: 0.08rem;
}

.photo-input {
  display: none;
}

.af-unit {
  margin-top: 0.12rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.advance-actions {
  display: flex;
  gap: 0.2rem;
  padding: 0.24rem 0.28rem;
  margin-top: 0.24rem;
}

.aa-btn {
  flex: 1;
  padding: 0.16rem 0;
  color: #4a5568;
  font-size: 0.28rem;
  background: #f0f2f5;
  border: none;
  border-radius: 0.24rem;
}

.aa-btn.primary {
  color: #fff;
  background: #1677ff;
}

.img-preview-popup {
  padding: 0.16rem;
  border-radius: 0.16rem;
}

.img-preview {
  display: block;
  width: 80vw;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 0.12rem;
}
</style>
