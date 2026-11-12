<template>
  <div class="login-page">
    <div class="login-brand">
      <div class="brand-mark">浦</div>
      <div>
        <strong>浦江中国水晶产业园</strong>
        <span>综合管理移动端</span>
      </div>
    </div>

    <div class="login-form-wrap">
      <h1>欢迎登录</h1>
      <p>选择身份进入对应工作台</p>

      <!-- 身份选择 -->
      <div class="role-select">
        <div class="role-item" :class="{ active: role === 'admin' }" @click="role = 'admin'">
          <van-icon name="manager-o" />
          <span>管理端</span>
        </div>
        <div class="role-item" :class="{ active: role === 'enterprise' }" @click="role = 'enterprise'">
          <van-icon name="shop-o" />
          <span>企业端</span>
        </div>
      </div>

      <!-- 账号密码 -->
      <div class="login-fields">
        <div class="field">
          <span class="field-label">账号</span>
          <input v-model.trim="account" placeholder="请输入账号" />
        </div>
        <div class="field">
          <span class="field-label">密码</span>
          <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码" />
          <van-icon :name="showPassword ? 'eye-o' : 'closed-eye'" class="field-eye" @click="showPassword = !showPassword" />
        </div>
      </div>

      <button class="login-btn" @click="handleLogin">登 录</button>
      <p class="login-hint">演示环境：任意账号密码即可登录</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const role = ref('admin')
const account = ref('')
const password = ref('')
const showPassword = ref(false)

function handleLogin() {
  if (!account.value) return showFailToast('请输入账号')
  if (!password.value) return showFailToast('请输入密码')

  const enterpriseName = role.value === 'enterprise' ? '浦江水晶工艺品有限公司' : ''
  userStore.login({ role: role.value, enterpriseName })

  showSuccessToast('登录成功')
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect && redirect !== '/login') {
    router.replace(redirect)
  } else {
    router.replace(role.value === 'enterprise' ? '/enterprise/recruitment' : '/archive')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 1.5rem 0.42rem 0.5rem;
  background: linear-gradient(145deg, #eaf3ff 0%, #f7f9fc 48%, #fff 100%);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #182230;
}

.brand-mark {
  display: grid;
  width: 0.78rem;
  height: 0.78rem;
  place-items: center;
  color: #fff;
  font-size: 0.38rem;
  font-weight: 700;
  background: #1677ff;
  border-radius: 0.2rem;
  box-shadow: 0 0.1rem 0.26rem rgba(22, 119, 255, 0.26);
}

.login-brand strong,
.login-brand span {
  display: block;
}

.login-brand strong {
  font-size: 0.34rem;
}

.login-brand span {
  margin-top: 0.06rem;
  color: #8c98a8;
  font-size: 0.21rem;
}

.login-form-wrap {
  margin-top: 1.25rem;
}

.login-form-wrap h1 {
  margin: 0;
  font-size: 0.56rem;
  line-height: 1.3;
}

.login-form-wrap > p {
  margin: 0.12rem 0 0.5rem;
  color: #8c98a8;
  font-size: 0.25rem;
}

/* 身份选择 */
.role-select {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.2rem;
}

.role-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.12rem;
  padding: 0.32rem 0.16rem;
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 0.16rem;
  box-shadow: 0 0.08rem 0.24rem rgba(24, 34, 48, 0.04);
}

.role-item :deep(.van-icon) {
  font-size: 0.56rem;
  color: #8c98a8;
}

.role-item span {
  color: #182230;
  font-size: 0.3rem;
  font-weight: 600;
}

.role-item.active {
  background: #eaf3ff;
  border-color: #1677ff;
}

.role-item.active :deep(.van-icon) {
  color: #1677ff;
}

.role-item.active span {
  color: #1677ff;
}

/* 表单 */
.login-fields {
  overflow: hidden;
  margin-top: 0.4rem;
  background: #fff;
  border-radius: 0.18rem;
  box-shadow: 0 0.08rem 0.24rem rgba(24, 34, 48, 0.04);
}

.field {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.28rem 0.24rem;
  border-bottom: 1px solid #f0f2f5;
}

.field:last-child {
  border-bottom: none;
}

.field-label {
  flex-shrink: 0;
  width: 0.9rem;
  color: #182230;
  font-size: 0.28rem;
}

.field input {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: #182230;
  font-size: 0.28rem;
  background: transparent;
  border: none;
  outline: none;
}

.field input::placeholder {
  color: #c3cbd6;
}

.field-eye {
  color: #8c98a8;
  font-size: 0.32rem;
}

.login-btn {
  width: 100%;
  height: 0.9rem;
  margin-top: 0.4rem;
  color: #fff;
  font-size: 0.3rem;
  background: #1677ff;
  border: none;
  border-radius: 0.18rem;
}

.login-btn:active {
  opacity: 0.85;
}

.login-hint {
  margin-top: 0.28rem;
  color: #a2acb9;
  font-size: 0.21rem;
  text-align: center;
}
</style>
