---
name: req-matrix-build
description: 建立REQ-ID追溯链：将现有API/表/功能点映射到REQ-ID，识别有代码无需求和有需求无代码的部分，输出追溯矩阵。触发关键词：建立追溯链、追溯矩阵、req-matrix、REQ-ID映射
---

# 建立REQ-ID追溯链

## 功能描述

为老项目建立 REQ-ID 追溯链，将现有 API 接口、数据库表、代码文件映射到 REQ-ID，生成 `req-matrix.json`（机器可读）和 `追溯矩阵.md`（人类可读）。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| prd_doc | string | 否 | PRD文档路径 | docs/需求分析/PRD-HIS系统.md |
| api_doc | string | 否 | API文档路径 | docs/概要设计/api/API文档-HIS系统.md |
| db_design_doc | string | 否 | 数据库设计文档路径 | docs/概要设计/数据库设计/数据字典-HIS系统.md |
| code_dir | string | 否 | 代码目录（如无文档可直接扫描代码） | src |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 使用示例

```bash
# 有设计文档
/req-matrix-build --project_name "HIS系统" --prd_doc "docs/需求分析/PRD-HIS系统.md" --api_doc "docs/概要设计/api/API文档-HIS系统.md" --db_design_doc "docs/概要设计/数据库设计/数据字典-HIS系统.md"

# 直接扫描代码
/req-matrix-build --project_name "HIS系统" --code_dir "src"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 追溯矩阵（人类可读） | {output_dir}/追溯矩阵-{project_name}.md |
| 追溯矩阵（机器可读） | {output_dir}/req-matrix.json |

## 关联技能

- [req-matrix-build](../1.0-软件开发流程角色agent模型/研发/skill/process/req-matrix-build.skill.md)