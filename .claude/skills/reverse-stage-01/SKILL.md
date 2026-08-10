---
name: reverse-stage-01
description: 从代码+设计反向生成PRD：基于reverse-stage-05产出的设计文档和现有代码，反向生成PRD文档。触发关键词：反向生成PRD、代码逆向PRD、reverse-stage-01
---

# 从代码反向生成PRD

## 功能描述

基于 reverse-stage-05 产出的设计文档和现有代码，反向生成 PRD 文档。从代码中提取功能点，结合设计文档补全业务流程和需求描述。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| design_docs_dir | string | 是 | reverse-stage-05 产出的设计文档目录 | docs/概要设计 |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |
| business_context | string | 否 | 业务背景描述，帮助AI理解业务语义 | 医院信息系统，包含门诊、住院、药品管理 |

## 使用示例

```bash
/reverse-stage-01 --project_name "HIS系统" --design_docs_dir "docs/概要设计" --business_context "医院信息系统，包含门诊、住院、药品管理"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 反向PRD文档 | {output_dir}/PRD-{project_name}.md |

## 注意事项

1. **⚠️ 文档可能有偏差**：反向生成的PRD基于代码推断，业务语义可能不准确，必须人工审核
2. **依赖 reverse-stage-05**：需先执行 reverse-stage-05 产出设计文档

## 关联技能

- [reverse-stage-01](../1.0-软件开发流程角色agent模型/产品/skill/reverse-stage-01.skill.md)