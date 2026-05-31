# ContractMind MVP v0.5

**版本**: 0.5  
**日期**: 2026-05-31  
**目标**: 2 周完成核心验证  
**原则**: 删掉一切非必要功能

---

## 一、MVP 核心流程

```
用户上传 PDF/DOCX
    ↓
Server 解析文本
    ↓
Deepseek AI 分析
    ↓
输出风险报告（Web 页面）
```

**删除项**: 注册、登录、支付、分享、PDF 下载、历史记录、邮件通知

---

## 二、功能清单

### P0 - 必须完成（Week 1）

| 功能 | 描述 | 验收标准 |
|------|------|---------|
| **上传合同** | 支持 PDF/DOCX，最大 10MB | 文件能上传成功 |
| **文本解析** | 提取合同文字内容 | 文字完整度 >95% |
| **合同分类** | 自动识别 NDA/劳动合同/服务合同 | 准确率 >80% |
| **条款切分** | 按编号切分为独立条款 | 主要条款被识别 |
| **风险分析** | 逐条 AI 分析，识别风险点 | 至少识别 3 类风险 |
| **报告生成** | Web 页面展示风险报告 | 风险评分 + 详情 + 建议 |
| **免责声明** | 页面显示法律声明 | 每个页面显示 |

### P1 - 重要优化（Week 1 末 - Week 2）

| 功能 | 描述 | 验收标准 |
|------|------|---------|
| **处理状态** | 显示分析进度 | 用户知道进度 |
| **报告链接** | 生成可分享的报告 URL | 对方无需登录查看 |
| **次数限制** | 按 IP 限制每日上传次数（每日 3 次） | 防止滥用 |

### P2 - 可选（2 周后）

| 功能 | 描述 | 备注 |
|------|------|------|
| 注册/登录 | 用户体系 | Phase 2 |
| 支付 | 付费解锁无限次 | Phase 2 |
| PDF 下载 | 报告导出 PDF | Phase 2 |
| 更多合同类型 | 租赁、采购合同 | Phase 2 |

---

## 三、开发顺序

### Week 1 - 核心功能

```
Day 1-2: 项目初始化
Day 3-4: 文件上传 + 解析
Day 5-6: AI 分析
Day 7: 报告页面
```

### Week 2 - 完善 + 测试

```
Day 8-9: 处理状态 + 报告链接
Day 10-11: 次数限制 + 测试
Day 12-14: 部署 + 监控
```

---

## 四、数据库设计

```prisma
model Review {
  id            String    @id @default(cuid())
  fileName      String
  filePath      String
  fileSize      Int
  contractType  String    @default("Unknown")
  overallScore  Int?
  status        String    @default("pending")
  reportData    Json?
  shareToken    String    @unique @default(cuid())
  ipAddress     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model DailyStat {
  id           String @id @default(cuid())
  ipAddress    String
  reviewDate   String
  reviewCount  Int    @default(0)
  @@unique([ipAddress, reviewDate])
}
```

---

## 五、API 设计

| 方法 | 路径 | 描述 |
|------|------|------|
| **POST** | `/api/upload` | 上传合同 |
| **POST** | `/api/analyze` | 触发分析 |
| **GET** | `/api/report/[id]` | 获取报告 |

---

## 六、页面设计

| 页面 | 路由 | P0/P1 |
|------|------|-------|
| 首页 | `/` | P0 |
| 上传页 | `/upload` | P0 |
| 分析中页 | `/analyzing/[id]` | P1 |
| 报告页 | `/report/[id]` | P0 |

---

*文档版本: 0.5 | 最后更新: 2026-05-31*
