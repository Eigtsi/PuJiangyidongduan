<template>
  <div class="page operation-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>园区运营</h1>
        <span class="page-header-park">浦江中国水晶产业园</span>
      </div>
    </ShellHeaderPortal>

    <div class="content-padding" v-if="ov.parks">
      <!-- 园区切换 -->
      <div class="park-switch">
        <span
          v-for="p in parks"
          :key="p.key"
          class="park-chip"
          :class="{ active: parkKey === p.key }"
          @click="parkKey = p.key"
        >{{ p.name }}</span>
      </div>

      <!-- 收入构成 -->
      <section class="card">
        <div class="comp-head">
          <span class="card-title">收入构成</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: revenueFilter.period === 'yearly' }]" @click="setRevenuePeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: revenueFilter.period === 'monthly' }]" @click="setRevenuePeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showRevenuePicker = true">
              <span>{{ revenueLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="fee-grid">
          <div
            v-for="c in composition"
            :key="c.key"
            class="fee-card"
            :class="{ active: activeType === c.key }"
            @click="activeType = c.key"
          >
            <span class="fee-icon" v-html="feeIcons[c.key]" />
            <div class="fee-body">
              <div class="fee-name">{{ c.name }}</div>
              <div class="fee-value">{{ fmt(c.value) }}<i>万</i></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 租金分析 -->
      <section v-if="activeType === 'rent'" class="card">
        <div class="comp-head">
          <span class="card-title">租金分析</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: rentFilter.period === 'yearly' }]" @click="setRentPeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: rentFilter.period === 'monthly' }]" @click="setRentPeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showRentPicker = true">
              <span>{{ rentLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="dual-name">{{ rentFilter.period === 'yearly' ? '年租金收入' : '月租金收入' }}</div>
        <div class="dual-num">{{ fmt(currentRent) }}<i>万元</i></div>
        <div class="rtype-table">
          <div class="rtype-head-grid">
            <span class="rtype-td name">类型</span>
            <span class="rtype-td group">{{ rentFilter.period === 'yearly' ? '本年' : '本月' }}</span>
            <span class="rtype-td group">{{ rentFilter.period === 'yearly' ? '年度同比' : '上月新增' }}</span>
            <span class="rtype-td">总面积</span>
            <span class="rtype-td">金额</span>
            <span class="rtype-td">总面积</span>
            <span class="rtype-td">金额</span>
          </div>
          <div v-for="t in rentByType" :key="t.type" class="rtype-row">
            <span class="rtype-td name">{{ t.type }}</span>
            <span class="rtype-td">{{ fmt(t.area) }}万m²</span>
            <span class="rtype-td strong">{{ fmt(t.rent) }}万</span>
            <span class="rtype-td" :class="deltaClass(t.areaMoM)">{{ signedDelta(t.areaMoM) }}万m²</span>
            <span class="rtype-td" :class="deltaClass(t.rentMoM)">{{ signedDelta(t.rentMoM) }}万</span>
          </div>
        </div>
      </section>

      <!-- 物业分析 -->
      <section v-else-if="activeType === 'property'" class="card">
        <div class="comp-head">
          <span class="card-title">物业分析</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: propertyFilter.period === 'yearly' }]" @click="setPropertyPeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: propertyFilter.period === 'monthly' }]" @click="setPropertyPeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showPropertyPicker = true">
              <span>{{ propertyLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="dual-name">{{ propertyFilter.period === 'yearly' ? '年物业费收入' : '月物业费收入' }}</div>
        <div class="dual-num">{{ fmt(currentProperty) }}<i>万元</i></div>
        <div class="rtype-table">
          <div class="rtype-head-grid">
            <span class="rtype-td name">类型</span>
            <span class="rtype-td group">{{ propertyFilter.period === 'yearly' ? '本年' : '本月' }}</span>
            <span class="rtype-td group">{{ propertyFilter.period === 'yearly' ? '年度同比' : '上月新增' }}</span>
            <span class="rtype-td">总面积</span>
            <span class="rtype-td">金额</span>
            <span class="rtype-td">总面积</span>
            <span class="rtype-td">金额</span>
          </div>
          <div v-for="t in propertyByType" :key="t.type" class="rtype-row">
            <span class="rtype-td name">{{ t.type }}</span>
            <span class="rtype-td">{{ fmt(t.area) }}万m²</span>
            <span class="rtype-td strong">{{ fmt(t.property) }}万</span>
            <span class="rtype-td" :class="deltaClass(t.areaMoM)">{{ signedDelta(t.areaMoM) }}万m²</span>
            <span class="rtype-td" :class="deltaClass(t.propertyMoM)">{{ signedDelta(t.propertyMoM) }}万</span>
          </div>
        </div>
      </section>

      <!-- 水费分析 -->
      <section v-else-if="activeType === 'water'" class="card">
        <div class="util-head">
          <span class="card-title">水费分析</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: waterFilter.period === 'yearly' }]" @click="setWaterPeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: waterFilter.period === 'monthly' }]" @click="setWaterPeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showWaterPicker = true">
              <span>{{ waterLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="util-stats">
          <div class="util-stat">
            <span class="util-stat-label">用水量</span>
            <span class="util-stat-num">{{ fmtUsage(waterData.usage, '吨') }}</span>
          </div>
          <div class="util-stat">
            <span class="util-stat-label">水费</span>
            <span class="util-stat-num blue">{{ fmt(waterData.fee) }}<i>万元</i></span>
          </div>
        </div>
        <div class="util-rows">
          <div v-for="t in waterData.split" :key="t.name" class="util-row">
            <span class="util-name">{{ t.name }}</span>
            <div class="util-track"><div class="util-fill water" :style="{ width: pctOf(t.fee, waterFeeMax) }" /></div>
            <span class="util-meta">{{ fmtUsage(t.volume, '吨') }} · {{ fmt(t.fee) }}万</span>
          </div>
        </div>
      </section>

      <!-- 电费分析 -->
      <section v-else-if="activeType === 'electricity'" class="card">
        <div class="util-head">
          <span class="card-title">电费分析</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: elecFilter.period === 'yearly' }]" @click="setElecPeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: elecFilter.period === 'monthly' }]" @click="setElecPeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showElecPicker = true">
              <span>{{ elecLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="util-stats">
          <div class="util-stat">
            <span class="util-stat-label">用电量</span>
            <span class="util-stat-num">{{ fmtUsage(electricityData.usage, 'kWh') }}</span>
          </div>
          <div class="util-stat">
            <span class="util-stat-label">电费</span>
            <span class="util-stat-num blue">{{ fmt(electricityData.fee) }}<i>万元</i></span>
          </div>
        </div>
        <div class="util-rows">
          <div v-for="t in electricityData.split" :key="t.name" class="util-row">
            <span class="util-name">{{ t.name }}</span>
            <div class="util-track"><div class="util-fill elec" :style="{ width: pctOf(t.fee, elecFeeMax) }" /></div>
            <span class="util-meta">{{ fmtUsage(t.volume, 'kWh') }} · {{ fmt(t.fee) }}万</span>
          </div>
        </div>
      </section>

      <!-- 停车分析 -->
      <section v-else-if="activeType === 'parking'" class="card">
        <div class="util-head">
          <span class="card-title">停车分析</span>
          <div class="util-head-right">
            <div class="period-switch">
              <span :class="['period-chip', { active: parkingFilter.period === 'yearly' }]" @click="setParkingPeriod('yearly')">年度</span>
              <span :class="['period-chip', { active: parkingFilter.period === 'monthly' }]" @click="setParkingPeriod('monthly')">月度</span>
            </div>
            <div class="period-select" @click="showParkingPicker = true">
              <span>{{ parkingLabel }}</span>
              <van-icon name="arrow-down" />
            </div>
          </div>
        </div>
        <div class="util-stats">
          <div class="util-stat">
            <span class="util-stat-label">停车费收入</span>
            <span class="util-stat-num blue">{{ fmt(parkingFee) }}<i>万元</i></span>
          </div>
          <div class="util-stat">
            <span class="util-stat-label">平均占用率</span>
            <span class="util-stat-num green">{{ occupancyRate }}<i>%</i></span>
          </div>
        </div>
        <div class="parking-cards">
          <div class="pc-item">
            <span class="pc-label">年卡车辆</span>
            <span class="pc-num">{{ ov.parking.yearCardVehicles }}<i>辆</i></span>
          </div>
          <div class="pc-item">
            <span class="pc-label">季卡车辆</span>
            <span class="pc-num">{{ ov.parking.quarterCardVehicles }}<i>辆</i></span>
          </div>
          <div class="pc-item">
            <span class="pc-label">月卡车辆</span>
            <span class="pc-num">{{ ov.parking.monthCardVehicles }}<i>辆</i></span>
          </div>
        </div>
        <div class="sub-title">停车费月度趋势（万元）</div>
        <div class="month-bars">
          <div v-for="(m, i) in ov.parking.monthlyParking" :key="i" class="mb-item" @click="toggleParkBar(i)">
            <span v-if="selectedParkMonth === i" class="mb-value" :style="{ bottom: (m / parkMax) * 1.4 + 0.42 + 'rem' }">{{ m.toFixed(1) }}万</span>
            <div class="mb-bar" :class="{ active: selectedParkMonth === i }" :style="{ height: (m / parkMax) * 1.4 + 'rem' }" />
            <span class="mb-label" :class="{ active: selectedParkMonth === i }">{{ i + 1 }}月</span>
          </div>
        </div>
      </section>

      <!-- 废渣处置 -->
      <section v-else-if="activeType === 'solidWaste'" class="card">
        <div class="comp-head">
          <span class="card-title">废渣处置</span>
          <div class="period-select" @click="showResidueYearPicker = true">
            <span>{{ residueYear }}年度</span>
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="residue-kpis">
          <div class="ps-item">
            <span class="ps-label">核定企业数</span>
            <span class="ps-num">{{ residueEnterprises }}<i>家</i></span>
          </div>
          <div class="ps-item">
            <span class="ps-label">核定设备数</span>
            <span class="ps-num green">{{ residueDevices }}<i>台</i></span>
          </div>
          <div class="ps-item">
            <span class="ps-label">缴费金额</span>
            <span class="ps-num blue">{{ residueAmount }}<i>元</i></span>
          </div>
        </div>
        <div class="sub-title">分档征收明细</div>
        <div class="residue-list">
          <div v-for="t in residueTiers" :key="t.tier" class="residue-row">
            <span class="residue-tier">{{ t.tier }}</span>
            <span class="residue-price">{{ t.price }}元/年/台</span>
            <span class="residue-dev">{{ t.deviceCount }}台</span>
            <span class="residue-amount">{{ t.amount }}元</span>
          </div>
        </div>
      </section>

      <!-- 水费年度/月度选择弹层 -->
      <van-popup v-model:show="showWaterPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in waterOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === waterKey }"
            @click="selectWaterPeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 电费年度/月度选择弹层 -->
      <van-popup v-model:show="showElecPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in elecOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === elecKey }"
            @click="selectElecPeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 收入构成年度/月度选择弹层 -->
      <van-popup v-model:show="showRevenuePicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in revenueOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === revenueKey }"
            @click="selectRevenuePeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 租金分析年度/月度选择弹层 -->
      <van-popup v-model:show="showRentPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in rentOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === rentKey }"
            @click="selectRentPeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 物业分析年度/月度选择弹层 -->
      <van-popup v-model:show="showPropertyPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in propertyOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === propertyKey }"
            @click="selectPropertyPeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 停车费年度/月度选择弹层 -->
      <van-popup v-model:show="showParkingPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="opt in parkingOptions"
            :key="opt.key"
            class="period-option"
            :class="{ active: opt.key === parkingKey }"
            @click="selectParkingPeriod(opt.key)"
          >{{ opt.label }}</div>
        </div>
      </van-popup>

      <!-- 废渣处置年度选择弹层 -->
      <van-popup v-model:show="showResidueYearPicker" round position="bottom" class="period-popup">
        <div class="period-popup-list">
          <div
            v-for="y in residueYears"
            :key="y"
            class="period-option"
            :class="{ active: y === residueYear }"
            @click="selectResidueYear(y)"
          >{{ y }}年度</div>
        </div>
      </van-popup>

      <!-- 欠费名单 -->
      <section class="card">
        <div class="comp-head">
          <span class="card-title">欠费企业明细<span class="card-sub">（{{ currentArrears.length }} 条 · 合计 {{ fmt(currentDebt) }}万）</span></span>
          <div class="period-select" @click="showArrearsPicker = true">
            <van-icon name="calendar-o" />
            <span>{{ arrearsDateLabel }}</span>
          </div>
        </div>
        <div class="arrears-list" v-if="currentArrears.length">
          <div v-for="r in currentArrears" :key="r.enterpriseId" class="arrears-row">
            <div class="ar-left">
              <span class="ar-name">{{ r.enterpriseName }}</span>
              <span class="ar-meta">{{ r.feeType }} · 网格员 {{ r.gridWorker }}</span>
              <span class="ar-meta">截止时间 {{ r.deadline }}</span>
            </div>
            <div class="ar-right">
              <span class="ar-amount">{{ r.amount }}万</span>
              <span class="status-tag" :class="statusTag(r.status)">{{ r.status }}</span>
            </div>
          </div>
        </div>
        <van-empty v-else description="该园区暂无欠费" image-size="60" />
      </section>
    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>

    <!-- 欠费名单截止时间范围筛选 -->
    <van-popup v-model:show="showArrearsPicker" position="bottom" round class="date-range-popup">
      <div class="drp">
        <div class="drp-title">选择截止时间范围</div>
        <div class="drp-body">
          <div class="drp-col">
            <span class="drp-tag">开始</span>
            <select v-model.number="arrearsStartYear" class="drp-select">
              <option v-for="y in ARREARS_YEARS" :key="y" :value="y">{{ y }}年</option>
            </select>
            <select v-model.number="arrearsStartMonth" class="drp-select">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select v-model.number="arrearsStartDay" class="drp-select">
              <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
          <div class="drp-col">
            <span class="drp-tag">结束</span>
            <select v-model.number="arrearsEndYear" class="drp-select">
              <option v-for="y in ARREARS_YEARS" :key="y" :value="y">{{ y }}年</option>
            </select>
            <select v-model.number="arrearsEndMonth" class="drp-select">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select v-model.number="arrearsEndDay" class="drp-select">
              <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
            </select>
          </div>
        </div>
        <div class="drp-actions">
          <button class="drp-btn cancel" @click="showArrearsPicker = false">取消</button>
          <button class="drp-btn confirm" @click="confirmArrearsRange">确定</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getOperationOverview } from '@/api/operation'

const ov = ref({})
const parkKey = ref('total')

// 费用类型详情切换（默认租金分析）
const activeType = ref('rent')

// 收入构成：年度/月度筛选（默认年度）
const revenueFilter = ref({ period: 'yearly', year: '2025', month: '2026-10' })
const showRevenuePicker = ref(false)
// 租金分析：年度/月度筛选（默认年度）
const rentFilter = ref({ period: 'yearly', year: '2025', month: '2026-10' })
const showRentPicker = ref(false)
// 物业分析：年度/月度筛选（默认年度）
const propertyFilter = ref({ period: 'yearly', year: '2025', month: '2026-10' })
const showPropertyPicker = ref(false)
const REVENUE_YEARS = [
  { key: '2024', label: '2024年', factor: 0.93 },
  { key: '2025', label: '2025年', factor: 1.0 },
  { key: '2026', label: '2026年', factor: 1.07 },
]

// 水电费分析：年度/月度筛选（水、电各自独立）
const waterFilter = ref({ period: 'monthly', year: '2026', month: '2026-10' })
const elecFilter = ref({ period: 'monthly', year: '2026', month: '2026-10' })
const showWaterPicker = ref(false)
const showElecPicker = ref(false)

// 停车费分析：年度/月度筛选（停车费随筛选变）
const parkingFilter = ref({ period: 'monthly', year: '2026', month: '2026-10' })
const showParkingPicker = ref(false)
const selectedParkMonth = ref(-1)

const parks = computed(() => [
  { key: 'total', name: '全园区' },
  ...(ov.value.parks || []),
])

const revenueOptions = computed(() => (revenueFilter.value.period === 'yearly' ? REVENUE_YEARS : ov.value.revenueMonths || []))
const revenueKey = computed(() => (revenueFilter.value.period === 'yearly' ? revenueFilter.value.year : revenueFilter.value.month))
const revenueLabel = computed(() => {
  const opt = revenueOptions.value.find((o) => o.key === revenueKey.value)
  return opt ? opt.label : '-'
})
const revenueFactor = computed(() => {
  const opt = revenueOptions.value.find((o) => o.key === revenueKey.value)
  return opt ? opt.factor : 1
})
const rentOptions = computed(() => (rentFilter.value.period === 'yearly' ? REVENUE_YEARS : ov.value.revenueMonths || []))
const rentKey = computed(() => (rentFilter.value.period === 'yearly' ? rentFilter.value.year : rentFilter.value.month))
const rentLabel = computed(() => {
  const opt = rentOptions.value.find((o) => o.key === rentKey.value)
  return opt ? opt.label : '-'
})
const rentFactor = computed(() => {
  const opt = rentOptions.value.find((o) => o.key === rentKey.value)
  return opt ? opt.factor : 1
})
const propertyOptions = computed(() => (propertyFilter.value.period === 'yearly' ? REVENUE_YEARS : ov.value.revenueMonths || []))
const propertyKey = computed(() => (propertyFilter.value.period === 'yearly' ? propertyFilter.value.year : propertyFilter.value.month))
const propertyLabel = computed(() => {
  const opt = propertyOptions.value.find((o) => o.key === propertyKey.value)
  return opt ? opt.label : '-'
})
const propertyFactor = computed(() => {
  const opt = propertyOptions.value.find((o) => o.key === propertyKey.value)
  return opt ? opt.factor : 1
})
const utilityRatio = computed(() => {
  const w = currentUtility.value.water?.fee || 0
  const e = currentUtility.value.electricity?.fee || 0
  return w + e ? w / (w + e) : 0.5
})

const currentZone = computed(() => {
  if (!ov.value.zones) return {}
  return parkKey.value === 'total' ? ov.value.total : ov.value.zones[parkKey.value] || {}
})

// 欠费名单：按截止时间范围筛选
const arrearsDateRange = ref([])
const showArrearsPicker = ref(false)
const ARREARS_YEARS = [2024, 2025, 2026, 2027]
const arrearsStartYear = ref(2026)
const arrearsStartMonth = ref(1)
const arrearsStartDay = ref(1)
const arrearsEndYear = ref(2026)
const arrearsEndMonth = ref(12)
const arrearsEndDay = ref(31)

function parseDeadline(s) {
  if (!s) return null
  const m = String(s).match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (!m) return null
  return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`
}

const arrearsDateLabel = computed(() => {
  if (arrearsDateRange.value.length === 2) return `${arrearsDateRange.value[0]} ~ ${arrearsDateRange.value[1]}`
  return '全部时间'
})

const currentArrears = computed(() => {
  const list = ov.value.arrears || []
  let result = parkKey.value === 'total' ? list : list.filter((r) => r.zone === parkKey.value)
  if (arrearsDateRange.value.length === 2) {
    const [start, end] = arrearsDateRange.value
    result = result.filter((r) => {
      const d = parseDeadline(r.deadline)
      return d && d >= start && d <= end
    })
  }
  return result
})

const currentDebt = computed(() => currentArrears.value.reduce((s, r) => s + (r.amount || 0), 0))

// 收入构成各费用类型图标（浅色主题下的语义化线性图标）
const feeIcons = {
  rent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  property: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15"/><path d="M13 10h6a1 1 0 0 1 1 1v10"/><path d="M2 21h20"/><path d="M7 8h1M7 12h1M7 16h1M10.5 8h1M10.5 12h1M10.5 16h1"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6.5 6.7 6.5 11.3a6.5 6.5 0 0 1-13 0C5.5 9.7 12 3 12 3z"/></svg>',
  electricity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  solidWaste: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1.5 1.5 0 0 1-1.5 1.3H7.5A1.5 1.5 0 0 1 6 20L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
  parking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11 6.7 6.6A2 2 0 0 1 8.6 5.2h6.8a2 2 0 0 1 1.9 1.4L19 11"/><path d="M4.5 11h15a1.5 1.5 0 0 1 1.5 1.5v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4A1.5 1.5 0 0 1 4.5 11Z"/><path d="M7 14.5h.01M17 14.5h.01"/></svg>',
}

const composition = computed(() => {
  const z = currentZone.value
  const f = revenueFactor.value
  const r = utilityRatio.value
  const rows = [
    { key: 'rent', name: '租金', value: z.rent },
    { key: 'property', name: '物业费', value: z.property },
    { key: 'water', name: '水费', value: z.utility != null ? z.utility * r : null },
    { key: 'electricity', name: '电费', value: z.utility != null ? z.utility * (1 - r) : null },
    { key: 'solidWaste', name: '废渣处置', value: z.solidWaste },
    { key: 'parking', name: '停车费', value: z.parking },
  ]
  return rows.filter((c) => c.value != null).map((c) => ({ key: c.key, name: c.name, value: +(c.value * f).toFixed(1) }))
})

const currentRent = computed(() => +(currentZone.value.rent * rentFactor.value).toFixed(1))
const currentProperty = computed(() => +(currentZone.value.property * propertyFactor.value).toFixed(1))
const rentByType = computed(() => (ov.value.rentByType || []).map((t) => ({
  type: t.type,
  rent: +(t.rent * rentFactor.value).toFixed(1),
  area: t.area,
  rentMoM: t.rentMoM,
  areaMoM: t.areaMoM,
})))
const propertyByType = computed(() => (ov.value.propertyByType || []).map((t) => ({
  type: t.type,
  property: +(t.property * propertyFactor.value).toFixed(1),
  area: t.area,
  propertyMoM: t.propertyMoM,
  areaMoM: t.areaMoM,
})))
const parkMax = computed(() => Math.max(...(ov.value.parking?.monthlyParking || []), 1))

const currentUtility = computed(() => {
  const map = ov.value.utility || {}
  const keys = (ov.value.parks || []).map((p) => p.key)
  const empty = { water: { usage: 0, fee: 0, split: [] }, electricity: { usage: 0, fee: 0, split: [] } }
  if (!keys.length || !map[keys[0]]) return empty
  if (parkKey.value !== 'total') return map[parkKey.value]
  const wSplit = {}
  const eSplit = {}
  const water = { usage: 0, fee: 0 }
  const electricity = { usage: 0, fee: 0 }
  keys.forEach((k) => {
    const z = map[k]
    water.usage += z.water.usage
    water.fee += +z.water.fee
    electricity.usage += z.electricity.usage
    electricity.fee += +z.electricity.fee
    z.water.split.forEach((s) => { const t = wSplit[s.name] || (wSplit[s.name] = { volume: 0, fee: 0 }); t.volume += s.volume; t.fee += +s.fee })
    z.electricity.split.forEach((s) => { const t = eSplit[s.name] || (eSplit[s.name] = { volume: 0, fee: 0 }); t.volume += s.volume; t.fee += +s.fee })
  })
  return {
    water: { usage: water.usage, fee: +water.fee.toFixed(1), split: Object.entries(wSplit).map(([name, v]) => ({ name, volume: v.volume, fee: +v.fee.toFixed(1) })) },
    electricity: { usage: electricity.usage, fee: +electricity.fee.toFixed(1), split: Object.entries(eSplit).map(([name, v]) => ({ name, volume: v.volume, fee: +v.fee.toFixed(1) })) },
  }
})

const utilityMonths = computed(() => ov.value.utilityMonths || [])
const utilityYears = computed(() => ov.value.utilityYears || [])
// 水费筛选
const waterOptions = computed(() => (waterFilter.value.period === 'yearly' ? utilityYears.value : utilityMonths.value))
const waterKey = computed(() => (waterFilter.value.period === 'yearly' ? waterFilter.value.year : waterFilter.value.month))
const waterLabel = computed(() => {
  const opt = waterOptions.value.find((o) => o.key === waterKey.value)
  return opt ? opt.label : '-'
})
const waterMult = computed(() => {
  const opt = waterOptions.value.find((o) => o.key === waterKey.value)
  return opt ? opt.factor : 1
})

// 电费筛选
const elecOptions = computed(() => (elecFilter.value.period === 'yearly' ? utilityYears.value : utilityMonths.value))
const elecKey = computed(() => (elecFilter.value.period === 'yearly' ? elecFilter.value.year : elecFilter.value.month))
const elecLabel = computed(() => {
  const opt = elecOptions.value.find((o) => o.key === elecKey.value)
  return opt ? opt.label : '-'
})
const elecMult = computed(() => {
  const opt = elecOptions.value.find((o) => o.key === elecKey.value)
  return opt ? opt.factor : 1
})

// 停车费筛选
const parkingOptions = computed(() => (parkingFilter.value.period === 'yearly' ? utilityYears.value : utilityMonths.value))
const parkingKey = computed(() => (parkingFilter.value.period === 'yearly' ? parkingFilter.value.year : parkingFilter.value.month))
const parkingLabel = computed(() => {
  const opt = parkingOptions.value.find((o) => o.key === parkingKey.value)
  return opt ? opt.label : '-'
})
const parkingMult = computed(() => {
  const opt = parkingOptions.value.find((o) => o.key === parkingKey.value)
  return opt ? opt.factor : 1
})
const parkingFee = computed(() => {
  const annual = ov.value.total?.parking || 0
  return +(annual / 12 * parkingMult.value).toFixed(1)
})

const waterData = computed(() => {
  const w = currentUtility.value.water || { usage: 0, fee: 0, split: [] }
  const m = waterMult.value
  return {
    usage: Math.round(w.usage * m),
    fee: +(w.fee * m).toFixed(1),
    split: w.split.map((s) => ({ name: s.name, volume: Math.round(s.volume * m), fee: +(s.fee * m).toFixed(1) })),
  }
})

const electricityData = computed(() => {
  const e = currentUtility.value.electricity || { usage: 0, fee: 0, split: [] }
  const m = elecMult.value
  return {
    usage: Math.round(e.usage * m),
    fee: +(e.fee * m).toFixed(1),
    split: e.split.map((s) => ({ name: s.name, volume: Math.round(s.volume * m), fee: +(s.fee * m).toFixed(1) })),
  }
})

const waterFeeMax = computed(() => Math.max(...waterData.value.split.map((t) => t.fee), 1))
const elecFeeMax = computed(() => Math.max(...electricityData.value.split.map((t) => t.fee), 1))

const occupancyRate = computed(() => {
  const p = ov.value.parking || {}
  if (!p.totalSpaces) return 0
  return +((p.occupiedSpaces / p.totalSpaces) * 100).toFixed(1)
})

// 废渣处置（对齐大屏环保管理，一年一次统计，按核定设备数分档收费）
const residueYear = ref('2025')
const showResidueYearPicker = ref(false)
const residueYears = computed(() => ov.value.residueYears || ['2025'])
const residueTiers = computed(() => ov.value.residueTiers || [])
const residueEnterprises = computed(() => residueTiers.value.reduce((s, t) => s + t.enterpriseCount, 0))
const residueDevices = computed(() => residueTiers.value.reduce((s, t) => s + t.deviceCount, 0))
const residueAmount = computed(() => residueTiers.value.reduce((s, t) => s + t.amount, 0))

function setWaterPeriod(p) {
  waterFilter.value.period = p
}
function setElecPeriod(p) {
  elecFilter.value.period = p
}
function selectWaterPeriod(key) {
  if (waterFilter.value.period === 'yearly') waterFilter.value.year = key
  else waterFilter.value.month = key
  showWaterPicker.value = false
}
function selectElecPeriod(key) {
  if (elecFilter.value.period === 'yearly') elecFilter.value.year = key
  else elecFilter.value.month = key
  showElecPicker.value = false
}
function setRevenuePeriod(p) {
  revenueFilter.value.period = p
}
function selectRevenuePeriod(key) {
  if (revenueFilter.value.period === 'yearly') revenueFilter.value.year = key
  else revenueFilter.value.month = key
  showRevenuePicker.value = false
}
function setRentPeriod(p) {
  rentFilter.value.period = p
}
function selectRentPeriod(key) {
  if (rentFilter.value.period === 'yearly') rentFilter.value.year = key
  else rentFilter.value.month = key
  showRentPicker.value = false
}
function setPropertyPeriod(p) {
  propertyFilter.value.period = p
}
function selectPropertyPeriod(key) {
  if (propertyFilter.value.period === 'yearly') propertyFilter.value.year = key
  else propertyFilter.value.month = key
  showPropertyPicker.value = false
}
function setParkingPeriod(p) {
  parkingFilter.value.period = p
}
function selectParkingPeriod(key) {
  if (parkingFilter.value.period === 'yearly') parkingFilter.value.year = key
  else parkingFilter.value.month = key
  showParkingPicker.value = false
}
function toggleParkBar(i) {
  selectedParkMonth.value = selectedParkMonth.value === i ? -1 : i
}
function selectResidueYear(y) {
  residueYear.value = y
  showResidueYearPicker.value = false
}

function pctOf(v, max) {
  return `${Math.round((v / max) * 100)}%`
}
function fmt(n) {
  if (n == null) return '-'
  const v = Number(n)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}
function signedDelta(v) {
  const n = Number(v) || 0
  if (n === 0) return '0.0'
  const abs = Number.isInteger(Math.abs(n)) ? String(Math.abs(n)) : Math.abs(n).toFixed(1)
  return (n > 0 ? '+' : '-') + abs
}
function deltaClass(v) {
  const n = Number(v) || 0
  return n > 0 ? 'delta-up' : n < 0 ? 'delta-down' : 'delta-zero'
}
function fmtUsage(v, unit) {
  if (unit === 'kWh') return (v / 10000).toFixed(1) + '万kWh'
  return v >= 10000 ? (v / 10000).toFixed(1) + '万吨' : v + '吨'
}
function statusTag(s) {
  if (s === '诉讼中') return 'tag-red'
  if (s === '已发函') return 'tag-orange'
  return 'tag-blue'
}
function pad2(s) {
  return String(s).padStart(2, '0')
}
function confirmArrearsRange() {
  arrearsDateRange.value = [
    `${arrearsStartYear.value}-${pad2(arrearsStartMonth.value)}-${pad2(arrearsStartDay.value)}`,
    `${arrearsEndYear.value}-${pad2(arrearsEndMonth.value)}-${pad2(arrearsEndDay.value)}`,
  ]
  showArrearsPicker.value = false
}

onMounted(async () => {
  ov.value = (await getOperationOverview()) || {}
})
</script>

<style scoped>
/* 园区切换 */
.park-switch {
  display: flex;
  gap: 0.12rem;
  margin: 0.16rem 0 0.24rem;
}

.park-chip {
  flex: 1;
  padding: 0.1rem 0;
  color: #4a5568;
  font-size: 0.22rem;
  text-align: center;
  background: #fff;
  border-radius: 0.08rem;
}

.park-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #eaf3ff;
}

/* 核心指标配色 */
/* 收入构成 */
.comp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}

.comp-head .card-title {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}

.fee-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.16rem;
}

.fee-card {
  display: flex;
  align-items: center;
  gap: 0.16rem;
  padding: 0.2rem;
  background: #f7f8fa;
  border: 1px solid transparent;
  border-radius: 0.12rem;
  min-width: 0;
}

.fee-card.active {
  background: #d6e7ff;
}

.fee-card.active .fee-icon {
  background: #fff;
}

.fee-icon {
  display: grid;
  width: 0.72rem;
  height: 0.72rem;
  flex-shrink: 0;
  place-items: center;
  color: #1677ff;
  background: #eaf3ff;
  border-radius: 0.16rem;
}

.fee-icon svg {
  width: 0.36rem;
  height: 0.36rem;
}

.fee-body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.fee-name {
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.fee-value {
  color: #1677ff;
  font-size: 0.28rem;
  font-weight: 700;
  line-height: 1.3;
}

.fee-value i {
  margin-left: 0.02rem;
  font-size: 0.16rem;
  font-style: normal;
  font-weight: 400;
}

/* 租金/物业分析 */
.dual-name {
  color: #8c98a8;
  font-size: 0.26rem;
}

.dual-num {
  margin-top: 0.08rem;
  color: #1677ff;
  font-size: 0.36rem;
  font-weight: 700;
  line-height: 1.3;
}

.dual-num i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.rtype-table {
  display: flex;
  flex-direction: column;
  margin-top: 0.2rem;
}

.rtype-head-grid,
.rtype-row {
  display: grid;
  grid-template-columns: 1rem repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 0.06rem;
}

.rtype-head-grid {
  padding: 0.1rem 0.12rem;
  background: #f7f8fa;
  border-radius: 0.1rem 0.1rem 0 0;
}

.rtype-head-grid .name {
  grid-row: span 2;
}

.rtype-head-grid .group {
  grid-column: span 2;
}

.rtype-row {
  padding: 0.14rem 0.12rem;
  border-bottom: 1px solid #f0f2f5;
}

.rtype-row:last-child {
  border-bottom: none;
}

.rtype-td {
  min-width: 0;
  color: #4a5568;
  font-size: 0.22rem;
  text-align: center;
}

.rtype-head-grid .rtype-td {
  color: #8c98a8;
  font-size: 0.2rem;
}

.rtype-td.name {
  color: #182230;
  font-size: 0.24rem;
  font-weight: 600;
  text-align: left;
}

.rtype-head-grid .rtype-td.name {
  color: #8c98a8;
  font-size: 0.2rem;
  font-weight: 400;
}

.rtype-td.strong {
  color: #1677ff;
  font-weight: 700;
}

.delta-up { color: #16a46b; }
.delta-down { color: #e6535a; }
.delta-zero { color: #8c98a8; }

/* 水电费分析（水费/电费两卡片 + 年度/月度筛选） */
.util-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.2rem;
}

.util-head .card-title {
  margin-bottom: 0;
}

.util-head-right {
  display: flex;
  align-items: center;
  gap: 0.08rem;
}

.period-select {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.06rem;
  padding: 0.06rem 0.16rem;
  color: #1677ff;
  font-size: 0.22rem;
  font-weight: 600;
  background: #eaf3ff;
  border-radius: 0.08rem;
}

.period-switch {
  display: flex;
  gap: 0.04rem;
  padding: 0.04rem;
  background: #f0f2f5;
  border-radius: 0.08rem;
}

.period-chip {
  padding: 0.04rem 0.16rem;
  color: #8c98a8;
  font-size: 0.2rem;
  border-radius: 0.06rem;
}

.period-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #fff;
}

.util-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.14rem;
}

.util-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem;
  text-align: center;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.util-stat-label {
  color: #8c98a8;
  font-size: 0.26rem;
}

.util-stat-num {
  margin-top: 0.04rem;
  color: #182230;
  font-size: 0.34rem;
  font-weight: 700;
  line-height: 1.3;
}

.util-stat-num.blue { color: #1677ff; }
.util-stat-num.green { color: #16a46b; }

.util-stat-num i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.util-rows {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  margin-top: 0.2rem;
}

.util-row {
  display: flex;
  align-items: center;
  gap: 0.06rem;
}

.util-name {
  flex-shrink: 0;
  width: 1.3rem;
  color: #8c98a8;
  font-size: 0.24rem;
}

.util-track {
  flex: 1;
  height: 0.08rem;
  overflow: hidden;
  background: #edf0f4;
  border-radius: 0.04rem;
}

.util-fill {
  height: 100%;
  border-radius: 0.04rem;
}

.util-fill.water { background: #1677ff; }
.util-fill.elec { background: #1677ff; }

.util-meta {
  flex-shrink: 0;
  min-width: 1.8rem;
  color: #4a5568;
  font-size: 0.24rem;
  text-align: right;
  white-space: nowrap;
}

/* 筛选弹层 */
.period-popup {
  padding: 0.16rem 0;
}

.period-popup-list {
  max-height: 60vh;
  overflow-y: auto;
}

.period-option {
  padding: 0.24rem 0.28rem;
  color: #182230;
  font-size: 0.26rem;
  text-align: center;
}

.period-option.active {
  color: #1677ff;
  font-weight: 600;
  background: #f2f8ff;
}

.period-option + .period-option {
  border-top: 1px solid #f0f2f5;
}

/* 停车 */
.ps-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.2rem 0.08rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.ps-label {
  color: #8c98a8;
  font-size: 0.26rem;
}

.ps-num {
  margin-top: 0.06rem;
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.ps-num i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.ps-num.green { color: #16a46b; }

.parking-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.14rem;
  margin-top: 0.16rem;
}

.pc-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.16rem 0.08rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.pc-label {
  color: #8c98a8;
  font-size: 0.26rem;
}

.pc-num {
  margin-top: 0.04rem;
  color: #182230;
  font-size: 0.3rem;
  font-weight: 700;
}

.pc-num i {
  margin-left: 0.04rem;
  font-size: 0.18rem;
  font-style: normal;
  font-weight: 400;
}

.sub-title {
  margin-top: 0.26rem;
  color: #4a5568;
  font-size: 0.28rem;
  font-weight: 600;
}

/* 废渣处置 */
.residue-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.14rem;
}

.residue-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  margin-top: 0.16rem;
}

.residue-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.08rem;
  padding: 0.22rem 0.2rem;
  background: #f7f8fa;
  border-radius: 0.1rem;
}

.residue-tier {
  flex-shrink: 0;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 600;
}

.residue-price {
  flex-shrink: 0;
  color: #f39b24;
  font-size: 0.24rem;
  font-weight: 700;
}

.residue-dev {
  flex-shrink: 0;
  color: #4a5568;
  font-size: 0.24rem;
}

.residue-amount {
  flex-shrink: 0;
  color: #182230;
  font-size: 0.24rem;
  font-weight: 600;
}

/* 停车月度柱状 */
.month-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.08rem;
  height: 1.7rem;
  margin-top: 0.14rem;
}

.mb-item {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  min-width: 0;
}

.mb-value {
  position: absolute;
  left: 50%;
  z-index: 2;
  padding: 0.04rem 0.1rem;
  background: #182230;
  color: #fff;
  font-size: 0.2rem;
  line-height: 1.3;
  border-radius: 0.06rem;
  white-space: nowrap;
  transform: translateX(-50%);
}

.mb-bar {
  width: 100%;
  max-width: 0.3rem;
  background: linear-gradient(180deg, #1677ff, #2e8df6);
  border-radius: 0.04rem 0.04rem 0 0;
}

.mb-bar.active {
  background: linear-gradient(180deg, #0f66d6, #1f7be8);
}

.mb-label {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.22rem;
  white-space: nowrap;
}

.mb-label.active {
  color: #1677ff;
  font-weight: 600;
}

/* 卡片副标题 */
.card-sub {
  margin-left: 0.08rem;
  color: #8c98a8;
  font-size: 0.24rem;
  font-weight: 400;
}

/* 欠费名单 */
.arrears-list {
  display: flex;
  flex-direction: column;
}

.arrears-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
  padding: 0.16rem 0;
  border-bottom: 1px solid #f0f2f5;
}

.arrears-row:last-child {
  border-bottom: none;
}

.ar-left {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.ar-name {
  overflow: hidden;
  color: #182230;
  font-size: 0.24rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ar-meta {
  margin-top: 0.02rem;
  color: #8c98a8;
  font-size: 0.24rem;
}

.ar-right {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.14rem;
}

.ar-amount {
  color: #e6535a;
  font-size: 0.28rem;
  font-weight: 700;
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
