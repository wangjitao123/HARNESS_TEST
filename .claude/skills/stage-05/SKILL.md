---
name: stage-05-outline-design
description: 概要设计阶段：生成业务架构设计、数据库设计。触发关键词：概要设计、架构设计、数据库设计
---

# 概要设计阶段技能

## 功能描述

启动概要设计阶段工作流，执行以下任务：
1. 根据业务需求调用研发技能
2. 生成业务架构设计（C4模型）
3. 生成数据库设计（表结构、索引、ER图）

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| requirement_docs_dir | string | 是 | 需求文档目录（相对路径） | docs/需求理解 |
| system_design_dir | string | 是 | 系统设计文档目录（相对路径） | docs/系统设计 |
| output_dir | string | 否 | 输出目录（相对路径，不传默认为 docs/概要设计） | docs/概要设计 |
| skill_dir | string | 否 | 研发技能目录（相对路径） | 1.0-软件开发流程角色agent模型/研发 |

## 使用示例

### 示例1：HIS系统概要设计

```bash
/stage-05 --project_name "HIS系统" --requirement_docs_dir "docs/需求理解" --system_design_dir "docs/系统设计" --output_dir "docs/概要设计"
```

### 示例2：带自定义输出目录

```bash
/stage-05 --project_name "电商系统" --requirement_docs_dir "docs/电商/需求理解" --system_design_dir "docs/电商/系统设计" --output_dir "docs/电商/概要设计"
```

## 工作流程

1. **需求理解阶段**：理解业务需求和系统约束
   - 读取需求文档
   - 提取业务模块清单
   - 识别数据实体
   - 理解性能目标

2. **架构设计阶段**：使用C4模型进行架构设计
   - **Context层**：系统上下文图，展示与外部系统交互
   - **Container层**：容器图，展示服务、数据库等
   - **Component层**：组件图，展示容器内部结构
   - **ADR决策记录**：关键架构决策文档
   - **技术选型**：评估并选择技术栈

3. **数据库设计阶段**：设计数据库结构
   - **表结构设计**：符合多租户、审计追踪、逻辑删除规范
   - **索引策略**：根据查询场景设计索引
   - **ER关系图**：实体关系图
   - **DDL脚本**：建表SQL脚本
   - **数据字典**：枚举值定义

4. **评审验证与决策回环阶段**：评审设计文档质量 + 决策分流

   **4.1 自评检查**
   - C4模型完整性检查（Context/Container/Component三层）
   - 表结构规范检查（多租户、审计字段、逻辑删除）
   - 风险识别

   **4.2 交叉评审（可选）**
   - 向用户提问：「是否需要进行交叉评审（检查PRD与设计文档的一致性）？」
   - 用户回答「是」：引导执行 `/cross-review --prd_doc "..." --architecture_doc "..." --database_design_doc "..."`
   - 用户回答「否」：跳过交叉评审
   - 交叉评审产出：冲突矩阵、遗漏清单、越界检测报告

   **4.3 评审决策回环（核心机制）**
   根据自评+交叉评审结果分流：
   - **自评通过 + 交叉评审通过（或未执行）** → 进入第5步（终版锁定）
   - **自评不通过 或 交叉评审发现冲突** →
     1. 列出所有不通过项和冲突项
     2. 向用户提问：「概要设计评审发现 {N} 个问题，是否返回修改？」
     3. 用户回答「是」→ 重新执行第2~3步（架构设计+数据库设计），针对问题项修改
     4. 用户回答「否」→ 将问题标记为「已知风险」记录在设计文档中，进入第5步

5. **终版锁定阶段**：锁定产物基线

   **5.1 终版检查**
   - 所有产出物是否齐全（架构设计文档、C4图、ADR、数据库设计、ER图、DDL、数据字典）
   - 自评和交叉评审是否通过（或问题已记录为已知风险）

   **5.2 终版锁定**
   - 在产出目录创建 `_baseline.lock` 文件
   - 记录终版时间、终版文件清单、文件MD5校验值
   - 下游阶段（stage-06/07/08）读取设计文档时，优先读取 _baseline.lock 标记的终版文件
   - 终版后若需修改设计，需先解除锁定（删除 _baseline.lock）

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| 架构设计文档 | .md | {output_dir}/架构设计/架构设计文档-{project_name}.md |
| C4架构图 | .drawio | {output_dir}/架构设计/架构图/ |
| ADR决策记录 | .md | {output_dir}/架构设计/ADR/ |
| 数据库设计文档 | .md | {output_dir}/数据库设计/数据库设计文档-{project_name}.md |
| ER关系图 | .md | {output_dir}/数据库设计/ER图.md |
| DDL脚本 | .sql | {output_dir}/数据库设计/sql/ |
| 数据字典 | .md | {output_dir}/数据库设计/数据字典.md |

## C4模型说明

| 层级 | 名称 | 描述 |
|-----|------|------|
| Level 1 | System Context | 系统上下文，展示系统与外部世界的关系 |
| Level 2 | Container | 容器，展示应用、数据库、微服务等 |
| Level 3 | Component | 组件，展示容器内部的组件结构 |
| Level 4 | Code | 代码，展示核心代码结构（可选） |

## 数据库设计规范

| 规范项 | 要求 |
|-------|------|
| 主键 | BIGINT AUTO_INCREMENT |
| 多租户 | tenant_id 字段，索引必须包含 |
| 审计字段 | creator, create_time, updater, update_time |
| 逻辑删除 | deleted 字段，唯一索引必须包含 |
| 命名规范 | 小写下划线，模块前缀（如 his_patient） |

## 注意事项

1. **C4模型完整性**：必须完成Context、Container、Component三层
2. **ADR记录**：关键架构决策必须有ADR文档
3. **多租户设计**：所有表必须包含tenant_id
4. **索引设计**：必须包含tenant_id作为第一列

## 关联技能

- [system-architect](../1.0-软件开发流程角色agent模型/研发/skill/architect/system-architect.skill.md)
- [db-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/db-designer-java.skill.md)
- [data-model-designer](../1.0-软件开发流程角色agent模型/研发/skill/design/data-model-designer.skill.md)
- [cross-review](../1.0-软件开发流程角色agent模型/研发/skill/process/cross-review.skill.md) — 交叉评审（stage-05后可选触发）