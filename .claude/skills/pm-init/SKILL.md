---
name: pm-init
description: 产品代理模式-初始化项目仓库。产品经理专用命令，AI自动完成git clone、目录结构创建、分支切换，产品无需手动操作Git。触发关键词：产品初始化、pm-init、产品建仓库
---

# 产品代理模式 - 初始化项目仓库

## 功能描述

产品经理专用命令。AI Agent 自动执行项目仓库初始化的所有操作，包括 git clone、创建标准目录结构、切换工作分支。产品经理只需告诉AI项目名称和仓库地址，无需手动操作Git。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| repo_url | string | 否 | Git仓库地址（如不提供，在当前目录初始化） | https://gitlab.com/team/his.git |
| branch | string | 否 | 工作分支（默认 product/{project_name}） | product/HIS系统 |
| docs_dir | string | 否 | 文档目录（默认 docs） | docs |

## 使用示例

### 示例1：克隆远程仓库并初始化

```bash
/pm-init --project_name "HIS系统" --repo_url "https://gitlab.com/team/his.git"
```

### 示例2：在当前目录初始化

```bash
/pm-init --project_name "HIS系统"
```

## AI自动执行的操作

### 1. 仓库准备
```
操作：git clone {repo_url} 或 git init
分支：git checkout -b product/{project_name}
```

### 2. 创建标准目录结构
```
{docs_dir}/
├── 需求分析/
├── 需求理解/
├── 系统设计/
├── 概要设计/
│   ├── 架构设计/
│   └── 数据库设计/
├── 详细设计/
└── knowledge/
```

### 3. 创建项目配置文件
```
文件：{docs_dir}/_project.json
内容：
{
  "project_name": "{project_name}",
  "created_at": "{timestamp}",
  "pm_mode": true,
  "current_stage": "init",
  "pm_name": "{git_user_name}",
  "branches": {
    "product": "product/{project_name}"
  }
}
```

### 4. 首次提交
```
操作：git add . && git commit -m "初始化: {project_name} 项目仓库 [产品@{pm_name}]"
操作：git push origin product/{project_name}
```

### 5. 返回结果
```
✅ 项目初始化完成
   - 仓库：{repo_url 或 当前目录}
   - 分支：product/{project_name}
   - 文档目录：{docs_dir}/
   - 配置文件：{docs_dir}/_project.json

下一步：
   1. 使用 /stage-01 开始需求分析
   2. 或直接编辑 {docs_dir}/需求分析/PRD-{project_name}.md
   3. 完成后使用 /pm-save-prd 保存
```

## 产品可用命令总览

| 命令 | 功能 | 何时用 |
|------|------|--------|
| `/pm-init` | 初始化项目仓库 | 项目开始时 |
| `/pm-save-prd` | 保存PRD并自动Git提交 | 修改PRD后 |
| `/pm-submit-review` | 提交PRD评审 | PRD完成后 |
| `/pm-status` | 查看当前状态 | 随时 |

## 注意事项

1. **产品无需操作Git**：所有git add/commit/push由AI自动完成
2. **分支策略**：产品工作在 `product/{project_name}` 分支，不直接操作main
3. **提交信息规范**：自动生成 `[产品@{pm_name}]` 标记，便于区分提交来源
4. **_project.json**：记录项目元信息，后续pm命令读取此文件获取项目状态

## 关联命令

- [/pm-save-prd](../pm-save-prd/SKILL.md) — 保存PRD并自动提交
- [/pm-submit-review](../pm-submit-review/SKILL.md) — 提交PRD评审
- [/pm-status](../pm-status/SKILL.md) — 查看当前状态
