<template>
  <div class="page ent-recruitment-page">
    <ShellHeaderPortal>
      <div class="page-header">
        <h1>招工</h1>
        <span class="page-header-park">{{ userStore.enterpriseName }}</span>
      </div>
    </ShellHeaderPortal>

    <div class="content-padding">
      <div class="panel-toolbar">
        <span class="toolbar-count">共 {{ list.length }} 条招工</span>
        <button class="publish-btn" @click="openForm">+ 发布招工</button>
      </div>

      <div class="recruit-list">
        <div v-for="r in list" :key="r.id" class="recruit-item">
          <div class="r-head">
            <span class="r-name">{{ r.positionName }}</span>
            <span class="status-tag" :class="r.status === '招聘中' ? 'tag-green' : 'tag-gray'">{{ r.status }}</span>
          </div>
          <div class="r-salary">{{ r.salaryMin }}-{{ r.salaryMax }} 元/月</div>
          <div class="r-meta">
            <span>需求 {{ r.headcount }} 人</span>
            <span>发布 {{ r.publishDate }}</span>
          </div>
          <div class="r-req">{{ r.requirements }}</div>
        </div>
        <van-empty v-if="!list.length" description="暂无招工信息" image-size="64" />
      </div>
    </div>

    <!-- 发布招工表单 -->
    <van-popup v-model:show="showForm" position="bottom" round class="form-popup">
      <div class="form-panel">
        <div class="fp-title">发布招工</div>
        <div class="field">
          <span class="field-label">岗位名称</span>
          <input v-model.trim="form.positionName" placeholder="请输入岗位名称" />
        </div>
        <div class="field-row">
          <div class="field">
            <span class="field-label">薪资下限</span>
            <input v-model.trim="form.salaryMin" type="number" placeholder="元/月" />
          </div>
          <div class="field">
            <span class="field-label">薪资上限</span>
            <input v-model.trim="form.salaryMax" type="number" placeholder="元/月" />
          </div>
        </div>
        <div class="field">
          <span class="field-label">招聘人数</span>
          <input v-model.trim="form.headcount" type="number" placeholder="请输入人数" />
        </div>
        <div class="field">
          <span class="field-label">发布时间</span>
          <input v-model="form.publishDate" type="date" />
        </div>
        <div class="field-row">
          <div class="field">
            <span class="field-label">联系人</span>
            <input v-model.trim="form.contact" placeholder="请输入联系人" />
          </div>
          <div class="field">
            <span class="field-label">联系电话</span>
            <input v-model.trim="form.phone" placeholder="请输入联系电话" />
          </div>
        </div>
        <div class="field field-area">
          <span class="field-label">岗位要求</span>
          <textarea v-model.trim="form.requirements" rows="3" placeholder="请输入岗位职责与任职要求" />
        </div>
        <button class="submit-btn" @click="submit">发布</button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { showFailToast, showSuccessToast } from 'vant'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { useUserStore } from '@/store/user'
import { getEnterpriseRecruitments, publishRecruitment } from '@/api/enterprise-service'

const userStore = useUserStore()
const list = ref([])
const showForm = ref(false)
const form = reactive({ positionName: '', salaryMin: '', salaryMax: '', headcount: '', requirements: '', publishDate: '', contact: '张明华', phone: '13957901001' })

function today() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function openForm() {
  Object.assign(form, {
    positionName: '',
    salaryMin: '',
    salaryMax: '',
    headcount: '',
    requirements: '',
    publishDate: today(),
    contact: '张明华',
    phone: '13957901001',
  })
  showForm.value = true
}

async function submit() {
  if (!form.positionName) return showFailToast('请输入岗位名称')
  if (!form.salaryMin || !form.salaryMax) return showFailToast('请填写薪资区间')
  if (!form.headcount) return showFailToast('请填写招聘人数')

  await publishRecruitment({
    positionName: form.positionName,
    salaryMin: Number(form.salaryMin),
    salaryMax: Number(form.salaryMax),
    headcount: Number(form.headcount),
    requirements: form.requirements,
    publishDate: form.publishDate,
    contact: form.contact,
    phone: form.phone,
  })
  showSuccessToast('发布成功')
  showForm.value = false
  await load()
}

async function load() {
  const res = await getEnterpriseRecruitments()
  list.value = res.rows || []
}

onMounted(load)
</script>

<style scoped>
.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0.24rem 0 0.16rem;
}

.toolbar-count {
  color: #8c98a8;
  font-size: 0.22rem;
}

.publish-btn {
  padding: 0.12rem 0.22rem;
  color: #fff;
  font-size: 0.24rem;
  background: #1677ff;
  border: none;
  border-radius: 0.08rem;
}

.recruit-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
}

.recruit-item {
  padding: 0.2rem;
  background: #fff;
  border-radius: 0.16rem;
  box-shadow: 0 0.08rem 0.24rem rgba(24, 34, 48, 0.04);
}

.r-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.r-name {
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
}

.r-salary {
  margin-top: 0.08rem;
  color: #1677ff;
  font-size: 0.28rem;
  font-weight: 700;
}

.r-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.1rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.r-req {
  margin-top: 0.12rem;
  color: #4a5568;
  font-size: 0.22rem;
  line-height: 1.6;
}

.form-popup {
  padding-bottom: env(safe-area-inset-bottom);
}

.form-panel {
  padding: 0.32rem;
}

.fp-title {
  margin-bottom: 0.24rem;
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
}

.field {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.24rem 0;
  border-bottom: 1px solid #f0f2f5;
}

.field-row {
  display: flex;
  gap: 0.24rem;
}

.field-row .field {
  flex: 1;
  min-width: 0;
}

.field-label {
  flex-shrink: 0;
  width: 1.3rem;
  color: #182230;
  font-size: 0.26rem;
}

.field input,
.field textarea {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: #182230;
  font-size: 0.26rem;
  background: transparent;
  border: none;
  outline: none;
}

.field textarea {
  resize: none;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #c3cbd6;
}

.field-area {
  align-items: flex-start;
}

.submit-btn {
  width: 100%;
  margin-top: 0.32rem;
  padding: 0.22rem 0;
  color: #fff;
  font-size: 0.28rem;
  background: #1677ff;
  border: none;
  border-radius: 0.12rem;
}
</style>
