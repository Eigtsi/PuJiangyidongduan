import { request } from './http'

// ---------- 我的账单 ----------
export function getEnterpriseBills(params = {}) {
  return request({ url: '/biz/enterpriseService/enterprise/bills', method: 'get', params })
}
export function payBill(id) {
  return request({ url: '/biz/enterpriseService/enterprise/bills/pay', method: 'post', data: { id } })
}

// ---------- 本企业招工 ----------
export function getEnterpriseRecruitments() {
  return request({ url: '/biz/enterpriseService/enterprise/recruitments', method: 'get' })
}
export function publishRecruitment(data) {
  return request({ url: '/biz/enterpriseService/enterprise/recruitment', method: 'post', data })
}

// ---------- 服务申请 / 进度 ----------
export function getEnterpriseApplications() {
  return request({ url: '/biz/enterpriseService/enterprise/applications', method: 'get' })
}
export function submitApplication(data) {
  return request({ url: '/biz/enterpriseService/enterprise/application', method: 'post', data })
}

// ---------- 本企业合同/房产资源 ----------
export function getEnterpriseContract() {
  return request({ url: '/biz/enterpriseService/enterprise/contract', method: 'get' })
}
