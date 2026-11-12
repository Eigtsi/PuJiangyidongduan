import { request } from './http'

// ---------- 招工管理 ----------
export function getRecruitmentList(params = {}) {
  return request({ url: '/biz/enterpriseService/recruitment/list', method: 'get', params })
}
export function getRecruitmentDetail(id) {
  return request({ url: `/biz/enterpriseService/recruitment/${id}`, method: 'get' })
}

// ---------- 统一核算 ----------
export function getBillingOverview() {
  return request({ url: '/biz/enterpriseService/billing/overview', method: 'get' })
}
export function getParkFeeStats(year) {
  return request({ url: '/biz/enterpriseService/billing/park-stats', method: 'get', params: { year } })
}
export function getBillingDetail(id) {
  return request({ url: `/biz/enterpriseService/billing/${id}`, method: 'get' })
}
export function sendBillingRemind(id) {
  return request({ url: '/biz/enterpriseService/billing/remind', method: 'post', data: { enterpriseId: id } })
}

// ---------- 业务提醒 ----------
export function getPaymentReminders() {
  return request({ url: '/biz/enterpriseService/reminder/payment', method: 'get' })
}
export function getContractReminders() {
  return request({ url: '/biz/enterpriseService/reminder/contract', method: 'get' })
}
export function getEquipmentReminders() {
  return request({ url: '/biz/enterpriseService/reminder/equipment', method: 'get' })
}
export function sendReminder(type, id) {
  return request({ url: '/biz/enterpriseService/reminder/send', method: 'post', data: { type, id } })
}

// ---------- 园区服务 ----------
export function getParkServiceList() {
  return request({ url: '/biz/enterpriseService/park-service/list', method: 'get' })
}
export function saveParkService(data) {
  return request({ url: '/biz/enterpriseService/park-service/save', method: 'post', data })
}
