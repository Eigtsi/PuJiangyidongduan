# 浦江水晶产业园移动端（pj-park-mobile-app）

参照 `huachuan-h5-node-dev`（Vue3 + Vite + Vant4 + Pinia + Mock.js）搭建，主色 `#1677ff`，750 设计稿 rem 适配。

## 当前进度

已落地 **园区档案管理**（管理端「档案」Tab）：

- **档案首页** `/archive`：关键字搜索（企业名称 / 统一社会信用代码 / 法人 / 所属行业）、「一园一档」入口卡片、「一企一档」企业卡片列表
- **园区档案详情** `/archive/park`：园区基本信息 + 园区档案文件 + 行业分布
- **企业档案详情** `/archive/enterprise/:id`：企业基本信息 + 3 个子 Tab（档案信息 / 环保档案 / 租赁合同）

其余 4 个 Tab（运营 / 环保 / 服务 / 事项）为占位页，后续按设计文档逐步落地。

## 运行

```bash
npm install
npm run dev
```

开发模式 `VITE_MOCK_ENABLED=true`，全部数据来自 `src/mock/index.ts` 种子数据，无真实后端。

## 目录

```
src/
├ api/        # axios 封装 + 业务接口
├ mock/       # Mock.js 种子数据
├ router/     # 路由
├ store/      # Pinia
├ components/ # AppShell / ShellHeaderPortal / GlobalLoading
├ utils/      # rem 适配 / 格式化
├ styles/     # 全局样式
└ views/
   ├ archive/       # 园区档案管理
   └ placeholder/   # 占位页
```
