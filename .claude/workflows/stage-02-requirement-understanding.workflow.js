/**
 * 需求理解阶段工作流
 *
 * 功能描述：
 * - 读取 stage-01 产出的 PRD、功能点清单和原型
 * - 生成 BRD 业务需求文档
 * - 生成业务流程图
 * - 功能点细化描述
 * - 产出详细描述文档，按模块/子模块/功能点分类组织
 *
 * 注意：原型已在 stage-01 产出，本阶段不再生成原型
 *
 * 输入参数：
 * - project_name: 项目名称
 * - requirement_docs_dir: 需求分析文档目录（stage-01输出，绝对路径）
 * - output_dir: 输出目录（绝对路径）
 * - skill_dir: 产品技能目录（绝对路径）
 */

export const meta = {
  name: 'stage-02-requirement-understanding',
  description: '需求理解阶段：生成BRD+业务流程图+功能点细化（原型已在stage-01产出）',
  phases: [
    { title: '文档解析', detail: '解析 stage-01 产出的文档' },
    { title: 'BRD生成', detail: '生成业务需求文档' },
    { title: '模块划分', detail: '按模块/子模块组织功能结构' },
    { title: '流程设计', detail: '生成业务流程图' },
    { title: '功能点细化', detail: '功能点详细描述' },
    { title: '文档输出', detail: '按分类输出详细文档' },
  ],
};

export default async function (args) {
  const {
    project_name,
    requirement_docs_dir,
    output_dir = 'F:\\sandbox\\workflow\\2.0-用例\\项目管理样例\\02-开发库\\02-需求理解',
    skill_dir = 'F:\\sandbox\\workflow\\1.0-软件开发流程角色agent模型\\产品',
  } = args;

  // Phase 1: 文档解析
  phase('文档解析');

  const docsAnalysis = await agent(
    `解析 stage-01 产出的需求文档：

    目录路径：${requirement_docs_dir}

    请读取并分析：
    1. PRD文档
    2. 功能点清单（含MoSCoW优先级）
    3. 用户故事
    4. stage-01 产出的原型（docs/需求分析/prototype/）

    提取关键信息用于后续BRD和流程设计`,
    {
      label: 'parse-docs',
      phase: '文档解析',
      schema: {
        type: 'object',
        properties: {
          businessContext: { type: 'string' },
          modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                moduleId: { type: 'string' },
                moduleName: { type: 'string' },
                moduleCode: { type: 'string' },
                description: { type: 'string' },
                subModules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      subModuleId: { type: 'string' },
                      subModuleName: { type: 'string' },
                      features: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            featureId: { type: 'string' },
                            featureName: { type: 'string' },
                            description: { type: 'string' },
                            userRole: { type: 'string' },
                            moscowPriority: { type: 'string' },
                            complexity: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          userRoles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                roleId: { type: 'string' },
                roleName: { type: 'string' },
                permissions: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
        required: ['modules', 'userRoles'],
      },
    }
  );

  log(
    `文档解析完成，识别 ${docsAnalysis.modules?.length || 0} 个模块`
  );

  // Phase 2: BRD生成
  phase('BRD生成');

  const brdResult = await agent(
    `生成业务需求文档（BRD）：

    项目：${project_name}
    模块信息：${JSON.stringify(docsAnalysis.modules, null, 2)}
    用户角色：${JSON.stringify(docsAnalysis.userRoles, null, 2)}

    请使用以下技能模板：
    ${skill_dir}\\references\\brd-template.md

    要求：
    1. 按模块组织功能点（基于stage-01的MoSCoW优先级）
    2. 包含业务背景、目标、范围
    3. 定义业务规则和约束
    4. 包含验收标准
    5. 标注风险和假设`,
    {
      label: 'generate-brd',
      phase: 'BRD生成',
      schema: {
        type: 'object',
        properties: {
          brdContent: { type: 'string' },
          businessRules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ruleId: { type: 'string' },
                ruleName: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                riskId: { type: 'string' },
                riskDescription: { type: 'string' },
                mitigation: { type: 'string' },
              },
            },
          },
          assumptions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['brdContent', 'businessRules'],
      },
    }
  );

  log(`BRD生成完成，含 ${brdResult.businessRules?.length || 0} 条业务规则`);

  // Phase 3: 模块划分（构建目录结构）
  phase('模块划分');

  const moduleStructure = await agent(
    `根据模块信息设计文档目录结构：

    模块信息：${JSON.stringify(docsAnalysis.modules, null, 2)}

    要求：
    1. 每个模块独立目录
    2. 每个子模块独立子目录
    3. 按功能点或业务分类
    4. 不能全部塞一个文件夹

    输出目录结构设计`,
    {
      label: 'design-structure',
      phase: '模块划分',
      schema: {
        type: 'object',
        properties: {
          directoryStructure: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                description: { type: 'string' },
                documents: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
        required: ['directoryStructure'],
      },
    }
  );

  log('目录结构设计完成');

  // Phase 4: 流程设计（按模块并行，结合 stage-01 原型）
  phase('流程设计');

  const flowDesigns = await pipeline(
    docsAnalysis.modules || [],
    async (moduleInfo) => {
      return agent(
        `为模块设计业务流程图：

        模块：${moduleInfo.moduleName}
        子模块功能点：
        ${JSON.stringify(moduleInfo.subModules, null, 2)}

        用户角色：
        ${docsAnalysis.userRoles?.map((r) => `- ${r.roleName}`).join('\n') || '未定义'}

        请结合 stage-01 产出的原型进行流程细化，生成业务流程图描述，包含：
        1. 流程节点定义
        2. 节点间的流转条件
        3. 角色职责标注
        4. 异常处理分支

        使用Mermaid格式描述流程`,
        {
          label: `flow-${moduleInfo.moduleCode}`,
          phase: '流程设计',
          schema: {
            type: 'object',
            properties: {
              moduleId: { type: 'string' },
              moduleName: { type: 'string' },
              flows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    flowName: { type: 'string' },
                    flowCode: { type: 'string' },
                    description: { type: 'string' },
                    mermaidCode: { type: 'string' },
                    nodes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          nodeId: { type: 'string' },
                          nodeName: { type: 'string' },
                          nodeType: { type: 'string' },
                          responsibleRole: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            required: ['moduleId', 'flows'],
          },
        }
      );
    }
  );

  log(`流程设计完成，共 ${flowDesigns.filter(Boolean).length} 个模块`);

  // Phase 5: 功能点细化
  phase('功能点细化');

  const featureRefinements = await pipeline(
    docsAnalysis.modules || [],
    async (moduleInfo) => {
      return agent(
        `对模块功能点进行细化描述：

        模块：${moduleInfo.moduleName} (${moduleInfo.moduleCode})
        描述：${moduleInfo.description}

        子模块功能点：
        ${JSON.stringify(moduleInfo.subModules, null, 2)}

        业务流程图：
        ${JSON.stringify(flowDesigns.find(f => f?.moduleId === moduleInfo.moduleId)?.flows || [], null, 2)}

        业务规则：
        ${JSON.stringify(brdResult.businessRules || [], null, 2)}

        请对每个功能点进行细化描述，包含：
        1. 输入输出边界
        2. 前置/后置条件
        3. 与原型页面的对应关系
        4. 业务规则细化`,
        {
          label: `refine-${moduleInfo.moduleCode}`,
          phase: '功能点细化',
          schema: {
            type: 'object',
            properties: {
              moduleId: { type: 'string' },
              moduleName: { type: 'string' },
              refinedFeatures: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    featureId: { type: 'string' },
                    featureName: { type: 'string' },
                    inputOutput: { type: 'string' },
                    preCondition: { type: 'string' },
                    postCondition: { type: 'string' },
                    pageMapping: { type: 'string' },
                    businessRules: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
            required: ['moduleId', 'refinedFeatures'],
          },
        }
      );
    }
  );

  log(`功能点细化完成，共 ${featureRefinements.filter(Boolean).length} 个模块`);

  // Phase 6: 文档输出
  phase('文档输出');

  const outputDocs = await agent(
    `生成最终文档结构，按模块/子模块/功能点组织：

    目录结构：${JSON.stringify(moduleStructure.directoryStructure, null, 2)}

    流程设计：${JSON.stringify(flowDesigns.filter(Boolean), null, 2)}

    功能点细化：${JSON.stringify(featureRefinements.filter(Boolean), null, 2)}

    请生成完整的文档内容，确保：
    1. 输出BRD文档和业务规则文档
    2. 每个模块有独立目录
    3. 每个子模块有独立子目录
    4. 功能点按分类存放
    5. 包含README索引文件
    6. 不生成原型设计文档（原型已在 stage-01 产出）`,
    {
      label: 'output-docs',
      phase: '文档输出',
      schema: {
        type: 'object',
        properties: {
          totalDirectories: { type: 'number' },
          totalDocuments: { type: 'number' },
          documentList: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                title: { type: 'string' },
                type: { type: 'string' },
              },
            },
          },
        },
        required: ['totalDirectories', 'totalDocuments', 'documentList'],
      },
    }
  );

  log(
    `文档输出完成，共 ${outputDocs.totalDocuments} 个文档，${outputDocs.totalDirectories} 个目录`
  );

  return {
    projectName: project_name,
    outputDir: output_dir,
    brd: brdResult,
    moduleStructure: moduleStructure,
    flowDesigns: flowDesigns.filter(Boolean),
    featureRefinements: featureRefinements.filter(Boolean),
    outputDocs: outputDocs,
  };
}