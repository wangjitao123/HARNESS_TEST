---
name: reverse-stage-05
description: 代码反向建模-设计文档：扫描现有代码库，反向生成数据字典、ER图、API文档、架构设计、业务流程图。触发关键词：反向建模、代码逆向、生成设计文档、reverse-stage-05
---

# 代码反向建模-设计文档

## 功能描述

从现有代码库反向生成设计文档：扫描DO实体类生成数据字典+ER图、扫描Controller生成API文档、扫描Service生成业务流程图、扫描配置文件生成架构设计。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| code_dir | string | 是 | 代码目录根路径（相对路径） | src |
| output_dir | string | 否 | 输出目录（默认 docs/概要设计） | docs/概要设计 |
| scan_scope | string | 否 | 扫描范围：full/db/api/arch，默认full | full |
| db_config_path | string | 否 | 数据库连接配置文件路径 | src/main/resources/application-dev.yml |

## 使用示例

```bash
# 完整反向建模
/reverse-stage-05 --project_name "HIS系统" --code_dir "src" --scan_scope "full"

# 仅反向生成API文档
/reverse-stage-05 --project_name "HIS系统" --code_dir "src" --scan_scope "api"

# 有数据库连接，直接扫描数据库
/reverse-stage-05 --project_name "HIS系统" --code_dir "src" --db_config_path "src/main/resources/application-dev.yml" --scan_scope "db"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 数据字典 | {output_dir}/数据库设计/数据字典-{project_name}.md |
| ER关系图 | {output_dir}/数据库设计/ER图-{project_name}.md |
| DDL脚本 | {output_dir}/数据库设计/sql/reverse-{project_name}.sql |
| API文档 | {output_dir}/api/API文档-{project_name}.md |
| 架构设计文档 | {output_dir}/架构设计/架构设计文档-{project_name}.md |
| C4架构图 | {output_dir}/架构设计/C4架构图-{project_name}.md |
| 业务流程图 | {output_dir}/业务流程图-{project_name}.md |

## 注意事项

1. **⚠️ 文档可能有偏差**：反向生成的文档基于代码推断，业务语义可能不准确，必须人工审核
2. **不修改代码**：只读取代码生成文档，不修改任何代码文件

## 关联技能

- [reverse-stage-05](../1.0-软件开发流程角色agent模型/研发/skill/process/reverse-stage-05.skill.md)