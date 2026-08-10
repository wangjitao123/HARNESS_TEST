/**
 * 后端开发阶段工作流
 *
 * 功能描述：
 * - 同步各阶段文档到开发目录
 * - 调用后端框架skill完成代码开发
 * - AI自动生成单元测试
 * - 执行单元测试 + 修复闭环
 * - 生成测试报告
 * - 执行Code Review
 * - 质量门控：单测通过 + Code Review通过 → 自动git commit
 * - 生成前端对接文档
 *
 * 输入参数：
 * - project_name: 项目名称
 * - docs_dir: 各阶段文档目录（绝对路径）
 * - output_dir: 输出目录（绝对路径）
 * - backend_skill_path: 后端框架skill路径（绝对路径）
 * - frontend_doc_dir: 前端对接文档目录（绝对路径）
 */

export const meta = {
  name: 'stage-07-backend-development',
  description: '后端开发：文档同步 + 代码开发 + AI单测+报告 + Code Review + 质量门控（通过后自动git commit）',
  phases: [
    { title: '文档同步', detail: '同步各阶段文档到开发目录' },
    { title: '代码开发', detail: '调用后端框架skill完成代码开发' },
    { title: 'AI单测生成', detail: 'AI自动生成单元测试' },
    { title: '单测执行+修复', detail: '执行测试并修复直到全部通过' },
    { title: '测试报告', detail: '生成测试报告' },
    { title: 'Code Review', detail: 'AI自动代码审查' },
    { title: '质量门控', detail: '单测+Review通过则自动git commit' },
    { title: '接口文档', detail: '生成前端对接文档' },
  ],
};

export default async function (args) {
  const {
    project_name,
    docs_dir,
    output_dir,
    backend_skill_path = 'F:\\projects\\yudao-ai-his-backend\\CLAUDE.md',
    frontend_doc_dir = 'F:\\projects\\yudao-ai-his-backend\\docs\\his',
  } = args;

  // Phase 1: 文档同步
  phase('文档同步');

  const docSync = await agent(
    `同步各阶段文档到开发目录：

    文档来源目录：${docs_dir}

    请读取以下阶段的文档：
    1. 需求分析阶段文档
    2. 概要设计阶段文档
    3. 数据库设计文档
    4. 排期计划文档

    整理并提取开发所需信息`,
    {
      label: 'sync-docs',
      phase: '文档同步',
      schema: {
        type: 'object',
        properties: {
          syncedDocuments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                docName: { type: 'string' },
                docPath: { type: 'string' },
                keyPoints: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          developmentRequirements: {
            type: 'object',
            properties: {
              modules: { type: 'array', items: { type: 'string' } },
              apis: { type: 'array', items: { type: 'string' } },
              entities: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        required: ['syncedDocuments'],
      },
    }
  );

  log(`文档同步完成，同步 ${docSync.syncedDocuments?.length || 0} 份文档`);

  // Phase 2: 代码开发
  phase('代码开发');

  const developmentResult = await agent(
    `调用后端框架skill完成开发：

    项目：${project_name}

    后端框架Skill路径：${backend_skill_path}

    开发需求：
    ${JSON.stringify(docSync.developmentRequirements, null, 2)}

    请按照以下流程开发：
    1. 阅读后端框架skill文档
    2. 根据数据库设计生成实体类
    3. 生成Mapper接口
    4. 生成Service层代码
    5. 生成Controller层代码

    技术栈：Spring Boot 2.7.x（JDK 8兼容） / MyBatis-Plus / Swagger v3`,
    {
      label: 'backend-dev',
      phase: '代码开发',
      schema: {
        type: 'object',
        properties: {
          generatedFiles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filePath: { type: 'string' },
                fileType: { type: 'string' },
                moduleName: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
          totalFiles: { type: 'number' },
          modules: { type: 'array', items: { type: 'string' } },
          apis: { type: 'array', items: { type: 'string' } },
        },
        required: ['generatedFiles', 'totalFiles'],
      },
    }
  );

  log(`代码开发完成，生成 ${developmentResult.totalFiles} 个文件`);

  // Phase 3: AI单元测试生成
  phase('AI单测生成');

  const testGeneration = await agent(
    `为生成的代码自动生成单元测试：

    生成的文件列表：
    ${JSON.stringify(developmentResult.generatedFiles, null, 2)}

    项目路径：${output_dir}

    要求：
    1. 为每个Service方法生成单元测试（JUnit 5 + Mockito）
    2. 测试覆盖正常场景、边界场景、异常场景
    3. 使用Mock模拟Mapper、Redis等外部依赖
    4. 测试文件存放在 src/test/java/ 对应目录
    5. 测试类命名：{ServiceName}Test`,
    {
      label: 'generate-tests',
      phase: 'AI单测生成',
      schema: {
        type: 'object',
        properties: {
          testFiles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                testFilePath: { type: 'string' },
                targetService: { type: 'string' },
                testCaseCount: { type: 'number' },
              },
            },
          },
          totalTestCases: { type: 'number' },
        },
        required: ['testFiles', 'totalTestCases'],
      },
    }
  );

  log(`单元测试生成完成，共 ${testGeneration.totalTestCases} 个测试用例`);

  // Phase 4: 单元测试执行与修复闭环
  phase('单测执行+修复');

  let testPassed = false;
  let testRetryCount = 0;
  const maxTestRetries = 5;
  let testResult;

  while (testRetryCount < maxTestRetries) {
    testResult = await agent(
      `执行单元测试并分析结果：

      项目路径：${output_dir}
      执行命令：mvn test

      如果测试失败：
      1. 分析失败原因
      2. 修复代码或测试用例
      3. 重新执行测试

      当前第 ${testRetryCount + 1} 轮，最多 ${maxTestRetries} 轮`,
      {
        label: `test-${testRetryCount + 1}`,
        phase: '单测执行+修复',
        schema: {
          type: 'object',
          properties: {
            allPassed: { type: 'boolean' },
            totalTests: { type: 'number' },
            passedCount: { type: 'number' },
            failedCount: { type: 'number' },
            failures: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  testName: { type: 'string' },
                  errorMessage: { type: 'string' },
                  fixed: { type: 'boolean' },
                },
              },
            },
          },
          required: ['allPassed', 'totalTests'],
        },
      }
    );

    if (testResult.allPassed) {
      testPassed = true;
      log(`单元测试全部通过！${testResult.totalTests} 个测试用例，0 失败`);
      break;
    }

    testRetryCount++;
    log(`第 ${testRetryCount} 轮：${testResult.failedCount} 个失败，继续修复...`);
  }

  if (!testPassed) {
    log(`⚠️ 连续 ${maxTestRetries} 轮未全部通过，暂停。请人工介入。`);
  }

  // Phase 5: 测试报告
  phase('测试报告');

  const testReport = await agent(
    `生成测试报告：

    测试结果：${JSON.stringify(testResult, null, 2)}
    项目：${project_name}

    报告内容：
    1. 测试总览：总用例数、通过数、失败数、覆盖率
    2. 按模块分组：各模块测试通过率
    3. 覆盖率报告

    输出文件：${frontend_doc_dir}/test-report-${project_name}.md`,
    {
      label: 'test-report',
      phase: '测试报告',
      schema: {
        type: 'object',
        properties: {
          reportPath: { type: 'string' },
          summary: { type: 'string' },
          coverageRate: { type: 'number' },
        },
        required: ['reportPath'],
      },
    }
  );

  log(`测试报告已生成：${testReport.reportPath}`);

  // Phase 6: Code Review
  phase('Code Review');

  const codeReview = await agent(
    `对生成的代码进行Code Review：

    项目路径：${output_dir}
    生成的文件：
    ${JSON.stringify(developmentResult.generatedFiles, null, 2)}

    检查维度：
    1. 代码规范（命名、注释、异常处理）
    2. 架构分层（是否越层调用）
    3. 安全漏洞（SQL注入、XSS等）
    4. 性能问题（N+1查询、未使用缓存等）

    输出文件：${frontend_doc_dir}/code-review-${project_name}.md`,
    {
      label: 'code-review',
      phase: 'Code Review',
      schema: {
        type: 'object',
        properties: {
          reviewPassed: { type: 'boolean' },
          totalIssues: { type: 'number' },
          criticalIssues: { type: 'number' },
          majorIssues: { type: 'number' },
          minorIssues: { type: 'number' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                severity: { type: 'string' },
                file: { type: 'string' },
                description: { type: 'string' },
                suggestion: { type: 'string' },
              },
            },
          },
          reportPath: { type: 'string' },
        },
        required: ['reviewPassed', 'totalIssues', 'reportPath'],
      },
    }
  );

  log(`Code Review完成：${codeReview.reviewPassed ? '✅ 通过' : '❌ 不通过'}，${codeReview.totalIssues} 个问题`);

  // Phase 7: 质量门控与自动提交
  phase('质量门控');

  const gateResult = await agent(
    `质量门控判断：

    单元测试：${testPassed ? '✅ 全部通过' : '❌ 有失败'}
    Code Review：${codeReview.reviewPassed ? '✅ 通过' : '❌ 不通过'}

    判断逻辑：
    - 两个条件都满足 → 执行 git add backend/ + git commit + git push
    - 任一不满足 → 阻止提交，输出失败原因

    如果通过，执行：
    git add ${output_dir}/
    git commit -m "后端开发: ${project_name} - 单测通过+Code Review通过 [AI@stage-07]"
    git push`,
    {
      label: 'quality-gate',
      phase: '质量门控',
      schema: {
        type: 'object',
        properties: {
          gatePassed: { type: 'boolean' },
          commitMessage: { type: 'string' },
          commitHash: { type: 'string' },
          blockReason: { type: 'string' },
        },
        required: ['gatePassed'],
      },
    }
  );

  if (gateResult.gatePassed) {
    log(`✅ 质量门控通过，已自动提交：${gateResult.commitHash}`);
  } else {
    log(`❌ 质量门控阻止提交：${gateResult.blockReason}`);
  }

  // Phase 8: 接口文档
  phase('接口文档');

  const apiDocumentation = await agent(
    `生成前端对接文档：

    项目：${project_name}
    开发结果：${JSON.stringify(developmentResult, null, 2)}
    输出目录：${frontend_doc_dir}

    请生成以下文档：
    1. API接口文档（按模块组织）
    2. 请求参数说明
    3. 响应数据结构
    4. 错误码说明
    5. 接口调用示例`,
    {
      label: 'api-doc',
      phase: '接口文档',
      schema: {
        type: 'object',
        properties: {
          generatedDocs: {
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
          totalApis: { type: 'number' },
        },
        required: ['generatedDocs', 'totalApis'],
      },
    }
  );

  log(`接口文档生成完成，共 ${apiDocumentation.totalApis} 个API`);

  return {
    projectName: project_name,
    outputDir: output_dir,
    frontendDocDir: frontend_doc_dir,
    docSync: docSync,
    developmentResult: developmentResult,
    testGeneration: testGeneration,
    testResult: testResult,
    testReport: testReport,
    codeReview: codeReview,
    gateResult: gateResult,
    apiDocumentation: apiDocumentation,
  };
}