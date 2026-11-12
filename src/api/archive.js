import { request } from './http'

// 一园一档：园区基本信息（整体园区概况）
export function getParkInfo() {
  return request({ url: '/biz/parkArchive/parkInfo', method: 'get' })
}

// 一园一档：三园区列表（中部/东部/西部）
export function listParks() {
  return request({ url: '/biz/parkArchive/parkList', method: 'get' })
}

// 园区档案文件列表（支持 category/status/keyword）
export function listParkDocuments(params) {
  return request({ url: '/biz/parkArchive/documents', method: 'get', params })
}

// 园区档案文件详情
export function getParkDocument(id) {
  return request({ url: `/biz/parkArchive/document/${id}`, method: 'get' })
}

// 上传/新增园区档案文件
export function uploadParkDocument(data) {
  return request({ url: '/biz/parkArchive/document', method: 'post', data })
}

// 删除园区档案文件
export function deleteParkDocument(id) {
  return request({ url: `/biz/parkArchive/document/${id}`, method: 'delete' })
}

// 一企一档：企业列表（支持 keyword/industry/area/leaseStatus）
export function listEnterprises(params) {
  return request({ url: '/biz/parkArchive/enterprise/list', method: 'get', params })
}

// 一企一档：企业档案详情
export function getEnterprise(id) {
  return request({ url: `/biz/parkArchive/enterprise/${id}`, method: 'get' })
}
