---
name: pm-submit-review
description: 产品代理模式-提交PRD评审。产品经理专用命令，自动推送PRD变更、创建MR、触发prd-review评审、输出评审结果。触发关键词：提交评审、pm-submit-review、产品评审、PRD评审提交
---

# 产品代理模式 - 提交PRD评审

## 功能描述

产品经理专用命令。产品PRD修改完成后，一条命令完成：推送变更到远程、创建正式Merge Request、触发PRD评审流程、在MR评论区输出评审结果。产品无需手动操作Git和MR系统。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| docs_dir | string | 否 | 文档目录（默认读取_project.json） | docs |
| review_depth | string | 否 | 评审深度：quick/standard/deep，默认standard | standard |
| review_assignee | string | 否 | 指定评审人 | dev-zhang |
| message | string | 否 | 评审说明（如不提供，使用最近一次pm-save-prd的message） | 完成挂号模块PRD，请评审 |

## 使用示例

### 示例1：提交标准评审

```bash
/pm-submit-review
```

### 示例2：提交深度评审，指定评审人

```bash
/pm-submit-review --review_depth "deep" --review_assignee "dev-zhang" --message "患者管理模块PRD完成，请深度评审"
```

## AI自动执行的操作

### 1. 检查未提交变更
```
操作：git status --porcelain
检查：{docs_dir}/需求分析/ 目录是否有未提交的变更
若 有未提交变更 → 先执行 pm-save-prd 的提交流程
若 无未提交变更 → 跳到第2步
```

### 2. 推送到远程
```
操作：git push origin product/{project_name}
确保：远程分支有最新的PRD变更
```

### 3. 创建正式Merge Request
```
操作：创建Merge Request（从 product/{project_name} → main）
标题：PRD评审: {project_name} - {message或最近提交message}
描述：
  ## PRD评审请求

  ### 评审范围
  - PRD文档：docs/需求分析/PRD-{project_name}.md
  - 用户故事：docs/需求分析/用户故事-{project_name}.md
  - 验收标准：PRD中的验收标准章节

  ### 评审维度
  1. 需求完整性
  2. 需求一致性
  3. 验收标准
  4. 实体与角色
  5. 非功能需求
  6. 可行性预判

  ### 评审深度
  {review_depth}

  ### 变更文件
  {git diff --name-only 的输出}

  提交人：产品@{pm_name}
  评审人：@{review_assignee}
```

### 4. 触发PRD评审
```
操作：自动执行 /prd-review --prd_doc "{docs_dir}/需求分析/PRD-{project_name}.md" --review_depth {review_depth}
流程：AI逐条提出评审问题，产品回答对/错/跳过
```

### 5. 评审结果输出
```
操作：将评审报告写入 {docs_dir}/需求分析/PRD评审报告-{timestamp}.md
操作：在MR评论区输出评审摘要

MR评论内容：
## PRD评审结果

- 评审结论：✅ 通过 / ⚠️ 有条件通过 / ❌ 不通过
- 提出问题：{n} 条
- 已确认问题：{n} 条（需修改）
- 已排除问题：{n} 条（AI误判）
- 待讨论问题：{n} 条

### 评审报告
详见：{docs_dir}/需求分析/PRD评审报告-{timestamp}.md

### 决策
- 若 ✅ 通过 → 可进入stage-02
- 若 ⚠️/❌ 不通过 → 产品需修改PRD后重新 /pm-submit-review
```

### 6. 返回结果
```
✅ PRD评审提交完成

  MR链接：https://gitlab.com/team/his/-/merge_requests/124
  评审结论：⚠️ 有条件通过
  已确认问题：3条（需修改）
  评审报告：docs/需求分析/PRD评审报告-20260807-120000.md

  下一步：
    - 查看评审报告，修改已确认问题
    - 修改后使用 /pm-save-prd "修复评审问题" 保存
    - 再次 /pm-submit-review 提交评审
    - 评审通过后使用 /stage-02 进入需求开发
```

## 完整产品工作流

```
/pm-init → 初始化项目
    │
    ▼
编辑 PRD-{project_name}.md（在IDE中修改Markdown）
    │
    ▼
/pm-save-prd "改了什么" → AI自动git add+commit+push
    │
    ▼
/pm-submit-review → AI自动push+创建MR+触发prd-review
    │
    ├─ 评审通过 → 进入 /stage-02
    │
    └─ 评审不通过 → 修改PRD → /pm-save-prd → 再次 /pm-submit-review
```

## 注意事项

1. **自动检查未提交变更**：如果PRD有未保存的修改，会先自动执行pm-save-prd
2. **MR自动创建**：从产品分支到main分支的MR自动创建
3. **评审自动触发**：prd-review自动执行，产品在对话中回答对/错/跳过
4. **评审决策回环**：评审不通过时，引导产品修改后重新提交评审
5. **评审报告归档**：评审报告自动保存到需求分析目录，作为后续修改依据

## 关联命令

- [/pm-init](../pm-init/SKILL.md) — 初始化项目仓库
- [/pm-save-prd](../pm-save-prd/SKILL.md) — 保存PRD并自动提交
- [/pm-status](../pm-status/SKILL.md) — 查看当前状态
- [/prd-review](../prd-review/SKILL.md) — PRD交互式评审（被此命令调用）
