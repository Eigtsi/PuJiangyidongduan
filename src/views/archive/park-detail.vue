<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">一园一档</div>
        <div class="right" />
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content">
      <!-- 三园区（中部 / 东部 / 西部） -->
      <section class="card zone-card">
        <div class="card-title">浦江中国水晶产业园</div>
        <van-tabs v-model:active="activeZone" class="zone-tabs">
          <van-tab v-for="z in parks" :key="z.zoneId" :title="z.zoneName" :name="String(z.zoneId)">
            <div class="zone-body">
              <!-- 园区概况 -->
              <div class="zone-group-title">园区概况</div>
              <div class="metric-grid">
                <div class="metric-item">
                  <div class="metric-value">{{ z.planArea }}</div>
                  <div class="metric-label">总用地面积</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ z.enterpriseCount }}<i>家</i></div>
                  <div class="metric-label">入驻企业</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ z.scaleEnterpriseCount }}<i>家</i></div>
                  <div class="metric-label">规上企业</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ z.annualOutput }}</div>
                  <div class="metric-label">年产值</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ z.establishDate }}</div>
                  <div class="metric-label">竣工投产</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ z.buildingCount }}<i>幢</i></div>
                  <div class="metric-label">厂房幢数</div>
                </div>
              </div>

              <!-- 园区介绍 -->
              <div class="zone-group-title">园区介绍</div>
              <p class="zone-desc">{{ z.description }}</p>

              <!-- 环保设施 -->
              <div class="zone-group-title">环保设施</div>
              <template v-if="z.env && z.env.length">
                <div v-for="f in z.env" :key="f.title" class="facility-card">
                  <div class="facility-head">
                    <span class="facility-title">{{ f.title }}</span>
                    <span v-if="f.count > 1" class="facility-count">×{{ f.count }}</span>
                  </div>
                  <div v-if="f.name" class="facility-name">{{ f.name }}</div>
                  <div v-if="f.fields" class="info-grid facility-fields">
                    <div v-for="it in f.fields" :key="it.label" class="info-row full">
                      <span class="label">{{ it.label }}</span>
                      <span class="value">{{ it.value }}</span>
                    </div>
                  </div>
                  <div v-if="f.indicators" class="indicator-wrap">
                    <span class="indicator-label">监测指标</span>
                    <span class="indicator-line">{{ f.indicators.join(' · ') }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="facility-empty">暂无环保设施</div>
            </div>
          </van-tab>
        </van-tabs>
      </section>

      <!-- 园区档案文件入口 -->
      <section class="card files-entry" @click="router.push('/archive/park/files')">
        <div class="files-entry-icon"><van-icon name="description" /></div>
        <div class="files-entry-body">
          <div class="files-entry-title">园区档案文件</div>
          <div class="files-entry-meta">规划环评 · 应急预案 · 管理制度 · 项目准入</div>
        </div>
        <van-icon name="arrow" class="files-entry-arrow" />
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { listParks } from '@/api/archive'

const router = useRouter()
const parks = ref([])
const activeZone = ref('1')

onMounted(async () => {
  parks.value = (await listParks()) || []
})
</script>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.16rem;
}

.metric-item {
  padding: 0.24rem;
  text-align: center;
  background: #f5f7fa;
  border-radius: 0.12rem;
}

.metric-value {
  color: #1677ff;
  font-size: 0.32rem;
  font-weight: 700;
  line-height: 1.3;
}

.metric-value i {
  margin-left: 0.04rem;
  font-size: 0.2rem;
  font-style: normal;
  font-weight: 400;
}

.metric-label {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.22rem;
}

.zone-card {
  padding-bottom: 0.08rem;
}

.zone-tabs :deep(.van-tabs__nav) {
  background: #f5f6f8;
  border-radius: 0.12rem;
}

.zone-body {
  padding: 0.24rem 0 0.08rem;
}

.zone-group-title {
  margin: 0.24rem 0 0.16rem;
  color: #182230;
  font-size: 0.26rem;
  font-weight: 700;
}

.zone-info {
  padding: 0.24rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.zone-desc {
  margin: 0;
  color: #4a5568;
  font-size: 0.24rem;
  line-height: 1.7;
}

.facility-card {
  padding: 0.24rem;
  margin-bottom: 0.16rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.facility-head {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  margin-bottom: 0.06rem;
}

.facility-title {
  color: #182230;
  font-size: 0.26rem;
  font-weight: 700;
}

.facility-count {
  padding: 0.02rem 0.14rem;
  color: #1677ff;
  font-size: 0.2rem;
  background: #eaf3ff;
  border-radius: 0.2rem;
}

.facility-name {
  margin-bottom: 0.08rem;
  color: #4a5568;
  font-size: 0.22rem;
}

.facility-fields {
  margin-top: 0.08rem;
}

.indicator-wrap {
  display: flex;
  align-items: baseline;
  gap: 0.12rem;
  margin-top: 0.12rem;
}

.indicator-label {
  flex-shrink: 0;
  color: #8c98a8;
  font-size: 0.2rem;
}

.indicator-line {
  color: #4a5568;
  font-size: 0.22rem;
  line-height: 1.6;
}

.facility-empty {
  padding: 0.4rem 0;
  color: #8c98a8;
  font-size: 0.22rem;
  text-align: center;
}

.files-entry {
  display: flex;
  align-items: center;
}

.files-entry-icon {
  display: grid;
  width: 0.72rem;
  height: 0.72rem;
  margin-right: 0.18rem;
  place-items: center;
  color: #1677ff;
  font-size: 0.34rem;
  background: #eaf3ff;
  border-radius: 0.14rem;
}

.files-entry-body {
  flex: 1;
  min-width: 0;
}

.files-entry-title {
  font-size: 0.28rem;
  font-weight: 600;
}

.files-entry-meta {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.files-entry-arrow {
  color: #c3cbd6;
  font-size: 0.26rem;
}
</style>
