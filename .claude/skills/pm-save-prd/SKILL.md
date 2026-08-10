---
name: pm-save-prd
description: 产品代理模式-保存PRD。产品经理专用命令，自动检测PRD文件变更、git add、commit、push，产品无需手动操作Git。触发关键词：保存PRD、pm-save-prd、提交PRD、产品保存
---

# 产品代理模式 - 保存PRD

## 功能描述

产品经理专用命令。产品经理修改PRD文档后，只需用一条命令描述改了什么，AI自动完成所有Git操作：检测变更文件、git add、git commit、git push，并返回提交结果。产品无需手动操作Git。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| message | string | 是 | 本次修改的描述（产品用自然语言描述） | 修改了挂号流程的短信通知逻辑 |
| docs_dir | string | 否 | 文档目录（默认读取_project.json） | docs |
| auto_push | boolean | 否 | 是否自动push（默认true） | true |
| review_assignee | string | 否 | 指定评审人（自动创建MR草稿并@此人） | dev-zhang |

## 使用示例

### 示例1：保存PRD修改

```bash
/pm-save-prd "修改了挂号流程的短信通知逻辑，新增了短信模板配置"
```

### 示例2：保存并指定评审人

```bash
/pm-save-prd "完成了患者管理模块的PRD，请开发评审" --review_assignee "dev-zhang"
```

### 示例3：仅保存不push

```bash
/pm-save-prd "草稿修改，先不push" --auto_push false
```

## AI自动执行的操作

### 1. 读取项目配置
```
操作：读取 {docs_dir}/_project.json
获取：project_name, pm_name, 分支名
```

### 2. 检测文件变更
```
操作：git status --porcelain
检测：{docs_dir}/需求分析/ 目录下的PRD文件变更
列出：变更文件清单（新增/修改/删除）
```

### 3. 暂存变更文件
```
操作：git add {docs_dir}/需求分析/
范围：只提交需求分析目录下的文件，不提交其他目录
```

### 4. 自动提交
```
操作：git commit -m "PRD更新: {message} [产品@{pm_name}]"
标记：提交信息自动带上 [产品@{pm_name}] 标记
```

### 5. 推送到远程（auto_push=true时）
```
操作：git push origin product/{project_name}
结果：推送到产品分支
```

### 6. 创建MR草稿（review_assignee指定时）
```
操作：创建Merge Request草稿
标题：PRD更新: {message}
描述：
  ## 变更说明
  {message}

  ## 变更文件
  {变更文件清单}

  ## 评审要求
  请评审以下内容：
  - 功能点完整性
  - 验收标准可测试性
  - 业务规则合理性

  提交人：产品@{pm_name}
  评审人：@{review_assignee}
@评审人：{review_assignee}
```

### 7. 返回结果
```
✅ PRD保存完成

  变更文件：
    - M docs/需求分析/PRD-HIS系统.md
    - A docs/需求分析/用户故事-HIS系统.md

  提交信息：PRD更新: 修改了挂号流程的短信通知逻辑 [产品@pm-zhang]
  推送分支：product/HIS系统
  MR链接：https://gitlab.com/team/his/-/merge_requests/123

  下一步：
    - 使用 /pm-submit-review 提交正式评审
    - 或继续编辑PRD后再次 /pm-save-prd
```

## 产品工作流

```
1. 在IDE中编辑 PRD-{project_name}.md（修改Markdown文件）
2. 输入 /pm-save-prd "改了什么"
3. AI自动完成 git add + commit + push
4. （可选）AI自动创建MR草稿并@评审人
5. 在MR链接里跟开发对话
```

## 注意事项

1. **只提交需求分析目录**：自动只git add `docs/需求分析/` 目录，不影响其他目录
2. **提交信息自动生成**：产品只需描述"改了什么"，AI自动格式化为规范的commit message
3. **[产品@{pm_name}]标记**：所有提交自动带此标记，便于区分产品提交和开发提交
4. **不覆盖开发提交**：如果工作区有开发人员的变更，不会一起提交，只提交产品目录
5. **auto_push=false**：仅本地提交不推送，适合草稿修改

## 关联命令

- [/pm-init](../pm-init/SKILL.md) — 初始化项目仓库
- [/pm-submit-review](../pm-submit-review/SKILL.md) — 提交PRD正式评审
- [/pm-status](../pm-status/SKILL.md) — 查看当前状态
- [/prd-review](../prd-review/SKILL.md) — PRD交互式评审（被pm-submit-review调用）
