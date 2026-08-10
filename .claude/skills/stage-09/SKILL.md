---
name: stage-09-incremental-development
description: 增量开发阶段：分析变更需求、评估影响、在已有代码上增量修改、回归检查。适用于老项目新增功能或修改已有功能。触发关键词：增量开发、需求变更、老项目改造、迭代开发
---

# 增量开发阶段技能

## 功能描述

启动增量开发阶段工作流，适用于老项目（已有代码基础）的需求变更场景，执行以下任务：
1. 解析变更需求，提取变更点
2. 分析变更对现有系统的影响（数据模型、数据库、代码、接口）
3. 评审变更可行性和风险
4. 在已有代码基础上进行增量修改（后端 + 前端）
5. 回归检查，确保变更未引入错误

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| change_request | string | 否 | 变更需求描述（与 requirement_doc 二选一） | 新增会员等级功能，根据消费金额自动计算等级 |
| requirement_doc | string | 否 | 需求文档路径（相对路径，来自 stage-01 产出的 PRD） | docs/需求分析/PRD-HIS系统.md |
| change_type | string | 否 | 变更类型：feature（新功能）/ fix（修复）/ refactor（重构） | feature |
| docs_dir | string | 是 | 各阶段文档目录（相对路径） | docs |
| backend_dir | string | 是 | 后端项目目录（相对路径） | backend |
| frontend_dir | string | 否 | 前端项目目录（相对路径） | frontend |

## 使用示例

### 示例1：老项目新增功能（直接描述需求）

```bash
/stage-09 --project_name "HIS系统" --change_request "新增会员等级功能，根据消费金额自动计算等级，等级包括普通、铜牌、银牌、金牌，不同等级享受不同折扣" --change_type "feature" --docs_dir "docs" --backend_dir "backend" --frontend_dir "frontend"
```

### 示例2：老项目复杂新功能（先走 stage-01 出 PRD，再走 stage-09）

```bash
# 第一步：需求分析（产出 PRD 文档）
/stage-01 --project_name "HIS系统" --requirement_description "新增会员中心模块，包含会员等级、积分、优惠券三个子功能" --output_dir "docs/需求分析"

# 第二步：增量开发（读取 PRD，扫描老代码，增量开发）
/stage-09 --project_name "HIS系统" --requirement_doc "docs/需求分析/PRD-HIS系统.md" --change_type "feature" --docs_dir "docs" --backend_dir "backend" --frontend_dir "frontend"
```

### 示例3：修改已有功能

```bash
/stage-09 --project_name "电商系统" --change_request "订单收货地址字段拆分，原address字段拆分为province、city、district、detail_address四个字段" --change_type "refactor" --docs_dir "docs" --backend_dir "backend"
```

### 示例4：Bug修复

```bash
/stage-09 --project_name "HIS系统" --change_request "患者列表查询时，按手机号搜索无结果，需修复模糊查询逻辑" --change_type "fix" --docs_dir "docs" --backend_dir "backend"
```

## 工作流程

### 阶段一：变更需求解析

1. **解析变更请求**
   - 如果提供了 `requirement_doc`（PRD 文档路径），优先读取 PRD 作为需求来源
   - 如果提供了 `change_request`（变更需求描述），直接解析需求描述
   - 提取变更类型（新增功能 / 修改功能 / 修复Bug / 重构）
   - 识别变更涉及的业务模块
   - 提取变更点清单

2. **加载现有设计文档和代码**
   - 读取 `docs/` 下的需求分析、概要设计、数据库设计等文档（如存在）
   - **🆕 自动读取** `docs/后端经验-{project_name}.md` 和 `docs/前端经验-{project_name}.md`（如存在），获取历史踩坑记录
   - 扫描 `backend_dir` 和 `frontend_dir` 下的现有代码结构
   - 开发规范参考 stage-07/08 关联的 skill 文件（java-scaffold、java-implement、entity-designer-java 等）

### 阶段二：影响分析

1. **数据模型影响分析**
   - 实体变更（新增、修改、删除）
   - 属性变更（字段类型、约束、默认值）
   - 关系变更（关联关系、基数）

2. **数据库影响分析**
   - 表结构变更（DDL：ALTER TABLE / CREATE TABLE）
   - 索引变更
   - 数据迁移需求

3. **代码影响分析**
   - 后端：DO 实体类、Mapper、Service、Controller、VO 的修改范围
   - 前端：API 调用、页面组件、路由的修改范围
   - 测试用例变更

4. **接口影响分析**
   - 新增接口
   - 修改接口（向后兼容性评估）
   - 废弃接口

### 阶段三：变更评审

1. **可行性评估**
   - 技术可行性
   - 实现复杂度
   - 工期预估

2. **风险识别**
   - 数据迁移风险
   - 接口兼容性风险
   - 性能影响
   - 并发安全

3. **生成变更影响分析报告**
   - 输出到 `docs/变更分析/` 目录

### 阶段四：增量开发

1. **数据库变更**
   - 生成 DDL 脚本（ALTER TABLE / CREATE TABLE）
   - 生成数据迁移脚本
   - 生成回滚脚本

2. **后端增量开发**
   - 阅读现有代码结构，理解现有实现
   - 新增实体：在已有模块下创建新的 DO/Mapper/Service/Controller/VO
   - 修改实体：在已有 DO 上增加字段，同步修改 Mapper/Service/Controller/VO
   - 修复Bug：定位问题代码，修改逻辑

3. **前端增量开发**（如指定 frontend_dir）
   - 阅读现有前端代码结构
   - 新增页面：在已有路由配置中添加新路由
   - 修改页面：在已有页面组件上修改
   - 新增/修改 API 调用

### 阶段五：回归检查

1. **编译检查**（最多重试3次）
   - 后端：mvn compile
   - 前端：npm run build

2. **代码规范检查**
   - 命名规范
   - 分层架构一致性
   - 权限标识格式

3. **接口兼容性检查**
   - 新增接口不破坏现有接口
   - 修改接口的向后兼容性

4. **更新前端对接文档**
   - 新增/修改的接口文档
   - 输出到 `docs/api/` 目录

## 变更类型处理策略

| 变更类型 | 数据库 | 后端 | 前端 | 特殊处理 |
|---------|--------|------|------|---------|
| feature（新功能） | 新建表或新增字段 | 新增 DO/Mapper/Service/Controller | 新增页面和路由 | 可能需要初始化数据 |
| fix（修复） | 通常不变 | 定位并修改问题代码 | 定位并修改问题组件 | 需要复现步骤 |
| refactor（重构） | 可能字段拆分/合并 | 修改多个文件 | 同步修改调用方 | 需要兼容性过渡方案 |

## 代码规范

### 后端命名规范（同 stage-07）

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| DO类 | XxxDO | PatientDO |
| Mapper | XxxMapper | PatientMapper |
| Service接口 | XxxService | PatientService |
| Service实现 | XxxServiceImpl | PatientServiceImpl |
| Controller | XxxController | PatientController |
| 保存VO | XxxSaveReqVO | PatientSaveReqVO |
| 分页VO | XxxPageReqVO | PatientPageReqVO |
| 响应VO | XxxRespVO | PatientRespVO |

### 前端命名规范（同 stage-08）

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| API 文件 | 小写连字符目录 + index.ts | patient/index.ts |
| 页面文件 | 小写连字符目录 + index.vue | patient/index.vue |
| 组件文件 | PascalCase | PatientForm.vue |
| 路由文件 | 小写连字符 .ts | his.ts |

## 产出物清单

| 产出物 | 文件格式 | 存放路径 |
|--------|---------|---------|
| 变更影响分析报告 | .md | docs/变更分析/ |
| DDL 脚本 | .sql | docs/变更分析/ |
| 数据迁移脚本 | .sql | docs/变更分析/ |
| 回滚脚本 | .sql | docs/变更分析/ |
| 新增/修改的后端代码 | .java | backend/ |
| 新增/修改的前端代码 | .vue/.ts | frontend/ |
| 更新的接口文档 | .md | docs/api/ |

## 注意事项

1. **必须先分析再动手**：先完成影响分析，确认变更范围后再修改代码
2. **保持已有代码风格**：增量修改时必须遵循项目已有的代码风格和分层架构
3. **兼容性优先**：修改接口时优先保证向后兼容，无法兼容时需要版本管理
4. **数据安全**：涉及表结构变更时必须生成回滚脚本
5. **增量修改而非重新生成**：在已有文件上修改，不要删除已有代码重新生成
6. **错误修复最多重试3次**：编译/规范检查失败时最多重试3次

## 关联技能

- [requirement-change](../1.0-软件开发流程角色agent模型/研发/skill/process/requirement-change.skill.md)
- [requirement-review](../1.0-软件开发流程角色agent模型/研发/skill/process/requirement-review.skill.md)
- [crud-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/crud-designer-java.skill.md)
- [code-review-v2](../1.0-软件开发流程角色agent模型/研发/skill/process/code-review-v2.skill.md)
