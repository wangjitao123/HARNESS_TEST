# Skill: diff-code-vs-prd（代码与PRD差异对比）

## 基本信息

- **ID**: diff-code-vs-prd
- **名称**: 代码与PRD差异对比
- **版本**: 1.0.0
- **分类**: process
- **部门**: 研发部
- **优先级**: P1
- **描述**: 扫描代码提取已有功能，对比PRD功能清单，找出"有需求无代码"和"有代码无需求"的差异，输出差异报告。

## 触发条件

- **命令**: `/diff-code-vs-prd`
- **关键词**: 代码PRD差异, 对比代码需求, 差异报告, diff-code-vs-prd, 代码需求对比
- **patterns**:
  - 对比.*代码.*PRD
  - 代码.*PRD.*差异
  - 差异.*报告

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| prd_doc | string | 是 | PRD文档路径 | docs/需求分析/PRD-HIS系统.md |
| code_dir | string | 是 | 代码目录 | backend |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 工作流程

1. **PRD功能提取阶段**
   - 读取PRD文档
   - 提取所有功能点（含REQ-ID）
   - 提取所有验收标准

2. **代码功能扫描阶段**
   - 扫描Controller → 提取API接口列表
   - 扫描DO/Entity类 → 提取数据表列表
   - 扫描Service方法 → 提取业务功能列表
   - 从代码注释/方法名推断功能语义

3. **差异对比阶段**
   - 将PRD功能点与代码功能逐项对比
   - 分类：
     - ✅ 已实现：PRD有需求 + 代码有实现
     - ❌ 未实现：PRD有需求 + 代码无实现
     - ⚠️ 超范围：PRD无需求 + 代码有实现

4. **差异报告生成阶段**

## 输出格式

```markdown
# {project_name} 代码与PRD差异报告

## 差异概要
- PRD功能点总数：{n}
- 代码功能数：{n}
- ✅ 已实现：{n}（{%}）
- ❌ 未实现：{n}（需排期开发）
- ⚠️ 超范围：{n}（需确认是否补录需求或标记为技术债务）

## ✅ 已实现（{n}项）
| REQ-ID | 需求描述 | 对应代码 | 对应API |
|--------|----------|---------|---------|
| REQ-001 | 患者查询 | PatientController.page | GET /his/patient/page |

## ❌ 未实现（{n}项）
| REQ-ID | 需求描述 | PRD位置 | 建议处理 |
|--------|----------|---------|---------|
| REQ-005 | 药品库存预警 | PRD 3.2节 | 排期开发 |

## ⚠️ 超范围（{n}项）
| 代码位置 | 推断功能 | 对应API | 建议处理 |
|---------|---------|---------|---------|
| PatientController.import | 批量导入患者 | POST /his/patient/import | 补录需求或标记技术债务 |

## 评审建议
1. 未实现项：排期进入stage-07开发
2. 超范围项：产品确认是否补录PRD需求，或标记为技术债务
```

## 使用示例

```bash
/diff-code-vs-prd --project_name "HIS系统" --prd_doc "docs/需求分析/PRD-HIS系统.md" --code_dir "backend" --output_dir "docs/需求分析"
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| 差异报告 | .md | {output_dir}/差异报告-{project_name}.md |

## 注意事项

1. **依赖PRD文档**：必须先有PRD（stage-01生成或import-prd导入或reverse-stage-01反向生成）
2. **代码扫描范围**：主要扫描Controller和DO类，不扫描全部代码
3. **语义匹配有偏差**：AI对比功能语义可能有偏差，需人工确认差异报告

## 相关文档

- [import-prd](import-prd.skill.md) — 导入已有PRD（前置步骤）
- [reverse-stage-01](reverse-stage-01.skill.md) — 从代码反向生成PRD（替代方案）
- [req-matrix-build](req-matrix-build.skill.md) — 完整追溯链建立
