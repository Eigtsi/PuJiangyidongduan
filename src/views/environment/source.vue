<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">企业源头管控</div>
        <div class="right" />
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content">
      <van-tabs v-model:active="active" shrink>
        <van-tab title="环保设备监控">
          <div class="tab-body">
            <div v-for="e in elecMonitors" :key="e.id" class="card">
              <div class="elec-head">
                <span class="elec-name">{{ e.enterpriseName }}</span>
                <span class="status-tag" :class="e.alarmStatus === '正常' ? 'tag-green' : 'tag-red'">{{ e.alarmStatus }}</span>
              </div>
              <div class="elec-region">{{ e.region }}</div>
              <div class="elec-metrics">
                <div class="elec-metric">
                  <span class="e-label">生产功率</span>
                  <span class="e-value">{{ e.prodUsage }}<i>kW</i></span>
                  <span class="e-threshold">阈值 {{ e.prodThreshold }} kW</span>
                </div>
                <div class="elec-metric">
                  <span class="e-label">环保功率</span>
                  <span class="e-value" :class="{ red: e.alarmStatus !== '正常' }">{{ e.treatUsage }}<i>kW</i></span>
                  <span class="e-threshold">阈值 {{ e.treatThreshold }} kW</span>
                </div>
              </div>
              <div class="elec-time">监测时间 {{ e.monitorTime }}</div>
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
                <span class="alert-title">{{ a.point }} · {{ a.indicator }}</span>
                <span class="status-tag" :class="statusTag(a.status)">{{ a.status }}</span>
              </div>
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
              <button v-if="a.status === '已处置'" class="view-process-btn" @click="toggleProcess(a.id)">
                {{ expandedProcess[a.id] ? '收起流程' : '查看流程' }}
              </button>
              <button v-else class="handle-btn" @click="openAdvance(a)">
                {{ a.status === '未处置' ? '开始处置' : '完成处置' }}
              </button>
            </div>
            <van-empty v-if="!filteredAlerts.length" description="暂无匹配的预警记录" image-size="64" />
          </div>
        </van-tab>
      </van-tabs>
    </div>

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
  </div>
</template>

<script setup>
import { computed, nextTick, onActivated, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getElecMonitors, getElecAlerts, advanceAlert } from '@/api/environment'

const router = useRouter()
const route = useRoute()
const active = ref(0)
const elecMonitors = ref([])
const elecAlerts = ref([])
const highlightId = ref('')

// 推进处置弹窗（处置人 + 处置说明 + 现场照片，对齐 PC 端）
const advanceOpen = ref(false)
const advanceIsStart = ref(true)
const advanceTitle = ref('')
const advancePlaceholder = ref('')
const currentAdvanceId = ref(null)
const advanceForm = ref({ operator: '园区运维员', remark: '', images: [] })

// 现场照片预览
const previewUrl = ref('')
const previewOpen = ref(false)

// 已处置预警：默认收起处置流程，点「查看流程」展开
const expandedProcess = ref({})
function toggleProcess(id) {
  expandedProcess.value[id] = !expandedProcess.value[id]
}
function showProcess(a) {
  if (a.status !== '已处置') return true
  return !!expandedProcess.value[a.id]
}

// 预警记录筛选：状态 + 时间
const statusOptions = ['全部', '未处置', '处置中', '已处置']
const statusFilter = ref('全部')
const dateRange = ref([])
const showFilterCalendar = ref(false)
const filterMinDate = new Date(2025, 0, 1)
const filterMaxDate = new Date(2025, 11, 31)

const filteredAlerts = computed(() => {
  let list = elecAlerts.value || []
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

function statusTag(status) {
  if (status === '未处置') return 'tag-red'
  if (status === '处置中') return 'tag-orange'
  return 'tag-green'
}

function openAdvance(a) {
  currentAdvanceId.value = a.id
  advanceIsStart.value = a.status === '未处置'
  advanceForm.value = { operator: '园区运维员', remark: '', images: [] }
  advanceTitle.value = advanceIsStart.value ? '开始处置' : '完成处置'
  advancePlaceholder.value = advanceIsStart.value ? '请填写处置措施，如：已通知企业现场核查、督促开启环保设备等' : '请填写处置结果，如：环保设备已开启、功率恢复正常等'
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

function previewImage(url) {
  previewUrl.value = url
  previewOpen.value = true
}

async function submitAdvance() {
  if (!advanceForm.value.operator.trim()) { showToast('请填写处置人'); return }
  if (!advanceForm.value.remark.trim()) { showToast('请填写处置说明'); return }
  const res = await advanceAlert('elec', currentAdvanceId.value, {
    operator: advanceForm.value.operator.trim(),
    remark: advanceForm.value.remark.trim(),
    images: advanceForm.value.images,
  })
  if (res) {
    showSuccessToast('处置流程已推进')
    advanceOpen.value = false
    elecAlerts.value = (await getElecAlerts()) || []
  }
}

// 从首页实时预警记录跳转：切到预警记录 Tab 并定位到对应那条
function locateAlert() {
  const alertId = route.query.alert
  highlightId.value = alertId ? String(alertId) : ''
  if (alertId) {
    active.value = 1
    nextTick(() => {
      setTimeout(() => {
        const el = document.getElementById('alert-' + highlightId.value)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    })
  }
}

onMounted(async () => {
  const [elec, alerts] = await Promise.all([
    getElecMonitors(),
    getElecAlerts(),
  ])
  elecMonitors.value = elec || []
  elecAlerts.value = alerts || []
  locateAlert()
})

// keep-alive 缓存下再次进入时 onMounted 不重跑，用 onActivated 兜底定位
onActivated(locateAlert)
</script>

<style scoped>
.tab-body {
  padding-top: 0.16rem;
}

.elec-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.elec-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.elec-head .status-tag {
  flex-shrink: 0;
  white-space: nowrap;
}

.elec-region {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.elec-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.16rem;
  margin-top: 0.16rem;
}

.elec-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.16rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.e-label {
  color: #8c98a8;
  font-size: 0.2rem;
}

.e-value {
  margin-top: 0.04rem;
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.e-value i {
  margin-left: 0.04rem;
  color: #8c98a8;
  font-size: 0.18rem;
  font-style: normal;
  font-weight: 400;
}

.e-value.red {
  color: #e6535a;
}

.e-threshold {
  margin-top: 0.02rem;
  color: #8c98a8;
  font-size: 0.18rem;
}

.elec-time {
  margin-top: 0.16rem;
  padding-top: 0.14rem;
  color: #8c98a8;
  font-size: 0.2rem;
  border-top: 1px solid #f0f2f5;
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
  justify-content: space-between;
  gap: 0.12rem;
}

.alert-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-head .status-tag {
  flex-shrink: 0;
  white-space: nowrap;
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
