# Skill: reverse-stage-05（代码反向建模-设计文档）

## 基本信息

- **ID**: reverse-stage-05
- **名称**: 代码反向建模-设计文档
- **版本**: 1.0.0
- **分类**: process
- **部门**: 研发部
- **优先级**: P0
- **描述**: 从现有代码库反向生成设计文档，包括扫描数据库生成ER图+数据字典、扫描Controller生成API文档、扫描Service生成业务流程图、扫描配置文件生成架构图。

## 触发条件

- **命令**: `/reverse-stage-05`
- **关键词**: 反向建模, 代码逆向, 生成设计文档, 代码扫描, reverse-stage-05, 反向生成设计
- **patterns**:
  - 从代码.*生成.*设计
  - 反向.*建模
  - 扫描.*代码.*文档

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| code_dir | string | 是 | 代码目录根路径（相对路径） | backend |
| output_dir | string | 否 | 输出目录（默认 docs/概要设计） | docs/概要设计 |
| scan_scope | string | 否 | 扫描范围：full（全部）/ db（仅数据库）/ api（仅API）/ arch（仅架构），默认full | full |
| db_config_path | string | 否 | 数据库连接配置文件路径（如application-dev.yml） | backend/src/main/resources/application-dev.yml |

## 工作流程

1. **代码扫描阶段**：扫描代码库结构
   - 识别项目技术栈（从pom.xml/package.json推断）
   - 扫描目录结构，识别分层架构（controller/service/dal等）
   - 扫描配置文件（application.yml等）

2. **数据库反向生成**（scan_scope=db或full时）
   - 方式A（有数据库连接）：连接数据库 → 读取INFORMATION_SCHEMA → 生成ER图+数据字典+DDL
   - 方式B（无数据库连接）：扫描DO/Entity类 → 解析@Table/@TableName注解 → 生成ER图+数据字典
   - 产出：ER关系图、数据字典、DDL脚本（反向提取的建表语句）
   - 识别：多租户字段(tenant_id)、审计字段(creator/create_time)、逻辑删除(deleted)

3. **API反向生成**（scan_scope=api或full时）
   - 扫描Controller类 → 解析@RequestMapping/@GetMapping/@PostMapping等注解
   - 提取：接口路径、HTTP方法、请求参数（@RequestBody/@RequestParam）、响应类型
   - 扫描VO类 → 生成请求/响应数据结构
   - 产出：API文档（OpenAPI风格Markdown格式）、接口清单

4. **业务流程反向生成**
   - 扫描Service类 → 解析方法调用关系
   - 识别关键业务流程（如：挂号→缴费→取药）
   - 从代码注释/方法名推断业务语义
   - 产出：业务流程图（Mermaid格式）

5. **架构反向生成**（scan_scope=arch或full时）
   - 扫描配置文件 → 识别中间件（Redis/MQ/DB等）
   - 扫描依赖文件（pom.xml） → 识别技术栈
   - 扫描模块结构 → 生成C4架构图（Container层+Component层）
   - 产出：架构设计文档（C4模型）、技术栈清单

6. **人工审核阶段**
   - 列出所有AI生成的文档
   - 向用户提示：「反向生成的文档可能存在偏差，请开发人员审核以下内容：」
   - 重点审核：业务流程语义是否正确、表关系是否准确、API分类是否合理
   - 用户修正后确认

## 输出格式

### 数据字典模板
```markdown
# {project_name} 数据字典（反向生成）

> ⚠️ 本文档由AI从代码反向生成，请开发人员审核确认。

## 生成方式
- 方式：{数据库连接扫描 / DO类注解扫描}
- 扫描时间：{timestamp}
- 数据库/DO数量：{n}个

## 表清单

| 表名 | DO类 | 模块 | 审计字段 | 逻辑删除 | 多租户 | 说明 |
|------|------|------|---------|---------|--------|------|
| his_patient | PatientDO | 门诊管理 | ✅ | ✅ | ✅ | 患者信息表 |

## 字段详情

### his_patient（患者信息表）
| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | BIGINT | 否 | AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | 否 | - | 姓名 |
| ... | ... | ... | ... | ... |
```

### API文档模板
```markdown
# {project_name} API文档（反向生成）

> ⚠️ 本文档由AI从Controller代码反向生成，请开发人员审核确认。

## 接口清单

| 序号 | 模块 | 接口路径 | 方法 | Controller | 说明 |
|------|------|---------|------|-----------|------|
| 1 | 门诊管理 | /his/patient/page | GET | PatientController | 分页查询患者 |
| 2 | 门诊管理 | /his/patient/create | POST | PatientController | 新增患者 |

## 接口详情

### 1. 分页查询患者
- **路径**: GET /his/patient/page
- **Controller**: PatientController.page
- **请求参数**: {参数列表}
- **响应类型**: CommonResult<PageResult<PatientRespVO>>
```

## 使用示例

### 示例1：完整反向建模

```bash
/reverse-stage-05 --project_name "HIS系统" --code_dir "backend" --output_dir "docs/概要设计" --scan_scope "full"
```

### 示例2：仅反向生成API文档

```bash
/reverse-stage-05 --project_name "HIS系统" --code_dir "backend" --scan_scope "api" --output_dir "docs/api"
```

### 示例3：有数据库连接，直接扫描数据库

```bash
/reverse-stage-05 --project_name "HIS系统" --code_dir "backend" --db_config_path "backend/src/main/resources/application-dev.yml" --scan_scope "db"
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 | 说明 |
|---------|---------|---------|------|
| 数据字典 | .md | {output_dir}/数据库设计/数据字典-{project_name}.md | 反向生成 |
| ER关系图 | .md | {output_dir}/数据库设计/ER图-{project_name}.md | 反向生成 |
| DDL脚本 | .sql | {output_dir}/数据库设计/sql/reverse-{project_name}.sql | 反向提取 |
| API文档 | .md | {output_dir}/api/API文档-{project_name}.md | 反向生成 |
| 架构设计文档 | .md | {output_dir}/架构设计/架构设计文档-{project_name}.md | 反向生成 |
| C4架构图 | .md | {output_dir}/架构设计/C4架构图-{project_name}.md | Mermaid格式 |
| 业务流程图 | .md | {output_dir}/业务流程图-{project_name}.md | Mermaid格式 |

## 注意事项

1. **⚠️ 文档可能有偏差**：AI反向生成的文档基于代码结构推断，业务语义可能不准确，**必须人工审核**
2. **两种数据库扫描模式**：有数据库连接时优先方式A（更准确），无连接时用方式B（从DO类推断）
3. **不修改代码**：本skill只读取代码生成文档，不修改任何代码文件
4. **技术栈自适应**：根据pom.xml/package.json自动适配扫描策略
5. **产出标记**：所有反向生成的文档头部标注「⚠️ 本文档由AI从代码反向生成，请审核确认」

## 相关文档

- [reverse-stage-01](reverse-stage-01.skill.md) — 从代码+设计反向生成PRD
- [req-matrix-build](req-matrix-build.skill.md) — 建立REQ-ID追溯链
- [cross-review](cross-review.skill.md) — 交叉评审（可评审反向生成的文档与代码的一致性）
