import Mock from 'mockjs'
import { setupEnvironmentMock } from './environment'
import { setupServiceMock } from './service'
import { setupEnterpriseServiceMock } from './enterprise-service'

// ---------- 工具函数 ----------
// 普通接口统一返回 { code, data }（http.js 会自动取 data）
const ok = (data: unknown, msg = 'success') => ({ code: 200, msg, data })
// 若依分页接口返回 { code, rows, total }（无 data 字段）
const page = (rows: unknown[], total?: number) => ({ code: 200, msg: 'success', rows, total: total ?? rows.length })

// 从 URL 中取查询参数
function queryOf(url: string, key: string) {
  const m = url.match(new RegExp(`[?&]${key}=([^&]+)`))
  return m ? decodeURIComponent(m[1]) : undefined
}

// ---------- 一园一档：园区基本信息（对齐 PC 端 api/park/archive.js）----------
const PARK = {
  parkId: 1,
  parkName: '浦江中国水晶产业园',
  shortName: '浦江中国水晶园',
  address: '浙江省金华市浦江县',
  lng: '119.8912',
  lat: '29.4528',
  planArea: '1500亩',
  buildArea: '980000㎡',
  greenRate: '35%',
  establishDate: '2018-06-18',
  leadingIndustry: '水晶工艺品制造',
  industryType: '水晶玻璃制品、灯具配件、工艺品加工',
  enterprises: 85,
  employees: 12600,
  annualOutput: '58.6亿元',
  annualTax: '3.2亿元',
  contactPerson: '张建国',
  contactPhone: '0579-84101234',
  legalPerson: '李明华',
  description: '浦江中国水晶产业园是浙江省特色小镇和省级工业园区，以水晶玻璃制品为主导产业，集聚了水晶加工、灯具制造、工艺品生产等上下游企业，是全国最大的水晶产品集散中心。',
  // 基础设施
  roadLength: '28.5公里',
  waterSupply: '日供水能力3万吨',
  powerSupply: '110KV变电站2座',
  gasSupply: '压缩空气管网全覆盖',
  sewagePipe: '雨污分流管网42公里',
  communication: '5G基站全覆盖',
  // 环保设施
  sewagePlant: '集中污水处理厂2座',
  sewageCapacity: '日处理能力2.5万吨',
  wasteGasSystem: '废气集中处理设施3套',
  wasteGasStandard: '达到国家二级排放标准',
  solidWasteSite: '固废暂存场1处',
  noiseControl: '厂界噪声达标率100%',
  onlineMonitor: '在线监测点位18个',
  emergencyPool: '应急事故池2座(总容积5000m³)',
  // 公共设施
  adminCenter: '综合服务中心1栋',
  exhibitionHall: '水晶展览馆1栋',
  trainingCenter: '培训中心1栋',
  workerDorm: '职工宿舍6栋(共1200套)',
  staffCanteen: '员工食堂3处',
  medicalStation: '医疗站2处',
  fireStation: '消防站1座',
  logisticsCenter: '物流配送中心1处',
}

// ---------- 一园一档：三园区（中部/东部/西部，对齐 PC 端房产资源「三园区」+ facility.js 分区设施）----------
const PARKS = [
  {
    zoneId: 1,
    zoneName: '中部园区',
    buildingCount: 46,
    planArea: '346.3亩',
    enterpriseCount: 165,
    scaleEnterpriseCount: 19,
    establishDate: '2015.10',
    annualOutput: '30.5亿元',
    annualTax: '1.7亿元',
    leadingIndustry: '水晶工艺品制造',
    address: '浦江中国水晶产业园中部片区',
    description: '位于浦江经济开发区岩头镇飞轮村、新岭脚村北侧，总用地面积 346.3 亩，总建筑面积 36 万平方米（其中厂房 46 幢、23.7 万平方米），是我县规模最大的综合性水晶产业园区，由杭州市建筑设计研究院有限公司设计。中部示范区于 2014 年初主体开工，2015 年 10 月底竣工验收并实现水晶加工企业入园投产，功能划分为综合产品生产集聚区、污水处理区及综合配套服务区。污水处理厂日处理能力 12000 吨，中水回用率 75% 以上。主要集聚灯饰、工艺品等水晶企业，现有入驻企业 165 家，其中规上企业 19 家。',
    infra: [
      { label: '供电设施', value: '10KV配电房A' },
      { label: '供气设施', value: '压缩空气调压站（日供气 5 万 m³）' },
      { label: '供水保障', value: '消防水泵站' },
    ],
    env: [
      {
        title: '污水处理厂',
        name: '中部污水处理厂',
        fields: [
          { label: '设计单位', value: '同济大学设计研究院' },
          { label: '总投资额', value: '4400 万元' },
          { label: '占地面积', value: '8400 平方米' },
          { label: '日处理能力', value: '12000 吨' },
          { label: '中水回用率', value: '70%—80%' },
          { label: '处理工艺', value: '物理化学（混凝-沉淀-砂滤）+ 接触氧化' },
          { label: '排放标准', value: '《污水综合排放标准》三级标准，排入市政污水管网' },
          { label: '污泥处置', value: '板框压滤脱水后由制砖厂再生利用' },
        ],
      },
      {
        title: '排污口监测站',
        count: 1,
        indicators: ['PH', 'COD', '氨氮', '总氮', '总磷', '氟化物', '流量'],
      },
      {
        title: '大气监测站',
        count: 2,
        indicators: ['PM2.5', 'PM10', 'SO₂', 'NO₂', 'O₃', 'TVOC', '噪音'],
      },
    ],
  },
  {
    zoneId: 2,
    zoneName: '东部园区',
    buildingCount: 55,
    planArea: '251.3亩',
    enterpriseCount: 115,
    scaleEnterpriseCount: 20,
    establishDate: '2016.07',
    annualOutput: '15.2亿元',
    annualTax: '0.8亿元',
    leadingIndustry: '水晶工艺品制造',
    address: '浦江中国水晶产业园东部片区',
    description: '位于岩郑公路以南、郑宅镇三郑村北侧，总用地面积 251.3 亩，总建筑面积 25.7 万平方米（其中厂房 55 幢、23.5 万平方米）。园区于 2014 年 5 月 30 日开工，2016 年 7 月底竣工验收并实现水晶加工企业入园投产。污水处理厂日处理能力约 10000 吨，中水回用率 70% 以上。主要集聚钻类水晶企业，现有入驻企业 115 家，其中规上企业 20 家。',
    infra: [
      { label: '供电设施', value: '110KV变电站A（2×50MVA）' },
      { label: '供水设施', value: '供水泵站A（日供水 1.5 万吨）' },
    ],
    env: [
      {
        title: '污水处理厂',
        name: '东部污水处理厂',
        fields: [
          { label: '设计单位', value: '中国联合工程公司' },
          { label: '总投资额', value: '约 3205 万元' },
          { label: '占地面积', value: '7320 平方米' },
          { label: '日处理能力', value: '10000 吨' },
          { label: '中水回用率', value: '55% 左右' },
          { label: '处理工艺', value: '物理化学 + 接触氧化组合工艺' },
          { label: '排放标准', value: '《污水综合排放标准》三级标准，排入浦江富春紫光水务（四厂）统一处理' },
          { label: '污泥处置', value: '板框压滤脱水后由制砖厂再生利用' },
        ],
      },
      {
        title: '排污口监测站',
        count: 1,
        indicators: ['PH', 'COD', '氨氮', '总氮', '总磷', '氟化物', '流量'],
      },
    ],
  },
  {
    zoneId: 3,
    zoneName: '西部园区',
    buildingCount: 25,
    planArea: '114.6亩',
    enterpriseCount: 44,
    scaleEnterpriseCount: 7,
    establishDate: '2016.06',
    annualOutput: '12.9亿元',
    annualTax: '0.7亿元',
    leadingIndustry: '水晶工艺品制造',
    address: '浦江中国水晶产业园西部片区',
    description: '位于虞宅乡虞宅村东侧，总用地面积 114.6 亩，总建筑面积 9.5 万平方米（其中厂房 25 幢、8.8 万平方米）。项目于 2014 年 10 月 18 日开工，2016 年 6 月底竣工验收并实现企业入园。主要集聚压型、刻面等污染物较少的水晶企业，现有入驻企业 44 家，其中规上企业 7 家。',
    infra: [
      { label: '供电设施', value: '110KV变电站B（2×40MVA）' },
      { label: '供水设施', value: '供水泵站B（日供水 1.5 万吨）' },
      { label: '供气设施', value: '压缩空气储气站（储气 2000 m³）' },
    ],
    env: [],
  },
]

// ---------- 园区档案文件（对齐 PC 端 api/park/document.js）----------
const DOCUMENTS = [
  { docId: 1, docCode: 'GHHP-2024-001', docName: '浦江中国水晶产业园规划环评报告', category: '规划环评', publishDate: '2024-01-15', effectiveDate: '2024-01-20', expiryDate: '2029-01-19', version: 'V1.0', status: '有效', fileSize: '3.2 MB', remark: '园区总体规划环境影响评价', content: '本报告依据《中华人民共和国环境影响评价法》《规划环境影响评价条例》等法律法规，对浦江中国水晶产业园总体规划进行环境影响评价。园区位于浦江县，规划面积约5.2平方公里，重点发展水晶加工、灯具配件等产业。评价结论：在落实本报告提出的环保措施前提下，规划实施的环境影响可接受。' },
  { docId: 2, docCode: 'YJYA-2024-001', docName: '园区突发环境事件应急预案', category: '应急预案', publishDate: '2024-03-20', effectiveDate: '2024-04-01', expiryDate: '2027-03-31', version: 'V2.1', status: '有效', fileSize: '1.8 MB', remark: '突发环境事件专项应急预案', content: '一、总则。1.1 编制目的：建立健全园区突发环境事件应急机制，提高应对能力。1.2 适用范围：本预案适用于浦江中国水晶产业园区内发生的突发环境事件。二、组织机构与职责。设立应急指挥部，由管委会主任担任总指挥。三、应急响应程序。包括信息报告、先期处置、分级响应、现场处置等环节。' },
  { docId: 3, docCode: 'YJYA-2024-002', docName: '园区安全生产事故应急预案', category: '应急预案', publishDate: '2024-03-25', effectiveDate: '2024-04-01', expiryDate: '2027-03-31', version: 'V2.0', status: '有效', fileSize: '2.1 MB', remark: '安全生产专项预案', content: '一、总则。1.1 编制目的：规范园区安全生产事故应急管理。1.2 工作原则：以人为本、预防为主、统一领导、分级负责。二、危险源分析。园区涉及危化品使用企业12家，特种设备86台套。三、应急组织体系。设立安全生产应急指挥部，下设抢险救援组、医疗救护组等5个工作组。' },
  { docId: 4, docCode: 'GLZD-2024-001', docName: '浦江中国水晶产业园管理办法', category: '管理制度', publishDate: '2024-02-10', effectiveDate: '2024-03-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '856 KB', remark: '园区综合管理制度', content: '第一章 总则。第一条 为规范浦江中国水晶产业园管理，促进产业集聚发展，制定本办法。第二条 本办法适用于园区内所有入驻企业。第二章 入园管理。第五条 企业入园实行审核备案制。第三章 运营管理。第十二条 园区实行统一的物业管理。第四章 退出机制。第二十条 企业退出须提前30日书面报备。' },
  { docId: 5, docCode: 'GLZD-2024-002', docName: '园区企业入驻管理办法', category: '项目准入', publishDate: '2024-04-15', effectiveDate: '2024-05-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '1.2 MB', remark: '企业入驻标准和流程', content: '一、总则。明确企业入驻园区的条件、流程和管理要求。二、准入条件。2.1 符合园区产业定位。2.2 具备合法的经营资质。2.3 环保、安全达标。三、审批流程。提交申请→材料初审→现场核查→联审会议→签订协议→入驻备案。四、入驻后管理。' },
  { docId: 6, docCode: 'GHHP-2024-002', docName: '园区大气环境专项评价报告', category: '规划环评', publishDate: '2024-05-20', effectiveDate: '2024-06-01', expiryDate: '2029-05-31', version: 'V1.0', status: '有效', fileSize: '4.5 MB', remark: '大气环境容量专项评价', content: '对园区大气环境容量进行专项评价。采用AERMOD模型模拟园区SO2、NOx、PM10、VOCs的扩散。结论：园区SO2容量9.8t/a，NOx容量15.3t/a，PM10容量12.1t/a，VOCs容量6.5t/a。建议严格控制VOCs排放总量，新增排放源须实施倍量替代。' },
  { docId: 7, docCode: 'GHHP-2024-003', docName: '园区水环境专项评价报告', category: '规划环评', publishDate: '2024-05-25', effectiveDate: '2024-06-01', expiryDate: '2029-05-31', version: 'V1.0', status: '有效', fileSize: '3.8 MB', remark: '水环境容量专项评价', content: '对园区水环境容量进行专项评价。采用QUAL2K模型对纳污水体进行模拟。结论：园区COD容量120.5t/a，氨氮容量8.2t/a。要求园区污水处理厂出水执行一级A标准，企业废水须预处理达标后方可纳管。实施雨污分流全覆盖。' },
  { docId: 9, docCode: 'XMZR-2024-001', docName: '水晶加工企业准入条件', category: '项目准入', publishDate: '2024-02-28', effectiveDate: '2024-03-15', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '980 KB', remark: '水晶加工类企业准入标准', content: '一、适用范围：拟入驻园区的水晶加工类企业。二、基本条件：2.1 注册资本不低于100万元。2.2 年产值不低于500万元。三、环保要求：3.1 废水处理设施齐全，生产废水回用率≥80%。3.2 车间粉尘排放浓度≤30mg/m³。3.3 固废分类暂存，危废交由有资质单位处置。四、安全要求。' },
  { docId: 10, docCode: 'XMZR-2024-002', docName: '灯具配件企业准入条件', category: '项目准入', publishDate: '2024-03-15', effectiveDate: '2024-04-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '1.1 MB', remark: '灯具配件类企业准入标准', content: '一、适用范围：拟入驻园区的灯具配件类企业。二、基本条件与水晶加工企业相同。三、环保特殊要求：3.1 喷涂/电镀车间VOCs收集效率≥90%。3.2 焊接烟尘经除尘后排放。3.3 化学品仓库须防渗防漏。四、消防安全：厂房耐火等级不低于二级，配备自动喷淋系统。' },
  { docId: 11, docCode: 'GLZD-2024-004', docName: '园区安全生产管理制度', category: '管理制度', publishDate: '2024-04-01', effectiveDate: '2024-04-15', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '1.5 MB', remark: '安全生产管理规定', content: '第一章 总则。明确安全生产责任制。第二章 安全教育培训。新员工三级安全教育不少于24学时。第三章 隐患排查治理。企业每周自查、园区每月巡查、每季度联合检查。第四章 特种设备管理。建立一机一档，定期检验。第五章 危险作业审批。动火、高处、受限空间作业实行审批制。' },
  { docId: 12, docCode: 'GLZD-2024-005', docName: '园区环境保护管理制度', category: '管理制度', publishDate: '2024-04-10', effectiveDate: '2024-05-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '1.3 MB', remark: '环境保护管理规定', content: '第一章 总则。第二章 排污许可管理。企业须持证排污、按证排污。第三章 污染治理设施运行管理。确保设施正常运行、达标排放。第四章 环境监测。重点排污单位须安装在线监测设备并联网。第五章 固废管理。一般固废与危废分类收集、规范贮存、合法处置。第六章 环境应急。' },
  { docId: 13, docCode: 'GHHP-2023-001', docName: '浦江中国水晶产业园总体规划(2018-2030)', category: '规划环评', publishDate: '2023-12-20', effectiveDate: '2018-01-01', expiryDate: '2030-12-31', version: 'V1.0', status: '有效', fileSize: '8.6 MB', remark: '园区总体规划文本', content: '浦江中国水晶产业园总体规划（2018-2030年）。规划范围：总用地面积5.2平方公里。发展定位：打造全国水晶产业转型升级示范区。空间布局："一心两轴三片区"。一心：综合服务中心。两轴：产业发展轴、生态景观轴。三片区：水晶加工片区、配套产业片区、生活服务片区。' },
  { docId: 14, docCode: 'YJYA-2023-001', docName: '园区消防应急预案(旧版)', category: '应急预案', publishDate: '2022-06-15', effectiveDate: '2022-07-01', expiryDate: '2024-03-31', version: 'V1.0', status: '失效', fileSize: '1.2 MB', remark: '已被新版替代', content: '（本版本已废止，内容仅供存档参考）' },
  { docId: 17, docCode: 'GLZD-2024-006', docName: '园区固废管理办法', category: '管理制度', publishDate: '2024-08-01', effectiveDate: '2024-09-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '640 KB', remark: '固体废物管理规定', content: '第一条 为规范园区固体废物管理，制定本办法。第二条 分类标准：一般工业固废、危险废物、生活垃圾。第三条 一般固废综合利用优先，综合利用率≥85%。第四条 危险废物须交由有资质单位处置，转移执行联单制度。第五条 企业须建立固废管理台账。' },
  { docId: 18, docCode: 'XMZR-2024-003', docName: '园区产业负面清单', category: '项目准入', publishDate: '2024-01-20', effectiveDate: '2024-02-01', expiryDate: '', version: 'V1.0', status: '有效', fileSize: '480 KB', remark: '禁止和限制准入产业目录', content: '一、禁止准入类（6项）：1.电镀加工（含氰电镀除外）；2.印染加工；3.造纸制浆；4.化工合成（制剂复配除外）；5.铅蓄电池制造；6.皮革鞣制。二、限制准入类（4项）：1.喷涂加工（须配套RTO/RCO）；2.铸造（须电炉熔炼）；3.酸洗磷化（须配套废水零排放）；4.人造革制造。' },
  { docId: 19, docCode: 'YJYA-2024-003', docName: '园区危险化学品事故应急预案', category: '应急预案', publishDate: '2024-09-15', effectiveDate: '2024-10-01', expiryDate: '2027-09-30', version: 'V1.0', status: '有效', fileSize: '2.7 MB', remark: '危化品专项应急预案', content: '一、总则。针对园区内涉及危化品生产、储存、使用、运输的企业。二、危化品概况。园区涉及硫酸、盐酸、硝酸、氢氟酸等8种重点监管危化品。三、应急响应分级。I级(特别重大)、II级(重大)、III级(较大)、IV级(一般)。四、处置措施。包括泄漏控制、人员疏散、消防灭火、环境监测等。' },
]

// ---------- 一企一档：企业档案（对齐 PC 端 api/enterprise/archive.js，25 家）----------
const ENTERPRISES = [
  { enterpriseId: 1, enterpriseName: '浦江水晶工艺品有限公司', industry: '水晶加工', area: 'A区', contact: '张明华', phone: '13957901001', leaseStatus: '租赁中', legalPerson: '张明华', creditCode: '91330726MA2E5X9K1A', address: '浦江县水晶园区A区1栋', resourceNo: '东部01号楼1层、东部02号楼1层', businessScope: '水晶工艺品加工销售', entryDate: '2023-03-15', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-001', zone: '东部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→清洗', rawMaterials: '水晶原石、抛光粉、切割液', pollutants: { COD: 0.85, 氨氮: 0.12, VOCs: 0.35, 'SO₂': 0.15 }, preventionMeasures: '含铬废水预处理+综合废水生化处理、布袋除尘+水幕净化', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-10', result: '达标', org: '浦江县环境监测站' }, { type: '废气', date: '2026-05-10', result: '达标', org: '第三方检测机构' }] },
  { enterpriseId: 2, enterpriseName: '金华晶盛水晶加工厂', industry: '水晶加工', area: 'A区', contact: '李建国', phone: '13957901002', leaseStatus: '租赁中', legalPerson: '李建国', creditCode: '91330700MA2E5Y0L2B', address: '浦江县水晶园区A区2栋', resourceNo: '东部01号楼2层', businessScope: '水晶灯饰配件加工', entryDate: '2023-04-20', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-002', zone: '东部园区', eiaType: '片区环评', mainProcess: '切割→粗磨→精磨→清洗', rawMaterials: '水晶毛坯、磨料、冷却液', pollutants: { COD: 0.62, 氨氮: 0.08, VOCs: 0.28, 'SO₂': 0.10 }, preventionMeasures: '沉淀池+生化处理、布袋除尘器', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '待更新', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-04-15', result: '达标', org: '浙江省环境监测中心' }] },
  { enterpriseId: 3, enterpriseName: '浦江璀璨水晶有限公司', industry: '水晶加工', area: 'B区', contact: '王丽芳', phone: '13957901003', leaseStatus: '租赁中', legalPerson: '王丽芳', creditCode: '91330726MA2E5Z1M3C', address: '浦江县水晶园区B区5栋', resourceNo: '中部01号楼3层', businessScope: '高端水晶礼品定制', entryDate: '2023-02-10', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-003', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→镀膜→检验', rawMaterials: '高纯水晶原料、镀膜材料', pollutants: { COD: 1.20, 氨氮: 0.15, VOCs: 0.50, 'SO₂': 0.20 }, preventionMeasures: '含铬废水预处理+综合废水生化、VOCs催化燃烧', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-22', result: '达标', org: '金华市环境监测站' }, { type: '废气', date: '2026-05-22', result: '达标', org: '金华市环境监测站' }] },
  { enterpriseId: 4, enterpriseName: '浙江晶亮光学科技有限公司', industry: '光学元件', area: 'C区', contact: '陈志远', phone: '13957901004', leaseStatus: '租赁中', legalPerson: '陈志远', creditCode: '91330000MA2E5A2N4D', address: '浦江县水晶园区C区3栋', businessScope: '光学镜片研发生产', entryDate: '2023-01-08', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-004', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→镀膜→检验', rawMaterials: '光学玻璃、镀膜材料、研磨液', pollutants: { COD: 1.50, 氨氮: 0.18, VOCs: 0.60, 'SO₂': 0.25 }, preventionMeasures: '含氟废水预处理+生化、VOCs RTO焚烧', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-18', result: '达标', org: '浙江省环境监测中心' }, { type: '废气', date: '2026-05-18', result: '超标', org: '浙江省环境监测中心' }] },
  { enterpriseId: 5, enterpriseName: '浦江华彩包装印刷有限公司', industry: '包装印刷', area: 'D区', contact: '赵文博', phone: '13957901005', leaseStatus: '租赁中', legalPerson: '赵文博', creditCode: '91330726MA2E5B3O5E', address: '浦江县水晶园区D区1栋', businessScope: '包装装潢印刷', entryDate: '2023-05-12', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-005', zone: '西部园区', eiaType: '片区环评', mainProcess: '印刷→覆膜→模切→糊盒', rawMaterials: '纸张、油墨、溶剂、胶水', pollutants: { COD: 0.45, 氨氮: 0.05, VOCs: 1.80, 'SO₂': 0.08 }, preventionMeasures: '溶剂回收+活性炭吸附、VOCs催化燃烧', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '办理中', emergencyPlanStatus: '待更新', monitorStatus: '已完成', monitorRecords: [{ type: '废气', date: '2026-05-25', result: '超标', org: '浦江县环境监测站' }] },
  { enterpriseId: 6, enterpriseName: '浦江晶锐水晶加工厂', industry: '水晶加工', area: 'A区', contact: '刘德明', phone: '13957901006', leaseStatus: '租赁中', legalPerson: '刘德明', creditCode: '91330726MA2E5C4P6F', address: '浦江县水晶园区A区5栋', businessScope: '水晶珠饰品加工', entryDate: '2023-06-01', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-006', zone: '东部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光', rawMaterials: '水晶原石、金刚砂', pollutants: { COD: 0.55, 氨氮: 0.07, VOCs: 0.20, 'SO₂': 0.08 }, preventionMeasures: '沉淀循环水系统、旋风除尘器', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '待办理', emergencyPlanStatus: '办理中', monitorStatus: '已完成', monitorRecords: [] },
  { enterpriseId: 7, enterpriseName: '浦江顺达物流有限公司', industry: '物流运输', area: 'E区', contact: '周志强', phone: '13957901007', leaseStatus: '租赁中', legalPerson: '周志强', creditCode: '91330726MA2E5D5Q7G', address: '浦江县水晶园区E区物流中心', businessScope: '道路货物运输 仓储服务', entryDate: '2023-03-25', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '东部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 8, enterpriseName: '金华明辉水晶制品有限公司', industry: '水晶加工', area: 'B区', contact: '孙秀英', phone: '13957901008', leaseStatus: '租赁中', legalPerson: '孙秀英', creditCode: '91330700MA2E5E6R8H', address: '浦江县水晶园区B区8栋', businessScope: '水晶纪念品制造销售', entryDate: '2023-04-08', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-008', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→组装', rawMaterials: '水晶毛坯、磨料、抛光液', pollutants: { COD: 0.90, 氨氮: 0.12, VOCs: 0.38, 'SO₂': 0.15 }, preventionMeasures: '生化处理+深度处理、布袋除尘', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-04-20', result: '达标', org: '金华市环境监测站' }] },
  { enterpriseId: 9, enterpriseName: '浦江鑫源配套服务有限公司', industry: '配套服务', area: 'D区', contact: '吴海燕', phone: '13957901009', leaseStatus: '租赁中', legalPerson: '吴海燕', creditCode: '91330726MA2E5F7S9I', address: '浦江县水晶园区D区服务楼', businessScope: '企业管理咨询服务', entryDate: '2023-07-15', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '西部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 10, enterpriseName: '浦江水晶之光科技有限公司', industry: '水晶加工', area: 'C区', contact: '黄志豪', phone: '13957901010', leaseStatus: '租赁中', legalPerson: '黄志豪', creditCode: '91330726MA2E5G8T0J', address: '浦江县水晶园区C区1栋', businessScope: '水晶激光内雕技术研发', entryDate: '2023-01-20', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-010', zone: '西部园区', eiaType: '片区环评', mainProcess: '切割→激光内雕→抛光→检验', rawMaterials: '水晶原石、激光设备耗材', pollutants: { COD: 0.80, 氨氮: 0.10, VOCs: 0.32, 'SO₂': 0.13 }, preventionMeasures: '含铬废水预处理+生化、布袋除尘', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-12', result: '达标', org: '浦江县环境监测站' }] },
  { enterpriseId: 11, enterpriseName: '浙江浦江光学仪器厂', industry: '光学元件', area: 'C区', contact: '郑伟达', phone: '13957901011', leaseStatus: '租赁中', legalPerson: '郑伟达', creditCode: '91330000MA2E5H9U1K', address: '浦江县水晶园区C区5栋', businessScope: '望远镜镜片 透镜生产', entryDate: '2023-02-28', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-011', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→组装→校准', rawMaterials: '光学玻璃、抛光粉、清洗剂', pollutants: { COD: 1.10, 氨氮: 0.14, VOCs: 0.45, 'SO₂': 0.18 }, preventionMeasures: '综合废水生化处理、袋式除尘器', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-03-15', result: '达标', org: '浙江省环境监测中心' }] },
  { enterpriseId: 12, enterpriseName: '浦江恒信包装厂', industry: '包装印刷', area: 'D区', contact: '钱国平', phone: '13957901012', leaseStatus: '已退租', legalPerson: '钱国平', creditCode: '91330726MA2E5I0V2L', address: '浦江县水晶园区D区2栋', businessScope: '纸箱包装加工', entryDate: '2023-08-01', environmentalLevel: 'C级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-012', zone: '西部园区', eiaType: '独立环评', mainProcess: '纸箱设计→印刷→模切→钉箱', rawMaterials: '纸板、印刷耗材', pollutants: { COD: 0.25, 氨氮: 0.03, VOCs: 0.80, 'SO₂': 0.03 }, preventionMeasures: '水性油墨替代+活性炭吸附', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '待办理', emergencyPlanStatus: '待办理', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 13, enterpriseName: '浦江万通水晶贸易有限公司', industry: '配套服务', area: 'D区', contact: '马晓东', phone: '13957901013', leaseStatus: '租赁中', legalPerson: '马晓东', creditCode: '91330726MA2E5J1W3M', address: '浦江县水晶园区D区展销中心', businessScope: '水晶制品贸易 批发零售', entryDate: '2023-05-20', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '西部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 14, enterpriseName: '金华瑞丰水晶有限公司', industry: '水晶加工', area: 'B区', contact: '林美珍', phone: '13957901014', leaseStatus: '租赁中', legalPerson: '林美珍', creditCode: '91330700MA2E5K2X4N', address: '浦江县水晶园区B区3栋', businessScope: '水晶奖杯奖牌制造', entryDate: '2023-03-10', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-014', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→组装→包装', rawMaterials: '水晶原石、金属配件、包装材料', pollutants: { COD: 0.95, 氨氮: 0.13, VOCs: 0.40, 'SO₂': 0.16 }, preventionMeasures: '综合废水生化处理、袋式除尘+水幕', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '办理中', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-04-28', result: '达标', org: '金华市环境监测站' }] },
  { enterpriseId: 15, enterpriseName: '浦江通达货运有限公司', industry: '物流运输', area: 'E区', contact: '何建峰', phone: '13957901015', leaseStatus: '租赁中', legalPerson: '何建峰', creditCode: '91330726MA2E5L3Y5O', address: '浦江县水晶园区E区货运站', businessScope: '货物专用运输 配载服务', entryDate: '2023-06-18', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '东部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 16, enterpriseName: '浦江晶莹水晶有限公司', industry: '水晶加工', area: 'A区', contact: '徐志明', phone: '13957901016', leaseStatus: '已退租', legalPerson: '徐志明', creditCode: '91330726MA2E5M4Z6P', address: '浦江县水晶园区A区7栋', businessScope: '水晶拉丝加工', entryDate: '2023-04-25', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-016', zone: '东部园区', eiaType: '片区环评', mainProcess: '拉丝→酸洗→清洗→切割', rawMaterials: '水晶棒材、酸洗液', pollutants: { COD: 0.48, 氨氮: 0.06, VOCs: 0.18, 'SO₂': 0.06 }, preventionMeasures: '酸碱中和+沉淀处理、酸雾吸收塔', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '待办理', emergencyPlanStatus: '待办理', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 17, enterpriseName: '浙江浦星光学元件有限公司', industry: '光学元件', area: 'C区', contact: '杨国华', phone: '13957901017', leaseStatus: '租赁中', legalPerson: '杨国华', creditCode: '91330000MA2E5N5A7Q', address: '浦江县水晶园区C区7栋', businessScope: '精密光学元件制造', entryDate: '2023-01-15', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-017', zone: '中部园区', eiaType: '独立环评', mainProcess: '切割→精密研磨→镀膜→检测', rawMaterials: '精密光学材料、镀膜材料', pollutants: { COD: 1.35, 氨氮: 0.16, VOCs: 0.55, 'SO₂': 0.22 }, preventionMeasures: '含氟废水预处理+生化、VOCs催化燃烧+活性炭', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-08', result: '达标', org: '浙江省环境监测中心' }, { type: '废气', date: '2026-05-08', result: '达标', org: '浙江省环境监测中心' }] },
  { enterpriseId: 18, enterpriseName: '浦江嘉禾包装有限公司', industry: '包装印刷', area: 'D区', contact: '朱丽萍', phone: '13957901018', leaseStatus: '租赁中', legalPerson: '朱丽萍', creditCode: '91330726MA2E5O6B8R', address: '浦江县水晶园区D区4栋', businessScope: '礼品盒包装设计印刷', entryDate: '2023-09-01', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-018', zone: '西部园区', eiaType: '独立环评', mainProcess: '印刷→裱纸→模切→糊盒→装箱', rawMaterials: '纸板、水性胶水、印刷油墨', pollutants: { COD: 0.30, 氨氮: 0.03, VOCs: 1.20, 'SO₂': 0.04 }, preventionMeasures: '水性胶替代溶剂胶+活性炭吸附、低温等离子处理', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '待办理', emergencyPlanStatus: '办理中', monitorStatus: '已完成', monitorRecords: [{ type: '废气', date: '2026-04-05', result: '达标', org: '浦江县环境监测站' }] },
  { enterpriseId: 19, enterpriseName: '浦江新世纪水晶加工厂', industry: '水晶加工', area: 'B区', contact: '胡建平', phone: '13957901019', leaseStatus: '租赁中', legalPerson: '胡建平', creditCode: '91330726MA2E5P7C9S', address: '浦江县水晶园区B区10栋', businessScope: '水晶球 水晶柱加工', entryDate: '2023-07-05', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-019', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→研磨→抛光→成型', rawMaterials: '水晶原石、切割液', pollutants: { COD: 0.58, 氨氮: 0.08, VOCs: 0.22, 'SO₂': 0.09 }, preventionMeasures: '沉淀+生化处理、旋风除尘', eiaStatus: '已完成', acceptanceStatus: '已完成', permitStatus: '已完成', emergencyPlanStatus: '待更新', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-30', result: '达标', org: '金华市环境监测站' }] },
  { enterpriseId: 20, enterpriseName: '浦江安达物流仓储有限公司', industry: '物流运输', area: 'E区', contact: '曹明辉', phone: '13957901020', leaseStatus: '租赁中', legalPerson: '曹明辉', creditCode: '91330726MA2E5Q8D0T', address: '浦江县水晶园区E区仓储中心', businessScope: '仓储物流 货物配送', entryDate: '2023-04-12', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '东部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 21, enterpriseName: '浦江晶宇水晶饰品有限公司', industry: '水晶加工', area: 'A区', contact: '陈美华', phone: '13957901021', leaseStatus: '租赁中', legalPerson: '陈美华', creditCode: '91330726MA2E5R9E1U', address: '浦江县水晶园区A区9栋', businessScope: '水晶饰品设计加工', entryDate: '2023-08-10', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-021', zone: '东部园区', eiaType: '独立环评', mainProcess: '3D建模→激光内雕→精密切割→抛光', rawMaterials: '水晶原石、激光雕刻机耗材', pollutants: { COD: 0.65, 氨氮: 0.08, VOCs: 0.25, 'SO₂': 0.10 }, preventionMeasures: '废水沉淀+生化处理、激光烟尘净化器', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '待办理', emergencyPlanStatus: '办理中', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-03-28', result: '达标', org: '浦江县环境监测站' }] },
  { enterpriseId: 22, enterpriseName: '金华恒达配套设备有限公司', industry: '配套服务', area: 'D区', contact: '赵国庆', phone: '13957901022', leaseStatus: '租赁中', legalPerson: '赵国庆', creditCode: '91330700MA2E5S0F2V', address: '浦江县水晶园区D区设备楼', businessScope: '水晶加工设备销售维修', entryDate: '2023-05-08', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '西部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 23, enterpriseName: '浦江光辉水晶工艺厂', industry: '水晶加工', area: 'B区', contact: '王德福', phone: '13957901023', leaseStatus: '已退租', legalPerson: '王德福', creditCode: '91330726MA2E5T1G3W', address: '浦江县水晶园区B区12栋', businessScope: '水晶工艺品雕刻', entryDate: '2023-06-25', environmentalLevel: 'B级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-023', zone: '中部园区', eiaType: '片区环评', mainProcess: '切割→雕刻→抛光', rawMaterials: '水晶原石、雕刻刀具', pollutants: { COD: 0.42, 氨氮: 0.05, VOCs: 0.15, 'SO₂': 0.06 }, preventionMeasures: '沉淀池处理、布袋除尘', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '已完成', emergencyPlanStatus: '待办理', monitorStatus: '待办理', monitorRecords: [] },
  { enterpriseId: 24, enterpriseName: '浦江天宇光学科技有限公司', industry: '光学元件', area: 'C区', contact: '周晓东', phone: '13957901024', leaseStatus: '租赁中', legalPerson: '周晓东', creditCode: '91330726MA2E5U2H4X', address: '浦江县水晶园区C区9栋', businessScope: '光学镜头组件研发', entryDate: '2023-02-05', environmentalLevel: 'A级', wasteWaterStandard: '达标', emissionPermit: 'PJ-2023-WS-024', zone: '西部园区', eiaType: '独立环评', mainProcess: '光学镜片加工→组装→检测', rawMaterials: '光学玻璃坯料、稀土抛光粉、真空镀膜材料', pollutants: { COD: 1.80, 氨氮: 0.22, VOCs: 0.75, 'SO₂': 0.30 }, preventionMeasures: '含氟含稀土废水专项处理+生化、VOCs催化燃烧+脱硫', eiaStatus: '已完成', acceptanceStatus: '待办理', permitStatus: '已完成', emergencyPlanStatus: '已完成', monitorStatus: '已完成', monitorRecords: [{ type: '废水', date: '2026-05-15', result: '达标', org: '浙江省环境监测中心' }] },
  { enterpriseId: 25, enterpriseName: '浦江诚信物业服务有限公司', industry: '配套服务', area: 'D区', contact: '刘玉芬', phone: '13957901025', leaseStatus: '租赁中', legalPerson: '刘玉芬', creditCode: '91330726MA2E5V3I5Y', address: '浦江县水晶园区综合服务楼', businessScope: '物业管理 园区保洁', entryDate: '2023-01-01', environmentalLevel: 'C级', wasteWaterStandard: '-', emissionPermit: '-', zone: '西部园区', eiaType: '', mainProcess: '', rawMaterials: '', pollutants: {}, preventionMeasures: '', eiaStatus: '', acceptanceStatus: '', permitStatus: '', emergencyPlanStatus: '', monitorStatus: '待办理', monitorRecords: [] },
]

// ---------- 园区运营（智慧运营，对齐浦江大屏 financials.ts + 三园区）----------
const OP_PARKS = [
  { key: 'center', name: '中部园区' },
  { key: 'east', name: '东部园区' },
  { key: 'west', name: '西部园区' },
]

// 三园区年度经营收入（2025 口径，金额单位：万元；中部体量最大）
// 对齐大屏 zoneRevenues：rent/property/utility/solidWaste/parking/total/collectionRate
const OP_ZONE_REVENUE = {
  center: { rent: 502.3, property: 126.5, utility: 228.6, solidWaste: 48.2, parking: 15.6, total: 921.2, collectionRate: 99.4 },
  east: { rent: 412.6, property: 103.8, utility: 188.4, solidWaste: 42.5, parking: 18.2, total: 765.5, collectionRate: 98.9 },
  west: { rent: 330.9, property: 82.1, utility: 151.2, solidWaste: 29.3, parking: 11.2, total: 604.7, collectionRate: 98.1 },
}

// 三园区资产状态（出租率随园区规模递减）
const OP_ZONE_ASSET = {
  center: { rented: 34, vacant: 3, repair: 1, rentalRate: 89 },
  east: { rented: 28, vacant: 5, repair: 2, rentalRate: 82 },
  west: { rented: 22, vacant: 7, repair: 1, rentalRate: 74 },
}

// 收入构成（万元）：6 类，含当年累计应收/实收/欠费/收缴率/环比（对齐大屏 revenueItems）
const OP_REVENUE_ITEMS = [
  { type: '租金', yearReceived: 538.1, outstanding: 3.9, collectionRate: 99.3, growth: 1.6 },
  { type: '物业费', yearReceived: 133.5, outstanding: 2.3, collectionRate: 98.3, growth: 1.5 },
  { type: '水电费', yearReceived: 248.2, outstanding: 0.0, collectionRate: 100.0, growth: 3.8 },
  { type: '废渣处置费', yearReceived: 52.6, outstanding: 1.4, collectionRate: 97.4, growth: 5.9 },
  { type: '停车费', yearReceived: 19.3, outstanding: 0.5, collectionRate: 97.5, growth: 5.3 },
  { type: '其他', yearReceived: 7.3, outstanding: 0.5, collectionRate: 93.6, growth: 6.7 },
]

// 年租金/年物业费按标的物类型构成（2025，万元；area 为总面积万m²，MoM 为比上月新增金额/面积，可正可负）
const OP_RENT_BY_TYPE = [
  { type: '厂房', rent: 560.0, area: 3.2, rentMoM: 6.5, areaMoM: 0.3 },
  { type: '仓库', rent: 210.0, area: 1.8, rentMoM: -2.4, areaMoM: -0.1 },
  { type: '综合楼', rent: 260.0, area: 2.6, rentMoM: 3.2, areaMoM: 0.2 },
  { type: '宿舍楼', rent: 120.0, area: 1.2, rentMoM: -1.5, areaMoM: 0.0 },
  { type: '营业房', rent: 95.8, area: 0.9, rentMoM: 2.8, areaMoM: -0.2 },
]
const OP_PROPERTY_BY_TYPE = [
  { type: '厂房', property: 140.0, area: 3.2, propertyMoM: 1.2, areaMoM: 0.3 },
  { type: '仓库', property: 40.0, area: 1.8, propertyMoM: -0.8, areaMoM: -0.1 },
  { type: '综合楼', property: 60.0, area: 2.6, propertyMoM: 0.5, areaMoM: 0.2 },
  { type: '宿舍楼', property: 50.0, area: 1.2, propertyMoM: -0.3, areaMoM: 0.0 },
  { type: '营业房', property: 22.4, area: 0.9, propertyMoM: 0.4, areaMoM: -0.2 },
]

// 水电费明细（对齐大屏 parkMonitor.ts waterUsage/electricity，用量 + 费用双口径）
// 水：厂自来水/卫自来水/中水（用量吨 + 费用万元）；电：尖/峰/平/谷（用量kWh + 费用万元）
const OP_ZONE_UTILITY = {
  center: {
    water: { usage: 8200, fee: 32.5, split: [
      { name: '厂自来水', volume: 4100, fee: 14.3 },
      { name: '卫自来水', volume: 1950, fee: 6.5 },
      { name: '中水', volume: 2150, fee: 11.7 },
    ] },
    electricity: { usage: 228000, fee: 68.4, split: [
      { name: '尖电', volume: 34200, fee: 10.3 },
      { name: '峰电', volume: 57000, fee: 17.1 },
      { name: '平电', volume: 91200, fee: 27.3 },
      { name: '谷电', volume: 45600, fee: 13.7 },
    ] },
  },
  east: {
    water: { usage: 6100, fee: 24.8, split: [
      { name: '厂自来水', volume: 3050, fee: 12.4 },
      { name: '卫自来水', volume: 1450, fee: 4.2 },
      { name: '中水', volume: 1600, fee: 8.2 },
    ] },
    electricity: { usage: 182000, fee: 54.6, split: [
      { name: '尖电', volume: 32760, fee: 9.8 },
      { name: '峰电', volume: 49140, fee: 14.8 },
      { name: '平电', volume: 69160, fee: 20.7 },
      { name: '谷电', volume: 30940, fee: 9.3 },
    ] },
  },
  west: {
    water: { usage: 5400, fee: 21.2, split: [
      { name: '厂自来水', volume: 2700, fee: 8.5 },
      { name: '卫自来水', volume: 1300, fee: 4.9 },
      { name: '中水', volume: 1400, fee: 7.8 },
    ] },
    electricity: { usage: 118000, fee: 35.4, split: [
      { name: '尖电', volume: 14160, fee: 4.2 },
      { name: '峰电', volume: 25960, fee: 7.8 },
      { name: '平电', volume: 49560, fee: 14.9 },
      { name: '谷电', volume: 28320, fee: 8.5 },
    ] },
  },
}

// 水电费 年度/月度 筛选选项（对齐大屏 parkMonitor.ts monthOptions/yearOptions 波动系数）
const OP_UTILITY_MONTHS = [
  { key: '2025-11', label: '2025年11月', factor: 0.85 },
  { key: '2025-12', label: '2025年12月', factor: 0.91 },
  { key: '2026-01', label: '2026年1月', factor: 0.76 },
  { key: '2026-02', label: '2026年2月', factor: 0.7 },
  { key: '2026-03', label: '2026年3月', factor: 0.94 },
  { key: '2026-04', label: '2026年4月', factor: 1.03 },
  { key: '2026-05', label: '2026年5月', factor: 1.09 },
  { key: '2026-06', label: '2026年6月', factor: 1.18 },
  { key: '2026-07', label: '2026年7月', factor: 1.27 },
  { key: '2026-08', label: '2026年8月', factor: 1.22 },
  { key: '2026-09', label: '2026年9月', factor: 1.07 },
  { key: '2026-10', label: '2026年10月', factor: 1.0 },
]
const OP_UTILITY_YEARS = [
  { key: '2024', label: '2024年', factor: 10.6 },
  { key: '2025', label: '2025年', factor: 11.4 },
  { key: '2026', label: '2026年', factor: 12.2 },
]

// 收入构成 月度筛选选项：复用水电费月份，因子换算为「年度收入基数的当月占比」
const OP_REVENUE_MONTHS = OP_UTILITY_MONTHS.map((m) => ({ key: m.key, label: m.label, factor: +(m.factor / 12).toFixed(3) }))

// 停车（2025）：车位 + 办卡车辆 + 月度停车费趋势（万元）
const OP_PARKING = {
  totalSpaces: 1260,
  occupiedSpaces: 897,
  yearCardVehicles: 120,
  quarterCardVehicles: 210,
  monthCardVehicles: 280,
  monthlyParking: [3.2, 2.8, 3.5, 3.8, 4.0, 4.2, 4.5, 4.3, 3.9, 3.7, 3.4, 3.7],
}

// 月度营收趋势（12 个月，2025，总营收万元；对齐大屏 monthlyRevenues）
const OP_MONTHLY_REVENUE = [
  { month: '1月', total: 177.3 }, { month: '2月', total: 171.8 }, { month: '3月', total: 190.6 },
  { month: '4月', total: 193.0 }, { month: '5月', total: 199.3 }, { month: '6月', total: 203.3 },
  { month: '7月', total: 207.9 }, { month: '8月', total: 206.8 }, { month: '9月', total: 196.7 },
  { month: '10月', total: 194.4 }, { month: '11月', total: 179.7 }, { month: '12月', total: 166.4 },
]

// 欠费名单（对齐大屏 arrearsRecords，zone 用于按园区筛选）
const OP_ARREARS = [
  { enterpriseId: 'ENT-001', enterpriseName: '浦江晶彩光学制品厂', zone: 'east', feeType: '租金', amount: 2.4, deadline: '2026年9月30日', status: '催收中', gridWorker: '任小龙' },
  { enterpriseId: 'ENT-012', enterpriseName: '金辉水晶灯饰有限公司', zone: 'center', feeType: '物业费', amount: 1.8, deadline: '2026年8月30日', status: '催收中', gridWorker: '何剑龙' },
  { enterpriseId: 'ENT-023', enterpriseName: '华艺水晶工艺品厂', zone: 'west', feeType: '租金', amount: 3.6, deadline: '2026年7月31日', status: '催收中', gridWorker: '王强' },
  { enterpriseId: 'ENT-034', enterpriseName: '浦江星光磨料磨具厂', zone: 'east', feeType: '废渣处置费', amount: 0.8, deadline: '2026年10月15日', status: '催收中', gridWorker: '方晓琨' },
  { enterpriseId: 'ENT-045', enterpriseName: '千叶高精度雕刻厂', zone: 'center', feeType: '物业费', amount: 1.2, deadline: '2026年8月30日', status: '催收中', gridWorker: '张建伟' },
  { enterpriseId: 'ENT-056', enterpriseName: '恒盛水晶原料加工厂', zone: 'west', feeType: '租金', amount: 5.2, deadline: '2026年6月30日', status: '催收中', gridWorker: '黄晨' },
  { enterpriseId: 'ENT-067', enterpriseName: '浦江明达水晶玻璃厂', zone: 'east', feeType: '停车费', amount: 0.3, deadline: '2026年10月31日', status: '催收中', gridWorker: '楼东升' },
  { enterpriseId: 'ENT-089', enterpriseName: '浦江博源水晶科技有限公司', zone: 'west', feeType: '租金', amount: 1.5, deadline: '2026年9月15日', status: '催收中', gridWorker: '王强' },
  { enterpriseId: 'ENT-095', enterpriseName: '利达水晶切割加工厂', zone: 'east', feeType: '废渣处置费', amount: 0.6, deadline: '2026年10月20日', status: '催收中', gridWorker: '潘超俊' },
]

// 废渣处置（对齐大屏 environmental.ts residueYearTiers，一年一次统计，按核定设备数分档收费）
const OP_RESIDUE_YEARS = ['2025']
const OP_RESIDUE_TIERS = [
  { tier: '一档', price: 210, enterpriseCount: 5, deviceCount: 8, amount: 1680 },
  { tier: '二档', price: 120, enterpriseCount: 4, deviceCount: 14, amount: 1680 },
  { tier: '三档', price: 50, enterpriseCount: 3, deviceCount: 17, amount: 850 },
  { tier: '四档', price: 20, enterpriseCount: 3, deviceCount: 25, amount: 500 },
  { tier: '五档', price: 0, enterpriseCount: 2, deviceCount: 28, amount: 0 },
]

function operationOverview() {
  const zones: Record<string, any> = {}
  OP_PARKS.forEach((p) => {
    zones[p.key] = { ...OP_ZONE_REVENUE[p.key], ...OP_ZONE_ASSET[p.key] }
  })
  const total = OP_PARKS.reduce(
    (acc, p) => {
      const z = OP_ZONE_REVENUE[p.key]
      const a = OP_ZONE_ASSET[p.key]
      acc.rent += z.rent
      acc.property += z.property
      acc.utility += z.utility
      acc.solidWaste += z.solidWaste
      acc.parking += z.parking
      acc.total += z.total
      acc.rented += a.rented
      acc.vacant += a.vacant
      acc.repair += a.repair
      return acc
    },
    { rent: 0, property: 0, utility: 0, solidWaste: 0, parking: 0, total: 0, rented: 0, vacant: 0, repair: 0 },
  )
  total.collectionRate = 99.0
  total.rentalRate = Math.round((total.rented / (total.rented + total.vacant + total.repair)) * 100)

  return {
    parks: OP_PARKS,
    zones,
    total,
    revenueItems: OP_REVENUE_ITEMS,
    rentByType: OP_RENT_BY_TYPE,
    propertyByType: OP_PROPERTY_BY_TYPE,
    utility: OP_ZONE_UTILITY,
    utilityMonths: OP_UTILITY_MONTHS,
    utilityYears: OP_UTILITY_YEARS,
    revenueMonths: OP_REVENUE_MONTHS,
    parking: OP_PARKING,
    residueYears: OP_RESIDUE_YEARS,
    residueTiers: OP_RESIDUE_TIERS,
    monthlyRevenue: OP_MONTHLY_REVENUE,
    arrears: OP_ARREARS,
  }
}

export function setupMock() {
  Mock.setup({ timeout: '200-500' })

  // ---------- 一园一档 ----------
  Mock.mock(/\/biz\/parkArchive\/parkInfo/, 'get', () => ok(PARK))
  Mock.mock(/\/biz\/parkArchive\/parkList/, 'get', () => ok(PARKS))

  // ---------- 园区档案文件 ----------
  Mock.mock(/\/biz\/parkArchive\/documents/, 'get', (options: { url: string }) => {
    const keyword = (queryOf(options.url, 'keyword') || '').trim().toLowerCase()
    const category = queryOf(options.url, 'category')
    const status = queryOf(options.url, 'status')
    let filtered = [...DOCUMENTS]
    if (keyword) {
      filtered = filtered.filter((d) =>
        [d.docName, d.docCode, d.remark || '', d.content || ''].join(' ').toLowerCase().includes(keyword),
      )
    }
    if (category) filtered = filtered.filter((d) => d.category === category)
    if (status) filtered = filtered.filter((d) => d.status === status)
    filtered = [...filtered].sort((a, b) => {
      if (a.status !== b.status) return a.status === '有效' ? -1 : 1
      return (b.publishDate || '').localeCompare(a.publishDate || '')
    })
    return page(filtered)
  })
  Mock.mock(/\/biz\/parkArchive\/document\/\d+/, 'get', (options: { url: string }) => {
    const id = Number(options.url.match(/document\/(\d+)/)?.[1])
    return ok(DOCUMENTS.find((d) => d.docId === id) || null)
  })
  // 上传/新增档案文件
  Mock.mock(/\/biz\/parkArchive\/document$/, 'post', (options: { body: string }) => {
    const body = JSON.parse(options.body || '{}')
    const nextId = Math.max(0, ...DOCUMENTS.map((d) => d.docId)) + 1
    const year = new Date().getFullYear()
    const doc = {
      docId: nextId,
      docCode: `SC-${year}-${String(nextId).padStart(3, '0')}`,
      docName: (body.docName || '').trim() || '未命名文件',
      category: body.category || '管理制度',
      publishDate: body.publishDate || '',
      effectiveDate: body.effectiveDate || '',
      expiryDate: body.expiryDate || '',
      version: body.version || 'V1.0',
      status: '有效',
      fileSize: body.fileSize || '',
      remark: body.remark || '',
      content: body.content || '',
    }
    DOCUMENTS.unshift(doc)
    return ok(doc, '上传成功')
  })
  // 删除档案文件
  Mock.mock(/\/biz\/parkArchive\/document\/\d+/, 'delete', (options: { url: string }) => {
    const id = Number(options.url.match(/document\/(\d+)/)?.[1])
    const idx = DOCUMENTS.findIndex((d) => d.docId === id)
    if (idx > -1) DOCUMENTS.splice(idx, 1)
    return ok({ deleted: idx > -1 }, '删除成功')
  })

  // ---------- 一企一档 ----------
  Mock.mock(/\/biz\/parkArchive\/enterprise\/list/, 'get', (options: { url: string }) => {
    const keyword = (queryOf(options.url, 'keyword') || '').trim().toLowerCase()
    const industry = queryOf(options.url, 'industry')
    const area = queryOf(options.url, 'area')
    const leaseStatus = queryOf(options.url, 'leaseStatus')
    let filtered = [...ENTERPRISES]
    if (keyword) {
      filtered = filtered.filter((e) =>
        [e.enterpriseName, e.creditCode, e.legalPerson, e.industry, e.area, e.contact]
          .join(' ')
          .toLowerCase()
          .includes(keyword),
      )
    }
    if (industry) filtered = filtered.filter((e) => e.industry === industry)
    if (area) filtered = filtered.filter((e) => e.area === area)
    if (leaseStatus) filtered = filtered.filter((e) => e.leaseStatus === leaseStatus)
    return page(filtered)
  })
  Mock.mock(/\/biz\/parkArchive\/enterprise\/\d+/, 'get', (options: { url: string }) => {
    const id = Number(options.url.match(/enterprise\/(\d+)/)?.[1])
    return ok(ENTERPRISES.find((e) => e.enterpriseId === id) || null)
  })

  // ---------- 园区运营（智慧运营，三园区）----------
  Mock.mock(/\/biz\/parkOperation\/overview/, 'get', () => ok(operationOverview()))

  // ---------- 环保一件事管理 ----------
  setupEnvironmentMock()

  // ---------- 企业一站式服务（管理端）----------
  setupServiceMock()

  // ---------- 企业一站式服务（企业端）----------
  setupEnterpriseServiceMock()
}
