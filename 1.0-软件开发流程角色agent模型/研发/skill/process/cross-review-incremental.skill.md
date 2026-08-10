# Skill: cross-review-incremental（增量交叉评审）

## 基本信息

- **ID**: cross-review-incremental
- **名称**: 增量交叉评审
- **版本**: 1.0.0
- **分类**: review
- **部门**: 研发部
- **优先级**: P1
- **描述**: 老项目增量变更时的轻量级交叉评审，只评审受变更影响的REQ-ID相关产物，而非全量检查。适用于日常需求变更、Bug修复、小功能迭代场景。

## 触发条件

- **命令**: `/cross-review-incremental`
- **关键词**: 增量交叉评审, 增量一致性检查, 受影响评审, incremental cross review
- **patterns**:
  - 增量.*评审
  - 受影响.*检查
  - 变更.*交叉

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| affected_req_ids | array | 是 | 受变更影响的REQ-ID列表 | ["REQ-001", "REQ-005"] |
| req_matrix_path | string | 是 | 追溯矩阵文件路径（req-matrix.json） | docs/需求分析/req-matrix.json |
| prd_doc | string | 否 | PRD文档路径 | docs/需求分析/PRD-HIS系统.md |
| api_doc | string | 否 | API文档路径 | docs/概要设计/api/API文档.md |
| db_design_doc | string | 否 | 数据库设计文档路径 | docs/概要设计/数据库设计/数据字典.md |
| code_dir | string | 否 | 代码目录（扫描受影响代码） | backend |
| output_dir | string | 否 | 输出目录 | docs/需求分析 |

## 工作流程

1. **影响范围确定阶段**
   - 读取req-matrix.json
   - 根据affected_req_ids找到关联的API/表/代码文件
   - 确定本次评审的范围（仅受影响的产物）

2. **增量交叉检查阶段**（只检查受影响的部分）
   - 需求↔数据库：受影响的REQ-ID在数据库中是否有对应表/字段变更
   - 需求↔API：受影响的REQ-ID在API中是否有对应接口变更
   - 需求↔代码：受影响的REQ-ID在代码中是否有对应实现变更
   - 数据库↔API：变更的表字段与API字段是否一致

3. **增量评审报告生成阶段**

## 输出格式

```markdown
# {project_name} 增量交叉评审报告

## 评审概要
- 受影响REQ-ID：{affected_req_ids}
- 评审范围：{涉及的API/表/代码文件数量}
- 评审时间：{timestamp}
- 评审结论：✅ 通过 / ⚠️ 有问题 / ❌ 不通过

## 增量检查结果

### REQ-001（患者查询）受影响项
| 检查项 | 检查内容 | 结果 | 说明 |
|--------|---------|------|------|
| 需求↔数据库 | his_patient表是否有字段变更 | ✅ | 新增了phone字段 |
| 需求↔API | GET /his/patient/page响应是否包含phone | ✅ | 已在VO中添加 |
| 需求↔代码 | PatientController.page是否更新 | ✅ | 已更新 |

### REQ-005（药品库存预警）受影响项
| 检查项 | 检查内容 | 结果 | 说明 |
|--------|---------|------|------|
| 需求↔数据库 | 是否有预警相关表 | ❌ | 缺少his_drug_alert表 |
| 需求↔API | 是否有预警接口 | ❌ | 缺少GET /his/drug/alert接口 |
| 需求↔代码 | 是否有预警Service | ❌ | 缺少DrugAlertService |

## 发现的问题
1. 🔴 REQ-005: 数据库缺少预警表，需新增his_drug_alert
2. 🔴 REQ-005: API缺少预警接口，需新增GET /his/drug/alert
```

## 使用示例

### 示例1：增量变更后评审

```bash
/cross-review-incremental --project_name "HIS系统" --affected_req_ids '["REQ-001", "REQ-005"]' --req_matrix_path "docs/需求分析/req-matrix.json" --prd_doc "docs/需求分析/PRD-HIS系统.md" --api_doc "docs/概要设计/api/API文档.md" --db_design_doc "docs/概要设计/数据库设计/数据字典.md" --code_dir "backend"
```

## 与cross-review的区别

| 维度 | cross-review（全量） | cross-review-incremental（增量） |
|------|---------------------|-------------------------------|
| 评审范围 | 全部产物 | 仅受变更影响的REQ-ID相关产物 |
| 评审耗时 | 长（全量检查） | 短（只查受影响部分） |
| 适用场景 | 新项目/全量评审 | 老项目日常增量变更 |
| 依赖 | PRD+设计文档 | req-matrix.json + 受影响REQ-ID |

## 注意事项

1. **依赖req-matrix.json**：增量评审必须有追溯矩阵文件，否则无法确定影响范围
2. **只检查受影响部分**：不检查未受变更影响的产物，速度快
3. **可与cross-review配合**：重大变更用全量cross-review，日常变更用增量

## 相关文档

- [cross-review](cross-review.skill.md) — 全量交叉评审
- [req-matrix-build](req-matrix-build.skill.md) — 追溯链建立
- [requirement-change](requirement-change.skill.md) — 需求变更管理
