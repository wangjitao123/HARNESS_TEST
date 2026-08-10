# Skill: req-matrix-build（建立REQ-ID追溯链）

## 基本信息

- **ID**: req-matrix-build
- **名称**: 建立REQ-ID追溯链
- **版本**: 1.0.0
- **分类**: process
- **部门**: 研发部
- **优先级**: P0
- **描述**: 为老项目建立REQ-ID追溯链，将现有API/表/功能点映射到REQ-ID，识别"有代码无需求"和"有需求无代码"的部分，输出追溯矩阵。

## 触发条件

- **命令**: `/req-matrix-build`
- **关键词**: 建立追溯链, 追溯矩阵, req-matrix, REQ-ID映射, 历史代码追溯
- **patterns**:
  - 建立.*追溯
  - 映射.*REQ
  - 历史.*追溯

## 输入参数

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| project_name | string | 是 | 项目名称 | HIS系统 |
| prd_doc | string | 否 | PRD文档路径（reverse-stage-01的产出） | docs/需求分析/PRD-HIS系统.md |
| api_doc | string | 否 | API文档路径 | docs/概要设计/api/API文档-HIS系统.md |
| db_design_doc | string | 否 | 数据库设计文档路径 | docs/概要设计/数据库设计/数据字典-HIS系统.md |
| code_dir | string | 否 | 代码目录（如无文档可直接扫描代码） | backend |
| output_dir | string | 否 | 输出目录（默认 docs/需求分析） | docs/需求分析 |

## 工作流程

1. **输入收集阶段**
   - 读取PRD文档（如有） → 提取已有REQ-ID和需求描述
   - 读取API文档（如有） → 提取接口列表
   - 读取数据库设计文档（如有） → 提取表清单
   - 若无文档但有code_dir → 扫描Controller和DO类提取接口和表

2. **REQ-ID映射阶段**
   - 将每个API接口映射到对应的REQ-ID
   - 将每个数据库表映射到对应的REQ-ID
   - 将每个代码文件（Controller/Service）映射到对应的REQ-ID
   - 对于PRD中已有的REQ-ID，直接关联
   - 对于PRD中没有的代码功能，标记为「legacy」并分配新REQ-ID

3. **差异识别阶段**
   - **有代码无需求**：代码中存在但PRD中没有 → 标记「待补需求」
   - **有需求无代码**：PRD中有但代码中没有 → 标记「已废弃/待清理」
   - **已对齐**：PRD和代码都有 → 标记「✅ 已对齐」

4. **追溯矩阵生成阶段**
   - 生成req-matrix.json（机器可读）
   - 生成追溯矩阵.md（人类可读）

## 输出格式

### req-matrix.json
```json
{
  "project_name": "HIS系统",
  "generated_at": "2026-08-07T12:00:00",
  "total_req": 50,
  "aligned": 35,
  "legacy_only": 10,
  "orphaned_req": 5,
  "items": [
    {
      "req_id": "REQ-001",
      "source": "prd",
      "description": "患者信息查询",
      "status": "aligned",
      "api": ["GET /his/patient/page"],
      "tables": ["his_patient"],
      "code_files": ["PatientController.java", "PatientServiceImpl.java"]
    },
    {
      "req_id": "REQ-LEGACY-001",
      "source": "legacy",
      "description": "（从代码反推）批量导入患者",
      "status": "legacy_only",
      "api": ["POST /his/patient/import"],
      "tables": ["his_patient"],
      "code_files": ["PatientController.java"],
      "note": "有代码无需求，待产品确认"
    },
    {
      "req_id": "REQ-005",
      "source": "prd",
      "description": "药品库存预警",
      "status": "orphaned_req",
      "api": [],
      "tables": [],
      "code_files": [],
      "note": "有需求无代码，可能已废弃或未实现"
    }
  ]
}
```

### 追溯矩阵.md
```markdown
# {project_name} 追溯矩阵

> 由 /req-matrix-build 生成，锁定追溯链基线。

## 统计概要
- 总需求数：{total}
- ✅ 已对齐：{aligned}（PRD↔代码双向对应）
- ⚠️ 待补需求：{legacy_only}（有代码无需求）
- ❌ 已废弃/待清理：{orphaned_req}（有需求无代码）

## 追溯明细

### ✅ 已对齐（{n}项）
| REQ-ID | 需求描述 | API接口 | 数据库表 | 代码文件 |
|--------|----------|---------|---------|---------|
| REQ-001 | 患者查询 | GET /his/patient/page | his_patient | PatientController |
| REQ-002 | 患者新增 | POST /his/patient/create | his_patient | PatientController |

### ⚠️ 待补需求（{n}项）
| REQ-ID | 代码推断描述 | API接口 | 数据库表 | 代码文件 | 处理建议 |
|--------|-----------|---------|---------|---------|---------|
| REQ-LEGACY-001 | 批量导入患者 | POST /his/patient/import | his_patient | PatientController | 待产品确认是否补录需求 |
| REQ-LEGACY-002 | 药品库存导出 | GET /his/drug/export | his_drug_stock | DrugController | 待产品确认 |

### ❌ 已废弃/待清理（{n}项）
| REQ-ID | 需求描述 | PRD位置 | 处理建议 |
|--------|----------|---------|---------|
| REQ-005 | 药品库存预警 | PRD第3.2节 | 确认是否废弃，或排期开发 |
```

## 使用示例

### 示例1：有reverse-stage-01和reverse-stage-05的产出

```bash
/req-matrix-build --project_name "HIS系统" --prd_doc "docs/需求分析/PRD-HIS系统.md" --api_doc "docs/概要设计/api/API文档-HIS系统.md" --db_design_doc "docs/概要设计/数据库设计/数据字典-HIS系统.md" --output_dir "docs/需求分析"
```

### 示例2：直接扫描代码（无设计文档）

```bash
/req-matrix-build --project_name "HIS系统" --code_dir "backend" --output_dir "docs/需求分析"
```

## 产出物清单

| 文档名称 | 文件格式 | 存放路径 |
|---------|---------|---------|
| 追溯矩阵（人类可读） | .md | {output_dir}/追溯矩阵-{project_name}.md |
| 追溯矩阵（机器可读） | .json | {output_dir}/req-matrix.json |

## 注意事项

1. **基线锁定**：req-matrix.json生成后即作为追溯链基线，后续增量变更时更新此文件
2. **legacy标记**：从代码反推的REQ-ID统一标记为REQ-LEGACY-XXX，区别于PRD正向定义的REQ-XXX
3. **需要人工确认**：待补需求和已废弃需求需产品+开发一起评审确认
4. **可重复执行**：每次执行会重新扫描代码和文档，更新追溯矩阵

## 相关文档

- [reverse-stage-05](reverse-stage-05.skill.md) — 从代码反向生成设计文档（前置）
- [reverse-stage-01](reverse-stage-01.skill.md) — 从代码反向生成PRD（前置）
- [diff-code-vs-prd](diff-code-vs-prd.skill.md) — 对比代码与PRD的差异（类似功能）
