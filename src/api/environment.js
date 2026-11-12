import { request } from './http'

// 环保首页总览（水/大气核心指标 + 预警快报 + 实时监测）
export function getEnvOverview() {
  return request({ url: '/biz/environment/overview', method: 'get' })
}

// ---------- 水环境 ----------
export function getWaterRealtime() {
  return request({ url: '/biz/environment/water/realtime', method: 'get' })
}
export function getWaterIndicators() {
  return request({ url: '/biz/environment/water/indicators', method: 'get' })
}
export function getRainMonitors() {
  return request({ url: '/biz/environment/water/rain', method: 'get' })
}
export function getWaterStat() {
  return request({ url: '/biz/environment/water/stat', method: 'get' })
}
export function getWaterAlerts() {
  return request({ url: '/biz/environment/water/alerts', method: 'get' })
}
export function getWaterHistory(point) {
  return request({ url: '/biz/environment/water/history', method: 'get', params: { point } })
}

// ---------- 大气环境 ----------
export function getAirRealtime() {
  return request({ url: '/biz/environment/air/realtime', method: 'get' })
}
export function getAirIndicators() {
  return request({ url: '/biz/environment/air/indicators', method: 'get' })
}
export function getAirStat() {
  return request({ url: '/biz/environment/air/stat', method: 'get' })
}
export function getAirAlerts() {
  return request({ url: '/biz/environment/air/alerts', method: 'get' })
}
export function getAirHistory(point) {
  return request({ url: '/biz/environment/air/history', method: 'get', params: { point } })
}
export function getSolidWaste() {
  return request({ url: '/biz/environment/air/solid-waste', method: 'get' })
}

// ---------- 企业源头管控 ----------
export function getElecMonitors() {
  return request({ url: '/biz/environment/source/elec', method: 'get' })
}
export function getElecAlerts() {
  return request({ url: '/biz/environment/source/elec/alerts', method: 'get' })
}

// 推进预警处置（type: water | air | elec；payload: { operator 处置人, remark 处置说明, images 现场照片 }）
export function advanceAlert(type, id, payload = {}) {
  return request({ url: '/biz/environment/alert/advance', method: 'post', data: { type, id, ...payload } })
}
