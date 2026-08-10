---
name: stage-07-backend-development
description: 后端开发阶段：同步文档 + 框架skill开发 + AI单测+报告 + Code Review + 质量门控（每步交互确认）。触发关键词：后端开发、后端实现
---

# 后端开发阶段技能

## 功能描述

启动后端开发阶段工作流，**每步操作前都会弹窗询问用户是否执行**：
1. 同步各阶段文档到开发目录
2. 调用后端框架skill完成代码开发
3. 🆕 询问 → AI自动生成单元测试
4. 🆕 询问 → 执行单元测试 + 修复闭环
5. 自动生成测试报告
6. 🆕 询问 → 执行Code Review
7. 🆕 询问 → 质量门控 + git提交
8. 自动生成前端对接文档

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| docs_dir | string | 是 | 各阶段文档目录（相对路径） | docs |
| output_dir | string | 是 | 后端项目目录（相对路径） | backend |
| frontend_doc_dir | string | 否 | 前端对接文档目录（相对路径，不传默认为 docs/api） | docs/api |

## 使用示例

```bash
/stage-07 --project_name "HIS系统" --docs_dir "docs" --output_dir "backend"
```

## 工作流程

1. **文档同步阶段**：自动执行，无需询问
   - 同步需求分析、概要设计、数据库设计、排期计划文档
   - **🆕 自动读取** `docs/后端经验-{project_name}.md`（如存在），获取历史踩坑记录和最佳实践，避免重复踩坑

2. **代码开发阶段**：自动执行，无需询问
   - 调用 java-scaffold.skill.md 生成项目脚手架（如项目尚未初始化）
   - 调用 java-implement.skill.md 生成业务代码
   - 调用 entity-designer-java.skill.md 生成 DO 实体类
   - 调用 db-designer-java.skill.md 生成 Mapper
   - 调用 api-designer-java.skill.md 生成 Controller + VO
   - 调用 crud-designer-java.skill.md 生成 Service 层
   - 技术栈：Spring Boot 2.7.x（JDK 8）+ MyBatis-Plus + Swagger v3

---

### 🆕 以下步骤每步都会弹窗询问用户

3. **AI单元测试生成阶段**：询问确认

   **3.1 询问**
   > 「代码已生成完毕，是否生成AI单元测试？将覆盖正常/边界/异常场景。」
   - 「是」→ 进入3.2
   - 「否」→ 跳过单测，进入第7步（质量门控中单测条件自动跳过）

   **3.2 生成单测**
   - 为每个Service方法生成JUnit 5 + Mockito单元测试
   - 测试文件存放在 `src/test/java/` 对应目录

4. **单元测试执行阶段**：询问确认

   **4.1 询问**
   > 「单元测试已生成（共{N}个用例），是否执行？将自动修复失败用例。」
   - 「是」→ 进入4.2
   - 「否」→ 跳过测试，进入第7步（质量门控中单测条件自动跳过）

   **4.2 执行 + 修复闭环**
   1. 执行 `mvn test`
   2. 分析失败原因，自动修复代码
   3. 重新测试，直到全部通过
   4. 连续5轮未通过 → 暂停，请求人工介入

5. **测试报告生成阶段**：自动执行（单测执行后自动生成，无需询问）
   - 报告文件：`{frontend_doc_dir}/test-report-{project_name}.md`

6. **Code Review阶段**：询问确认

   **6.1 询问**
   > 「测试报告已生成，是否进行Code Review？将检查规范/安全/性能。」
   - 「是」→ 进入6.2
   - 「否」→ 跳过Review，进入第7步（质量门控中Review条件自动跳过）

   **6.2 执行Review**
   - 检查代码规范、架构分层、安全漏洞（SQL注入/XSS）、性能问题（N+1查询）
   - 报告文件：`{frontend_doc_dir}/code-review-{project_name}.md`

7. **质量门控与提交阶段**：询问确认

   **7.1 质量判断**
   ```
   单测通过/跳过？  ──是──→  Review通过/跳过？  ──是──→  进入7.2询问
       │                       │
       否（未通过）             否（未通过）
       │                       │
       ▼                       ▼
   ⚠️ 列出失败测试           ⚠️ 列出Review问题
   返回步骤4修复              返回步骤2修复
   ```
   > 用户跳过的步骤不阻塞门控

   **7.2 询问**
   > 「质量检查完成。是否自动git提交？提交信息：`后端开发: {project_name} [AI@stage-07]`」
   - 「是」→ 执行 `git add backend/` → `git commit` → `git push`
   - 「否」→ 跳过提交，提醒手动提交
   - 「修改提交信息」→ 用户输入自定义message后提交

8. **接口文档阶段**：自动执行，无需询问
   - 生成API接口文档到 `{frontend_doc_dir}/`

## 交互确认汇总

| 步骤 | 弹窗时机 | 默认回答 | 跳过后果 |
|------|---------|---------|---------|
| 单测生成 | 代码开发完成后 | 是 | 质量门控跳过单测条件 |
| 单测执行 | 单测生成后 | 是 | 质量门控跳过单测条件 |
| Code Review | 测试报告后 | 是 | 质量门控跳过Review条件 |
| Git提交 | 质量门控后 | 是 | 需手动提交 |

## 代码规范

### 命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| DO类 | XxxDO | PatientDO |
| Mapper | XxxMapper | PatientMapper |
| Service | XxxService / XxxServiceImpl | PatientServiceImpl |
| Controller | XxxController | PatientController |
| VO | XxxSaveReqVO / XxxPageReqVO / XxxRespVO | |
| 测试类 | XxxServiceTest | PatientServiceTest |

### 分层架构

```
cn.iocoder.yudao.module.{模块}
├── controller/admin/{功能}/     # Controller + VO
├── service/{功能}/              # Service 接口 + 实现
├── dal/dataobject/{功能}/       # DO 实体
├── dal/mysql/{功能}/            # Mapper
└── enums/                       # 错误码 + 枚举

src/test/java/{package}/
└── modules/{模块}/service/      # 单元测试
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| 实体类/Mapper/Service/Controller/VO | .java | {output_dir}/ |
| 单元测试 | .java | src/test/java/ |
| 测试报告 | .md | {frontend_doc_dir}/test-report-{project_name}.md |
| Code Review报告 | .md | {frontend_doc_dir}/code-review-{project_name}.md |
| API接口文档 | .md | {frontend_doc_dir}/ |
| 验证闭环日志 | .md | {frontend_doc_dir}/dev-loop-log.md |

## 注意事项

1. **每步都询问**：单测生成、单测执行、Code Review、Git提交，4个步骤各弹窗一次
2. **跳过不阻塞**：用户跳过的步骤，质量门控中对应条件自动跳过
3. **修复闭环**：单测失败时自动修复，连续5轮未通过时暂停
4. **提交信息可自定义**：用户回答「修改提交信息」可输入自定义message
5. **验证日志**：每次验证循环记录到 dev-loop-log.md

## 后端框架技术栈

- Spring Boot 2.7.x（JDK 8兼容）
- MyBatis-Plus
- JUnit 5 + Mockito（单元测试）
- Swagger v3

## 关联技能

- [java-scaffold](../1.0-软件开发流程角色agent模型/研发/skill/implement/java-scaffold.skill.md) — 项目脚手架生成
- [java-implement](../1.0-软件开发流程角色agent模型/研发/skill/implement/java-implement.skill.md) — 功能代码实现
- [entity-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/entity-designer-java.skill.md) — DO实体类设计
- [db-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/db-designer-java.skill.md) — 数据库映射设计
- [api-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/api-designer-java.skill.md) — API接口设计
- [crud-designer-java](../1.0-软件开发流程角色agent模型/研发/skill/design/crud-designer-java.skill.md) — CRUD代码生成
- [code-review-v2](../1.0-软件开发流程角色agent模型/研发/skill/process/code-review-v2.skill.md) — 代码审查