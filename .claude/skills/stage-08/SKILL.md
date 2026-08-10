---
name: stage-08-frontend-development
description: 前端开发阶段：同步文档 + 框架skill开发 + AI单测+报告 + Code Review + 质量门控（每步交互确认）+ 知识沉淀。触发关键词：前端开发、前端实现
---

# 前端开发阶段技能

## 功能描述

启动前端开发阶段工作流，**每步操作前都会弹窗询问用户是否执行**：
1. 同步各阶段文档和接口文档
2. 调用前端框架skill完成代码开发
3. 🆕 询问 → AI自动生成前端单元测试
4. 🆕 询问 → 执行单元测试 + 修复闭环
5. 自动生成测试报告
6. 🆕 询问 → 执行Code Review
7. 🆕 询问 → 质量门控 + git提交
8. 🆕 询问 → 知识沉淀

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| docs_dir | string | 是 | 各阶段文档目录（相对路径） | docs |
| output_dir | string | 是 | 前端项目目录（相对路径） | frontend |
| backend_doc_dir | string | 否 | 后端接口文档目录（相对路径，不传默认为 docs/api） | docs/api |

## 使用示例

```bash
/stage-08 --project_name "HIS系统" --docs_dir "docs" --output_dir "frontend"
```

## 工作流程

1. **文档同步阶段**：自动执行，无需询问
   - 读取需求分析、原型、后端接口文档、数据字典
   - **🆕 自动读取** `docs/前端经验-{project_name}.md`（如存在），获取历史踩坑记录和最佳实践，避免重复踩坑

2. **API层开发阶段**：自动执行，无需询问
   - 调用 vue-scaffold.skill.md 初始化项目（如项目尚未初始化）
   - 调用 vue-implement.skill.md 生成 API 请求层代码
   - TypeScript类型定义 → API请求函数 → 标准CRUD接口

3. **页面开发阶段**：自动执行，无需询问
   - 调用 component-designer-vue.skill.md 生成页面组件
   - 调用 vue-best-practices.skill.md 遵循最佳实践
   - 列表页 → 表单弹窗 → 详情页 → 路由配置

---

### 🆕 以下步骤每步都会弹窗询问用户

4. **AI单元测试生成阶段**：询问确认

   **4.1 询问**
   > 「页面代码已生成完毕，是否生成前端单元测试？将覆盖组件渲染和API调用。」
   - 「是」→ 进入4.2
   - 「否」→ 跳过单测，进入第7步（质量门控中单测条件自动跳过）

   **4.2 生成单测**
   - 为每个组件生成渲染测试（Vitest + Vue Test Utils）
   - 为API函数生成调用测试
   - 测试文件存放在 `src/__tests__/` 对应目录

5. **单元测试执行阶段**：询问确认

   **5.1 询问**
   > 「单元测试已生成（共{N}个用例），是否执行？将自动修复失败用例。」
   - 「是」→ 进入5.2
   - 「否」→ 跳过测试，进入第7步（质量门控中单测条件自动跳过）

   **5.2 执行 + 修复闭环**
   1. 执行 `npx vitest run`
   2. 分析失败原因，自动修复代码
   3. 重新测试，直到全部通过
   4. 连续5轮未通过 → 暂停，请求人工介入

6. **测试报告生成阶段**：自动执行（单测执行后自动生成，无需询问）
   - 报告文件：`docs/test-report-{project_name}-frontend.md`

7. **Code Review阶段**：询问确认

   **7.1 询问**
   > 「测试报告已生成，是否进行Code Review？将检查规范/性能/安全/可访问性。」
   - 「是」→ 进入7.2
   - 「否」→ 跳过Review，进入第8步（质量门控中Review条件自动跳过）

   **7.2 执行Review**
   - 检查代码规范、性能（大列表虚拟滚动）、安全（XSS）、可访问性（aria）
   - 报告文件：`docs/code-review-{project_name}-frontend.md`

8. **质量门控与提交阶段**：询问确认

   **8.1 质量判断**
   ```
   单测通过/跳过？  ──是──→  Review通过/跳过？  ──是──→  进入8.2询问
       │                       │
       否（未通过）             否（未通过）
       │                       │
       ▼                       ▼
   ⚠️ 列出失败测试           ⚠️ 列出Review问题
   返回步骤5修复              返回步骤3修复
   ```
   > 用户跳过的步骤不阻塞门控

   **8.2 询问**
   > 「质量检查完成。是否自动git提交？提交信息：`前端开发: {project_name} [AI@stage-08]`」
   - 「是」→ 执行 `git add frontend/` → `git commit` → `git push`
   - 「否」→ 跳过提交，提醒手动提交
   - 「修改提交信息」→ 用户输入自定义message后提交

9. **知识沉淀阶段**：询问确认

   **9.1 询问**
   > 「前端开发已完成，是否进行知识沉淀？将提取踩坑记录和最佳实践回写知识库。」
   - 「是」→ 引导执行 `/knowledge-precipitate`
   - 「否」→ 流程结束

## 交互确认汇总

| 步骤 | 弹窗时机 | 默认回答 | 跳过后果 |
|------|---------|---------|---------|
| 单测生成 | 页面开发完成后 | 是 | 质量门控跳过单测条件 |
| 单测执行 | 单测生成后 | 是 | 质量门控跳过单测条件 |
| Code Review | 测试报告后 | 是 | 质量门控跳过Review条件 |
| Git提交 | 质量门控后 | 是 | 需手动提交 |
| 知识沉淀 | 流程结束时 | 是 | 跳过知识沉淀 |

## 代码规范

### 文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| API文件 | 小写连字符 | patient/index.ts |
| 页面文件 | 小写连字符 | patient/index.vue |
| 组件文件 | PascalCase | PatientForm.vue |
| 测试文件 | {name}.test.ts | PatientForm.test.ts |

### 目录结构

```
apps/web-antd/src/
├── api/his/{module}/index.ts    # API层
├── views/his/{module}/          # 页面层
│   ├── index.vue                # 列表页
│   ├── data.ts                  # 表格配置
│   └── modules/form.vue         # 表单弹窗
├── __tests__/                   # 单元测试
└── router/routes/modules/       # 路由配置
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| API层代码 | .ts | {output_dir}/src/api/his/{module}/ |
| 页面组件 | .vue | {output_dir}/src/views/his/{module}/ |
| 单元测试 | .test.ts | {output_dir}/src/__tests__/ |
| 测试报告 | .md | docs/test-report-{project_name}-frontend.md |
| Code Review报告 | .md | docs/code-review-{project_name}-frontend.md |

## 注意事项

1. **每步都询问**：单测生成、单测执行、Code Review、Git提交、知识沉淀，5个步骤各弹窗一次
2. **跳过不阻塞**：用户跳过的步骤，质量门控中对应条件自动跳过
3. **修复闭环**：单测失败时自动修复，连续5轮未通过时暂停
4. **提交信息可自定义**：用户回答「修改提交信息」可输入自定义message
5. **权限控制**：使用auth指令进行权限控制

## 前端框架技术栈

- Vue 3.5+ / TypeScript 5.9+ / Vite 8.0+
- Pinia 3.0+ / Ant Design Vue 4.x / VxeTable 4.x
- Vben Admin框架
- Vitest + Vue Test Utils（单元测试）

## 关联技能

- [vue-scaffold](../1.0-软件开发流程角色agent模型/研发/skill/implement/vue-scaffold.skill.md) — 项目脚手架生成
- [vue-implement](../1.0-软件开发流程角色agent模型/研发/skill/implement/vue-implement.skill.md) — Vue组件实现
- [vue-best-practices](../1.0-软件开发流程角色agent模型/研发/skill/design/vue-best-practices.skill.md) — Vue最佳实践
- [component-designer-vue](../1.0-软件开发流程角色agent模型/研发/skill/design/component-designer-vue.skill.md) — Vue组件设计
- [code-review-v2](../1.0-软件开发流程角色agent模型/研发/skill/process/code-review-v2.skill.md) — 代码审查
- [knowledge-precipitate](../1.0-软件开发流程角色agent模型/研发/skill/process/knowledge-precipitate.skill.md) — 知识沉淀