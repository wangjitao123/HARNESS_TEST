# Skill: reverse-stage-01（代码反向建模-PRD）

## 基本信息

- **ID**: reverse-stage-01
- **名称**: 代码反向建模-PRD
- **版本**: 1.0.0
- **分类**: analysis
- **部门**: 产品部
- **优先级**: P0
- **描述**: 从现有代码+设计文档反向生成PRD，包括从API文档反推功能清单、从数据库反推业务实体、从代码注释反推业务规则、AI补齐用户故事和验收标准。

## 触发条件

- **命令**: `/reverse-stage-01`
- **关键词**: 反向生成PRD, 代码反推需求, 反向建模PRD, reverse-stage-01, 代码逆向需求
- **patterns**:
  - 从代码.*生成.*PRD
  - 反向.*PRD
  - 反推.*需求

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| code_dir | string | 否 | 代码目录（如已执行reverse-stage-05可不用） | backend |
| design_docs_dir | string | 否 | 设计文档目录（reverse-stage-05的产出） | docs/概要设计 |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |
| business_context | string | 否 | 业务背景描述（帮助AI理解业务语义） | 医院信息系统，覆盖门诊、住院、药品管理 |

## 工作流程

1. **输入收集阶段**
   - 若提供design_docs_dir → 读取reverse-stage-05产出的API文档、数据字典、ER图、业务流程图
   - 若未提供design_docs_dir但有code_dir → 先执行reverse-stage-05，再继续
   - 若有business_context → 作为业务背景辅助理解

2. **功能清单反推**
   - 从API文档提取所有接口 → 按路径分组（如/his/patient/* → 患者管理模块）
   - 从Controller方法名和注释推断功能语义（如page=查询, create=新增, delete=删除）
   - 将接口分组为功能模块清单
   - 产出：功能点清单（含模块/功能点/对应API列表）

3. **业务实体反推**
   - 从数据字典提取所有表 → 按表名前缀分组（如his_patient → 门诊管理）
   - 从DO类注释提取实体名称和字段说明
   - 从ER关系图提取实体间关系
   - 产出：业务实体清单（含实体/字段/关系）

4. **业务规则反推**
   - 从代码注释/Service方法名推断业务规则（如checkConflict=冲突检查）
   - 从数据库约束推断业务规则（如唯一索引=不可重复）
   - 从枚举类推断业务状态（如PatientStatus: 待就诊/就诊中/已完成）
   - 产出：业务规则清单

5. **用户故事补齐**
   - 基于功能清单+业务实体+业务规则，AI生成用户故事
   - 格式：「作为[角色]，我想要[功能]，以便于[价值]」
   - 为每个用户故事生成INVEST检查
   - 产出：用户故事集

6. **验收标准补齐**
   - 基于API接口请求/响应，AI生成验收标准
   - 格式：Given[前置条件] When[操作] Then[预期结果]
   - 产出：验收标准清单

7. **PRD组装**
   - 组装功能清单+业务实体+业务规则+用户故事+验收标准
   - 生成标准格式PRD（使用prd-template.md）
   - 所有需求点分配REQ-XXX ID（标记为legacy来源）
   - 产出：PRD文档

8. **人工审核阶段**
   - 向用户提示：「反向生成的PRD基于代码推断，业务语义可能不准确，请产品经理审核」
   - 列出AI推断的功能清单和业务规则，让用户确认或修正
   - 用户修正后更新PRD

## 输出格式

### 功能清单模板
```markdown
## 功能清单（反向生成）

> ⚠️ 基于API接口反向推断，请产品经理审核确认。

| 模块 | 功能点 | 对应API | 推断的说明 | REQ-ID |
|------|--------|---------|-----------|--------|
| 门诊管理 | 患者信息查询 | GET /his/patient/page | 分页查询患者列表 | REQ-001 |
| 门诊管理 | 患者信息新增 | POST /his/patient/create | 新增患者 | REQ-002 |
| 门诊管理 | 患者信息修改 | PUT /his/patient/update | 修改患者 | REQ-003 |
```

### 用户故事模板
```markdown
## 用户故事（AI补齐）

> ⚠️ 基于功能清单AI生成，请产品经理审核确认。

### REQ-001: 患者信息查询
作为 接诊护士
我想要 在系统中查询患者信息
以便于 快速找到患者档案

**INVEST检查**:
- I(独立): ✅ 不依赖其他故事
- N(可协商): ✅ 可调整查询条件
- V(有价值): ✅ 提高查找效率
- E(可估算): ✅ 简单查询
- S(小): ✅ 1人日
- T(可测试): ✅ 可用接口测试验证

**验收标准**:
- Given 患者表中存在数据
- When 调用 GET /his/patient/page?pageNo=1&pageSize=10
- Then 返回PageResult，包含患者列表
```

## 使用示例

### 示例1：已有reverse-stage-05的产出，直接生成PRD

```bash
/reverse-stage-01 --project_name "HIS系统" --design_docs_dir "docs/概要设计" --output_dir "docs/需求分析" --business_context "医院信息系统，覆盖门诊、住院、药品管理"
```

### 示例2：只有代码，自动先执行reverse-stage-05

```bash
/reverse-stage-01 --project_name "HIS系统" --code_dir "backend" --output_dir "docs/需求分析" --business_context "医院信息系统"
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 | 说明 |
|---------|---------|---------|------|
| PRD文档 | .md | {output_dir}/PRD-{project_name}.md | 反向生成，含追溯矩阵 |
| 功能清单 | .md | {output_dir}/功能清单-{project_name}.md | 反向生成 |
| 用户故事集 | .md | {output_dir}/用户故事-{project_name}.md | AI补齐 |
| 待确认问题 | .md | {output_dir}/待确认问题-{project_name}.md | AI不确定的部分 |

## 注意事项

1. **⚠️ 业务语义可能不准确**：AI从代码推断业务语义，可能与实际业务含义有偏差，**必须产品经理审核**
2. **依赖reverse-stage-05**：若未提供design_docs_dir，会自动先执行reverse-stage-05
3. **REQ-ID标记为legacy**：反向生成的需求点REQ-ID标注来源为「legacy」（历史代码），区别于新需求
4. **不修改代码**：本skill只读取代码生成文档，不修改任何代码文件
5. **AI补齐部分需重点审核**：用户故事和验收标准是AI生成的，产品经理需逐一确认

## 相关文档

- [reverse-stage-05](reverse-stage-05.skill.md) — 从代码反向生成设计文档（前置依赖）
- [req-matrix-build](req-matrix-build.skill.md) — 建立REQ-ID追溯链（后置步骤）
- [prd-template](../../references/prd-template.md) — PRD标准模板
