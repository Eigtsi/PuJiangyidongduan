<template>
  <div class="page detail-page">
    <ShellHeaderPortal>
      <div class="detail-header">
        <div class="back-btn" @click="router.back()"><van-icon name="arrow-left" /></div>
        <div class="title">园区档案文件</div>
        <div class="right" @click="openUpload"><van-icon name="plus" />上传</div>
      </div>
    </ShellHeaderPortal>

    <div class="content-padding detail-content">
      <!-- 分类筛选 -->
      <div class="category-chips">
        <div
          v-for="c in categories"
          :key="c"
          class="chip"
          :class="{ active: category === c }"
          @click="category = c"
        >
          {{ c }}
        </div>
      </div>

      <!-- 文档列表 -->
      <div v-if="list.length" class="file-list">
        <div v-for="f in list" :key="f.docId" class="file-item" @click="openDoc(f)">
          <div class="file-icon"><van-icon name="description" /></div>
          <div class="file-body">
            <div class="file-name">{{ f.docName }}</div>
            <div class="file-meta">{{ f.docCode }} · 发布 {{ f.publishDate }}</div>
          </div>
          <div class="file-right">
            <span class="status-tag" :class="f.status === '有效' ? 'tag-green' : 'tag-gray'">
              {{ f.status }}
            </span>
            <van-icon name="delete-o" class="file-del" @click.stop="confirmDelete(f)" />
          </div>
        </div>
      </div>
      <van-empty v-else description="该分类下暂无档案文件" />
    </div>

    <!-- 文件全文预览（全屏，可下滑查看全文） -->
    <van-popup v-model:show="showDetail" position="top" :style="{ height: '100%' }">
      <div v-if="current" class="doc-detail">
        <div class="doc-detail-head">
          <div class="doc-detail-title">{{ current.docName }}</div>
          <van-icon name="cross" class="doc-detail-close" @click="showDetail = false" />
        </div>
        <div class="doc-content">
          <div class="doc-content-title">全文内容</div>
          <p class="doc-content-text">{{ current.content }}</p>
        </div>
      </div>
    </van-popup>

    <!-- 上传文件弹层 -->
    <van-popup v-model:show="showUpload" position="bottom" round :style="{ maxHeight: '85%' }">
      <div class="upload-panel">
        <div class="upload-head">
          <span class="upload-title">上传档案文件</span>
          <van-icon name="cross" class="upload-close" @click="showUpload = false" />
        </div>
        <div class="upload-body">
          <label class="upload-file-pick">
            <input type="file" class="upload-file-input" @change="onPickFile" />
            <van-icon name="uploader" />
            <span>{{ uploadForm.fileSize ? `${uploadForm.docName}（${uploadForm.fileSize}）` : '选择本地文件（可选）' }}</span>
          </label>

          <div class="af-label">文件名称 <i>*</i></div>
          <input v-model="uploadForm.docName" class="af-input" type="text" placeholder="请输入文件名称" />

          <div class="af-label">分类 <i>*</i></div>
          <div class="cat-chips">
            <span
              v-for="c in uploadCategories"
              :key="c"
              class="cat-chip"
              :class="{ active: uploadForm.category === c }"
              @click="uploadForm.category = c"
            >
              {{ c }}
            </span>
          </div>

          <div class="af-label">版本</div>
          <input v-model="uploadForm.version" class="af-input" type="text" placeholder="如 V1.0" />

          <div class="af-label">发布日期</div>
          <input v-model="uploadForm.publishDate" class="af-input" type="text" placeholder="YYYY-MM-DD" />

          <div class="af-label">备注</div>
          <textarea v-model="uploadForm.remark" class="af-textarea" rows="2" placeholder="选填"></textarea>
        </div>
        <div class="upload-actions">
          <button type="button" class="ua-btn" @click="showUpload = false">取消</button>
          <button type="button" class="ua-btn primary" @click="submitUpload">上传</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
import ShellHeaderPortal from '@/components/ShellHeaderPortal.vue'
import { listParkDocuments, uploadParkDocument, deleteParkDocument } from '@/api/archive'

const router = useRouter()
const categories = ['全部', '规划环评', '应急预案', '管理制度', '项目准入']
const category = ref('全部')
const docs = ref([])
const showDetail = ref(false)
const current = ref(null)
const showUpload = ref(false)
const uploadCategories = ['规划环评', '应急预案', '管理制度', '项目准入']
const uploadForm = ref({})

const list = computed(() => {
  if (category.value === '全部') return docs.value
  return docs.value.filter((d) => d.category === category.value)
})

function openDoc(doc) {
  current.value = doc
  showDetail.value = true
}

async function loadDocs() {
  const res = await listParkDocuments()
  docs.value = res?.rows || []
}

function today() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function openUpload() {
  uploadForm.value = {
    docName: '',
    category: '管理制度',
    version: 'V1.0',
    publishDate: today(),
    remark: '',
    fileSize: '',
  }
  showUpload.value = true
}

function onPickFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  uploadForm.value.docName = file.name
  uploadForm.value.fileSize = formatSize(file.size)
  e.target.value = ''
}

async function submitUpload() {
  if (!(uploadForm.value.docName || '').trim()) {
    showToast('请填写文件名称')
    return
  }
  if (!uploadForm.value.category) {
    showToast('请选择分类')
    return
  }
  await uploadParkDocument({ ...uploadForm.value })
  showSuccessToast('已上传')
  showUpload.value = false
  await loadDocs()
}

async function confirmDelete(f) {
  try {
    await showConfirmDialog({
      title: '删除文件',
      message: `确认删除「${f.docName}」吗？删除后不可恢复。`,
    })
  } catch {
    return
  }
  await deleteParkDocument(f.docId)
  showSuccessToast('已删除')
  await loadDocs()
}

onMounted(loadDocs)
</script>

<style scoped>
.detail-header .right {
  display: flex;
  align-items: center;
  gap: 0.02rem;
  width: auto;
  padding-right: 0.12rem;
  color: #1677ff;
  font-size: 0.26rem;
}

.detail-header .right .van-icon {
  font-size: 0.28rem;
}

.file-right {
  display: flex;
  align-items: center;
}

.file-del {
  margin-left: 0.16rem;
  color: #f56c6c;
  font-size: 0.38rem;
}

.upload-panel {
  padding: 0.28rem 0.28rem calc(0.28rem + env(safe-area-inset-bottom));
}

.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-title {
  font-size: 0.32rem;
  font-weight: 700;
}

.upload-close {
  color: #8c98a8;
  font-size: 0.36rem;
}

.upload-file-pick {
  display: flex;
  align-items: center;
  gap: 0.12rem;
  padding: 0.2rem;
  margin: 0.2rem 0 0.04rem;
  overflow: hidden;
  color: #1677ff;
  font-size: 0.24rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: #eaf3ff;
  border: 1px dashed #1677ff;
  border-radius: 0.12rem;
}

.upload-file-input {
  display: none;
}

.af-label {
  margin: 0.18rem 0 0.08rem;
  color: #4a5568;
  font-size: 0.24rem;
}

.af-label i {
  color: #f56c6c;
  font-style: normal;
}

.af-input,
.af-textarea {
  width: 100%;
  padding: 0.16rem 0.2rem;
  color: #182230;
  font-size: 0.26rem;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  outline: none;
  box-sizing: border-box;
}

.af-textarea {
  font-size: 0.24rem;
  line-height: 1.6;
  resize: none;
}

.af-input:focus,
.af-textarea:focus {
  border-color: #1677ff;
}

.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.12rem;
}

.cat-chip {
  padding: 0.1rem 0.24rem;
  color: #687588;
  font-size: 0.22rem;
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 0.24rem;
}

.cat-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #eaf3ff;
  border-color: #1677ff;
}

.upload-actions {
  display: flex;
  gap: 0.2rem;
  margin-top: 0.28rem;
}

.ua-btn {
  flex: 1;
  padding: 0.16rem 0;
  color: #4a5568;
  font-size: 0.28rem;
  background: #f0f2f5;
  border: none;
  border-radius: 0.24rem;
}

.ua-btn.primary {
  color: #fff;
  background: #1677ff;
}

.category-chips {
  display: flex;
  gap: 0.16rem;
  margin-top: 0.2rem;
  padding-bottom: 0.04rem;
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

.file-list {
  display: flex;
  flex-direction: column;
  margin-top: 0.2rem;
  padding: 0 0.24rem;
  background: #fff;
  border-radius: 0.16rem;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.22rem 0;
  border-bottom: 1px solid #f0f2f5;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
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

.file-body {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  font-size: 0.27rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.file-right {
  margin-left: 0.12rem;
}

.doc-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.32rem 0.28rem calc(0.32rem + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.doc-detail-head {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.2rem;
}

.doc-detail-title {
  flex: 1;
  font-size: 0.32rem;
  font-weight: 700;
  line-height: 1.4;
}

.doc-detail-close {
  color: #8c98a8;
  font-size: 0.36rem;
}

.doc-content {
  flex: 1;
  min-height: 0;
  margin-top: 0.24rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.doc-content-title {
  font-size: 0.28rem;
  font-weight: 700;
}

.doc-content-text {
  margin: 0.16rem 0 0;
  color: #4a5568;
  font-size: 0.26rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
</style>
