import { request } from './http'

// 园区运营总览（首页 KPI + 资产总览 + 收入构成，单页聚合）
export function getOperationOverview() {
  return request({ url: '/biz/parkOperation/overview', method: 'get' })
}
