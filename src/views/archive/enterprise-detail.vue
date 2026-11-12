<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">企业档案</div>
        <div class="right" />
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content" v-if="ent.enterpriseId">
      <!-- 基本信息 -->
      <section class="card">
        <div class="enterprise-title-row">
          <div class="enterprise-name">{{ ent.enterpriseName }}</div>
          <span class="status-tag" :class="leaseClass(ent.leaseStatus)">{{ ent.leaseStatus }}</span>
        </div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">行业分类</span>
            <span class="value">{{ ent.industry }}</span>
          </div>
          <div class="info-row">
            <span class="label">所在区域</span>
            <span class="value">{{ ent.zone }}</span>
          </div>
          <div class="info-row full">
            <span class="label">法定代表人</span>
            <span class="value">{{ ent.legalPerson }}</span>
          </div>
          <div class="info-row full">
            <span class="label">统一社会信用代码</span>
            <span class="value">{{ ent.creditCode }}</span>
          </div>
          <div class="info-row full">
            <span class="label">注册地址</span>
            <span class="value">{{ ent.address }}</span>
          </div>
          <div class="info-row full">
            <span class="label">经营范围</span>
            <span class="value intro">{{ ent.businessScope }}</span>
          </div>
        </div>
      </section>

      <!-- 联系信息 -->
      <section class="card">
        <div class="card-title">联系信息</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">联系人</span>
            <span class="value">{{ ent.contact }}</span>
          </div>
          <div class="info-row">
            <span class="label">联系电话</span>
            <span class="value">{{ ent.phone }}</span>
          </div>
          <div class="info-row full">
            <span class="label">资源编号</span>
            <span class="value">{{ ent.resourceNo }}</span>
          </div>
        </div>
      </section>

      <!-- 环保信息 -->
      <section class="card">
        <div class="card-title">环保信息</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">环保等级</span>
            <span class="value">
              <span class="status-tag" :class="envLevelClass(ent.environmentalLevel)">{{ ent.environmentalLevel }}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">废水排放标准</span>
            <span class="value">{{ ent.wasteWaterStandard }}</span>
          </div>
          <div class="info-row full">
            <span class="label">排污许可证号</span>
            <span class="value">{{ ent.emissionPermit }}</span>
          </div>
        </div>
      </section>

      <!-- 环评信息 -->
      <section class="card" v-if="ent.eiaType">
        <div class="card-title">环评信息</div>
        <div class="info-grid">
          <div class="info-row">
            <span class="label">所属片区</span>
            <span class="value">{{ ent.zone }}</span>
          </div>
          <div class="info-row">
            <span class="label">环评类型</span>
            <span class="value">{{ ent.eiaType }}</span>
          </div>
          <div class="info-row full">
            <span class="label">主要工艺</span>
            <span class="value">{{ ent.mainProcess }}</span>
          </div>
          <div class="info-row full">
            <span class="label">原辅材料</span>
            <span class="value">{{ ent.rawMaterials }}</span>
          </div>
          <div v-if="pollutantEntries.length" class="info-row full">
            <span class="label">排污总量指标</span>
            <div class="value pollutant-list">
              <span v-for="[k, v] in pollutantEntries" :key="k" class="pollutant-item">
                {{ k }}：{{ v }} kg/a
              </span>
            </div>
          </div>
          <div class="info-row full">
            <span class="label">污染防治措施</span>
            <span class="value intro">{{ ent.preventionMeasures }}</span>
          </div>
        </div>
      </section>

    </div>

    <van-loading v-else class="loading-block" vertical>加载中...</van-loading>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { getEnterprise } from '@/api/archive'

const route = useRoute()
const router = useRouter()
const ent = ref({})

const pollutantEntries = computed(() => Object.entries(ent.value.pollutants || {}))

function leaseClass(status) {
  return status === '租赁中' ? 'tag-green' : 'tag-gray'
}

function envLevelClass(level) {
  if (level === 'A级') return 'tag-green'
  if (level === 'B级') return 'tag-blue'
  return 'tag-orange'
}

onMounted(async () => {
  ent.value = (await getEnterprise(route.params.id)) || {}
})
</script>

<style scoped>
.enterprise-title-row {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  margin-bottom: 0.2rem;
}

.enterprise-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.32rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-block {
  padding: 1.2rem 0;
}

.pollutant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.12rem 0.24rem;
}

.pollutant-item {
  color: #4a5568;
  font-size: 0.24rem;
  font-weight: 500;
}

</style>
