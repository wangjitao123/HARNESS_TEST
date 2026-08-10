# Skill: import-prd（导入已有PRD）

## 基本信息

- **ID**: import-prd
- **名称**: 导入已有PRD
- **版本**: 1.0.0
- **分类**: analysis
- **部门**: 产品部
- **优先级**: P1
- **描述**: 从飞书/Wiki/外部链接导入已有PRD文档，AI解析提取功能点、用户故事、验收标准，自动生成REQ-ID（标记为legacy），输出标准格式PRD + req-matrix.json（需求部分）。

## 触发条件

- **命令**: `/import-prd`
- **关键词**: 导入PRD, 导入需求, 飞书PRD, Wiki导入, import-prd
- **patterns**:
  - 导入.*PRD
  - 飞书.*需求
  - 导入.*需求文档

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| source | string | 是 | PRD来源（飞书链接/Wiki链接/本地文件路径） | https://feishu.cn/docs/xxx 或 docs/old-prd.md |
| project_name | string | 是 | 项目名称 | HIS系统 |
| source_type | string | 否 | 来源类型：feishu/wiki/file/url，默认自动识别 | feishu |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 工作流程

1. **PRD获取阶段**
   - 根据source_type获取PRD原始内容
   - feishu/wiki/url → 使用WebFetch获取页面内容
   - file → 直接读取本地文件
   - 产出：原始PRD内容（文本/Markdown）

2. **PRD解析阶段**
   - AI解析PRD内容，提取：
     - 功能点列表（模块/子模块/功能）
     - 用户故事（如有）
     - 验收标准（如有）
     - 非功能需求
   - 识别PRD的文档结构，映射到标准PRD模板

3. **REQ-ID分配阶段**
   - 为每个功能点分配REQ-XXX ID
   - 标记来源为「legacy」（从外部PRD导入，非stage-01生成）
   - 生成req-matrix.json（需求部分，代码映射留空）

4. **标准格式转换阶段**
   - 将原始PRD内容转换到prd-template.md标准格式
   - 补齐缺失的章节（如追溯矩阵）
   - 保留原始PRD的链接引用

5. **人工确认阶段**
   - 向用户展示提取的功能点清单
   - 询问：「从PRD中提取了{n}个功能点，请确认是否准确」
   - 用户修正后更新

## 使用示例

### 示例1：从飞书导入

```bash
/import-prd --source "https://feishu.cn/docs/HIS系统PRD" --project_name "HIS系统" --source_type "feishu" --output_dir "docs/需求分析"
```

### 示例2：从本地文件导入

```bash
/import-prd --source "docs/old-prd/HIS需求文档.md" --project_name "HIS系统" --output_dir "docs/需求分析"
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| 标准PRD文档 | .md | {output_dir}/PRD-{project_name}.md |
| 追溯矩阵（需求部分） | .json | {output_dir}/req-matrix.json |
| 功能点清单 | .md | {output_dir}/功能清单-{project_name}.md |

## 注意事项

1. **飞书/Wiki需要URL可访问**：如果是私有文档，URL需有访问权限
2. **格式自适应**：AI会尝试解析各种格式的PRD（Markdown/HTML/纯文本）
3. **REQ-ID标记为legacy**：导入的需求点标记来源为legacy
4. **需后续执行diff-code-vs-prd**：导入后建议执行差异对比，找出代码与PRD的偏差

## 相关文档

- [diff-code-vs-prd](diff-code-vs-prd.skill.md) — 对比代码与PRD的差异（后置步骤）
- [req-matrix-build](req-matrix-build.skill.md) — 完整追溯链建立
