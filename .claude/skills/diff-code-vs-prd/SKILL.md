---
name: diff-code-vs-prd
description: 代码与PRD差异对比：扫描代码提取已有功能，对比PRD功能清单，找出有需求无代码和有代码无需求的差异。触发关键词：代码PRD差异、对比代码需求、差异报告、diff-code-vs-prd
---

# 代码与PRD差异对比

## 功能描述

扫描代码提取已有功能，对比 PRD 功能清单，找出"有需求无代码"和"有代码无需求"的差异，输出差异报告。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| prd_doc | string | 是 | PRD文档路径 | docs/需求分析/PRD-HIS系统.md |
| code_dir | string | 是 | 代码目录 | src |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 使用示例

```bash
/diff-code-vs-prd --project_name "HIS系统" --prd_doc "docs/需求分析/PRD-HIS系统.md" --code_dir "src"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 差异报告 | {output_dir}/差异报告-{project_name}.md |

差异报告包含三类：
- ✅ 已实现：PRD有需求 + 代码有实现
- ❌ 未实现：PRD有需求 + 代码无实现
- ⚠️ 超范围：PRD无需求 + 代码有实现

## 关联技能

- [diff-code-vs-prd](../1.0-软件开发流程角色agent模型/研发/skill/process/diff-code-vs-prd.skill.md)