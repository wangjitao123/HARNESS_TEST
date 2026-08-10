/**
 * 增量开发阶段工作流
 *
 * 功能描述：
 * - 解析变更需求，提取变更点
 * - 分析变更对现有系统的影响（数据模型、数据库、代码、接口）
 * - 评审变更可行性和风险
 * - 在已有代码基础上进行增量修改（后端 + 前端）
 * - 回归检查，确保变更未引入错误
 *
 * 输入参数：
 * - project_name: 项目名称
 * - change_request: 变更需求描述（与 requirement_doc 二选一）
 * - requirement_doc: 需求文档路径（来自 stage-01 产出的 PRD）
 * - change_type: 变更类型（feature/fix/refactor）
 * - docs_dir: 各阶段文档目录（相对路径）
 * - backend_dir: 后端项目目录（相对路径）
 * - frontend_dir: 前端项目目录（相对路径）
 * - backend_skill_path: 后端框架skill路径（相对路径）
 * - frontend_skill_path: 前端框架skill路径（相对路径）
 */

export const meta = {
  name: 'stage-09-incremental-development',
  description: '增量开发阶段：变更解析 + 影响分析 + 变更评审 + 增量开发 + 回归检查',
  phases: [
    { title: '变更需求解析', detail: '解析变更请求，提取变更点，加载现有设计文档' },
    { title: '影响分析', detail: '分析对数据模型、数据库、代码、接口的影响' },
    { title: '变更评审', detail: '可行性评估、风险识别、生成变更影响分析报告' },
    { title: '增量开发', detail: '在已有代码上进行增量修改（后端 + 前端）' },
    { title: '回归检查', detail: '编译检查、规范检查、接口兼容性检查' },
  ],
};

export default async function (args) {
  const {
    project_name,
    change_request,
    requirement_doc,
    change_type = 'feature',
    docs_dir,
    backend_dir,
    frontend_dir,
    backend_skill_path = 'backend/CLAUDE.md',
    frontend_skill_path = 'frontend/CLAUDE.md',
  } = args;

  // Phase 1: 变更需求解析
  phase('变更需求解析');

  const changeAnalysis = await agent(
    `解析变更需求并加载现有设计文档：

    项目：${project_name}
    ${requirement_doc ? `需求文档路径：${requirement_doc}\n    请优先读取该 PRD 文档作为需求来源。` : `变更请求：${change_request}`}
    变更类型：${change_type}

    文档目录：${docs_dir}
    后端项目目录：${backend_dir}
    前端项目目录：${frontend_dir || '未指定'}
    后端框架Skill路径：${backend_skill_path}
    前端框架Skill路径：${frontend_skill_path}

    请执行以下步骤：
    1. ${requirement_doc ? '读取 requirement_doc 指定的 PRD 文档' : '解析 change_request 变更需求描述'}，提取变更类型（新增功能/修改功能/修复Bug/重构）
    2. 识别变更涉及的业务模块
    3. 提取变更点清单
    4. 读取 docs/ 下的需求分析、概要设计、数据库设计等文档（如存在）
    5. 读取 backend/CLAUDE.md 和 frontend/CLAUDE.md 了解项目框架规范
    6. 扫描 ${backend_dir} 和 ${frontend_dir || '未指定'} 下的现有代码结构，了解已有功能

    使用 requirement-change.skill.md 的变更解析方法：
    - 按变更类型分类（feature/fix/refactor）
    - 按影响维度分类（数据模型/领域设计/数据库/代码/接口）`,
    {
      label: 'change-analysis',
      phase: '变更需求解析',
      schema: {
        type: 'object',
        properties: {
          changeType: { type: 'string' },
          businessModules: { type: 'array', items: { type: 'string' } },
          changePoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                category: { type: 'string' },
                severity: { type: 'string' },
              },
            },
          },
          existingDocs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                docName: { type: 'string' },
                docPath: { type: 'string' },
                relevance: { type: 'string' },
              },
            },
          },
        },
        required: ['changeType', 'changePoints'],
      },
    }
  );

  log(
    `变更解析完成，识别 ${changeAnalysis.changePoints?.length || 0} 个变更点，涉及模块：${changeAnalysis.businessModules?.join(', ') || '未知'}`
  );

  // Phase 2: 影响分析
  phase('影响分析');

  const impactAnalysis = await agent(
    `分析变更对现有系统的影响：

    项目：${project_name}
    变更分析结果：
    ${JSON.stringify(changeAnalysis, null, 2)}

    后端项目目录：${backend_dir}
    前端项目目录：${frontend_dir || '未指定'}

    请使用 requirement-change.skill.md 和 requirement-review.skill.md 的影响分析方法，分析以下维度：

    1. 数据模型影响分析
       - 实体变更（新增、修改、删除）
       - 属性变更（字段类型、约束、默认值）
       - 关系变更（关联关系、基数）

    2. 数据库影响分析
       - 表结构变更（DDL：ALTER TABLE / CREATE TABLE）
       - 索引变更
       - 数据迁移需求

    3. 代码影响分析
       - 后端：DO/Mapper/Service/Controller/VO 的修改范围
       - 前端：API调用/页面组件/路由的修改范围
       - 测试用例变更

    4. 接口影响分析
       - 新增接口
       - 修改接口（向后兼容性评估）
       - 废弃接口

    请搜索现有代码，确认实际影响范围。`,
    {
      label: 'impact-analysis',
      phase: '影响分析',
      schema: {
        type: 'object',
        properties: {
          dataModelImpact: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entity: { type: 'string' },
                changeType: { type: 'string' },
                changeDescription: { type: 'string' },
                impactLevel: { type: 'string' },
              },
            },
          },
          databaseImpact: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                table: { type: 'string' },
                changeType: { type: 'string' },
                ddlStatement: { type: 'string' },
                dataMigration: { type: 'boolean' },
              },
            },
          },
          codeImpact: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                module: { type: 'string' },
                file: { type: 'string' },
                changeType: { type: 'string' },
                workEffort: { type: 'string' },
              },
            },
          },
          apiImpact: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                method: { type: 'string' },
                changeType: { type: 'string' },
                backwardCompatible: { type: 'boolean' },
              },
            },
          },
          totalEffort: { type: 'string' },
        },
        required: ['dataModelImpact', 'databaseImpact', 'codeImpact'],
      },
    }
  );

  log(
    `影响分析完成：数据模型 ${impactAnalysis.dataModelImpact?.length || 0} 项，数据库 ${impactAnalysis.databaseImpact?.length || 0} 项，代码 ${impactAnalysis.codeImpact?.length || 0} 项`
  );

  // Phase 3: 变更评审
  phase('变更评审');

  const reviewResult = await agent(
    `变更评审与风险评估：

    项目：${project_name}
    变更分析：
    ${JSON.stringify(changeAnalysis, null, 2)}

    影响分析：
    ${JSON.stringify(impactAnalysis, null, 2)}

    请使用 requirement-review.skill.md 的评审方法，执行以下步骤：

    1. 可行性评估
       - 技术可行性
       - 实现复杂度
       - 工期预估

    2. 风险识别
       - 数据迁移风险
       - 接口兼容性风险
       - 性能影响
       - 并发安全

    3. 生成变更影响分析报告
       - 输出到 docs/变更分析/ 目录
       - 包含 DDL 脚本、数据迁移脚本、回滚脚本

    4. 兼容性策略（如涉及接口变更）
       - 过渡期方案（双写/双读/清理）
       - 版本管理方案

    变更类型：${change_type}
    ${change_type === 'refactor' ? '重构变更需要兼容性过渡方案' : ''}
    ${change_type === 'fix' ? 'Bug修复需要复现步骤' : ''}
    ${change_type === 'feature' ? '新功能可能需要初始化数据' : ''}`,
    {
      label: 'change-review',
      phase: '变更评审',
      schema: {
        type: 'object',
        properties: {
          feasibility: {
            type: 'object',
            properties: {
              technicalFeasibility: { type: 'string' },
              complexity: { type: 'string' },
              estimatedDuration: { type: 'string' },
            },
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk: { type: 'string' },
                level: { type: 'string' },
                impact: { type: 'string' },
                mitigation: { type: 'string' },
              },
            },
          },
          rollbackPlan: { type: 'string' },
          compatibilityStrategy: { type: 'string' },
          reviewReportPath: { type: 'string' },
          ddlScriptPath: { type: 'string' },
          migrationScriptPath: { type: 'string' },
          rollbackScriptPath: { type: 'string' },
          reviewConclusion: { type: 'string' },
        },
        required: ['feasibility', 'risks', 'reviewConclusion'],
      },
    }
  );

  log(
    `变更评审完成：${reviewResult.reviewConclusion}，风险 ${reviewResult.risks?.length || 0} 项`
  );

  // Phase 4: 增量开发
  phase('增量开发');

  const developmentResult = await agent(
    `在已有代码基础上进行增量修改：

    项目：${project_name}
    变更类型：${change_type}
    后端项目目录：${backend_dir}
    前端项目目录：${frontend_dir || '未指定'}
    后端框架Skill路径：${backend_skill_path}
    前端框架Skill路径：${frontend_skill_path}

    变更分析：
    ${JSON.stringify(changeAnalysis, null, 2)}

    影响分析：
    ${JSON.stringify(impactAnalysis, null, 2)}

    评审结论：${reviewResult.reviewConclusion}

    请使用 crud-designer-java.skill.md 的代码模板，执行以下步骤：

    1. 数据库变更
       - 执行 DDL 脚本（ALTER TABLE / CREATE TABLE）
       - 执行数据迁移脚本
       - 确保回滚脚本可用

    2. 后端增量开发（在已有代码上修改，不要删除已有代码重新生成）
       - 阅读现有代码结构，理解现有实现
       - 新增实体：在已有模块下创建新的 DO/Mapper/Service/Controller/VO
       - 修改实体：在已有 DO 上增加字段，同步修改 Mapper/Service/Controller/VO
       - 修复Bug：定位问题代码，修改逻辑

    3. 前端增量开发（如指定 frontend_dir）
       - 阅读现有前端代码结构
       - 新增页面：在已有路由配置中添加新路由
       - 修改页面：在已有页面组件上修改
       - 新增/修改 API 调用

    技术栈：
    - 后端：Spring Boot 3.x / MyBatis-Plus / Swagger v3
    - 前端：Vue 3.5+ / TypeScript / Vite / Ant Design Vue / Vben Admin

    命名规范：
    - DO类：XxxDO | Service：XxxService/XxxServiceImpl | Controller：XxxController
    - VO：XxxSaveReqVO/XxxPageReqVO/XxxRespVO
    - 前端API：小写连字符目录+index.ts | 页面：小写连字符+index.vue | 组件：PascalCase

    注意：增量修改而非重新生成！在已有文件上修改！`,
    {
      label: 'incremental-dev',
      phase: '增量开发',
      schema: {
        type: 'object',
        properties: {
          databaseChanges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                sql: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
          backendChanges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                changeType: { type: 'string' },
                description: { type: 'string' },
                moduleName: { type: 'string' },
              },
            },
          },
          frontendChanges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                changeType: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
          totalFilesChanged: { type: 'number' },
        },
        required: ['backendChanges', 'totalFilesChanged'],
      },
    }
  );

  log(
    `增量开发完成，修改 ${developmentResult.totalFilesChanged} 个文件`
  );

  // Phase 5: 回归检查
  phase('回归检查');

  let regressionResult;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    regressionResult = await agent(
      `回归检查：

      项目：${project_name}
      后端项目目录：${backend_dir}
      前端项目目录：${frontend_dir || '未指定'}

      修改的文件：
      ${JSON.stringify(developmentResult.backendChanges, null, 2)}
      ${JSON.stringify(developmentResult.frontendChanges, null, 2)}

      请执行以下检查：

      1. 编译检查
         - 后端：mvn compile
         - 前端：npm run build（如指定 frontend_dir）

      2. 代码规范检查
         - 命名规范（DO/Mapper/Service/Controller/VO 命名是否正确）
         - 分层架构一致性
         - 权限标识格式

      3. 接口兼容性检查
         - 新增接口不破坏现有接口
         - 修改接口的向后兼容性

      如有错误，请修复后重新检查

      使用 code-review-v2.skill.md 的评审方法`,
      {
        label: `regression-check-${retryCount + 1}`,
        phase: '回归检查',
        schema: {
          type: 'object',
          properties: {
            hasErrors: { type: 'boolean' },
            errorCount: { type: 'number' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: { type: 'string' },
                  line: { type: 'number' },
                  errorType: { type: 'string' },
                  message: { type: 'string' },
                  fixed: { type: 'boolean' },
                },
              },
            },
            compatibilityIssues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  api: { type: 'string' },
                  issue: { type: 'string' },
                  resolved: { type: 'boolean' },
                },
              },
            },
            buildSuccess: { type: 'boolean' },
            codeReviewPassed: { type: 'boolean' },
          },
          required: ['hasErrors', 'buildSuccess'],
        },
      }
    );

    if (!regressionResult.hasErrors) {
      log('回归检查通过，无编译错误');
      break;
    }

    retryCount++;
    log(
      `发现 ${regressionResult.errorCount} 个错误，尝试修复 (${retryCount}/${maxRetries})`
    );
  }

  // 生成更新后的接口文档
  phase('回归检查');

  const apiDocUpdate = await agent(
    `更新前端对接文档：

    项目：${project_name}
    变更的接口：
    ${JSON.stringify(impactAnalysis.apiImpact, null, 2)}

    输出目录：docs/api/

    请更新以下文档：
    1. 新增/修改的 API 接口文档
    2. 请求参数说明
    3. 响应数据结构
    4. 接口调用示例

    文档格式：Markdown，按模块分文件组织`,
    {
      label: 'api-doc-update',
      phase: '回归检查',
      schema: {
        type: 'object',
        properties: {
          updatedDocs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                docName: { type: 'string' },
                docPath: { type: 'string' },
                apiCount: { type: 'number' },
              },
            },
          },
          totalUpdatedApis: { type: 'number' },
        },
        required: ['updatedDocs'],
      },
    }
  );

  log(
    `接口文档更新完成，更新 ${apiDocUpdate.totalUpdatedApis || 0} 个API`
  );

  return {
    projectName: project_name,
    changeType: change_type,
    changeRequest: change_request,
    changeAnalysis: changeAnalysis,
    impactAnalysis: impactAnalysis,
    reviewResult: reviewResult,
    developmentResult: developmentResult,
    regressionResult: regressionResult,
    apiDocUpdate: apiDocUpdate,
  };
}
