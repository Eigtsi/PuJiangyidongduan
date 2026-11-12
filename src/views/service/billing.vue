<template>
  <div class="service-panel">
    <div v-if="list.length">
      <!-- 园区费用总览 -->
      <section class="card">
        <div class="card-title">园区费用总览</div>
        <div class="year-filter" @click="showYearPicker = true">
          <span class="year-label">统计年份</span>
          <span class="year-value">{{ year }}年</span>
          <van-icon name="arrow-down" class="year-arrow" />
        </div>
        <div class="fee-grid">
          <div v-for="f in parkFees" :key="f.name" class="fee-card">
            <div class="fee-name">{{ f.name }}</div>
            <div class="fee-value">{{ f.amount }}<i>万元</i></div>
          </div>
        </div>
      </section>

      <!-- 年份选择 -->
      <van-popup v-model:show="showYearPicker" position="bottom" round>
        <van-picker v-model="pickerValue" :columns="yearColumns" @confirm="onYearConfirm" @cancel="showYearPicker = false" />
      </van-popup>

      <!-- 企业费用明细 -->
      <section class="card">
        <div class="card-title">企业费用明细</div>
        <div class="enterprise-list">
          <div v-for="e in list" :key="e.enterpriseId" class="enterprise-item" @click="openDetail(e)">
            <div class="ep-head">
              <span class="ep-name">{{ e.enterpriseName }}</span>
              <span class="ep-unpaid">未收 {{ formatWan(e.unpaid) }}万</span>
            </div>
            <div class="progress-row">
              <span class="p-name">缴费率</span>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: e.payRate + '%' }" />
              </div>
              <span class="p-value">{{ e.payRate }}%</span>
            </div>
            <div class="ep-foot">
              <span>应收 {{ formatWan(e.total) }}万</span>
              <van-icon name="arrow" class="ep-arrow" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>

    <!-- 企业费用明细弹层 -->
    <van-popup v-model:show="showDetail" position="bottom" round class="detail-popup">
      <div v-if="detail" class="billing-detail">
        <div class="bd-head">
          <div class="bd-title">{{ detail.enterpriseName }}</div>
          <div class="bd-total">应收 {{ formatWan(totalOf(detail)) }}万 · 未收 {{ formatWan(unpaidOf(detail)) }}万</div>
        </div>

        <div class="fee-grid">
          <div v-for="f in feeCards" :key="f.name" class="fee-card">
            <div class="fee-name">{{ f.name }}</div>
            <div class="fee-value">{{ formatNumber(f.amount) }}<i>元</i></div>
          </div>
        </div>

        <div class="bd-list">
          <div v-for="d in detail.details" :key="d.id" class="bd-row">
            <div class="bd-row-head">
              <span class="bd-fee">{{ d.feeType }} · {{ d.period }}</span>
              <span class="status-tag" :class="d.status === '已缴' ? 'tag-green' : 'tag-orange'">{{ d.status }}</span>
            </div>
            <div class="bd-row-meta">用量 {{ d.usage }} · 单价 {{ d.unitPrice }}</div>
            <div class="bd-row-amount">
              <span>应收 {{ formatNumber(d.receivable) }} 元</span>
              <span>实收 <b>{{ formatNumber(d.actual) }} 元</b></span>
            </div>
          </div>
        </div>

        <button class="remind-btn" @click="sendRemind">发送催缴通知</button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { getBillingOverview, getBillingDetail, sendBillingRemind, getParkFeeStats } from '@/api/service'
import { formatWan, formatNumber } from '@/utils/format'

const list = ref([])
const showDetail = ref(false)
const detail = ref(null)
const year = ref(new Date().getFullYear())
const showYearPicker = ref(false)
const pickerValue = ref([year.value])
const yearColumns = Array.from({ length: 7 }, (_, i) => {
  const y = year.value - 6 + i
  return { text: `${y}年`, value: y }
})
const parkFees = ref([])

const feeCards = computed(() => {
  if (!detail.value) return []
  const s = detail.value.summary || {}
  return [
    { name: '水费', amount: s.waterAmount },
    { name: '电费', amount: s.electricityAmount },
    { name: '压缩空气费', amount: s.gasAmount },
    { name: '固废处理费', amount: s.solidWasteAmount },
    { name: '物业费', amount: s.propertyAmount },
    { name: '租金', amount: s.rentAmount },
  ]
})

function totalOf(e) {
  return e.details.reduce((s, d) => s + d.actual, 0)
}
function unpaidOf(e) {
  return e.details.filter((d) => d.status === '未缴').reduce((s, d) => s + d.actual, 0)
}

async function openDetail(e) {
  detail.value = await getBillingDetail(e.enterpriseId)
  showDetail.value = true
}

async function sendRemind() {
  await sendBillingRemind(detail.value.enterpriseId)
  showSuccessToast('催缴通知已发送')
}

function onYearConfirm({ selectedValues }) {
  showYearPicker.value = false
  const y = Number(selectedValues[0])
  if (y === year.value) return
  year.value = y
  loadParkFees()
}

async function loadParkFees() {
  const res = await getParkFeeStats(year.value)
  parkFees.value = (res && res.items) || []
}

onMounted(async () => {
  const res = await getBillingOverview()
  list.value = res.rows || []
  await loadParkFees()
})
</script>

<style scoped>
.year-filter {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.2rem;
  padding: 0.12rem 0.16rem;
  background: #f7f8fa;
  border: 1px solid #e5e9ef;
  border-radius: 0.08rem;
}

.year-label {
  color: #8c98a8;
  font-size: 0.22rem;
}

.year-value {
  flex: 1;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.year-arrow {
  color: #c3cbd6;
  font-size: 0.24rem;
}

.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.enterprise-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.ep-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
  margin-bottom: 0.12rem;
}

.ep-name {
  overflow: hidden;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ep-unpaid {
  flex-shrink: 0;
  color: #e6535a;
  font-size: 0.22rem;
  font-weight: 600;
}

.ep-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.12rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.ep-arrow {
  color: #c3cbd6;
  font-size: 0.24rem;
}

.detail-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.billing-detail {
  padding: 0.32rem;
}

.bd-head {
  margin-bottom: 0.24rem;
}

.bd-title {
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.bd-total {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.22rem;
}

.fee-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.16rem;
  margin-bottom: 0.24rem;
}

.fee-card {
  padding: 0.2rem 0.12rem;
  text-align: center;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.fee-name {
  color: #4a5568;
  font-size: 0.22rem;
}

.fee-value {
  margin-top: 0.08rem;
  color: #182230;
  font-size: 0.28rem;
  font-weight: 700;
}

.fee-value i {
  margin-left: 0.04rem;
  font-size: 0.18rem;
  font-style: normal;
  font-weight: 400;
}

.bd-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  margin-bottom: 0.24rem;
}

.bd-row {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.bd-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.bd-fee {
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.bd-row-meta {
  margin-top: 0.08rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.bd-row-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.1rem;
  color: #4a5568;
  font-size: 0.22rem;
}

.bd-row-amount b {
  color: #182230;
}

.remind-btn {
  width: 100%;
  padding: 0.22rem 0;
  color: #fff;
  font-size: 0.28rem;
  background: #1677ff;
  border: none;
  border-radius: 0.12rem;
}

.unpaid {
  color: #e6535a;
}

.loading-block {
  padding: 1.2rem 0;
}
</style>
