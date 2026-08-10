---
name: import-prd
description: 导入已有PRD：从飞书/Wiki/外部链接导入已有PRD文档，AI解析提取功能点、用户故事、验收标准，输出标准格式PRD。触发关键词：导入PRD、导入需求、飞书PRD、import-prd
---

# 导入已有PRD

## 功能描述

从飞书/Wiki/本地文件导入已有 PRD 文档，AI 解析提取功能点、用户故事、验收标准，自动分配 REQ-ID（标记为 legacy），输出标准格式 PRD。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| source | string | 是 | PRD来源（飞书链接/Wiki链接/本地文件路径） | https://feishu.cn/docs/xxx |
| project_name | string | 是 | 项目名称 | HIS系统 |
| source_type | string | 否 | 来源类型：feishu/wiki/file/url，默认自动识别 | feishu |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 使用示例

```bash
# 从飞书导入
/import-prd --source "https://feishu.cn/docs/HIS系统PRD" --project_name "HIS系统" --source_type "feishu"

# 从本地文件导入
/import-prd --source "docs/old-prd/HIS需求文档.md" --project_name "HIS系统"
```

## 产出物

| 文档 | 路径 |
|------|------|
| 标准PRD文档 | {output_dir}/PRD-{project_name}.md |
| 追溯矩阵（需求部分） | {output_dir}/req-matrix.json |
| 功能点清单 | {output_dir}/功能清单-{project_name}.md |

## 关联技能

- [import-prd](../1.0-软件开发流程角色agent模型/产品/skill/import-prd.skill.md)