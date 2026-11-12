<template>
  <div class="service-panel">
    <section class="card">
      <div class="ps-head">
        <div class="card-title">服务事项</div>
        <button class="ps-add" @click="openCreate"><van-icon name="plus" />新建</button>
      </div>

      <div class="type-chips">
        <span
          v-for="t in typeOptions"
          :key="t"
          class="filter-chip"
          :class="{ active: typeFilter === t }"
          @click="typeFilter = t"
        >{{ t }}</span>
      </div>

      <div class="ps-list">
        <van-empty v-if="!filteredList.length" description="暂无服务事项" image-size="64" />
        <div v-for="item in filteredList" :key="item.id" class="ps-item">
          <div class="ps-head">
            <span class="ps-type" :class="typeClass(item.type)">{{ item.type }}</span>
            <span class="ps-date">{{ item.publishDate }}</span>
          </div>
          <div class="ps-title">{{ item.title }}</div>
          <div class="ps-meta">
            <span>{{ item.images.length }} 张图片</span>
            <span class="dot">·</span>
            <span>{{ item.files.length }} 个附件</span>
          </div>
          <div class="ps-actions">
            <button class="ps-btn ghost" @click="openEdit(item)">修改</button>
            <button class="ps-btn" @click="openDetail(item)">查看</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 查看详情 -->
    <van-popup v-model:show="showDetail" position="bottom" round class="ps-popup">
      <div v-if="detail" class="ps-sheet">
        <div class="ps-sheet-head">
          <span class="ps-sheet-title">服务详情</span>
          <van-icon name="cross" class="ps-sheet-close" @click="showDetail = false" />
        </div>
        <div class="ps-sheet-body">
          <div class="ps-detail-tag"><span class="ps-type" :class="typeClass(detail.type)">{{ detail.type }}</span></div>
          <div class="ps-detail-title">{{ detail.title }}</div>
          <div class="ps-field"><span class="ps-label">发布时间</span><span class="ps-value">{{ detail.publishDate }}</span></div>
          <div class="ps-field block">
            <span class="ps-label">内容</span>
            <div class="ps-value intro">{{ detail.content }}</div>
          </div>
          <div class="ps-field block">
            <span class="ps-label">图片</span>
            <div v-if="detail.images.length" class="ps-img-grid">
              <img v-for="(img, i) in detail.images" :key="i" :src="img" class="ps-img" @click="previewImage(i)" />
            </div>
            <span v-else class="ps-none">无</span>
          </div>
          <div class="ps-field block">
            <span class="ps-label">附件</span>
            <div v-if="detail.files.length" class="ps-file-list">
              <div v-for="(f, i) in detail.files" :key="i" class="ps-file-row">
                <van-icon name="description" class="ps-file-icon" />
                <span class="ps-file-name">{{ f.name }}</span>
                <span class="ps-file-size">{{ formatSize(f.size) }}</span>
              </div>
            </div>
            <span v-else class="ps-none">无</span>
          </div>
          <div class="ps-field">
            <span class="ps-label">公众号链接</span>
            <span class="ps-value link">{{ detail.wechatLink || '无' }}</span>
          </div>
        </div>
        <div class="ps-sheet-foot">
          <button class="ps-submit" @click="openEdit(detail)">修改</button>
        </div>
      </div>
    </van-popup>

    <!-- 新建 / 修改 -->
    <van-popup v-model:show="showForm" position="bottom" round class="ps-popup">
      <div class="ps-sheet">
        <div class="ps-sheet-head">
          <span class="ps-sheet-title">{{ form.id ? '修改服务事项' : '新建服务事项' }}</span>
          <van-icon name="cross" class="ps-sheet-close" @click="showForm = false" />
        </div>
        <div class="ps-sheet-body">
          <div class="ps-form-field">
            <span class="ps-label">类型</span>
            <div class="type-chips">
              <span
                v-for="t in PARK_TYPES"
                :key="t"
                class="filter-chip"
                :class="{ active: form.type === t }"
                @click="form.type = t"
              >{{ t }}</span>
            </div>
          </div>

          <div class="ps-form-field">
            <span class="ps-label">标题</span>
            <input v-model="form.title" class="ps-input" placeholder="请输入标题" />
          </div>

          <div class="ps-form-field">
            <span class="ps-label">内容</span>
            <textarea v-model="form.content" class="ps-textarea" rows="4" placeholder="请输入文字内容" />
          </div>

          <div class="ps-form-field">
            <span class="ps-label">图片</span>
            <div class="ps-upload">
              <div v-for="(img, i) in form.images" :key="i" class="ps-img-cell">
                <img :src="img" class="ps-img-thumb" />
                <span class="ps-del" @click="form.images.splice(i, 1)">×</span>
              </div>
              <label class="ps-upload-add">
                <van-icon name="plus" />
                <input type="file" accept="image/*" multiple hidden @change="onPickImages" />
              </label>
            </div>
          </div>

          <div class="ps-form-field">
            <span class="ps-label">附件</span>
            <div v-if="form.files.length" class="ps-file-list">
              <div v-for="(f, i) in form.files" :key="i" class="ps-file-row">
                <van-icon name="description" class="ps-file-icon" />
                <span class="ps-file-name">{{ f.name }}</span>
                <span class="ps-file-size">{{ formatSize(f.size) }}</span>
                <span class="ps-del" @click="form.files.splice(i, 1)">×</span>
              </div>
            </div>
            <label class="ps-file-add">
              <van-icon name="plus" /> 添加附件
              <input type="file" multiple hidden @change="onPickFiles" />
            </label>
          </div>

          <div class="ps-form-field">
            <span class="ps-label">公众号链接</span>
            <input v-model="form.wechatLink" class="ps-input" placeholder="请输入微信公众号链接" />
          </div>
        </div>
        <div class="ps-sheet-foot">
          <button class="ps-submit" @click="submit">保存</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { showFailToast, showSuccessToast, showImagePreview } from 'vant'
import { getParkServiceList, saveParkService } from '@/api/service'

const PARK_TYPES = ['党建活动', '消防演练', '上门服务', '其他']

const list = ref([])
const typeFilter = ref('全部')
const showDetail = ref(false)
const showForm = ref(false)
const detail = ref(null)

const typeOptions = computed(() => ['全部', ...PARK_TYPES])
const filteredList = computed(() =>
  typeFilter.value === '全部' ? list.value : list.value.filter((i) => i.type === typeFilter.value),
)

const emptyForm = () => ({ id: null, type: '党建活动', title: '', content: '', images: [], files: [], wechatLink: '' })
const form = ref(emptyForm())

function typeClass(type) {
  return { 党建活动: 't-red', 消防演练: 't-orange', 上门服务: 't-blue', 其他: 't-gray' }[type] || 't-gray'
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + 'MB'
  return Math.round(bytes / 1024) + 'KB'
}

async function load() {
  const res = await getParkServiceList()
  list.value = res.rows || []
}

function openDetail(item) {
  detail.value = item
  showDetail.value = true
}

function openCreate() {
  form.value = emptyForm()
  showForm.value = true
}

function openEdit(item) {
  showDetail.value = false
  form.value = {
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content,
    images: [...(item.images || [])],
    files: (item.files || []).map((f) => ({ ...f })),
    wechatLink: item.wechatLink || '',
  }
  showForm.value = true
}

function previewImage(i) {
  showImagePreview({ images: detail.value.images, startPosition: i })
}

function onPickImages(e) {
  const files = Array.from(e.target.files || [])
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => form.value.images.push(reader.result)
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function onPickFiles(e) {
  const files = Array.from(e.target.files || [])
  files.forEach((file) => form.value.files.push({ name: file.name, size: file.size }))
  e.target.value = ''
}

async function submit() {
  if (!form.value.title.trim()) return showFailToast('请输入标题')
  if (!form.value.content.trim()) return showFailToast('请输入内容')
  await saveParkService({ ...form.value })
  showSuccessToast(form.value.id ? '修改成功' : '发布成功')
  showForm.value = false
  await load()
}

onMounted(load)
</script>

<style scoped>
.service-panel {
  padding: 0.24rem;
}

.ps-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.16rem;
}

.ps-head .card-title {
  margin-bottom: 0;
}

.ps-add {
  display: flex;
  align-items: center;
  gap: 0.06rem;
  padding: 0.1rem 0.2rem;
  color: #fff;
  font-size: 0.22rem;
  line-height: 1;
  background: #1677ff;
  border: none;
  border-radius: 0.36rem;
}

/* 类型筛选 */
.type-chips {
  display: flex;
  gap: 0.12rem;
  margin-top: 0.16rem;
  overflow-x: auto;
}

.filter-chip {
  flex-shrink: 0;
  padding: 0.1rem 0.22rem;
  color: #7a8699;
  font-size: 0.22rem;
  line-height: 1;
  background: #f2f4f7;
  border-radius: 0.28rem;
  transition: all 0.2s ease;
}

.filter-chip.active {
  color: #1677ff;
  font-weight: 600;
  background: #eaf3ff;
}

/* 列表 */
.ps-list {
  display: flex;
  flex-direction: column;
  gap: 0.16rem;
  margin-top: 0.2rem;
}

.ps-item {
  padding: 0.2rem;
  background: #f7f8fa;
  border-radius: 0.12rem;
}

.ps-type {
  flex-shrink: 0;
  padding: 0.04rem 0.12rem;
  font-size: 0.2rem;
  border-radius: 0.06rem;
}

.ps-type.t-red { color: #e6535a; background: #fdecec; }
.ps-type.t-orange { color: #e08a2e; background: #fdf2e7; }
.ps-type.t-blue { color: #1677ff; background: #eaf3ff; }
.ps-type.t-gray { color: #8c98a8; background: #eef0f3; }

.ps-date {
  color: #8c98a8;
  font-size: 0.2rem;
}

.ps-title {
  margin-top: 0.12rem;
  color: #182230;
  font-size: 0.28rem;
  font-weight: 600;
  line-height: 1.4;
}

.ps-meta {
  display: flex;
  align-items: center;
  gap: 0.08rem;
  margin-top: 0.12rem;
  color: #8c98a8;
  font-size: 0.2rem;
}

.ps-meta .dot {
  color: #c3cbd6;
}

.ps-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.12rem;
  margin-top: 0.16rem;
}

.ps-btn {
  min-width: 1.2rem;
  padding: 0.1rem 0.24rem;
  color: #fff;
  font-size: 0.22rem;
  line-height: 1;
  background: #1677ff;
  border: none;
  border-radius: 0.28rem;
}

.ps-btn.ghost {
  color: #1677ff;
  background: #eaf3ff;
}

/* 弹层 */
.ps-popup {
  max-height: 85vh;
  border-radius: 0.24rem 0.24rem 0 0;
  overflow: hidden;
}

.ps-sheet {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.ps-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.28rem 0.24rem 0.2rem;
  border-bottom: 1px solid #f0f2f5;
}

.ps-sheet-title {
  color: #182230;
  font-size: 0.3rem;
  font-weight: 600;
}

.ps-sheet-close {
  color: #8c98a8;
  font-size: 0.32rem;
}

.ps-sheet-body {
  padding: 0.24rem;
  overflow-y: auto;
}

.ps-sheet-foot {
  padding: 0.16rem 0.24rem calc(0.24rem + env(safe-area-inset-bottom));
}

.ps-detail-tag {
  margin-bottom: 0.12rem;
}

.ps-detail-title {
  color: #182230;
  font-size: 0.32rem;
  font-weight: 700;
  line-height: 1.4;
}

.ps-field {
  display: flex;
  align-items: flex-start;
  gap: 0.16rem;
  padding: 0.14rem 0;
  font-size: 0.24rem;
}

.ps-field.block {
  flex-direction: column;
  gap: 0.1rem;
}

.ps-label {
  flex-shrink: 0;
  color: #8c98a8;
}

.ps-value {
  flex: 1;
  color: #182230;
  text-align: right;
  word-break: break-all;
}

.ps-field.block .ps-value {
  text-align: left;
}

.ps-value.intro {
  line-height: 1.6;
}

.ps-value.link {
  color: #1677ff;
}

.ps-none {
  color: #c3cbd6;
}

.ps-img-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.12rem;
}

.ps-img {
  width: 100%;
  height: 1.6rem;
  object-fit: cover;
  border-radius: 0.1rem;
}

.ps-file-list {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  width: 100%;
}

.ps-file-row {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  padding: 0.12rem;
  background: #f7f8fa;
  border-radius: 0.08rem;
}

.ps-file-icon {
  flex-shrink: 0;
  color: #1677ff;
  font-size: 0.28rem;
}

.ps-file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #182230;
  font-size: 0.22rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ps-file-size {
  flex-shrink: 0;
  color: #8c98a8;
  font-size: 0.2rem;
}

/* 表单 */
.ps-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin-bottom: 0.2rem;
}

.ps-form-field .type-chips {
  margin-top: 0;
}

.ps-input {
  padding: 0.14rem 0.16rem;
  color: #182230;
  font-size: 0.24rem;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  outline: none;
}

.ps-input:focus {
  border-color: #1677ff;
  background: #fff;
}

.ps-input::placeholder {
  color: #c3cbd6;
}

.ps-textarea {
  padding: 0.14rem 0.16rem;
  color: #182230;
  font-size: 0.24rem;
  line-height: 1.6;
  background: #f5f6f8;
  border: 1px solid transparent;
  border-radius: 0.1rem;
  outline: none;
  resize: none;
}

.ps-textarea:focus {
  border-color: #1677ff;
  background: #fff;
}

.ps-textarea::placeholder {
  color: #c3cbd6;
}

.ps-upload {
  display: flex;
  flex-wrap: wrap;
  gap: 0.12rem;
}

.ps-img-cell {
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
}

.ps-img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.1rem;
}

.ps-del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.36rem;
  height: 0.36rem;
  flex-shrink: 0;
  color: #fff;
  font-size: 0.24rem;
  line-height: 1;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.ps-img-cell .ps-del {
  position: absolute;
  top: -0.1rem;
  right: -0.1rem;
}

.ps-file-row .ps-del {
  width: auto;
  height: auto;
  padding: 0 0.04rem;
  color: #8c98a8;
  background: transparent;
  border-radius: 0;
}

.ps-upload-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: #8c98a8;
  font-size: 0.4rem;
  background: #f5f6f8;
  border: 1px dashed #c3cbd6;
  border-radius: 0.1rem;
}

.ps-file-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.08rem;
  padding: 0.14rem;
  color: #1677ff;
  font-size: 0.22rem;
  background: #eaf3ff;
  border-radius: 0.1rem;
}

.ps-submit {
  width: 100%;
  padding: 0.18rem 0;
  color: #fff;
  font-size: 0.28rem;
  font-weight: 600;
  background: #1677ff;
  border: none;
  border-radius: 0.14rem;
}
</style>
