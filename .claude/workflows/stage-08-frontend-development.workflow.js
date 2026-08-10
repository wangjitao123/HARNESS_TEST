/**
 * 前端开发阶段工作流
 *
 * 功能描述：
 * - 同步各阶段文档和接口文档
 * - 调用前端框架skill完成开发
 * - AI自动生成前端单元测试
 * - 执行单元测试 + 修复闭环
 * - 生成测试报告
 * - 执行Code Review
 * - 质量门控：单测通过 + Code Review通过 → 自动git commit
 *
 * 输入参数：
 * - project_name: 项目名称
 * - docs_dir: 各阶段文档目录（绝对路径）
 * - output_dir: 输出目录（绝对路径）
 * - frontend_skill_path: 前端框架skill路径（绝对路径）
 * - backend_doc_dir: 后端接口文档目录（绝对路径）
 */

export const meta = {
  name: 'stage-08-frontend-development',
  description: '前端开发：文档同步 + 代码开发 + AI单测+报告 + Code Review + 质量门控（通过后自动git commit）',
  phases: [
    { title: '文档同步', detail: '同步各阶段文档和接口文档' },
    { title: 'API层开发', detail: '生成API请求层代码' },
    { title: '页面开发', detail: '生成页面组件代码' },
    { title: 'AI单测生成', detail: 'AI自动生成前端单元测试' },
    { title: '单测执行+修复', detail: '执行测试并修复直到全部通过' },
    { title: '测试报告', detail: '生成测试报告' },
    { title: 'Code Review', detail: 'AI自动代码审查' },
    { title: '质量门控', detail: '单测+Review通过则自动git commit' },
  ],
};

export default async function (args) {
  const {
    project_name,
    docs_dir,
    output_dir,
    frontend_skill_path = 'F:\\projects\\yudao-ai-his-admin-ui\\yudao-ai-his-admin-ui\\CLAUDE.md',
    backend_doc_dir = 'F:\\projects\\yudao-ai-his-backend\\docs\\his',
  } = args;

  // Phase 1: 文档同步
  phase('文档同步');

  const docSync = await agent(
    `同步文档到前端开发目录：

    需求文档目录：${docs_dir}
    后端接口文档目录：${backend_doc_dir}

    请读取并整理：
    1. 需求分析文档（了解业务需求）
    2. stage-01 产出的原型（了解页面布局）
    3. 后端接口文档（对接API）
    4. 数据字典（枚举值）`,
    {
      label: 'sync-docs',
      phase: '文档同步',
      schema: {
        type: 'object',
        properties: {
          requirementDocs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                docName: { type: 'string' },
                keyPoints: { type: 'array', items: { type: 'string' } },
              },
            },
          },
          apiDocs: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                moduleName: { type: 'string' },
                apiCount: { type: 'number' },
                apis: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      apiName: { type: 'string' },
                      method: { type: 'string' },
                      path: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        required: ['apiDocs'],
      },
    }
  );

  log(`文档同步完成，读取 ${docSync.apiDocs?.length || 0} 个模块接口文档`);

  // Phase 2: API层开发
  phase('API层开发');

  const apiLayerResult = await agent(
    `调用前端框架skill生成API层代码：

    项目：${project_name}
    前端框架Skill路径：${frontend_skill_path}
    接口文档：${JSON.stringify(docSync.apiDocs, null, 2)}

    技术栈：Vue 3.5+ / TypeScript 5.9+ / Vben Admin
    目标路径：apps/web-antd/src/api/{module}/index.ts`,
    {
      label: 'api-layer-dev',
      phase: 'API层开发',
      schema: {
        type: 'object',
        properties: {
          generatedFiles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filePath: { type: 'string' },
                moduleName: { type: 'string' },
                apiCount: { type: 'number' },
              },
            },
          },
          totalApis: { type: 'number' },
          totalFiles: { type: 'number' },
        },
        required: ['generatedFiles', 'totalApis'],
      },
    }
  );

  log(`API层开发完成，生成 ${apiLayerResult.totalFiles} 个文件，${apiLayerResult.totalApis} 个API`);

  // Phase 3: 页面开发
  phase('页面开发');

  const pageLayerResult = await agent(
    `调用前端框架skill生成页面组件代码：

    项目：${project_name}
    前端框架Skill路径：${frontend_skill_path}
    需求文档：${JSON.stringify(docSync.requirementDocs, null, 2)}
    API层：${JSON.stringify(apiLayerResult.generatedFiles, null, 2)}

    请生成：
    1. 列表页（表格、搜索、操作按钮）
    2. 表单弹窗（新增/编辑）
    3. 详情页（数据展示）
    4. 路由配置

    技术栈：Vue 3.5+ / TypeScript / Ant Design Vue 4.x / VxeTable`,
    {
      label: 'page-layer-dev',
      phase: '页面开发',
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
              },
            },
          },
          totalPages: { type: 'number' },
          totalFiles: { type: 'number' },
        },
        required: ['generatedFiles', 'totalFiles'],
      },
    }
  );

  log(`页面开发完成，生成 ${pageLayerResult.totalFiles} 个文件，${pageLayerResult.totalPages} 个页面`);

  // Phase 4: AI单元测试生成
  phase('AI单测生成');

  const allGeneratedFiles = [
    ...(apiLayerResult.generatedFiles || []),
    ...(pageLayerResult.generatedFiles || []),
  ];

  const testGeneration = await agent(
    `为生成的前端代码自动生成单元测试：

    生成的文件列表：
    ${JSON.stringify(allGeneratedFiles, null, 2)}

    项目路径：${output_dir}

    要求：
    1. 为每个组件生成渲染测试（Vitest + Vue Test Utils）
    2. 为API函数生成调用测试
    3. 测试覆盖正常场景、边界场景、异常场景
    4. 测试文件存放在 src/__tests__/ 对应目录
    5. 测试文件命名：{name}.test.ts`,
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
                targetComponent: { type: 'string' },
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

  // Phase 5: 单元测试执行与修复闭环
  phase('单测执行+修复');

  let testPassed = false;
  let testRetryCount = 0;
  const maxTestRetries = 5;
  let testResult;

  while (testRetryCount < maxTestRetries) {
    testResult = await agent(
      `执行前端单元测试并分析结果：

      项目路径：${output_dir}
      执行命令：npx vitest run

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

  // Phase 6: 测试报告
  phase('测试报告');

  const testReport = await agent(
    `生成前端测试报告：

    测试结果：${JSON.stringify(testResult, null, 2)}
    项目：${project_name}

    报告内容：
    1. 测试总览：总用例数、通过数、失败数、覆盖率
    2. 按模块分组：各模块测试通过率

    输出文件：docs/test-report-${project_name}-frontend.md`,
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

  // Phase 7: Code Review
  phase('Code Review');

  const codeReview = await agent(
    `对生成的前端代码进行Code Review：

    项目路径：${output_dir}
    生成的文件：${JSON.stringify(allGeneratedFiles, null, 2)}

    检查维度：
    1. 代码规范（命名、组件结构、TypeScript类型）
    2. 性能问题（大列表未虚拟滚动、未懒加载等）
    3. 安全漏洞（XSS、敏感信息泄露等）
    4. 可访问性（aria标签、键盘导航等）

    输出文件：docs/code-review-${project_name}-frontend.md`,
    {
      label: 'code-review',
      phase: 'Code Review',
      schema: {
        type: 'object',
        properties: {
          reviewPassed: { type: 'boolean' },
          totalIssues: { type: 'number' },
          criticalIssues: { type: 'number' },
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

  // Phase 8: 质量门控与自动提交
  phase('质量门控');

  const gateResult = await agent(
    `质量门控判断：

    单元测试：${testPassed ? '✅ 全部通过' : '❌ 有失败'}
    Code Review：${codeReview.reviewPassed ? '✅ 通过' : '❌ 不通过'}

    判断逻辑：
    - 两个条件都满足 → 执行 git add frontend/ + git commit + git push
    - 任一不满足 → 阻止提交，输出失败原因

    如果通过，执行：
    git add ${output_dir}/
    git commit -m "前端开发: ${project_name} - 单测通过+Code Review通过 [AI@stage-08]"
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

  return {
    projectName: project_name,
    outputDir: output_dir,
    docSync: docSync,
    apiLayerResult: apiLayerResult,
    pageLayerResult: pageLayerResult,
    testGeneration: testGeneration,
    testResult: testResult,
    testReport: testReport,
    codeReview: codeReview,
    gateResult: gateResult,
  };
}