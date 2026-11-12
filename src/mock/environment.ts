import Mock from 'mockjs'

// 工具函数（与 index.ts 保持一致）
const ok = (data: unknown, msg = 'success') => ({ code: 200, msg, data })

// ============ 水环境（对齐大屏 parkMonitor.ts 中部/东部园区污水处理厂排污口）============
// 排污口监测指标（污水口径：PH/COD/氨氮/总氮/总磷/氟化物/流量）
const WATER_INDICATORS = [
  { field: 'phValue', name: 'PH', unit: '', limit: '6~9' },
  { field: 'codValue', name: 'COD', unit: 'mg/L', limit: '≤50' },
  { field: 'ammoniaNitrogen', name: '氨氮', unit: 'mg/L', limit: '≤5' },
  { field: 'totalNitrogen', name: '总氮', unit: 'mg/L', limit: '≤15' },
  { field: 'totalPhosphorus', name: '总磷', unit: 'mg/L', limit: '≤0.5' },
  { field: 'fluorideValue', name: '氟化物', unit: 'mg/L', limit: '≤10' },
  { field: 'flowRate', name: '流量', unit: 'm³/h', limit: '-' },
]

// 排污口实时监测（中部园区污水处理厂排口 + 东部园区污水处理厂排污口，三级状态：正常/黄色预警/红色预警）
const WATER_REALTIME = [
  { point: '中部园区污水处理厂排口', phValue: 7.2, codValue: 38.6, ammoniaNitrogen: 3.2, totalNitrogen: 11.8, totalPhosphorus: 0.38, fluorideValue: 8.6, flowRate: 120, monitorTime: '2025-06-25 11:00:00', statusLevel: '黄色预警' },
  { point: '东部园区污水处理厂排污口', phValue: 7.5, codValue: 32.1, ammoniaNitrogen: 2.8, totalNitrogen: 10.2, totalPhosphorus: 0.35, fluorideValue: 6.8, flowRate: 98, monitorTime: '2025-06-25 11:00:00', statusLevel: '正常' },
]

// 排污口历史数据（近 7 天，每 1 小时一条，用于历史数据查看）
function pad2(n: number) {
  return n < 10 ? '0' + n : '' + n
}
function fmtTime(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:00:00`
}
function genWaterHistory(point: string) {
  const isMiddle = point.includes('中部')
  const b = isMiddle
    ? { ph: 7.2, cod: 38.6, nh: 3.2, tn: 11.8, tp: 0.38, f: 8.6, flow: 120 }
    : { ph: 7.5, cod: 32.1, nh: 2.8, tn: 10.2, tp: 0.35, f: 6.8, flow: 98 }
  const list: any[] = []
  const end = new Date(2025, 5, 25, 11, 0, 0)
  const total = 168
  for (let i = total; i >= 0; i--) {
    const t = end.getTime() - i * 3600 * 1000
    const d = new Date(t)
    const w = Math.sin(i * 0.28) + Math.sin(i * 0.12)
    const drift = (total - i) / total
    const ph = +(b.ph + w * 0.1).toFixed(2)
    const cod = Math.round(b.cod + w * 4 + drift * 4)
    const nh = +(b.nh + w * 0.15).toFixed(1)
    const tn = +(b.tn + w * 0.4).toFixed(1)
    const tp = +(b.tp + w * 0.02).toFixed(2)
    const f = +(b.f + w * 0.7 + drift * 0.9).toFixed(1)
    const flow = Math.round(b.flow + w * 5)
    let statusLevel = '正常'
    if (f > 10 || cod > 50) statusLevel = '黄色预警'
    if (f > 11.5 || cod > 62) statusLevel = '红色预警'
    list.push({ time: fmtTime(d), phValue: ph, codValue: cod, ammoniaNitrogen: nh, totalNitrogen: tn, totalPhosphorus: tp, fluorideValue: f, flowRate: flow, statusLevel })
  }
  return list
}

// 大气监测站历史数据（近 7 天，每 1 小时一条）
function genAirHistory(point: string) {
  const high = point.includes('点位2')
  const b = high
    ? { pm25: 66, pm10: 132, so2: 98, no2: 66, o3: 148, tvoc: 0.98, noise: 57 }
    : { pm25: 58, pm10: 104, so2: 74, no2: 50, o3: 136, tvoc: 0.72, noise: 53 }
  const list: any[] = []
  const end = new Date(2025, 5, 25, 11, 0, 0)
  const total = 168
  for (let i = total; i >= 0; i--) {
    const t = end.getTime() - i * 3600 * 1000
    const d = new Date(t)
    const w = Math.sin(i * 0.28) + Math.sin(i * 0.12)
    const drift = (total - i) / total
    const pm25 = Math.round(b.pm25 + w * 8 + drift * 6)
    const pm10 = Math.round(b.pm10 + w * 14 + drift * 10)
    const so2 = Math.round(b.so2 + w * 10 + drift * 8)
    const no2 = Math.round(b.no2 + w * 8 + drift * 5)
    const o3 = Math.round(b.o3 + w * 12 + drift * 8)
    const tvoc = +(b.tvoc + w * 0.12 + drift * 0.15).toFixed(2)
    const noise = Math.round(b.noise + w * 3 + drift * 2)
    let statusLevel = '正常'
    if (tvoc > 1.0 || pm25 > 115) statusLevel = '黄色预警'
    if (tvoc > 1.3 || pm25 > 150) statusLevel = '红色预警'
    list.push({ time: fmtTime(d), pm25, pm10, so2, no2, o3, tvoc, noise, statusLevel })
  }
  return list
}

// 雨排口视频监控（对齐大屏 monitoringPoints.ts rain_outlet 4 个点位，视频监测）
const RAIN_MONITORS = [
  { id: 'ro-001', name: 'A区雨排口', online: true },
  { id: 'ro-002', name: 'B区雨排口', online: true },
  { id: 'ro-003', name: 'C区雨排口', online: true },
  { id: 'ro-004', name: '南侧主干雨排口', online: false },
]

// 水环境统计
const WATER_STAT = {
  totalMonitorPoints: 2,
  normalRate: 86.4,
  monitorFactors: 6,
  alertCount: 4,
  totalMonitorTimes: 360,
  topRiskFactor: '氟化物',
  factorDetail: [
    { factor: 'PH', avg: '7.05', limit: '6~9', rate: 100, exceedCount: 0, risk: '低', eval: '稳定达标' },
    { factor: 'COD', avg: '44.2', limit: '≤50', rate: 87.2, exceedCount: 23, risk: '中', eval: '接近限值，需关注' },
    { factor: '氨氮', avg: '3.6', limit: '≤5', rate: 92.5, exceedCount: 14, risk: '低', eval: '稳定达标' },
    { factor: '总氮', avg: '12.0', limit: '≤15', rate: 88.0, exceedCount: 18, risk: '中', eval: '接近限值，需关注' },
    { factor: '总磷', avg: '0.38', limit: '≤0.5', rate: 93.3, exceedCount: 12, risk: '低', eval: '稳定达标' },
    { factor: '氟化物', avg: '8.6', limit: '≤10', rate: 84.5, exceedCount: 28, risk: '高', eval: '重点管控因子' },
  ],
}

// 现场照片占位（内联 SVG，无需真实上传）
function mockImage(label, color) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="' + color + '"/><text x="50%" y="46%" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">现场照片</text><text x="50%" y="60%" fill="#fff" font-size="16" text-anchor="middle" font-family="sans-serif">' + label + '</text></svg>'
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

// 水环境预警事件（处置流程对齐 PC 端 sewage-monitor.vue 预警记录：处置人 + 处置说明 + 现场照片；状态 待处置/处理中/已处理）
let WATER_ALERTS = [
  {
    id: 'W20250625001', source: '水环境', point: '中部园区污水处理厂排口', indicator: '氟化物', value: 11.5, unit: 'mg/L', standardValue: '≥10', level: '红色', status: '待处置', occurTime: '2025-06-25 10:30:00', handler: '', remark: '',
    processLog: [{ action: '系统触发预警', operator: '系统', time: '2025-06-25 10:30:00', remark: '氟化物实测 11.5 mg/L 超阈值 10 mg/L，已通过 系统消息、短信 推送至 园区监管员、运维人员' }],
  },
  {
    id: 'W20250625002', source: '水环境', point: '东部园区污水处理厂排污口', indicator: 'COD', value: 62.4, unit: 'mg/L', standardValue: '40~50', level: '黄色', status: '处理中', occurTime: '2025-06-25 10:15:00', handler: '王运维', remark: '已通知企业排查前端工艺，检查化学沉淀池加药情况。',
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-25 10:15:00', remark: 'COD 实测 62.4 mg/L 超阈值 50 mg/L，已推送至 运维人员' },
      { action: '开始处置', operator: '王运维', time: '2025-06-25 10:40:00', remark: '已通知企业排查前端工艺，检查化学沉淀池加药情况。' },
    ],
  },
  {
    id: 'W20250624003', source: '水环境', point: '中部园区污水处理厂排口', indicator: '氟化物', value: 9.8, unit: 'mg/L', standardValue: '≥9', level: '红色', status: '已处理', occurTime: '2025-06-24 16:40:00', handler: '李监管', remark: '复测氟化物 7.2 mg/L，已达标，处置闭环。',
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-24 16:40:00', remark: '氟化物实测 9.8 mg/L 超阈值 9 mg/L，已推送至 园区监管员、运维人员' },
      { action: '开始处置', operator: '王运维', time: '2025-06-24 17:05:00', remark: '到场核查，确认为加药量不足，已调整钙盐投加比例。' },
      { action: '完成处置', operator: '李监管', time: '2025-06-24 18:20:00', remark: '复测氟化物 7.2 mg/L，已达标，处置闭环。', images: [mockImage('中部园区污水处理厂排口 复测', '#5a8dc2'), mockImage('氟化物复测达标', '#67a86a')] },
    ],
  },
  {
    id: 'W20250624004', source: '水环境', point: '东部园区污水处理厂排污口', indicator: 'COD', value: 53.2, unit: 'mg/L', standardValue: '40~50', level: '黄色', status: '已处理', occurTime: '2025-06-24 09:20:00', handler: '李监管', remark: '复测 COD 41 mg/L，达标闭环。',
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-24 09:20:00', remark: 'COD 实测 53.2 mg/L 超阈值 50 mg/L，已推送至 运维人员' },
      { action: '开始处置', operator: '张运维', time: '2025-06-24 09:45:00', remark: '排查发现进水浓度偏高，已降低生产负荷。' },
      { action: '完成处置', operator: '李监管', time: '2025-06-24 11:10:00', remark: '复测 COD 41 mg/L，达标闭环。', images: [mockImage('东部园区污水处理厂排污口 复测', '#5a8dc2'), mockImage('COD 复测达标', '#67a86a')] },
    ],
  },
]

// ============ 大气环境（对齐大屏 parkMonitor.ts 中部园区 2 个大气监测站）============
// 大气监测指标（PM2.5/PM10/SO2/NO2/O3/TVOC + 噪音）
const AIR_INDICATORS = [
  { field: 'pm25', name: 'PM2.5', unit: 'μg/m³', limit: '≤115' },
  { field: 'pm10', name: 'PM10', unit: 'μg/m³', limit: '≤250' },
  { field: 'so2', name: 'SO2', unit: 'μg/m³', limit: '≤475' },
  { field: 'no2', name: 'NO2', unit: 'μg/m³', limit: '≤200' },
  { field: 'o3', name: 'O3', unit: 'μg/m³', limit: '≤215' },
  { field: 'tvoc', name: 'TVOC', unit: 'mg/m³', limit: '≤1.0' },
  { field: 'noise', name: '噪音', unit: 'dB', limit: '昼≤65 · 夜≤55' },
]

// 大气监测站实时（中部园区点位1/点位2 最新，三级状态）
const AIR_REALTIME = [
  { point: '中部园区点位1', pm25: 58, pm10: 104, so2: 74, no2: 50, o3: 136, tvoc: 0.72, noise: 53, statusLevel: '正常', monitorTime: '2025-06-25 10:00:00' },
  { point: '中部园区点位2', pm25: 66, pm10: 132, so2: 98, no2: 66, o3: 148, tvoc: 0.98, noise: 57, statusLevel: '黄色预警', monitorTime: '2025-06-25 10:00:00' },
]

// 大气环境统计
const AIR_STAT = {
  totalStations: 2,
  monitorFactors: 5,
  avgTvoc: 0.68,
  tvocRatio: 68,
  complianceRate: 87.5,
  alertCount: 18,
  totalMonitorTimes: 4320,
  topRiskFactor: 'TVOC',
}

// 大气环境预警事件（处置流程对齐 PC 端 air/monitor.vue 预警记录：处置人 + 处置说明 + 现场照片）
let AIR_ALERTS = [
  {
    id: 'A20250625001', source: '大气环境', point: '中部园区点位2', indicator: 'TVOC', value: 0.98, unit: 'mg/m³', standardValue: '0.6~1.0', level: '黄色', status: '待处置', occurTime: '2025-06-25 09:50:00', handler: '', remark: '',
    processLog: [{ action: '系统触发预警', operator: '系统', time: '2025-06-25 09:50:00', remark: 'TVOC黄色预警，实测 0.98 超标准值 0.6~1.0，已推送至相关人员' }],
  },
  {
    id: 'A20250625002', source: '大气环境', point: '中部园区点位2', indicator: 'TVOC', value: 1.03, unit: 'mg/m³', standardValue: '≥1.0', level: '红色', status: '处理中', occurTime: '2025-06-25 08:30:00', handler: '张伟', remark: '已到场核查并采取处置措施。',
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-25 08:30:00', remark: 'TVOC红色超标，实测 1.03 超标准值 ≥1.0，已推送至相关人员' },
      { action: '开始处置', operator: '张伟', time: '2025-06-25 09:00:00', remark: '已到场核查并采取处置措施。' },
    ],
  },
  {
    id: 'A20250624003', source: '大气环境', point: '中部园区点位1', indicator: 'TVOC', value: 1.15, unit: 'mg/m³', standardValue: '≥1.0', level: '红色', status: '已处理', occurTime: '2025-06-24 15:20:00', handler: '王强', remark: '复测达标，处置闭环。',
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-24 15:20:00', remark: 'TVOC红色超标，实测 1.15 超标准值 ≥1.0，已推送至相关人员' },
      { action: '开始处置', operator: '李娜', time: '2025-06-24 15:45:00', remark: '已到场核查并采取处置措施。' },
      { action: '完成处置', operator: '王强', time: '2025-06-24 16:30:00', remark: '复测达标，处置闭环。', images: [mockImage('中部园区点位1 复测', '#5a8dc2'), mockImage('设施复测', '#67a86a')] },
    ],
  },
]

// 收运中转记录（对齐大屏 SolidWasteContent.vue：近3个月 2026-08-01 ~ 2026-10-28，固废/废水各1条/天；危废为平台手动导入）
// 园区（对齐 PC 端 air.js parks：中部/东部/西部）
const SOLID_WASTE_PARKS = ['中部园区', '东部园区', '西部园区']
const TRANSFER_PLATES = ['浙G·D3852', '浙G·A1176', '浙G·E8821', '浙G·G4519', '浙G·B2093', '浙G·F7310', '浙G·H6037', '浙G·C5568']

const TRANSFER_RECORDS = (() => {
  const pads = (n, len = 2) => String(n).padStart(len, '0')
  const dayMs = 24 * 60 * 60 * 1000
  const startDay = new Date(2026, 7, 1) // 2026-08-01
  const endDay = new Date(2026, 9, 28) // 2026-10-28
  const catDefs = [
    { cat: '固废', hour: 9, netBase: 9, span: 5 },
    { cat: '废水', hour: 15, netBase: 22, span: 9 },
  ]
  const list = []
  for (let t = startDay.getTime(); t <= endDay.getTime(); t += dayMs) {
    const d = new Date(t)
    const dayIdx = Math.round((t - startDay.getTime()) / dayMs)
    const date = `${d.getFullYear()}-${pads(d.getMonth() + 1)}-${pads(d.getDate())}`
    catDefs.forEach((c, ci) => {
      const net = c.netBase + (dayIdx % c.span) + ((dayIdx + ci) % 10) * 0.1
      const tare = 6.0 + (dayIdx % 5) * 0.1
      const minute = 10 + ((dayIdx * 7 + ci * 13) % 45)
      const dt = new Date(d)
      dt.setHours(c.hour, minute, 0, 0)
      const tareDt = new Date(dt.getTime() - 18 * 60 * 1000)
      const fmtHM = (x) => `${pads(x.getHours())}:${pads(x.getMinutes())}`
      const fmtFull = (x) => `${pads(x.getMonth() + 1)}-${pads(x.getDate())} ${fmtHM(x)}`
      list.push({
        serial: `PF${date.replace(/-/g, '')}${pads(ci + 1, 3)}`,
        plate: TRANSFER_PLATES[(dayIdx + ci) % TRANSFER_PLATES.length],
        category: c.cat,
        park: SOLID_WASTE_PARKS[(dayIdx + ci) % SOLID_WASTE_PARKS.length],
        date,
        time: fmtFull(dt),
        gross: (net + tare).toFixed(2),
        tare: tare.toFixed(1),
        net: net.toFixed(2),
        tareTime: fmtFull(tareDt),
      })
    })
  }
  return list
})()

// 危废手动导入（平台录入，非车辆运输）：近3个月每天一条
const HAZARDOUS_IMPORTS = (() => {
  const pads = (n) => String(n).padStart(2, '0')
  const dayMs = 24 * 60 * 60 * 1000
  const startDay = new Date(2026, 7, 1)
  const endDay = new Date(2026, 9, 28)
  const list = []
  for (let t = startDay.getTime(); t <= endDay.getTime(); t += dayMs) {
    const d = new Date(t)
    const dayIdx = Math.round((t - startDay.getTime()) / dayMs)
    const date = `${d.getFullYear()}-${pads(d.getMonth() + 1)}-${pads(d.getDate())}`
    list.push({ date, park: SOLID_WASTE_PARKS[dayIdx % SOLID_WASTE_PARKS.length], amount: +(1.5 + (dayIdx % 6) * 0.2).toFixed(2) })
  }
  return list
})()

// 固废处置（仅收运中转记录；固废总量/三废量/外运与转运面板已删）
const SOLID_WASTE = {
  parks: SOLID_WASTE_PARKS,
  transferRecords: TRANSFER_RECORDS,
  hazardousImports: HAZARDOUS_IMPORTS,
}

// ============ 企业源头管控（对齐 PC 端 api/environment/source.js）============
// 企业环保设备功率监控（生产设备 vs 环保设备，环保设备未开启预警）
const ELEC_MONITORS = [
  { id: 1, enterpriseName: '浦江水晶工艺品有限公司', region: '浦江水晶产业园（中部）', prodUsage: 132, prodThreshold: 100, treatUsage: 46, treatThreshold: 20, alarmStatus: '正常', monitorTime: '2025-06-25 10:00:00' },
  { id: 2, enterpriseName: '金华晶盛水晶加工厂', region: '浦江水晶产业园（中部）', prodUsage: 186, prodThreshold: 100, treatUsage: 8, treatThreshold: 20, alarmStatus: '环保设备未开启', monitorTime: '2025-06-25 10:00:00' },
  { id: 3, enterpriseName: '浦江璀璨水晶有限公司', region: '浦江水晶产业园（东部）', prodUsage: 98, prodThreshold: 100, treatUsage: 35, treatThreshold: 20, alarmStatus: '正常', monitorTime: '2025-06-25 10:00:00' },
  { id: 4, enterpriseName: '浙江晶亮光学科技', region: '浦江水晶产业园（西部）', prodUsage: 152, prodThreshold: 100, treatUsage: 12, treatThreshold: 20, alarmStatus: '环保设备未开启', monitorTime: '2025-06-25 10:00:00' },
  { id: 5, enterpriseName: '浦江华美包装', region: '浦江水晶产业园（中部）', prodUsage: 76, prodThreshold: 100, treatUsage: 28, treatThreshold: 20, alarmStatus: '正常', monitorTime: '2025-06-25 10:00:00' },
  { id: 6, enterpriseName: '浦江精工水晶', region: '浦江水晶产业园（东部）', prodUsage: 118, prodThreshold: 100, treatUsage: 42, treatThreshold: 20, alarmStatus: '正常', monitorTime: '2025-06-25 10:00:00' },
]

// 企业环保设备未开启预警事件（生产设备功率达阈值 + 环保设备未达阈值触发；无红/黄预警分级；状态：未处置/处置中/已处置）
let ELEC_ALERTS = [
  {
    id: 'ELEC00002', source: '企业源头', point: '金华晶盛水晶加工厂', indicator: '环保设备未开启', value: '生产 186kW / 环保 8kW', unit: '', standardValue: '生产 ≥100kW · 环保 ≥20kW', level: '', status: '未处置', occurTime: '2025-06-25 10:00:00',
    enterpriseCode: 'QY002', enterpriseName: '金华晶盛水晶加工厂', region: '浦江水晶产业园（中部）', monitorTime: '2025-06-25 10:00:00', prodUsage: 186, prodThreshold: 100, treatUsage: 8, treatThreshold: 20,
    processLog: [{ action: '系统触发预警', operator: '系统', time: '2025-06-25 10:00:00', remark: '企业生产设备功率 186 KW.h（达阈值 100），环保设备功率仅 8 KW.h（未达阈值 20），判定环保设备未开启。' }],
  },
  {
    id: 'ELEC00004', source: '企业源头', point: '浙江晶亮光学科技', indicator: '环保设备未开启', value: '生产 152kW / 环保 12kW', unit: '', standardValue: '生产 ≥100kW · 环保 ≥20kW', level: '', status: '处置中', occurTime: '2025-06-25 10:00:00',
    enterpriseCode: 'QY004', enterpriseName: '浙江晶亮光学科技', region: '浦江水晶产业园（西部）', monitorTime: '2025-06-25 10:00:00', prodUsage: 152, prodThreshold: 100, treatUsage: 12, treatThreshold: 20,
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-25 10:00:00', remark: '企业生产设备功率 152 KW.h（达阈值 100），环保设备功率仅 12 KW.h（未达阈值 20），判定环保设备未开启。' },
      { action: '开始处置', operator: '张运维', time: '2025-06-25 10:30:00', remark: '已通知企业现场核查，督促开启环保设备。' },
    ],
  },
  {
    id: 'ELEC00007', source: '企业源头', point: '浦江精工水晶', indicator: '环保设备未开启', value: '生产 165kW / 环保 10kW', unit: '', standardValue: '生产 ≥100kW · 环保 ≥20kW', level: '', status: '已处置', occurTime: '2025-06-24 09:00:00',
    enterpriseCode: 'QY007', enterpriseName: '浦江精工水晶', region: '浦江水晶产业园（东部）', monitorTime: '2025-06-24 09:00:00', prodUsage: 165, prodThreshold: 100, treatUsage: 10, treatThreshold: 20,
    processLog: [
      { action: '系统触发预警', operator: '系统', time: '2025-06-24 09:00:00', remark: '企业生产设备功率 165 KW.h（达阈值 100），环保设备功率仅 10 KW.h（未达阈值 20），判定环保设备未开启。' },
      { action: '开始处置', operator: '李运维', time: '2025-06-24 09:20:00', remark: '已通知企业现场核查，督促开启环保设备。' },
      { action: '完成处置', operator: '李运维', time: '2025-06-24 10:10:00', remark: '环保设备已开启，功率恢复至 42 KW.h，达到阈值要求，预警解除。', images: [mockImage('现场照片 1', '#5a8dc2'), mockImage('现场照片 2', '#67a86a')] },
    ],
  },
]

// ============ 首页总览 ============
const statusRank: Record<string, number> = { 待处置: 0, 处理中: 1, 已处理: 2, 未处置: 0, 处置中: 1, 已处置: 2 }

function overview() {
  const all = [...WATER_ALERTS, ...AIR_ALERTS, ...ELEC_ALERTS]
  return {
    waterNormalRate: WATER_STAT.normalRate,
    airComplianceRate: AIR_STAT.complianceRate,
    pendingAlerts: all.filter((e) => e.status === '待处置' || e.status === '未处置').length,
    processingAlerts: all.filter((e) => e.status === '处理中' || e.status === '处置中').length,
    onlinePoints: WATER_REALTIME.length + AIR_REALTIME.length,
    waterRealtime: WATER_REALTIME,
    airRealtime: AIR_REALTIME,
    recentAlerts: [...all].sort((a, b) => statusRank[a.status] - statusRank[b.status]),
  }
}

// 推进预警处置：待处置 → 处理中 → 已处理
function nowStr() {
  const n = new Date()
  const p = (x: number) => (x < 10 ? '0' + x : '' + x)
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`
}

export function setupEnvironmentMock() {
  // ---------- 环保首页总览 ----------
  Mock.mock(/\/biz\/environment\/overview/, 'get', () => ok(overview()))

  // ---------- 水环境 ----------
  Mock.mock(/\/biz\/environment\/water\/realtime/, 'get', () => ok(WATER_REALTIME))
  Mock.mock(/\/biz\/environment\/water\/indicators/, 'get', () => ok(WATER_INDICATORS))
  Mock.mock(/\/biz\/environment\/water\/rain/, 'get', () => ok(RAIN_MONITORS))
  Mock.mock(/\/biz\/environment\/water\/stat/, 'get', () => ok(WATER_STAT))
  Mock.mock(/\/biz\/environment\/water\/alerts/, 'get', () => ok(WATER_ALERTS))
  Mock.mock(/\/biz\/environment\/water\/history/, 'get', (options: { url: string }) => {
    const m = options.url.match(/[?&]point=([^&]*)/)
    const point = m ? decodeURIComponent(m[1]) : ''
    return ok(genWaterHistory(point))
  })

  // ---------- 大气环境 ----------
  Mock.mock(/\/biz\/environment\/air\/realtime/, 'get', () => ok(AIR_REALTIME))
  Mock.mock(/\/biz\/environment\/air\/indicators/, 'get', () => ok(AIR_INDICATORS))
  Mock.mock(/\/biz\/environment\/air\/stat/, 'get', () => ok(AIR_STAT))
  Mock.mock(/\/biz\/environment\/air\/alerts/, 'get', () => ok(AIR_ALERTS))
  Mock.mock(/\/biz\/environment\/air\/history/, 'get', (options: { url: string }) => {
    const m = options.url.match(/[?&]point=([^&]*)/)
    const point = m ? decodeURIComponent(m[1]) : ''
    return ok(genAirHistory(point))
  })
  Mock.mock(/\/biz\/environment\/air\/solid-waste/, 'get', () => ok(SOLID_WASTE))

  // ---------- 企业源头管控 ----------
  Mock.mock(/\/biz\/environment\/source\/elec$/, 'get', () => ok(ELEC_MONITORS))
  Mock.mock(/\/biz\/environment\/source\/elec\/alerts/, 'get', () => ok(ELEC_ALERTS))

  // ---------- 预警处置（推进闭环：待处置 → 处理中 → 已处理；处置人 + 处置说明 + 现场照片，对齐 PC monitor.vue）----------
  Mock.mock(/\/biz\/environment\/alert\/advance/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    const { type, id, operator, remark, images } = body
    const flow: Record<string, { next: string; action: string }> = {
      待处置: { next: '处理中', action: '开始处置' },
      处理中: { next: '已处理', action: '完成处置' },
      未处置: { next: '处置中', action: '开始处置' },
      处置中: { next: '已处置', action: '完成处置' },
    }
    let list: any[] = []
    if (type === 'water') list = WATER_ALERTS
    else if (type === 'air') list = AIR_ALERTS
    else if (type === 'elec') list = ELEC_ALERTS
    const e = list.find((x) => x.id === id)
    if (!e) return ok(null)
    const f = flow[e.status]
    if (f) {
      e.processLog = e.processLog || []
      const entry: any = { action: f.action, operator: operator || '园区运维员', time: nowStr(), remark: remark || '' }
      if (images && images.length) entry.images = images
      else if (f.action === '完成处置') entry.images = [mockImage('现场照片 1', '#5a8dc2'), mockImage('现场照片 2', '#67a86a')]
      e.processLog.push(entry)
      e.handler = operator || e.handler
      e.remark = remark || e.remark
      e.status = f.next
    }
    return ok(e)
  })
}
