---
name: cross-review-incremental
description: 增量交叉评审：老项目增量变更时的轻量级交叉评审，只评审受变更影响的REQ-ID相关产物。触发关键词：增量交叉评审、增量一致性检查、cross-review-incremental
---

# 增量交叉评审

## 功能描述

老项目增量变更时的轻量级交叉评审，只评审受变更影响的 REQ-ID 相关产物，而非全量检查。适用于日常需求变更、Bug修复、小功能迭代。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| affected_req_ids | array | 是 | 受变更影响的REQ-ID列表 | ["REQ-001","REQ-005"] |
| req_matrix_path | string | 是 | 追溯矩阵文件路径 | docs/需求分析/req-matrix.json |
| prd_doc | string | 否 | PRD文档路径 | docs/需求分析/PRD-HIS系统.md |
| api_doc | string | 否 | API文档路径 | docs/概要设计/api/API文档.md |
| db_design_doc | string | 否 | 数据库设计文档路径 | docs/概要设计/数据库设计/数据字典.md |
| code_dir | string | 否 | 代码目录 | src |
| output_dir | string | 否 | 输出目录 | docs/需求分析 |

## 使用示例

```bash
/cross-review-incremental --project_name "HIS系统" --affected_req_ids '["REQ-001","REQ-005"]' --req_matrix_path "docs/需求分析/req-matrix.json" --code_dir "src"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 增量评审报告 | {output_dir}/增量评审报告-{project_name}.md |

## 关联技能

- [cross-review-incremental](../1.0-软件开发流程角色agent模型/研发/skill/process/cross-review-incremental.skill.md)