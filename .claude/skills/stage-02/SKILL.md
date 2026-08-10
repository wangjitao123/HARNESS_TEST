---
name: stage-02-requirement-understanding
description: 需求理解阶段：读取stage-01的PRD+原型，生成BRD+业务流程图+功能点细化描述（按模块/子模块/功能点分类组织）。触发关键词：需求理解、业务流程图、BRD
---

# 需求理解阶段技能

## 功能描述

启动需求理解阶段工作流，执行以下任务：
1. 读取 stage-01 产出的 PRD、功能点清单和原型
2. 生成 BRD 业务需求文档（含业务规则、风险识别、验收标准）
3. 生成业务流程图
4. 功能点细化描述
5. 产出详细描述文档（**按模块/子模块/功能点分类组织，不能全部塞一个文件夹**）

> **注意**：原型设计已在 stage-01（原型先行模式）中完成，功能点MoSCoW优先级也已在stage-01标注，本阶段聚焦BRD+流程细化+功能点深化。

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| requirement_docs_dir | string | 是 | 需求分析文档目录（stage-01输出，相对路径） | docs/需求分析 |
| output_dir | string | 否 | 输出目录（相对路径，不传默认为 docs/需求理解） | docs/需求理解 |
| skill_dir | string | 否 | 产品技能目录（相对路径） | 1.0-软件开发流程角色agent模型/产品 |

## 使用示例

### 示例1：HIS系统需求理解

```bash
/stage-02 --project_name "HIS系统" --requirement_docs_dir "docs/需求分析" --output_dir "docs/需求理解"
```

### 示例2：带自定义输出目录

```bash
/stage-02 --project_name "电商系统" --requirement_docs_dir "docs/电商/需求分析" --output_dir "docs/电商/需求理解"
```

## 工作流程

1. **文档解析阶段**：解析 stage-01 产出的文档
   - 读取 PRD 文档和功能点清单（含MoSCoW优先级）
   - 读取 stage-01 产出的原型（`docs/需求分析/prototype/`）
   - 提取模块结构
   - 识别用户角色

2. **BRD生成阶段**：生成业务需求文档
   - 按模块组织功能点（基于stage-01的MoSCoW优先级）
   - 定义业务规则和约束
   - 标注风险和假设
   - 制定验收标准

3. **模块划分阶段**：设计文档目录结构
   - 每个模块独立目录
   - 每个子模块独立子目录
   - 按功能点或业务分类

4. **流程设计阶段**：生成业务流程图（按模块并行）
   - 结合 stage-01 原型进行流程细化
   - 流程节点定义
   - 节点间流转条件
   - 角色职责标注
   - 异常处理分支
   - Mermaid格式描述

5. **功能点细化阶段**：对功能点进行详细描述
   - 输入输出边界
   - 前置/后置条件
   - 与原型页面的对应关系
   - 业务规则细化

6. **文档输出阶段**：按分类输出详细文档
   - 生成README索引文件
   - 按模块组织文档
   - 输出BRD和业务规则文档

## 目录结构规范

```
{output_dir}/
├── README.md                    # 总索引
├── BRD-{project_name}.md        # 业务需求文档
├── 业务规则-{project_name}.md    # 业务规则文档
├── M01-门诊管理/                # 模块目录
│   ├── README.md               # 模块索引
│   ├── M01-01-挂号管理/        # 子模块目录
│   │   ├── 功能点清单.md
│   │   └── 业务流程图.md
│   └── M01-02-处方管理/
│       ├── 功能点清单.md
│       └── 业务流程图.md
├── M02-住院管理/
│   └── ...
└── M06-药品管理/
    └── ...
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| BRD业务需求文档 | .md | {output_dir}/BRD-{project_name}.md |
| 业务规则文档 | .md | {output_dir}/业务规则-{project_name}.md |
| 模块索引 | .md | {output_dir}/{模块编号}-{模块名称}/README.md |
| 功能点清单 | .md | {output_dir}/{模块}/子模块/功能点清单.md |
| 业务流程图 | .md | {output_dir}/{模块}/子模块/业务流程图.md |

## 注意事项

1. **目录组织原则**：模块 → 子模块 → 功能点，层级分明
2. **禁止单文件夹**：所有文档不能全部塞一个文件夹
3. **并行生成**：各模块流程设计并行生成
4. **Mermaid格式**：业务流程图使用Mermaid语法
5. **原型复用**：流程设计应结合 stage-01 产出的原型进行细化，而非从零设计
6. **BRD依赖**：BRD基于stage-01的功能点清单和MoSCoW优先级生成，不再重复提取功能点

## 关联技能

- [user-story-generator](../1.0-软件开发流程角色agent模型/产品/skill/user-story-generator.skill.md)
- [acceptance-criteria-writer](../1.0-软件开发流程角色agent模型/产品/skill/acceptance-criteria-writer.skill.md)
- [business-rule-analyzer](../1.0-软件开发流程角色agent模型/产品/skill/business-rule-analyzer.skill.md)