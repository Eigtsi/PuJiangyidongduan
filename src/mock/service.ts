import Mock from 'mockjs'

// 工具函数（与 index.ts 保持一致）
const ok = (data: unknown, msg = 'success') => ({ code: 200, msg, data })
const page = (rows: unknown[], total?: number) => ({ code: 200, msg: 'success', rows, total: total ?? rows.length })

function queryOf(url: string, key: string) {
  const m = url.match(new RegExp(`[?&]${key}=([^&]+)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

// ============ 招工管理（对齐 PC 端 api/enterprise-service/index.js）============
const RECRUITMENTS = [
  { id: 1, jobCode: 'ZG2026001', enterpriseName: '浦江水晶工艺品有限公司', positionName: '水晶切割工', requirements: '熟练掌握水晶切割设备操作，有2年以上水晶行业工作经验，能看懂加工图纸', salaryMin: 5500, salaryMax: 8000, headcount: 8, contact: '张明华', phone: '13957901001', publishDate: '2026-05-20', status: '招聘中' },
  { id: 2, jobCode: 'ZG2026002', enterpriseName: '浦江水晶工艺品有限公司', positionName: '研磨操作工', requirements: '熟悉水晶研磨抛光工艺流程，能独立完成产品研磨工序', salaryMin: 5000, salaryMax: 7500, headcount: 5, contact: '张明华', phone: '13957901001', publishDate: '2026-05-18', status: '招聘中' },
  { id: 3, jobCode: 'ZG2026003', enterpriseName: '金华晶盛水晶加工厂', positionName: '包装工', requirements: '负责水晶制品的包装和装箱工作，做事细心认真', salaryMin: 4000, salaryMax: 5500, headcount: 10, contact: '李建国', phone: '13957901002', publishDate: '2026-05-15', status: '招聘中' },
  { id: 4, jobCode: 'ZG2026004', enterpriseName: '金华晶盛水晶加工厂', positionName: '仓库管理员', requirements: '负责仓库出入库管理、库存盘点，熟练使用ERP系统', salaryMin: 4500, salaryMax: 6000, headcount: 2, contact: '李建国', phone: '13957901002', publishDate: '2026-05-12', status: '招聘中' },
  { id: 5, jobCode: 'ZG2026005', enterpriseName: '浦江璀璨水晶有限公司', positionName: '质检员', requirements: '负责水晶成品质量检测，熟悉行业标准，具备良好判断能力', salaryMin: 5000, salaryMax: 7000, headcount: 4, contact: '王丽芳', phone: '13957901003', publishDate: '2026-05-10', status: '招聘中' },
  { id: 6, jobCode: 'ZG2026006', enterpriseName: '浙江晶亮光学科技有限公司', positionName: '光学镀膜工', requirements: '掌握真空镀膜设备操作，了解光学薄膜原理，有镀膜经验者优先', salaryMin: 7000, salaryMax: 10000, headcount: 3, contact: '陈志远', phone: '13957901004', publishDate: '2026-05-08', status: '招聘中' },
  { id: 7, jobCode: 'ZG2026007', enterpriseName: '浙江晶亮光学科技有限公司', positionName: '设备维修工程师', requirements: '机电一体化相关专业，3年以上设备维修经验，有水晶加工设备维修经验优先', salaryMin: 8000, salaryMax: 12000, headcount: 2, contact: '陈志远', phone: '13957901004', publishDate: '2026-05-05', status: '招聘中' },
  { id: 8, jobCode: 'ZG2026008', enterpriseName: '浦江华彩包装印刷有限公司', positionName: '印刷操作工', requirements: '熟悉胶印或数码印刷设备操作，有包装印刷行业经验', salaryMin: 5000, salaryMax: 7000, headcount: 3, contact: '赵文博', phone: '13957901005', publishDate: '2026-05-03', status: '招聘中' },
  { id: 9, jobCode: 'ZG2026009', enterpriseName: '浦江晶锐水晶加工厂', positionName: '激光内雕操作工', requirements: '掌握激光内雕机操作及简单编程，有水晶内雕经验优先', salaryMin: 6000, salaryMax: 9000, headcount: 4, contact: '刘德明', phone: '13957901006', publishDate: '2026-04-28', status: '招聘中' },
  { id: 10, jobCode: 'ZG2026010', enterpriseName: '浦江顺达物流有限公司', positionName: '叉车司机', requirements: '持有叉车操作证，2年以上仓储物流工作经验', salaryMin: 5000, salaryMax: 6500, headcount: 3, contact: '周志强', phone: '13957901007', publishDate: '2026-04-25', status: '招聘中' },
  { id: 11, jobCode: 'ZG2026011', enterpriseName: '金华明辉水晶制品有限公司', positionName: '水晶设计师', requirements: '美术或工业设计专业，熟练使用3D建模软件，有水晶产品设计经验', salaryMin: 8000, salaryMax: 15000, headcount: 2, contact: '孙秀英', phone: '13957901008', publishDate: '2026-04-20', status: '招聘中' },
  { id: 12, jobCode: 'ZG2026012', enterpriseName: '浦江水晶之光科技有限公司', positionName: '数控编程员', requirements: '精通CNC数控编程，熟悉水晶加工工艺，能独立编写加工程序', salaryMin: 7000, salaryMax: 11000, headcount: 2, contact: '黄志豪', phone: '13957901010', publishDate: '2026-04-15', status: '已结束' },
  { id: 13, jobCode: 'ZG2026013', enterpriseName: '浙江浦江光学仪器厂', positionName: '光学检验员', requirements: '了解光学检验标准，会使用干涉仪、偏光仪等检测设备', salaryMin: 5500, salaryMax: 8000, headcount: 3, contact: '郑伟达', phone: '13957901011', publishDate: '2026-04-10', status: '已结束' },
  { id: 14, jobCode: 'ZG2026014', enterpriseName: '金华瑞丰水晶有限公司', positionName: '销售经理', requirements: '3年以上水晶工艺品销售经验，有客户资源者优先，具备团队管理能力', salaryMin: 8000, salaryMax: 20000, headcount: 1, contact: '林美珍', phone: '13957901014', publishDate: '2026-04-05', status: '已结束' },
  { id: 15, jobCode: 'ZG2026015', enterpriseName: '浦江新世纪水晶加工厂', positionName: '磨削工', requirements: '负责水晶磨削成型工序，能吃苦耐劳，适应倒班工作', salaryMin: 5500, salaryMax: 8000, headcount: 6, contact: '胡建平', phone: '13957901019', publishDate: '2026-04-01', status: '已结束' },
  { id: 16, jobCode: 'ZG2026016', enterpriseName: '浦江晶宇水晶饰品有限公司', positionName: '串珠工', requirements: '负责水晶串珠饰品组装，手工灵活，有饰品加工经验优先', salaryMin: 3500, salaryMax: 5000, headcount: 15, contact: '陈美华', phone: '13957901021', publishDate: '2026-03-28', status: '已结束' },
  { id: 17, jobCode: 'ZG2026017', enterpriseName: '浦江安达物流仓储有限公司', positionName: '货车司机', requirements: '持有B2以上驾照，3年以上货运经验，熟悉浦江及周边路线', salaryMin: 7000, salaryMax: 9500, headcount: 4, contact: '曹明辉', phone: '13957901020', publishDate: '2026-03-25', status: '已结束' },
  { id: 18, jobCode: 'ZG2026018', enterpriseName: '浦江水晶工艺品有限公司', positionName: '外贸业务员', requirements: '英语CET-4以上，口语流利，有水晶制品外贸经验者优先', salaryMin: 6000, salaryMax: 12000, headcount: 2, contact: '张明华', phone: '13957901001', publishDate: '2026-03-20', status: '已结束' },
  { id: 19, jobCode: 'ZG2026019', enterpriseName: '浙江浦星光学元件有限公司', positionName: '精磨技术员', requirements: '精密光学元件精磨加工，有高精度研磨经验，能读懂光学图纸', salaryMin: 7000, salaryMax: 10000, headcount: 3, contact: '杨国华', phone: '13957901017', publishDate: '2026-03-15', status: '已结束' },
  { id: 20, jobCode: 'ZG2026020', enterpriseName: '浦江鑫源配套服务有限公司', positionName: '行政前台', requirements: '形象气质佳，熟练使用办公软件，具备良好的沟通能力', salaryMin: 4000, salaryMax: 5000, headcount: 1, contact: '吴海燕', phone: '13957901009', publishDate: '2026-03-10', status: '已结束' },
]

// ============ 统一核算（对齐 PC 端 enterpriseBillingMap，5 家企业）============
const BILLING_MAP: Record<number, any> = {
  1: {
    enterpriseId: 1,
    enterpriseName: '浦江水晶工艺品有限公司',
    summary: { waterAmount: 2850.6, electricityAmount: 18560.0, gasAmount: 6280.5, solidWasteAmount: 1580.0, propertyAmount: 7800.0, rentAmount: 43680.0 },
    details: [
      { id: 1, feeType: '水费', period: '2026年4月', usage: '845m³', unitPrice: '3.38元/m³', receivable: 2856.1, discount: 5.5, actual: 2850.6, status: '已缴' },
      { id: 2, feeType: '电费', period: '2026年4月', usage: '23200kWh', unitPrice: '0.80元/kWh', receivable: 18560.0, discount: 0, actual: 18560.0, status: '已缴' },
      { id: 3, feeType: '压缩空气费', period: '2026年4月', usage: '1680m³', unitPrice: '3.74元/m³', receivable: 6283.2, discount: 2.7, actual: 6280.5, status: '已缴' },
      { id: 4, feeType: '固废处理费', period: '2026年4月', usage: '3.2吨', unitPrice: '500元/吨', receivable: 1600.0, discount: 20.0, actual: 1580.0, status: '已缴' },
      { id: 5, feeType: '物业费', period: '2026年Q2', usage: '520m²', unitPrice: '5元/m²/月', receivable: 7800.0, discount: 0, actual: 7800.0, status: '未缴' },
      { id: 6, feeType: '租金', period: '2026年Q2', usage: '520m²', unitPrice: '28元/m²/月', receivable: 43680.0, discount: 0, actual: 43680.0, status: '未缴' },
    ],
  },
  2: {
    enterpriseId: 2,
    enterpriseName: '金华晶盛水晶加工厂',
    summary: { waterAmount: 1980.4, electricityAmount: 12800.0, gasAmount: 4350.0, solidWasteAmount: 980.0, propertyAmount: 5700.0, rentAmount: 28500.0 },
    details: [
      { id: 1, feeType: '水费', period: '2026年4月', usage: '580m³', unitPrice: '3.42元/m³', receivable: 1983.6, discount: 3.2, actual: 1980.4, status: '已缴' },
      { id: 2, feeType: '电费', period: '2026年4月', usage: '16000kWh', unitPrice: '0.80元/kWh', receivable: 12800.0, discount: 0, actual: 12800.0, status: '已缴' },
      { id: 3, feeType: '压缩空气费', period: '2026年4月', usage: '1150m³', unitPrice: '3.78元/m³', receivable: 4347.0, discount: 0, actual: 4347.0, status: '未缴' },
      { id: 4, feeType: '固废处理费', period: '2026年4月', usage: '2.0吨', unitPrice: '490元/吨', receivable: 980.0, discount: 0, actual: 980.0, status: '未缴' },
      { id: 5, feeType: '物业费', period: '2026年Q2', usage: '380m²', unitPrice: '5元/m²/月', receivable: 5700.0, discount: 0, actual: 5700.0, status: '未缴' },
      { id: 6, feeType: '租金', period: '2026年Q2', usage: '380m²', unitPrice: '25元/m²/月', receivable: 28500.0, discount: 0, actual: 28500.0, status: '未缴' },
    ],
  },
  3: {
    enterpriseId: 3,
    enterpriseName: '浦江璀璨水晶有限公司',
    summary: { waterAmount: 4120.8, electricityAmount: 28500.0, gasAmount: 8960.0, solidWasteAmount: 2350.0, propertyAmount: 11250.0, rentAmount: 72000.0 },
    details: [
      { id: 1, feeType: '水费', period: '2026年4月', usage: '1220m³', unitPrice: '3.38元/m³', receivable: 4123.6, discount: 2.8, actual: 4120.8, status: '未缴' },
      { id: 2, feeType: '电费', period: '2026年4月', usage: '35600kWh', unitPrice: '0.80元/kWh', receivable: 28480.0, discount: 0, actual: 28480.0, status: '未缴' },
      { id: 3, feeType: '压缩空气费', period: '2026年4月', usage: '2400m³', unitPrice: '3.74元/m³', receivable: 8976.0, discount: 16.0, actual: 8960.0, status: '未缴' },
      { id: 4, feeType: '固废处理费', period: '2026年4月', usage: '4.7吨', unitPrice: '500元/吨', receivable: 2350.0, discount: 0, actual: 2350.0, status: '未缴' },
      { id: 5, feeType: '物业费', period: '2026年Q2', usage: '750m²', unitPrice: '5元/m²/月', receivable: 11250.0, discount: 0, actual: 11250.0, status: '未缴' },
      { id: 6, feeType: '租金', period: '2026年Q2', usage: '750m²', unitPrice: '32元/m²/月', receivable: 72000.0, discount: 0, actual: 72000.0, status: '未缴' },
    ],
  },
  4: {
    enterpriseId: 4,
    enterpriseName: '浙江晶亮光学科技有限公司',
    summary: { waterAmount: 1650.3, electricityAmount: 24800.0, gasAmount: 5200.0, solidWasteAmount: 1280.0, propertyAmount: 6800.0, rentAmount: 38080.0 },
    details: [
      { id: 1, feeType: '水费', period: '2026年4月', usage: '488m³', unitPrice: '3.38元/m³', receivable: 1649.44, discount: 0, actual: 1649.44, status: '已缴' },
      { id: 2, feeType: '电费', period: '2026年4月', usage: '31000kWh', unitPrice: '0.80元/kWh', receivable: 24800.0, discount: 0, actual: 24800.0, status: '已缴' },
      { id: 3, feeType: '压缩空气费', period: '2026年4月', usage: '1380m³', unitPrice: '3.78元/m³', receivable: 5216.4, discount: 16.4, actual: 5200.0, status: '已缴' },
      { id: 4, feeType: '固废处理费', period: '2026年4月', usage: '2.6吨', unitPrice: '490元/吨', receivable: 1274.0, discount: 0, actual: 1274.0, status: '已缴' },
      { id: 5, feeType: '物业费', period: '2026年Q2', usage: '680m²', unitPrice: '5元/m²/月', receivable: 6800.0, discount: 0, actual: 6800.0, status: '已缴' },
      { id: 6, feeType: '租金', period: '2026年Q2', usage: '680m²', unitPrice: '28元/m²/月', receivable: 38080.0, discount: 0, actual: 38080.0, status: '已缴' },
    ],
  },
  5: {
    enterpriseId: 5,
    enterpriseName: '浦江华彩包装印刷有限公司',
    summary: { waterAmount: 980.5, electricityAmount: 9600.0, gasAmount: 3200.0, solidWasteAmount: 750.0, propertyAmount: 2500.0, rentAmount: 15000.0 },
    details: [
      { id: 1, feeType: '水费', period: '2026年4月', usage: '290m³', unitPrice: '3.38元/m³', receivable: 980.2, discount: 0, actual: 980.2, status: '已缴' },
      { id: 2, feeType: '电费', period: '2026年4月', usage: '12000kWh', unitPrice: '0.80元/kWh', receivable: 9600.0, discount: 0, actual: 9600.0, status: '已缴' },
      { id: 3, feeType: '压缩空气费', period: '2026年4月', usage: '850m³', unitPrice: '3.78元/m³', receivable: 3213.0, discount: 13.0, actual: 3200.0, status: '未缴' },
      { id: 4, feeType: '固废处理费', period: '2026年4月', usage: '1.5吨', unitPrice: '500元/吨', receivable: 750.0, discount: 0, actual: 750.0, status: '未缴' },
      { id: 5, feeType: '物业费', period: '2026年Q2', usage: '250m²', unitPrice: '5元/m²/月', receivable: 2500.0, discount: 0, actual: 2500.0, status: '未缴' },
      { id: 6, feeType: '租金', period: '2026年Q2', usage: '250m²', unitPrice: '20元/m²/月', receivable: 15000.0, discount: 0, actual: 15000.0, status: '未缴' },
    ],
  },
}

function billingOverview() {
  return Object.values(BILLING_MAP).map((e) => {
    let paid = 0
    let unpaid = 0
    let total = 0
    e.details.forEach((d: any) => {
      total += d.actual
      if (d.status === '已缴') paid += d.actual
      else unpaid += d.actual
    })
    return {
      enterpriseId: e.enterpriseId,
      enterpriseName: e.enterpriseName,
      total,
      paid,
      unpaid,
      payRate: total > 0 ? Math.round((paid / total) * 100) : 0,
      summary: e.summary,
    }
  })
}

// 园区费用总览：6 类费用按年统计（对齐 PC 端 getBillingYearStatistics 的年维度口径）
const PARK_FEE_TYPES: [string, string][] = [
  ['水费', 'waterAmount'],
  ['电费', 'electricityAmount'],
  ['租金', 'rentAmount'],
  ['物业', 'propertyAmount'],
  ['供气', 'gasAmount'],
  ['废渣', 'solidWasteAmount'],
]

function parkFeeStats(year: number) {
  const base = Object.values(BILLING_MAP)
  // 2026 为真实账期；历史年份按 PC 端 generateHistory 的折算系数口径估算
  const factor = year >= 2026 ? 1 : Math.max(0.7, 1 - (2026 - year) * 0.06)
  const items = PARK_FEE_TYPES.map(([name, key]) => {
    const sum = base.reduce((s, e: any) => s + (e.summary[key] || 0), 0)
    return { name, amount: Math.round((sum * factor) / 1000) / 10 }
  })
  return { year, items }
}

// ============ 业务提醒（对齐 PC 端 paymentReminders/contractReminders/equipmentReminders）============
const PAYMENT_REMINDERS = [
  { id: 1, enterpriseName: '浦江璀璨水晶有限公司', feeType: '物业费', amount: 11250.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 2, enterpriseName: '浦江璀璨水晶有限公司', feeType: '租金', amount: 72000.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 3, enterpriseName: '金华晶盛水晶加工厂', feeType: '压缩空气费', amount: 4347.0, dueDate: '2026-05-15', overdueDays: 13, status: '已逾期' },
  { id: 4, enterpriseName: '金华晶盛水晶加工厂', feeType: '固废处理费', amount: 980.0, dueDate: '2026-05-10', overdueDays: 18, status: '已逾期' },
  { id: 5, enterpriseName: '金华晶盛水晶加工厂', feeType: '物业费', amount: 5700.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 6, enterpriseName: '浦江水晶工艺品有限公司', feeType: '物业费', amount: 7800.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 7, enterpriseName: '浦江水晶工艺品有限公司', feeType: '租金', amount: 43680.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 8, enterpriseName: '浙江晶亮光学科技有限公司', feeType: '电费', amount: 28480.0, dueDate: '2026-05-05', overdueDays: 23, status: '已逾期' },
  { id: 9, enterpriseName: '浦江华彩包装印刷有限公司', feeType: '水费', amount: 1850.0, dueDate: '2026-05-20', overdueDays: 8, status: '已逾期' },
  { id: 10, enterpriseName: '浦江晶锐水晶加工厂', feeType: '压缩空气费', amount: 3680.0, dueDate: '2026-05-25', overdueDays: 3, status: '已逾期' },
  { id: 11, enterpriseName: '浦江顺达物流有限公司', feeType: '物业费', amount: 4200.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 12, enterpriseName: '金华明辉水晶制品有限公司', feeType: '租金', amount: 38400.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 13, enterpriseName: '浦江水晶之光科技有限公司', feeType: '固废处理费', amount: 1800.0, dueDate: '2026-05-08', overdueDays: 20, status: '已逾期' },
  { id: 14, enterpriseName: '浦江鑫源配套服务有限公司', feeType: '物业费', amount: 2250.0, dueDate: '2026-05-31', overdueDays: 0, status: '即将到期' },
  { id: 15, enterpriseName: '浙江浦星光学元件有限公司', feeType: '电费', amount: 35200.0, dueDate: '2026-05-05', overdueDays: 23, status: '已逾期' },
]

const CONTRACT_REMINDERS = [
  { id: 1, enterpriseName: '浦江水晶工艺品有限公司', contractNo: 'ZL-2023-001', leaseTarget: 'A区1栋（520m²）', dueDate: '2026-06-30', remainDays: 33, status: '即将到期' },
  { id: 2, enterpriseName: '金华晶盛水晶加工厂', contractNo: 'ZL-2023-015', leaseTarget: 'A区2栋（380m²）', dueDate: '2026-07-15', remainDays: 48, status: '即将到期' },
  { id: 3, enterpriseName: '浦江璀璨水晶有限公司', contractNo: 'ZL-2023-008', leaseTarget: 'B区5栋（750m²）', dueDate: '2026-08-31', remainDays: 95, status: '正常' },
  { id: 4, enterpriseName: '浙江晶亮光学科技有限公司', contractNo: 'ZL-2023-003', leaseTarget: 'C区3栋（680m²）', dueDate: '2026-05-20', remainDays: -8, status: '已到期' },
  { id: 5, enterpriseName: '浦江华彩包装印刷有限公司', contractNo: 'ZL-2023-022', leaseTarget: 'D区1栋（250m²）', dueDate: '2026-09-30', remainDays: 125, status: '正常' },
  { id: 6, enterpriseName: '浦江晶锐水晶加工厂', contractNo: 'ZL-2023-028', leaseTarget: 'A区5栋（400m²）', dueDate: '2026-06-15', remainDays: 18, status: '即将到期' },
  { id: 7, enterpriseName: '浦江顺达物流有限公司', contractNo: 'ZL-2023-035', leaseTarget: 'E区物流中心（600m²）', dueDate: '2026-10-31', remainDays: 156, status: '正常' },
  { id: 8, enterpriseName: '金华明辉水晶制品有限公司', contractNo: 'ZL-2023-012', leaseTarget: 'B区8栋（480m²）', dueDate: '2026-07-31', remainDays: 64, status: '即将到期' },
  { id: 9, enterpriseName: '浦江水晶之光科技有限公司', contractNo: 'ZL-2023-005', leaseTarget: 'C区1栋（700m²）', dueDate: '2026-05-10', remainDays: -18, status: '已到期' },
  { id: 10, enterpriseName: '浙江浦星光学元件有限公司', contractNo: 'ZL-2023-009', leaseTarget: 'C区7栋（650m²）', dueDate: '2026-11-30', remainDays: 186, status: '正常' },
]

const EQUIPMENT_REMINDERS = [
  { id: 1, enterpriseName: '浦江水晶工艺品有限公司', equipmentName: '废水处理设施', reminderType: '维保到期', dueDate: '2026-06-05', remainDays: 8, status: '即将到期' },
  { id: 2, enterpriseName: '金华晶盛水晶加工厂', equipmentName: '油烟净化器', reminderType: '检测到期', dueDate: '2026-05-20', remainDays: -8, status: '已过期' },
  { id: 3, enterpriseName: '浦江璀璨水晶有限公司', equipmentName: '消防灭火系统', reminderType: '维保到期', dueDate: '2026-06-15', remainDays: 18, status: '即将到期' },
  { id: 4, enterpriseName: '浙江晶亮光学科技有限公司', equipmentName: '废气处理设备', reminderType: '检测到期', dueDate: '2026-05-25', remainDays: -3, status: '已过期' },
  { id: 5, enterpriseName: '浦江华彩包装印刷有限公司', equipmentName: 'VOCs治理设施', reminderType: '维保到期', dueDate: '2026-07-01', remainDays: 34, status: '正常' },
  { id: 6, enterpriseName: '浦江晶锐水晶加工厂', equipmentName: '废水在线监测仪', reminderType: '检测到期', dueDate: '2026-05-15', remainDays: -13, status: '已过期' },
  { id: 7, enterpriseName: '金华明辉水晶制品有限公司', equipmentName: '污水处理设施', reminderType: '维保到期', dueDate: '2026-06-10', remainDays: 13, status: '即将到期' },
  { id: 8, enterpriseName: '浦江水晶之光科技有限公司', equipmentName: '冷却水循环系统', reminderType: '检测到期', dueDate: '2026-05-30', remainDays: 2, status: '即将到期' },
]

// ============ 园区服务（党建活动/消防演练/上门服务/其他；支持图片/附件/公众号链接）============
function psImg(label: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="46%" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">${label}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const PARK_SERVICES = [
  {
    id: 1,
    type: '党建活动',
    title: '2026年第三季度“党旗领航·助企发展”主题党日活动',
    content: '组织园区党员和企业代表赴东部园区党群服务中心开展主题党日活动，围绕安全生产、绿色环保等主题进行学习交流，邀请县两新工委讲师授课。',
    images: [psImg('活动现场', '#c4453c')],
    files: [{ name: '活动方案.pdf', size: 1024000 }],
    wechatLink: 'https://mp.weixin.qq.com/s/party-day-2026-q3',
    publishDate: '2026-11-02',
  },
  {
    id: 2,
    type: '消防演练',
    title: '园区冬季消防安全应急演练',
    content: '联合县消防救援大队开展灭火器使用、疏散逃生演练，覆盖中部、东部、西部三园区重点企业。',
    images: [psImg('消防演练', '#e08a2e')],
    files: [],
    wechatLink: '',
    publishDate: '2026-10-28',
  },
  {
    id: 3,
    type: '上门服务',
    title: '企业环保设备运行上门巡检',
    content: '组织第三方运维单位对园区企业环保设备进行上门巡检，排查设备运行隐患并出具巡检报告。',
    images: [],
    files: [{ name: '巡检报告.docx', size: 512000 }],
    wechatLink: 'https://mp.weixin.qq.com/s/on-site-inspection',
    publishDate: '2026-10-15',
  },
]
let nextParkServiceId = 100

export function setupServiceMock() {
  // 招工列表
  Mock.mock(/\/biz\/enterpriseService\/recruitment\/list/, 'get', (options: { url: string }) => {
    const enterpriseName = (queryOf(options.url, 'enterpriseName') || '').trim()
    const positionName = (queryOf(options.url, 'positionName') || '').trim()
    const status = queryOf(options.url, 'status')
    let filtered = [...RECRUITMENTS]
    if (enterpriseName) filtered = filtered.filter((r) => r.enterpriseName.includes(enterpriseName))
    if (positionName) filtered = filtered.filter((r) => r.positionName.includes(positionName))
    if (status) filtered = filtered.filter((r) => r.status === status)
    return page(filtered)
  })

  // 招工详情
  Mock.mock(/\/biz\/enterpriseService\/recruitment\/\d+/, 'get', (options: { url: string }) => {
    const id = Number(options.url.match(/recruitment\/(\d+)/)?.[1])
    return ok(RECRUITMENTS.find((r) => r.id === id) || null)
  })

  // 统一核算总览（企业缴费总览）
  Mock.mock(/\/biz\/enterpriseService\/billing\/overview/, 'get', () => page(billingOverview()))

  // 园区费用总览（6 类费用按年统计）
  Mock.mock(/\/biz\/enterpriseService\/billing\/park-stats/, 'get', (options: { url: string }) => {
    const year = Number(queryOf(options.url, 'year')) || 2026
    return ok(parkFeeStats(year))
  })

  // 企业费用明细
  Mock.mock(/\/biz\/enterpriseService\/billing\/\d+/, 'get', (options: { url: string }) => {
    const id = Number(options.url.match(/billing\/(\d+)/)?.[1])
    return ok(BILLING_MAP[id] || BILLING_MAP[1])
  })

  // 发送催缴
  Mock.mock(/\/biz\/enterpriseService\/billing\/remind/, 'post', () => ok({ success: true }, '催缴通知已发送'))

  // 业务提醒：缴款 / 合同 / 设备
  Mock.mock(/\/biz\/enterpriseService\/reminder\/payment/, 'get', () => page(PAYMENT_REMINDERS))
  Mock.mock(/\/biz\/enterpriseService\/reminder\/contract/, 'get', () => page(CONTRACT_REMINDERS))
  Mock.mock(/\/biz\/enterpriseService\/reminder\/equipment/, 'get', () => page(EQUIPMENT_REMINDERS))
  Mock.mock(/\/biz\/enterpriseService\/reminder\/send/, 'post', () => ok({ success: true }, '提醒已发送'))

  // 园区服务：列表 + 新建/修改（有 id 为修改，无 id 为新建）
  Mock.mock(/\/biz\/enterpriseService\/park-service\/list/, 'get', () => page(PARK_SERVICES))
  Mock.mock(/\/biz\/enterpriseService\/park-service\/save/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    if (body.id) {
      const idx = PARK_SERVICES.findIndex((p) => p.id === body.id)
      if (idx > -1) PARK_SERVICES[idx] = { ...PARK_SERVICES[idx], ...body }
      return ok(PARK_SERVICES[idx])
    }
    const item = { id: nextParkServiceId++, publishDate: body.publishDate || new Date().toISOString().slice(0, 10), ...body }
    PARK_SERVICES.unshift(item)
    return ok(item, '发布成功')
  })
}
