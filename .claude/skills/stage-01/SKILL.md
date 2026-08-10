---
name: stage-01-requirement-analysis
description: 需求分析阶段：多Agent爬取资料 + 产品技能需求调研 + 原型先行（出原型→反推PRD+功能点MoSCoW优先级）。触发关键词：需求分析、开始需求分析、需求调研
---

# 需求分析阶段技能

## 功能描述

启动需求分析阶段工作流，采用**原型先行**模式，执行以下任务：
1. 多Agent并行爬取用户需求文档相关资料（**禁止Mock数据，必须使用真实网络资料**）
2. 调用产品技能进行需求调研
3. 生成可交互前端原型，从原型反向提取功能点并标注MoSCoW优先级，生成PRD文档
4. 产出需求分析文档（PRD框架、用户故事、功能点清单、澄清问题清单）

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| requirement_description | string | 是 | 用户需求描述 | 实现医院门诊管理、住院管理功能 |
| output_dir | string | 否 | 输出目录（相对路径，不传默认为 docs/需求分析） | docs/需求分析 |
| skill_dir | string | 否 | 产品技能目录（相对路径） | 1.0-软件开发流程角色agent模型/产品 |

## 使用示例

### 示例1：HIS系统需求分析

```bash
/stage-01 --project_name "HIS系统" --requirement_description "实现医院门诊管理、住院管理、药品管理三大核心功能模块" --output_dir "docs/需求分析"
```

### 示例2：带自定义输出目录

```bash
/stage-01 --project_name "电商系统" --requirement_description "实现商品管理、订单管理、支付功能" --output_dir "docs/电商/需求分析"
```

## 工作流程

1. **资料爬取阶段**：多Agent并行搜索真实网络资料
   - 搜索需求相关文档模板
   - 搜索业务流程最佳实践
   - 搜索系统设计参考资料
   - 搜索用户需求案例分析

2. **需求调研阶段**：调用产品技能深度调研
   - 解析模糊需求，识别核心业务痛点
   - 提取关键实体、角色、业务流程
   - 生成用户故事（符合INVEST原则）
   - 功能需求RICE评分

3. **文档生成阶段**：原型先行，从原型反推PRD

   **3.1 原型生成**：基于需求描述，生成可交互前端原型代码
   - 原型存放在 `{output_dir}/prototype/` 目录
   - 可调用 stitch-design 或 vue-scaffold skill 辅助生成
   - 原型包含：页面布局、导航结构、核心交互元素、数据区域、操作按钮

   **3.2 反向PRD**：从原型反推功能点、页面结构、交互流程
   - 从原型代码中提取页面列表、功能模块、交互流程
   - 对每个功能点进行MoSCoW优先级分类（Must/Should/Could/Won't）
   - 标注功能依赖关系和复杂度估算
   - 生成PRD框架（含原型页面引用和截图描述）
   - 产品补齐：业务规则、边界条件、验收标准
   - 再生成用户故事集、功能点清单和待澄清问题清单

4. **质量验证阶段**：验证文档质量
   - 需求覆盖率 ≥ 95%
   - INVEST原则符合度 100%
   - RICE评分完整性

5. **PRD评审与决策回环阶段**：交互式评审 + 决策分流

   **5.1 评审询问**
   - 向用户提问：「PRD文档已生成，是否需要进行PRD评审？」
   - 用户回答「是」或「要」：进入5.2评审执行
   - 用户回答「否」或「不用」：跳过评审，流程结束
   - 用户回答其他内容：解释PRD评审的作用（AI逐条提出问题，用户确认对/错），再次询问

   **5.2 评审执行**
   - 引导用户执行 `/prd-review --prd_doc "{output_dir}/PRD-{project_name}.md"`
   - AI逐条提出问题，用户确认对（问题成立）/错（AI误判）/跳过
   - 生成评审报告，含已确认问题、已排除问题、待讨论问题

   **5.3 评审决策回环（核心机制）**
   根据评审结论分流：
   - **评审结论为「✅ 通过」** → 进入 stage-02
   - **评审结论为「⚠️ 有条件通过」或「❌ 不通过」** →
     1. 列出所有「已确认问题」（需修改项）
     2. 向用户提问：「评审发现 {N} 个问题，是否返回修改PRD？」
     3. 用户回答「是」→ 重新执行第3步（文档生成），针对已确认问题修改PRD和用户故事，修改后回到5.2重新评审
     4. 用户回答「否」→ 将未解决问题标记为「已知风险」记录在PRD中，进入stage-02
   - **用户跳过评审（5.1选否）** → 直接进入 stage-02

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 | 备注 |
|---------|---------|---------|------|
| PRD框架文档 | .md | {output_dir}/PRD-{project_name}.md | 含追溯矩阵（REQ-XXX） |
| 用户故事集 | .md | {output_dir}/用户故事-{project_name}.md | |
| 功能点清单 | .md | {output_dir}/功能点清单-{project_name}.md | 含MoSCoW优先级+复杂度 |
| 待澄清问题 | .md | {output_dir}/待确认问题-{project_name}.md | |
| 可交互原型代码 | html/vue | {output_dir}/prototype/ | 始终产出 |

## 注意事项

1. **禁止Mock数据**：所有资料必须通过WebSearch从真实网络获取
2. **产品技能调用**：使用requirement-analyzer-v2.skill.md进行调研
3. **优先级评分**：功能需求必须使用RICE模型评分
4. **用户故事规范**：必须符合INVEST原则（Independent, Negotiable, Valuable, Estimable, Small, Testable）

## 关联技能

- [requirement-analyzer-v2](../1.0-软件开发流程角色agent模型/产品/skill/requirement-analyzer-v2.skill.md)
- [user-story-generator](../1.0-软件开发流程角色agent模型/产品/skill/user-story-generator.skill.md)
- [acceptance-criteria-writer](../1.0-软件开发流程角色agent模型/产品/skill/acceptance-criteria-writer.skill.md)
- [business-rule-analyzer](../1.0-软件开发流程角色agent模型/产品/skill/business-rule-analyzer.skill.md)
- [prd-review](./prd-review/SKILL.md) — PRD交互式评审（stage-01完成后触发）
