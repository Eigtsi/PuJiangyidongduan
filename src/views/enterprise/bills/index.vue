<template>
  <div class="page ent-bills-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>我的账单</h1>
        <span class="page-header-park">{{ userStore.enterpriseName }}</span>
      </div>
    </ShellHeaderPortal>

    <div v-if="categories.length" class="content-padding">
      <!-- 费用概览 -->
      <section class="card">
        <div class="card-title">费用概览</div>
        <div class="time-filter" @click="openTimePicker">
          <span class="time-label">统计时间</span>
          <span class="time-value">{{ timeLabel }}</span>
          <van-icon name="arrow-down" class="time-arrow" />
        </div>
        <div class="fee-grid">
          <div v-for="c in categories" :key="c.name" class="fee-card">
            <div class="fee-name">{{ c.name }}</div>
            <div class="fee-value">{{ formatNumber(c.amount) }}<i>元</i></div>
          </div>
        </div>
      </section>

      <!-- 账单明细 -->
      <section class="card">
        <div class="card-title">账单明细</div>
        <div class="status-chips">
          <span v-for="s in statusOptions" :key="s" class="filter-chip" :class="{ active: statusFilter === s }" @click="statusFilter = s">{{ s }}</span>
        </div>
        <div class="bill-list">
          <div v-for="b in filtered" :key="b.id" class="bill-item" @click="openDetail(b)">
            <div class="bill-head">
              <span class="bill-name">{{ b.feeType }} · {{ b.period }}</span>
              <span class="status-tag" :class="b.status === '未缴' ? 'tag-orange' : 'tag-green'">{{ b.status }}</span>
            </div>
            <div class="bill-meta">用量 {{ b.usage }} · 单价 {{ b.unitPrice }}</div>
            <div class="bill-amount">¥ {{ formatNumber(b.amount) }}<i>元</i></div>
          </div>
          <van-empty v-if="!filtered.length" description="暂无账单" image-size="64" />
        </div>
      </section>
    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>

    <!-- 账单详情 / 在线缴费 -->
    <van-popup v-model:show="showDetail" position="bottom" round class="detail-popup">
      <div v-if="detail" class="pay-detail">
        <div class="pd-head">
          <div class="pd-title">{{ detail.feeType }} · {{ detail.period }}</div>
          <span class="status-tag" :class="detail.status === '未缴' ? 'tag-orange' : 'tag-green'">{{ detail.status }}</span>
        </div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">用量</span>
            <span class="value">{{ detail.usage }}</span>
          </div>
          <div class="info-row">
            <span class="label">单价</span>
            <span class="value">{{ detail.unitPrice }}</span>
          </div>
          <div class="info-row">
            <span class="label">应缴金额</span>
            <span class="value">{{ formatNumber(detail.amount) }} 元</span>
          </div>
          <div class="info-row">
            <span class="label">缴费状态</span>
            <span class="value">{{ detail.status }}</span>
          </div>
        </div>
        <button v-if="detail.status === '未缴'" class="pay-btn" @click="pay">在线缴费</button>
      </div>
    </van-popup>

    <!-- 时间选择（按年/按月） -->
    <van-popup v-model:show="showTimePicker" position="bottom" round>
      <van-picker v-model="pickerValue" :columns="timeColumns" @confirm="onTimeConfirm" @cancel="showTimePicker = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { useUserStore } from '@/store/user'
import { getEnterpriseBills, payBill } from '@/api/enterprise-service'
import { formatNumber } from '@/utils/format'

const userStore = useUserStore()
const categories = ref([])
const bills = ref([])
const statusOptions = ['全部', '待缴', '已缴']
const statusFilter = ref('全部')
const showDetail = ref(false)
const detail = ref(null)
const year = ref('2026')
const month = ref('')
const showTimePicker = ref(false)
const pickerValue = ref(['2026', ''])
const yearOptions = [
  { text: '2025年', value: '2025' },
  { text: '2026年', value: '2026' },
]
const monthOptions = [
  { text: '全年', value: '' },
  ...Array.from({ length: 12 }, (_, i) => ({ text: `${i + 1}月`, value: String(i + 1) })),
]
const timeColumns = [yearOptions, monthOptions]
const timeLabel = computed(() => (month.value ? `${year.value}年${month.value}月` : `${year.value}年`))

const filtered = computed(() => {
  if (statusFilter.value === '待缴') return bills.value.filter((b) => b.status === '未缴')
  if (statusFilter.value === '已缴') return bills.value.filter((b) => b.status === '已缴')
  return bills.value
})

function openTimePicker() {
  pickerValue.value = [year.value, month.value]
  showTimePicker.value = true
}

function onTimeConfirm({ selectedValues }) {
  showTimePicker.value = false
  year.value = selectedValues[0] || '2026'
  month.value = selectedValues[1] || ''
  load()
}

function openDetail(b) {
  detail.value = b
  showDetail.value = true
}

async function pay() {
  await payBill(detail.value.id)
  showSuccessToast('缴费成功')
  showDetail.value = false
  await load()
}

async function load() {
  const params = { year: year.value }
  if (month.value) params.month = month.value
  const data = await getEnterpriseBills(params)
  categories.value = data.categories || []
  bills.value = data.bills || []
}

onMounted(load)
</script>

<style scoped>
.time-filter {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.2rem;
  padding: 0.12rem 0.16rem;
  background: #f7f8fa;
  border: 1px solid #e5e9ef;
  border-radius: 0.08rem;
}

.time-label {
  color: #8c98a8;
  font-size: 0.22rem;
}

.time-value {
  flex: 1;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.time-arrow {
  color: #c3cbd6;
  font-size: 0.24rem;
}

.fee-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.16rem;
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

.status-chips {
  display: flex;
  gap: 0.12rem;
  margin-bottom: 0.16rem;
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

.bill-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.bill-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.bill-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.bill-name {
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.bill-meta {
  margin-top: 0.08rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.bill-amount {
  margin-top: 0.1rem;
  color: #182230;
  font-size: 0.28rem;
  font-weight: 700;
}

.bill-amount i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.detail-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.pay-detail {
  padding: 0.32rem;
}

.pd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
  margin-bottom: 0.24rem;
}

.pd-title {
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.pay-btn {
  width: 100%;
  margin-top: 0.28rem;
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
