<template>
  <div class="service-panel">
    <!-- 用工需求统计 -->
    <section class="card">
      <div class="card-title">用工需求统计</div>
      <div class="date-filter">
        <input v-model="startDate" type="date" class="date-input" />
        <span class="date-sep">至</span>
        <input v-model="endDate" type="date" class="date-input" />
        <button v-if="startDate || endDate" class="date-clear" @click="clearDate">清除</button>
      </div>
      <div class="metric-grid">
        <div class="metric-item">
          <div class="metric-value">{{ stats.openPositions }}<i>个</i></div>
          <div class="metric-label">在招岗位</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">{{ stats.hiringEnterprises }}<i>家</i></div>
          <div class="metric-label">招聘企业</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">{{ stats.totalHeadcount }}<i>人</i></div>
          <div class="metric-label">招聘人数</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">{{ stats.avgSalary }}<i>元/月</i></div>
          <div class="metric-label">平均薪资</div>
        </div>
      </div>
    </section>

    <!-- 招工信息列表 -->
    <section class="card">
      <div class="card-title">招工信息</div>
      <div class="status-chips">
        <span v-for="s in statusOptions" :key="s" class="filter-chip" :class="{ active: statusFilter === s }" @click="statusFilter = s">{{ s }}</span>
      </div>
      <div class="job-list">
        <div v-for="j in filteredList" :key="j.id" class="job-item" @click="openDetail(j)">
          <div class="job-head">
            <span class="job-name">{{ j.positionName }}</span>
            <span class="job-salary">{{ j.salaryMin }}-{{ j.salaryMax }}元/月</span>
          </div>
          <div class="job-enterprise">{{ j.enterpriseName }}</div>
          <div class="job-meta">
            <span>招聘 {{ j.headcount }} 人</span>
            <span class="status-tag" :class="j.status === '招聘中' ? 'tag-blue' : 'tag-gray'">{{ j.status }}</span>
          </div>
        </div>
        <van-empty v-if="!filteredList.length" description="暂无招工信息" image-size="64" />
      </div>
    </section>

    <!-- 岗位详情 -->
    <van-popup v-model:show="showDetail" position="bottom" round class="detail-popup">
      <div v-if="detail" class="job-detail">
        <div class="jd-head">
          <div class="jd-title">{{ detail.positionName }}</div>
          <div class="jd-salary">{{ detail.salaryMin }}-{{ detail.salaryMax }}<i>元/月</i></div>
        </div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">招聘企业</span>
            <span class="value">{{ detail.enterpriseName }}</span>
          </div>
          <div class="info-row">
            <span class="label">岗位编号</span>
            <span class="value">{{ detail.jobCode }}</span>
          </div>
          <div class="info-row">
            <span class="label">招聘人数</span>
            <span class="value">{{ detail.headcount }} 人</span>
          </div>
          <div class="info-row">
            <span class="label">发布时间</span>
            <span class="value">{{ detail.publishDate }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系人</span>
            <span class="value">{{ detail.contact }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系电话</span>
            <span class="value">{{ detail.phone }}</span>
          </div>
          <div class="info-row full">
            <span class="label">岗位要求</span>
            <span class="value intro">{{ detail.requirements }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getRecruitmentList } from '@/api/service'

const list = ref([])
const statusOptions = ['全部', '招聘中', '已结束']
const statusFilter = ref('全部')
const startDate = ref('')
const endDate = ref('')
const showDetail = ref(false)
const detail = ref(null)

function clearDate() {
  startDate.value = ''
  endDate.value = ''
}

const filteredList = computed(() => {
  let result = list.value
  if (statusFilter.value !== '全部') result = result.filter((j) => j.status === statusFilter.value)
  if (startDate.value) result = result.filter((j) => j.publishDate >= startDate.value)
  if (endDate.value) result = result.filter((j) => j.publishDate <= endDate.value)
  return result
})

const stats = computed(() => {
  const inRange = (j) =>
    (!startDate.value || j.publishDate >= startDate.value) &&
    (!endDate.value || j.publishDate <= endDate.value)
  const open = list.value.filter((j) => j.status === '招聘中' && inRange(j))
  const names = new Set(open.map((j) => j.enterpriseName))
  const headcount = open.reduce((s, j) => s + j.headcount, 0)
  const avg = open.length
    ? Math.round(open.reduce((s, j) => s + (j.salaryMin + j.salaryMax) / 2, 0) / open.length)
    : 0
  return {
    openPositions: open.length,
    hiringEnterprises: names.size,
    totalHeadcount: headcount,
    avgSalary: avg,
  }
})

function openDetail(j) {
  detail.value = j
  showDetail.value = true
}

onMounted(async () => {
  const res = await getRecruitmentList()
  list.value = res.rows || []
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

.job-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.job-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.job-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.job-name {
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
}

.job-salary {
  flex-shrink: 0;
  color: #1677ff;
  font-size: 0.24rem;
  font-weight: 600;
}

.job-enterprise {
  margin-top: 0.08rem;
  color: #4a5568;
  font-size: 0.22rem;
}

.job-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.12rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.detail-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.job-detail {
  padding: 0.32rem;
}

.jd-head {
  margin-bottom: 0.24rem;
}

.jd-title {
  color: #182230;
  font-size: 0.34rem;
  font-weight: 700;
}

.jd-salary {
  margin-top: 0.08rem;
  color: #1677ff;
  font-size: 0.3rem;
  font-weight: 600;
}

.jd-salary i {
  margin-left: 0.04rem;
  font-size: 0.22rem;
  font-style: normal;
  font-weight: 400;
}
</style>
