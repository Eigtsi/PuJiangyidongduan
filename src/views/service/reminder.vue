<template>
  <div class="service-panel">
    <div class="date-filter">
      <input v-model="startDate" type="date" class="date-input" />
      <span class="date-sep">至</span>
      <input v-model="endDate" type="date" class="date-input" />
      <button v-if="startDate || endDate" class="date-clear" @click="clearDate">清除</button>
    </div>
    <van-tabs v-model:active="active" shrink>
      <van-tab title="缴款提醒">
        <div class="tab-body">
          <div v-for="r in filteredPayment" :key="r.id" class="remind-item">
            <div class="rm-head">
              <span class="rm-name">{{ r.enterpriseName }}</span>
              <span class="status-tag" :class="r.status === '已逾期' ? 'tag-red' : 'tag-orange'">{{ r.status }}</span>
            </div>
            <div class="rm-meta">{{ r.feeType }} · 到期 {{ r.dueDate }}</div>
            <div class="rm-foot">
              <span class="rm-amount">¥ {{ formatNumber(r.amount) }}<i>元</i></span>
              <button class="rm-btn" @click="send('payment', r)">发送提醒</button>
            </div>
          </div>
          <van-empty v-if="!filteredPayment.length" description="暂无缴款提醒" image-size="64" />
        </div>
      </van-tab>

      <van-tab title="合同到期">
        <div class="tab-body">
          <div v-for="r in filteredContract" :key="r.id" class="remind-item">
            <div class="rm-head">
              <span class="rm-name">{{ r.enterpriseName }}</span>
              <span class="status-tag" :class="contractTag(r.status)">{{ r.status }}</span>
            </div>
            <div class="rm-meta">{{ r.contractNo }} · {{ r.leaseTarget }}</div>
            <div class="rm-meta">到期 {{ r.dueDate }}</div>
            <div class="rm-foot">
              <span class="rm-days" :class="{ danger: r.remainDays < 0 }">{{ remainLabel(r.remainDays) }}</span>
              <button class="rm-btn" @click="send('contract', r)">发送提醒</button>
            </div>
          </div>
          <van-empty v-if="!filteredContract.length" description="暂无合同到期提醒" image-size="64" />
        </div>
      </van-tab>

      <van-tab title="设备提醒">
        <div class="tab-body">
          <div v-for="r in filteredEquipment" :key="r.id" class="remind-item">
            <div class="rm-head">
              <span class="rm-name">{{ r.enterpriseName }}</span>
              <span class="status-tag" :class="equipmentTag(r.status)">{{ r.status }}</span>
            </div>
            <div class="rm-meta">{{ r.equipmentName }} · {{ r.reminderType }}</div>
            <div class="rm-meta">到期 {{ r.dueDate }}</div>
            <div class="rm-foot">
              <span class="rm-days" :class="{ danger: r.remainDays < 0 }">{{ remainLabel(r.remainDays) }}</span>
              <button class="rm-btn" @click="send('equipment', r)">发送提醒</button>
            </div>
          </div>
          <van-empty v-if="!filteredEquipment.length" description="暂无设备提醒" image-size="64" />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { getPaymentReminders, getContractReminders, getEquipmentReminders, sendReminder } from '@/api/service'
import { formatNumber } from '@/utils/format'

const active = ref(0)
const paymentList = ref([])
const contractList = ref([])
const equipmentList = ref([])
const startDate = ref('')
const endDate = ref('')

function clearDate() {
  startDate.value = ''
  endDate.value = ''
}

function filterByDate(list) {
  let result = list
  if (startDate.value) result = result.filter((r) => r.dueDate >= startDate.value)
  if (endDate.value) result = result.filter((r) => r.dueDate <= endDate.value)
  return result
}

const filteredPayment = computed(() => filterByDate(paymentList.value))
const filteredContract = computed(() => filterByDate(contractList.value))
const filteredEquipment = computed(() => filterByDate(equipmentList.value))

function contractTag(s) {
  if (s === '已到期') return 'tag-red'
  if (s === '即将到期') return 'tag-orange'
  return 'tag-green'
}

function equipmentTag(s) {
  if (s === '已过期') return 'tag-red'
  if (s === '即将到期') return 'tag-orange'
  return 'tag-green'
}

function remainLabel(days) {
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  return `剩余 ${days} 天`
}

async function send(type, r) {
  await sendReminder(type, r.id)
  showSuccessToast('提醒已发送')
}

onMounted(async () => {
  const [p, c, e] = await Promise.all([getPaymentReminders(), getContractReminders(), getEquipmentReminders()])
  paymentList.value = p.rows || []
  contractList.value = c.rows || []
  equipmentList.value = e.rows || []
})
</script>

<style scoped>
.date-filter {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.16rem;
}

.date-input {
  flex: 1;
  min-width: 0;
  padding: 0.12rem 0.16rem;
  color: #182230;
  font-size: 0.22rem;
  background: #f7f8fa;
  border: 1px solid #e5e9ef;
  border-radius: 0.08rem;
}

.date-sep {
  flex-shrink: 0;
  color: #8c98a8;
  font-size: 0.22rem;
}

.date-clear {
  flex-shrink: 0;
  padding: 0.12rem 0;
  color: #1677ff;
  font-size: 0.22rem;
  background: transparent;
  border: none;
}

.tab-body {
  padding-top: 0.24rem;
}

.remind-item {
  margin-bottom: 0.16rem;
  padding: 0.2rem;
  background: #fff;
  border-radius: 0.12rem;
  box-shadow: 0 0.08rem 0.24rem rgba(24, 34, 48, 0.04);
}

.rm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.rm-name {
  overflow: hidden;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rm-meta {
  margin-top: 0.08rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.rm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.14rem;
}

.rm-amount {
  color: #e6535a;
  font-size: 0.3rem;
  font-weight: 700;
}

.rm-amount i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.rm-days {
  color: #8c98a8;
  font-size: 0.22rem;
}

.rm-days.danger {
  color: #e6535a;
  font-weight: 600;
}

.rm-btn {
  padding: 0.12rem 0.28rem;
  color: #1677ff;
  font-size: 0.24rem;
  background: #eaf3ff;
  border: none;
  border-radius: 0.08rem;
}
</style>
