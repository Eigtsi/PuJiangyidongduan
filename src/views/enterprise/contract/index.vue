<template>
  <div class="page ent-contract-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>合同</h1>
        <span class="page-header-park">{{ userStore.enterpriseName }}</span>
      </div>
    </ShellHeaderPortal>

    <div v-if="profile" class="content-padding">
      <!-- 企业信息 -->
      <section class="card">
        <div class="card-title">企业信息</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">企业代码</span>
            <span class="value">{{ profile.enterpriseCode }}</span>
          </div>
          <div class="info-row">
            <span class="label">企业状态</span>
            <span class="value">{{ profile.status }}</span>
          </div>
          <div class="info-row">
            <span class="label">所属园区</span>
            <span class="value">{{ profile.zone }}</span>
          </div>
          <div class="info-row">
            <span class="label">行业分类</span>
            <span class="value">{{ profile.industry }}</span>
          </div>
        </div>
      </section>

      <!-- 合同列表（一份房产资源对应一份合同） -->
      <section class="card">
        <div class="card-title">房产资源合同</div>
        <div class="contract-list">
          <div v-for="c in profile.contracts" :key="c.contractNo" class="contract-item">
            <div class="contract-head">
              <span class="contract-no">{{ c.contractNo }}</span>
              <span class="status-tag" :class="statusClass(c.status)">{{ c.status }}</span>
            </div>
            <div class="contract-sub">
              <span class="contract-target">{{ c.leaseTarget }}</span>
              <span class="contract-resource">{{ c.resourceNo }}</span>
            </div>
            <div class="contract-meta">
              <span>租赁面积 {{ c.area }}㎡</span>
              <span>合同期限 {{ c.startDate }} 至 {{ c.endDate }}</span>
            </div>
            <div class="contract-fee">年租金 {{ c.annualRent }} 万元 · 年物业费 {{ c.annualProperty }} 万元</div>
          </div>
        </div>
      </section>
    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { useUserStore } from '@/store/user'
import { getEnterpriseContract } from '@/api/enterprise-service'

const userStore = useUserStore()
const profile = ref(null)

function statusClass(status) {
  if (status === '生效中') return 'tag-green'
  if (status === '续租中') return 'tag-blue'
  if (status === '已到期') return 'tag-orange'
  return 'tag-gray'
}

onMounted(async () => {
  // 企业端演示固定为本企业：浦江水晶工艺品有限公司
  profile.value = (await getEnterpriseContract()) || null
})
</script>

<style scoped>
/* 企业信息内容居中 */
.info-grid .info-row {
  align-items: center;
  text-align: center;
}

.contract-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.contract-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.contract-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.contract-no {
  color: #182230;
  font-size: 0.26rem;
  font-weight: 700;
}

.contract-sub {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-top: 0.1rem;
}

.contract-target {
  padding: 0.04rem 0.14rem;
  color: #1677ff;
  font-size: 0.22rem;
  background: #eaf3ff;
  border-radius: 0.08rem;
}

.contract-resource {
  color: #4a5568;
  font-size: 0.24rem;
  font-weight: 600;
}

.contract-meta {
  display: flex;
  flex-direction: column;
  gap: 0.04rem;
  margin-top: 0.12rem;
  color: #8c98a8;
  font-size: 0.22rem;
}

.contract-fee {
  margin-top: 0.1rem;
  color: #182230;
  font-size: 0.24rem;
  font-weight: 600;
}

.loading-block {
  padding: 1.2rem 0;
}
</style>
