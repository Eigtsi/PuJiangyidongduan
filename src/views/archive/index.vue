<template>
  <div class="page archive-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>园区档案</h1>
        <span class="page-header-park">浦江中国水晶产业园</span>
      </div>
    </ShellHeaderPortal>

    <div class="archive-content content-padding">
      <!-- 关键字搜索 -->
      <div class="search-wrap">
        <van-search
          v-model="keyword"
          placeholder="搜索企业名称 / 信用代码 / 法人 / 行业 / 区域"
          shape="round"
          background="transparent"
        />
      </div>

      <!-- 一园一档入口 -->
      <section class="park-entry" @click="router.push('/archive/park')">
        <div class="park-entry-icon"><van-icon name="shop-o" /></div>
        <div class="park-entry-body">
          <div class="park-entry-title">一园一档</div>
          <div class="park-entry-name">{{ park.parkName || '加载中...' }}</div>
          <div class="park-entry-meta">
            <span>入驻企业 {{ park.enterprises }} 家</span>
            <i />
            <span>年产值 {{ park.annualOutput }}</span>
          </div>
        </div>
        <van-icon name="arrow" class="park-entry-arrow" />
      </section>

      <!-- 一企一档列表 -->
      <div class="section-title">
        <span>一企一档</span>
        <span class="count">共 {{ filtered.length }} 家</span>
      </div>

      <div class="zone-chips">
        <div
          v-for="z in zoneChips"
          :key="z"
          class="chip"
          :class="{ active: zoneFilter === z }"
          @click="zoneFilter = z"
        >
          {{ z }}
        </div>
      </div>

      <div v-if="filtered.length" class="enterprise-list">
        <div
          v-for="e in filtered"
          :key="e.enterpriseId"
          class="enterprise-item"
          @click="router.push(`/archive/enterprise/${e.enterpriseId}`)"
        >
          <div class="enterprise-head">
            <span class="enterprise-name">{{ e.enterpriseName }}</span>
            <span class="industry-tag">{{ e.industry }}</span>
            <span class="status-tag" :class="leaseClass(e.leaseStatus)">{{ e.leaseStatus }}</span>
          </div>
          <div class="enterprise-meta">统一社会信用代码：{{ e.creditCode }}</div>
          <div class="enterprise-foot">
            <span>法人：{{ e.legalPerson }}</span>
            <span>{{ e.zone }}</span>
            <span>入驻：{{ e.entryDate }}</span>
          </div>
        </div>
      </div>
      <van-empty v-else description="未找到匹配的企业" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getParkInfo, listEnterprises } from '@/api/archive'

const router = useRouter()
const keyword = ref('')
const zoneFilter = ref('全部')
const park = ref({})
const enterprises = ref([])

const zoneChips = ['全部', '中部园区', '东部园区', '西部园区']

// 本地过滤：园区（中部/东部/西部）+ 关键字（企业名称 / 信用代码 / 法人 / 行业 / 区域 / 联系人）
const filtered = computed(() => {
  let list = enterprises.value
  if (zoneFilter.value !== '全部') {
    list = list.filter((e) => e.zone === zoneFilter.value)
  }
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return list
  return list.filter((e) =>
    [e.enterpriseName, e.creditCode, e.legalPerson, e.industry, e.area, e.contact].some((v) =>
      String(v).toLowerCase().includes(kw),
    ),
  )
})

function leaseClass(status) {
  return status === '租赁中' ? 'tag-green' : 'tag-gray'
}

async function loadPark() {
  park.value = (await getParkInfo()) || {}
}

async function loadEnterprises() {
  const res = await listEnterprises()
  enterprises.value = res?.rows || []
}

onMounted(() => {
  loadPark()
  loadEnterprises()
})
</script>

<style scoped>
.search-wrap {
  margin-top: 0.16rem;
  padding: 0.04rem 0.08rem;
  background: #fff;
  border-radius: 0.16rem;
}

.zone-chips {
  display: flex;
  gap: 0.16rem;
  margin-top: 0.2rem;
  overflow-x: auto;
  white-space: nowrap;
}

.chip {
  flex-shrink: 0;
  padding: 0.1rem 0.28rem;
  color: #687588;
  font-size: 0.24rem;
  background: #fff;
  border-radius: 0.28rem;
}

.chip.active {
  color: #fff;
  background: #1677ff;
}

.park-entry {
  display: flex;
  align-items: center;
  margin-top: 0.2rem;
  padding: 0.3rem 0.24rem;
  background: linear-gradient(135deg, #1677ff, #2e8df6);
  border-radius: 0.16rem;
  box-shadow: 0 0.08rem 0.24rem rgba(22, 119, 255, 0.25);
}

.park-entry-icon {
  display: grid;
  width: 0.88rem;
  height: 0.88rem;
  margin-right: 0.2rem;
  place-items: center;
  color: #1677ff;
  font-size: 0.44rem;
  background: #fff;
  border-radius: 0.2rem;
}

.park-entry-body {
  flex: 1;
  min-width: 0;
  color: #fff;
}

.park-entry-title {
  font-size: 0.22rem;
  opacity: 0.85;
}

.park-entry-name {
  margin-top: 0.06rem;
  overflow: hidden;
  font-size: 0.32rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.park-entry-meta {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-top: 0.08rem;
  font-size: 0.2rem;
  opacity: 0.85;
}

.park-entry-meta i {
  width: 1px;
  height: 0.16rem;
  background: rgba(255, 255, 255, 0.5);
}

.park-entry-arrow {
  color: #fff;
  font-size: 0.32rem;
  opacity: 0.9;
}

.enterprise-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.enterprise-item {
  padding: 0.24rem;
  background: #fff;
  border-radius: 0.16rem;
  box-shadow: 0 0.08rem 0.24rem rgba(24, 34, 48, 0.04);
}

.enterprise-head {
  display: flex;
  align-items: center;
  gap: 0.12rem;
}

.enterprise-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.3rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.enterprise-meta {
  margin-top: 0.14rem;
  color: #687588;
  font-size: 0.22rem;
}

.enterprise-foot {
  display: flex;
  align-items: center;
  gap: 0.24rem;
  margin-top: 0.1rem;
  color: #8c98a8;
  font-size: 0.2rem;
}
</style>
