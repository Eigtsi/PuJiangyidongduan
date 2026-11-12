import Mock from 'mockjs'

// 工具函数（与 index.ts 保持一致）
const ok = (data: unknown, msg = 'success') => ({ code: 200, msg, data })
const page = (rows: unknown[], total?: number) => ({ code: 200, msg: 'success', rows, total: total ?? rows.length })

function queryOf(url: string, key: string) {
  const m = url.match(new RegExp(`[?&]${key}=([^&]+)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

// ============ 本企业（企业端演示：浦江水晶工艺品有限公司）============
const ENTERPRISE = { id: 1, name: '浦江水晶工艺品有限公司', contact: '张明华', phone: '13957901001' }

// ---------- 我的账单（对齐 PC 04 统一核算 BILLING_MAP[1]）----------
// 月度计费项（水费/电费/供气）与年度计费项（物业/租金/废渣）
const BILLS = [
  { id: 1, feeType: '水费', cycle: '月', period: '2026年4月', usage: '845m³', unitPrice: '3.38元/m³', amount: 2850.6, status: '已缴' },
  { id: 2, feeType: '电费', cycle: '月', period: '2026年4月', usage: '23200kWh', unitPrice: '0.80元/kWh', amount: 18560.0, status: '已缴' },
  { id: 3, feeType: '压缩空气费', cycle: '月', period: '2026年4月', usage: '1680m³', unitPrice: '3.74元/m³', amount: 6280.5, status: '已缴' },
  { id: 4, feeType: '固废处理费', cycle: '年', period: '2026年', usage: '3.2吨', unitPrice: '500元/吨', amount: 1580.0, status: '已缴' },
  { id: 5, feeType: '物业费', cycle: '年', period: '2026年', usage: '520m²', unitPrice: '5元/m²/月', amount: 7800.0, status: '未缴' },
  { id: 6, feeType: '租金', cycle: '年', period: '2026年', usage: '520m²', unitPrice: '28元/m²/月', amount: 43680.0, status: '未缴' },
]

// 费用展示名与顺序：月视图 3 类，年视图 6 类
const FEE_DISPLAY: Record<string, string> = { '压缩空气费': '供气', '固废处理费': '废渣', '物业费': '物业' }
const MONTH_FEE_TYPES = ['水费', '电费', '压缩空气费']
const YEAR_FEE_TYPES = ['水费', '电费', '物业费', '租金', '压缩空气费', '固废处理费']

// 历史月份（对齐 PC generateHistory 的历史账期；当前账期为 2026年4月）
const BILL_HISTORY_MONTHS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-05']
const BILL_HISTORY_FACTORS = [0.85, 0.95, 1.05, 0.9, 1.1, 0.8, 1.0]

function displayName(feeType: string) {
  return FEE_DISPLAY[feeType] || feeType
}

// 月视图：某月的水费/电费/供气
function monthBillsFor(year: string, month: string) {
  const monthNum = Number(month)
  const isCurrent = year === '2026' && monthNum === 4
  return MONTH_FEE_TYPES.map((feeType, i) => {
    const base = BILLS.find((b) => b.feeType === feeType)!
    if (isCurrent) return { ...base, period: `${year}年${monthNum}月` }
    const key = `${year}-${String(monthNum).padStart(2, '0')}`
    const idx = BILL_HISTORY_MONTHS.indexOf(key)
    const factor = idx >= 0 ? BILL_HISTORY_FACTORS[idx] : 0.9
    return {
      ...base,
      id: Number(`${year}${String(monthNum).padStart(2, '0')}${i}`),
      period: `${year}年${monthNum}月`,
      amount: Math.round(base.amount * factor * 100) / 100,
      status: '已缴',
    }
  })
}

// 年视图：6 类费用（月度费用按年合计，年度费用取年度金额）
function yearBillsFor(year: string) {
  return YEAR_FEE_TYPES.map((feeType) => {
    const base = BILLS.find((b) => b.feeType === feeType)!
    if (base.cycle === '年') return { ...base, period: `${year}年` }
    return {
      ...base,
      id: Number(`${year}${base.id}`),
      period: `${year}年`,
      amount: Math.round(base.amount * 12 * 100) / 100,
    }
  })
}

// ---------- 本企业发布的招工（对齐 PC 04 recruitmentList 中 浦江水晶工艺品有限公司 = id 1/2/18）----------
const RECRUITMENTS = [
  { id: 1, jobCode: 'ZG2026001', positionName: '水晶切割工', salaryMin: 5500, salaryMax: 8000, headcount: 8, publishDate: '2026-05-20', status: '招聘中', requirements: '熟练掌握水晶切割设备操作，有2年以上水晶行业工作经验，能看懂加工图纸', contact: '张明华', phone: '13957901001' },
  { id: 2, jobCode: 'ZG2026002', positionName: '研磨操作工', salaryMin: 5000, salaryMax: 7500, headcount: 5, publishDate: '2026-05-18', status: '招聘中', requirements: '熟悉水晶研磨抛光工艺流程，能独立完成产品研磨工序', contact: '张明华', phone: '13957901001' },
  { id: 18, jobCode: 'ZG2026018', positionName: '外贸业务员', salaryMin: 6000, salaryMax: 12000, headcount: 2, publishDate: '2026-03-20', status: '已结束', requirements: '英语CET-4以上，口语流利，有水晶制品外贸经验者优先', contact: '张明华', phone: '13957901001' },
]

// ---------- 服务申请 + 进度（高频事项：入退园/证照/报修/政策申报；状态：待受理/办理中/已办结）----------
const APPLICATIONS = [
  { id: 1, type: '报修', title: '厂房电路报修', submitTime: '2026-11-02 10:20', status: '待受理', desc: 'A区1栋2层车间照明线路故障，需安排检修', contact: '张明华', phone: '13957901001' },
  { id: 2, type: '证照', title: '排污许可证年检', submitTime: '2026-10-28 09:00', status: '办理中', desc: '2026年度排污许可证年检材料提交', contact: '张明华', phone: '13957901001' },
  { id: 3, type: '政策申报', title: '设备更新补贴申报', submitTime: '2026-10-15', status: '已办结', desc: '申报本年度生产设备更新补贴', contact: '张明华', phone: '13957901001' },
  { id: 4, type: '入退园', title: '新增厂房租赁申请', submitTime: '2026-10-10', status: '已办结', desc: '申请租赁A区3栋厂房用于扩大生产', contact: '张明华', phone: '13957901001' },
]

// ---------- 本企业合同/房产资源（一个房产资源 = 一份合同；对齐 PC 企业门户 portal/enterprise.js + 合同管理 asset.js）----------
const PROFILE = {
  enterpriseName: '浦江水晶工艺品有限公司',
  enterpriseCode: '201101',
  zone: '东部',
  industry: '水晶加工',
  status: '正常经营',
  contracts: [
    { contractNo: 'ZL-2024-001', leaseTarget: '厂房', resourceNo: '东部01号楼1层', area: 2000, annualRent: 54.0, annualProperty: 3.0, startDate: '2024-07-01', endDate: '2027-06-30', status: '生效中' },
    { contractNo: 'ZL-2024-002', leaseTarget: '仓库', resourceNo: '东部02号楼1层', area: 1200, annualRent: 32.4, annualProperty: 1.8, startDate: '2024-07-01', endDate: '2027-06-30', status: '生效中' },
  ],
}

let nextRecruitmentId = 100
let nextApplicationId = 100

export function setupEnterpriseServiceMock() {
  // 我的账单（按月/按年查看：月视图 3 类费用，年视图 6 类费用）
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/bills(\?|$)/, 'get', (options: { url: string }) => {
    const year = queryOf(options.url, 'year') || '2026'
    const month = queryOf(options.url, 'month')
    const bills = month ? monthBillsFor(year, month) : yearBillsFor(year)
    const categories = bills.map((b) => ({ name: displayName(b.feeType), amount: b.amount }))
    return ok({ enterprise: ENTERPRISE, categories, bills })
  })
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/bills\/pay/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    const bill = BILLS.find((b) => b.id === body.id)
    if (bill) bill.status = '已缴'
    return ok({ success: true }, '缴费成功')
  })

  // 本企业招工
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/recruitments$/, 'get', () => page(RECRUITMENTS))
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/recruitment$/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    const item = {
      id: nextRecruitmentId++,
      jobCode: `ZG2026${String(nextRecruitmentId).padStart(3, '0')}`,
      positionName: body.positionName || '',
      salaryMin: body.salaryMin || 0,
      salaryMax: body.salaryMax || 0,
      headcount: body.headcount || 0,
      publishDate: body.publishDate || new Date().toISOString().slice(0, 10),
      status: '招聘中',
      requirements: body.requirements || '',
      contact: body.contact || ENTERPRISE.contact,
      phone: body.phone || ENTERPRISE.phone,
    }
    RECRUITMENTS.unshift(item)
    return ok(item, '发布成功')
  })

  // 服务申请
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/applications$/, 'get', () => page(APPLICATIONS))
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/application$/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    const item = {
      id: nextApplicationId++,
      type: body.type || '报修',
      title: body.title || '',
      submitTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: '待受理',
      desc: body.desc || '',
      contact: body.contact || ENTERPRISE.contact,
      phone: body.phone || ENTERPRISE.phone,
    }
    APPLICATIONS.unshift(item)
    return ok(item, '提交成功')
  })

  // 本企业合同/房产资源
  Mock.mock(/\/biz\/enterpriseService\/enterprise\/contract$/, 'get', () => ok(PROFILE))
}
