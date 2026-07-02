<template>
  <div class="cockpit" v-loading="loading">
    <div class="page-header">
      <h2><b>数据安全驾驶舱</b></h2>
      <div class="header-operations">
        <label class="form-label">所属标准</label>
        <el-select v-model="categoryId" placeholder="所属标准" size="small" class="standard-select">
          <el-option v-for="item in standardOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>

    <el-row :gutter="16" class="section top-section" type="flex" align="stretch">
      <el-col :span="18">
        <el-row :gutter="16" type="flex" align="stretch" class="top-left-row">
          <el-col :span="8" class="top-col">
            <el-card class="panel-card top-card hoverable" shadow="never">
              <div class="top-card-header">
                <div class="top-card-icon top-card-icon-blue">
                  <i class="el-icon-s-operation"></i>
                </div>
                <div class="top-card-head">
                  <div class="top-card-title">数据总量</div>
                  <div class="top-card-sub">当前纳管数据资产规模</div>
                </div>
              </div>
              <div class="summary-metrics">
                <div class="summary-metric">
                  <div class="summary-value">
                    <count-to :start-val="0" :end-val="topData.summary.objectCount" :duration="1500" />
                  </div>
                  <div class="summary-key">纳管对象</div>
                  <div class="summary-subkey">字段+文件</div>
                </div>
                <div class="summary-metric">
                  <div class="summary-value">
                    <count-to :start-val="0" :end-val="topData.summary.capacityGB" :duration="1500" />
                    <span class="summary-unit">GB</span>
                  </div>
                  <div class="summary-key">总容量</div>
                  <div class="summary-subkey">存储占用</div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="16" class="top-col">
            <el-card class="panel-card top-card hoverable source-combined-card" shadow="never">
              <div class="source-split">
                <div class="source-pane">
                  <div class="top-card-header">
                    <div class="top-card-icon top-card-icon-gray">
                      <i class="el-icon-coin"></i>
                    </div>
                    <div class="top-card-head">
                      <div class="top-card-title">结构化数据源</div>
                    </div>
                  </div>
                  <div class="source-main">
                    <div class="source-main-value">
                      <count-to :start-val="0" :end-val="topData.structured.sourceCount" :duration="1500" />
                      <span class="source-unit">个</span>
                    </div>
                    <div class="source-sub">
                      {{ topData.structured.sizeGB }}GB · {{ topData.structured.fieldCount }}字段
                    </div>
                  </div>
                  <div class="badge-row">
                    <span class="warn-badge">
                      <span class="warn-dot"></span>
                      {{ topData.structured.sensitiveLabel }} {{ topData.structured.sensitivePercent }}%
                    </span>
                  </div>
                </div>
                <div class="source-divider"></div>
                <div class="source-pane">
                  <div class="top-card-header">
                    <div class="top-card-icon top-card-icon-gray">
                      <i class="el-icon-folder"></i>
                    </div>
                    <div class="top-card-head">
                      <div class="top-card-title">非结构化数据源</div>
                    </div>
                  </div>
                  <div class="source-main">
                    <div class="source-main-value">
                      <count-to :start-val="0" :end-val="topData.unstructured.sourceCount" :duration="1500" />
                      <span class="source-unit">个</span>
                    </div>
                    <div class="source-sub">
                      {{ topData.unstructured.sizeGB }}GB · {{ topData.unstructured.fileCount }}个文件
                    </div>
                  </div>
                  <div class="badge-row">
                    <span class="warn-badge">
                      <span class="warn-dot"></span>
                      {{ topData.unstructured.sensitiveLabel }} {{ topData.unstructured.sensitivePercent }}%
                    </span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <el-col :span="6" class="top-right-col">
        <div class="top-right-stack">
          <el-card v-for="(item, idx) in topData.rightCards" :key="idx" class="panel-card mini-stat-card hoverable"
            shadow="never">
            <div class="mini-stat">
              <div class="mini-left">
                <div class="mini-brand">
                  <div class="mini-icon" :style="{ color: item.iconColor }">
                    <svg-icon :icon-class="item.iconSvg" class-name="mini-svg" />
                  </div>
                  <div class="mini-model">{{ item.model }}</div>
                </div>
                <div class="mini-info">
                  <div class="mini-title">{{ item.title }}</div>
                  <div class="mini-desc">{{ item.modelDesc }}</div>
                </div>
              </div>
              <div class="mini-value">
                <count-to :start-val="0" :end-val="item.value" :duration="1500" />
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section middle-section" type="flex" align="stretch">
      <el-col :span="12" class="middle-col">
        <el-card ref="assetMapCard" class="panel-card hoverable" shadow="never">
          <div slot="header" class="panel-header">
            <div class="panel-title">
              数据资产地图<span v-if="mapDrillTitle" class="panel-path"> / {{ mapDrillTitle }}</span>
            </div>
            <div class="panel-actions">
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-dot blue"></span>
                  <span>数据占比</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot red"></span>
                  <span>敏感数据占比</span>
                </div>
              </div>
              <el-button v-if="mapDrillTitle" type="primary" plain size="small" icon="el-icon-arrow-left"
                @click="handleMapBack" style="border-radius: 10px;">
                返回
              </el-button>
            </div>
          </div>

          <div class="asset-map-body" :style="middleBodyStyle">
            <div class="asset-tile-grid">
              <div v-for="item in currentMapTiles" :key="item.id" class="asset-tile hoverable-tile"
                @click="handleMapTileClick(item)">
                <div class="tile-title">{{ item.title }}</div>
                <div class="tile-ratios">
                  <div class="tile-ratio">
                    <span class="tile-ratio-value tile-blue">{{ item.ratio }}%</span>
                  </div>
                  <div class="tile-ratio">
                    <span class="tile-ratio-value tile-red">{{ item.sensitiveRatio }}%</span>
                  </div>
                </div>
                <div class="tile-desc">{{ item.desc }}</div>
                <div class="tile-footer">
                  <div class="tile-tags">
                    <span v-for="(tag, tIdx) in item.sourceTags" :key="tIdx" class="source-tag">
                      {{ tag.label }}
                    </span>
                    <span v-if="item.moreCount" class="more-tag">+{{ item.moreCount }}</span>
                  </div>
                  <div class="tile-arrow">
                    <i class="el-icon-arrow-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="middle-col">
        <el-card ref="levelCard" class="panel-card hoverable" shadow="never">
          <div slot="header" class="panel-header">
            <div class="panel-title">数据等级分布</div>
            <div class="panel-actions">
              <span class="hint-badge">
                <span class="warn-dot orange"></span>
                {{ middleData.levelDistribution.hint }}
              </span>
            </div>
          </div>

          <div class="level-dist" :style="middleBodyStyle">
            <div class="level-bars">
              <div ref="levelChart" class="level-chart"></div>
              <div class="chart-tip">点击条形图筛选右侧表格</div>
            </div>

            <div class="level-table">
              <div class="level-table-head">
                <div class="level-table-title">分类明细</div>
                <span class="level-table-tag">{{ currentLevel.name }}</span>
              </div>

              <el-table :data="currentLevel.details" size="mini" height="100%" class="cockpit-table"
                :header-cell-style="{ background: '#f7f9fc' }">
                <el-table-column prop="category" label="数据类别" min-width="120" />
                <el-table-column prop="count" label="数量" width="90" />
                <el-table-column label="占比" width="70">
                  <template slot-scope="{ row }">
                    <span class="ratio-text">{{ row.ratio }}%</span>
                  </template>
                </el-table-column>
                <el-table-column label="数据源" min-width="140">
                  <template slot-scope="{ row }">
                    <div class="table-sources">
                      <span v-for="(s, sIdx) in row.sources" :key="sIdx" class="table-source-tag">{{ s.label }}</span>
                      <span v-if="row.moreCount" class="table-more-tag">+{{ row.moreCount }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="panel-card hoverable section bottom-section" shadow="never">
      <div slot="header" class="panel-header">
        <div class="panel-title">{{ bottomData.title }}</div>
      </div>
      <el-table :data="bottomData.rows" class="cockpit-table risk-table" :header-cell-style="{ background: '#f7f9fc' }">
        <el-table-column label="数据源名称" min-width="210">
          <template slot-scope="{ row }">
            <div class="source-name-cell">
              <div class="source-icon">
                <i class="el-icon-s-management"></i>
              </div>
              <el-link type="primary" :underline="false" class="source-link" @click="handleSourceClick(row)">{{
                row.sourceName }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="系统名称" width="110">
          <template slot-scope="{ row }">
            <span class="system-pill"><i class="el-icon-sunny"></i> {{ row.systemName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="风险统计" min-width="260">
          <template slot-scope="{ row }">
            <div class="risk-tags">
              <el-tag v-for="(t, idx) in row.riskStats" :key="idx" class="risk-level-tag"
                :style="getHomeRiskStyle(t.level)">
                {{ t.label }} * {{ t.value }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数据安全负责部门" min-width="180">
          <template slot-scope="{ row }">
            <div class="dept-cell">
              <i class="el-icon-office-building"></i>
              <span>{{ row.dept }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="负责人" width="110">
          <template slot-scope="{ row }">
            <div class="owner-cell">
              <span class="owner-avatar">{{ (row.owner || '').slice(0, 1) }}</span>
              <span>{{ row.owner }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template slot-scope="{ row }">
            <el-button class="action-btn" @click="handleCompleteList(row)">完整清单 <i
                class="el-icon-arrow-right"></i></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import CountTo from 'vue-count-to'
import * as echarts from 'echarts'
import { getFrameworks } from '@/api/system/protectCategory'
const topData = {
  "summary": {
    "objectCount": 1000,
    "capacityGB": 20
  },
  "structured": {
    "sourceCount": 10,
    "sizeGB": 5,
    "fieldCount": 800,
    "sensitiveLabel": "敏感字段",
    "sensitivePercent": 60
  },
  "unstructured": {
    "sourceCount": 5,
    "sizeGB": 15,
    "fileCount": 200,
    "sensitiveLabel": "敏感文件",
    "sensitivePercent": 60
  },
  "rightCards": [
    {
      "title": "识别数量",
      "iconSvg": "qwen",
      "iconColor": "#5b5cf6",
      "model": "QWen",
      "modelDesc": "由Qwen完成",
      "value": 1000
    },
    {
      "title": "审查数量",
      "iconSvg": "deepseek",
      "iconColor": "#5b5cf6",
      "model": "deepseek",
      "modelDesc": "由Deepseek完成",
      "value": 500
    }
  ]
}

const middleData = {
  "assetMap": {
    "tabs": [
      { "label": "数据占比", "value": "ratio" },
      { "label": "敏感数据占比", "value": "sensitiveRatio" }
    ],
    "root": [
      {
        "id": "customer",
        "title": "客户",
        "ratio": 20,
        "sensitiveRatio": 12,
        "desc": "子类：个人客户信息管理、单位客户档案维护、VIP客户分级标签",
        "sourceTags": [{ "label": "demo_sdd_202..." }],
        "moreCount": 2
      },
      {
        "id": "operation",
        "title": "经营管理",
        "ratio": 10,
        "sensitiveRatio": 6,
        "desc": "子类：财务报表核算系统、人力资源员工档案库、年度预算编制平台",
        "sourceTags": [{ "label": "prod_mysql_cr..." }],
        "moreCount": 1
      },
      {
        "id": "supervision",
        "title": "监管",
        "ratio": 15,
        "sensitiveRatio": 10,
        "desc": "子类：监管审计报送接口、合规审查记录库、反洗钱交易监测",
        "sourceTags": [{ "label": "dw_hive_us..." }],
        "moreCount": 1
      },
      {
        "id": "risk",
        "title": "风控",
        "ratio": 12,
        "sensitiveRatio": 8,
        "desc": "子类：反欺诈模型训练数据集、信用评分模型训练集、风险预警告警库",
        "sourceTags": [{ "label": "demo_sdd_202..." }],
        "moreCount": 1
      },
      {
        "id": "marketing",
        "title": "营销",
        "ratio": 8,
        "sensitiveRatio": 4,
        "desc": "子类：精准投放用户画像、多渠道触达记录、营销活动效果分析",
        "sourceTags": [{ "label": "prod_mysql_cr..." }],
        "moreCount": 1
      },
      {
        "id": "product",
        "title": "产品",
        "ratio": 14,
        "sensitiveRatio": 5,
        "desc": "子类：产品功能埋点数据集、用户行为路径分析、AB实验分流记录",
        "sourceTags": [{ "label": "demo_sdd_202..." }],
        "moreCount": 1
      },
      {
        "id": "dev",
        "title": "研发",
        "ratio": 9,
        "sensitiveRatio": 3,
        "desc": "子类：测试环境脱敏数据集、系统运行日志归档、CI/CD构建产物",
        "sourceTags": [{ "label": "demo_sdd_202..." }],
        "moreCount": 1
      },
      {
        "id": "legal",
        "title": "法务",
        "ratio": 7,
        "sensitiveRatio": 5,
        "desc": "子类：合同全生命周期管理库、知识产权登记系统、诉讼案件事实库",
        "sourceTags": [{ "label": "prod_mysql_cr..." }],
        "moreCount": 1
      },
      {
        "id": "ops",
        "title": "运维",
        "ratio": 5,
        "sensitiveRatio": 1,
        "desc": "子类：服务器监控指标库、告警事件处置记录、资源配置管理台账",
        "sourceTags": [{ "label": "dw_hive_us..." }],
        "moreCount": 1
      }
    ],
    "children": {
      "risk": [
        {
          "id": "risk_1",
          "title": "反欺诈",
          "ratio": 24,
          "sensitiveRatio": 12,
          "desc": "子类：交易反欺诈识别、设备指纹画像库、黑名单名单库",
          "sourceTags": [{ "label": "demo_sdd_202..." }],
          "moreCount": 1
        },
        {
          "id": "risk_2",
          "title": "信用评估",
          "ratio": 18,
          "sensitiveRatio": 9,
          "desc": "子类：授信审批数据集、贷后监控指标库、风险定价模型库",
          "sourceTags": [{ "label": "prod_mysql_cr..." }],
          "moreCount": 1
        },
        {
          "id": "risk_3",
          "title": "预警告警",
          "ratio": 12,
          "sensitiveRatio": 6,
          "desc": "子类：实时告警事件、规则命中记录、处置闭环追踪",
          "sourceTags": [{ "label": "dw_hive_us..." }],
          "moreCount": 2
        }
      ]
    }
  },
  "levelDistribution": {
    "hint": "敏感分级：1级 · 2级 · 3级 · 4级 · 5级",
    "levels": [
      {
        "name": "5级-国家安全数据",
        "value": 50,
        "tooltip": "5级-国家安全数据\n50 项 | 点击查看详情",
        "details": [
          {
            "category": "国家安全数据",
            "count": 12300,
            "ratio": 42,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 3
          },
          {
            "category": "军事保密信息",
            "count": 8900,
            "ratio": 30,
            "sources": [{ "label": "prod_mysql..." }],
            "moreCount": 2
          },
          {
            "category": "核心商业机密",
            "count": 5600,
            "ratio": 19,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "密码密钥信息",
            "count": 1950,
            "ratio": 7,
            "sources": [{ "label": "mdm_cust..." }],
            "moreCount": 1
          },
          {
            "category": "关键设施数据",
            "count": 580,
            "ratio": 2,
            "sources": [{ "label": "dw_hive..." }],
            "moreCount": 1
          }
        ]
      },
      {
        "name": "4级-高度敏感数据",
        "value": 28,
        "tooltip": "4级-高度敏感数据\n28 项 | 点击查看详情",
        "details": [
          {
            "category": "个人身份信息",
            "count": 6800,
            "ratio": 35,
            "sources": [{ "label": "crm_sens..." }],
            "moreCount": 2
          },
          {
            "category": "财务结算信息",
            "count": 5200,
            "ratio": 27,
            "sources": [{ "label": "prod_mysql..." }],
            "moreCount": 2
          },
          {
            "category": "授信审批材料",
            "count": 4100,
            "ratio": 21,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "风控策略规则",
            "count": 2850,
            "ratio": 15,
            "sources": [{ "label": "dw_hive..." }],
            "moreCount": 1
          },
          {
            "category": "账号认证信息",
            "count": 360,
            "ratio": 2,
            "sources": [{ "label": "iam_auth..." }],
            "moreCount": 1
          }
        ]
      },
      {
        "name": "3级-敏感数据",
        "value": 22,
        "tooltip": "3级-敏感数据\n22 项 | 点击查看详情",
        "details": [
          {
            "category": "营销触达记录",
            "count": 7200,
            "ratio": 40,
            "sources": [{ "label": "mkt_call..." }],
            "moreCount": 2
          },
          {
            "category": "用户行为日志",
            "count": 5400,
            "ratio": 30,
            "sources": [{ "label": "dw_hive..." }],
            "moreCount": 2
          },
          {
            "category": "产品埋点数据",
            "count": 3200,
            "ratio": 18,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "审计追踪记录",
            "count": 1500,
            "ratio": 8,
            "sources": [{ "label": "audit_log..." }],
            "moreCount": 1
          },
          {
            "category": "运维告警事件",
            "count": 600,
            "ratio": 4,
            "sources": [{ "label": "ops_mon..." }],
            "moreCount": 1
          }
        ]
      },
      {
        "name": "2级-内部数据",
        "value": 16,
        "tooltip": "2级-内部数据\n16 项 | 点击查看详情",
        "details": [
          {
            "category": "内部流程数据",
            "count": 520,
            "ratio": 32,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "一般业务数据",
            "count": 460,
            "ratio": 28,
            "sources": [{ "label": "prod_mysql..." }],
            "moreCount": 1
          },
          {
            "category": "服务日志记录",
            "count": 320,
            "ratio": 20,
            "sources": [{ "label": "dw_hive..." }],
            "moreCount": 1
          },
          {
            "category": "系统配置数据",
            "count": 230,
            "ratio": 14,
            "sources": [{ "label": "mdm_cust..." }],
            "moreCount": 1
          },
          {
            "category": "其他内部数据",
            "count": 90,
            "ratio": 6,
            "sources": [{ "label": "ops_mon..." }],
            "moreCount": 1
          }
        ]
      },
      {
        "name": "1级-公开数据",
        "value": 8,
        "tooltip": "1级-公开数据\n8 项 | 点击查看详情",
        "details": [
          {
            "category": "设备指纹信息",
            "count": 120,
            "ratio": 24,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "网络标识信息",
            "count": 100,
            "ratio": 20,
            "sources": [{ "label": "demo_sdd..." }],
            "moreCount": 1
          },
          {
            "category": "服务使用记录",
            "count": 98,
            "ratio": 20,
            "sources": [{ "label": "prod_mysql..." }],
            "moreCount": 1
          },
          {
            "category": "系统日志信息",
            "count": 85,
            "ratio": 17,
            "sources": [{ "label": "dw_hive..." }],
            "moreCount": 1
          },
          {
            "category": "基础配置信息",
            "count": 75,
            "ratio": 15,
            "sources": [{ "label": "mdm_cust..." }],
            "moreCount": 1
          }
        ]
      }
    ]
  }
}


const bottomData = {
  "title": "敏感数据风险清单",
  "rows": [
    {
      "sourceName": "demo_sdd_202592390293",
      "systemName": "API",
      "riskStats": [
        { "label": "4级-重要数据", "value": 10, "level": 4 },
        { "label": "3级-内部敏感", "value": 2, "level": 3 },
        { "label": "2级-内部一般", "value": 2, "level": 2 }
      ],
      "moreRiskCount": 1,
      "dept": "数据安全部",
      "owner": "张三"
    },
    {
      "sourceName": "crm_sensitive_profile_202406",
      "systemName": "CRM",
      "riskStats": [
        { "label": "4级-重要数据", "value": 6, "level": 4 },
        { "label": "3级-内部敏感", "value": 5, "level": 3 },
        { "label": "2级-内部一般", "value": 3, "level": 2 }
      ],
      "moreRiskCount": 1,
      "dept": "客户运营部",
      "owner": "李敏"
    },
    {
      "sourceName": "dw_finance_core_asset_202405",
      "systemName": "DWH",
      "riskStats": [
        { "label": "4级-重要数据", "value": 8, "level": 4 },
        { "label": "3级-内部敏感", "value": 4, "level": 3 },
        { "label": "2级-内部一般", "value": 1, "level": 2 }
      ],
      "moreRiskCount": 1,
      "dept": "财务管理部",
      "owner": "王强"
    }
  ]
}



export default {
  name: 'Dashboard',
  components: {
    CountTo
  },
  data() {
    return {
      loading: false,
      categoryId: '',
      standardOptions: [],
      topData,
      middleData,
      bottomData,
      mapDrillId: '',
      mapDrillTitle: '',
      selectedLevelIndex: 0,
      middleBodyHeight: 0,
      charts: {
        level: null
      }
    }
  },
  computed: {
    currentMapTiles() {
      const children = (this.middleData.assetMap.children || {})[this.mapDrillId]
      if (this.mapDrillId && Array.isArray(children)) return children
      return this.middleData.assetMap.root || []
    },
    maxLevelValue() {
      const list = this.middleData.levelDistribution.levels || []
      let max = 0
      list.forEach(i => {
        const v = Number(i.value) || 0
        if (v > max) max = v
      })
      return max || 1
    },
    currentLevel() {
      const list = this.middleData.levelDistribution.levels || []
      return list[this.selectedLevelIndex] || { name: '', details: [] }
    },
    middleBodyStyle() {
      if (!this.middleBodyHeight) return {}
      return {
        height: `${this.middleBodyHeight}px`
      }
    }
  },
  watch: {
    categoryId() {
      this.handleCategoryChange()
    },
    selectedLevelIndex() {
      this.updateLevelChart()
    }
  },
  mounted() {
    this.fetchFrameworkOptions()
    this.$nextTick(() => {
      this.syncMiddleBodyHeight()
      this.initLevelChart()
      window.addEventListener('resize', this.handleResize)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.charts.level) this.charts.level.dispose()
  },
  methods: {
    fetchFrameworkOptions() {
      getFrameworks().then((response) => {
        const list = (response && response.data) ? response.data : []
        this.standardOptions = list.map(it => ({
          value: String(it.id),
          label: it.categoryName
        }))
        if (!this.categoryId && this.standardOptions.length) {
          this.categoryId = String(this.standardOptions[0].value)
        }
      })
    },
    handleCategoryChange() {
      this.mapDrillId = ''
      this.mapDrillTitle = ''
      this.selectedLevelIndex = 0
    },
    handleMapTileClick(item) {
      const children = (this.middleData.assetMap.children || {})[item.id]
      if (Array.isArray(children) && children.length) {
        this.mapDrillId = item.id
        this.mapDrillTitle = item.title
      }
    },
    handleMapBack() {
      this.mapDrillId = ''
      this.mapDrillTitle = ''
    },
    handleSelectLevel(idx) {
      this.selectedLevelIndex = idx
    },
    initLevelChart() {
      const dom = this.$refs.levelChart
      if (!dom) return
      if (this.charts.level) this.charts.level.dispose()
      const chart = echarts.init(dom)
      this.charts.level = chart
      chart.off('click')
      chart.on('click', (params) => {
        if (typeof params.dataIndex === 'number') this.handleSelectLevel(params.dataIndex)
      })
      this.updateLevelChart()
    },
    syncMiddleBodyHeight() {
      const card = this.$refs.levelCard && this.$refs.levelCard.$el
      if (!card) return
      const header = card.querySelector('.el-card__header')
      const cardHeight = card.clientHeight || 0
      const headerHeight = header ? header.offsetHeight : 0
      const bodyPadding = 32
      const nextHeight = Math.max(cardHeight - headerHeight - bodyPadding, 0)
      this.middleBodyHeight = nextHeight
      this.$nextTick(() => {
        if (this.charts.level) this.charts.level.resize()
      })
    },
    updateLevelChart() {
      if (!this.charts.level) return
      const levels = this.middleData.levelDistribution.levels || []
      const names = levels.map(i => i.name)
      const values = levels.map(i => Number(i.value) || 0)
      const max = this.maxLevelValue
      this.charts.level.setOption({
        grid: { left: '6%', right: '4%', top: '10%', bottom: '10%', containLabel: true },
        tooltip: {
          trigger: 'item',
          formatter: (p) => {
            const item = levels[p.dataIndex] || {}
            const levelName = item.name || p.name || ''
            const value = Number(item.value != null ? item.value : p.value) || 0
            return `${levelName}<br/>${value} 项 | 点击查看详情`
          }
        },
        xAxis: {
          type: 'value',
          max,
          splitNumber: 5,
          axisLabel: { color: '#98a2b3' },
          axisLine: { lineStyle: { color: '#eef0f6' } },
          splitLine: { lineStyle: { color: '#eef0f6' } }
        },
        yAxis: {
          type: 'category',
          data: names,
          inverse: true,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { show: false }
        },
        series: [
          {
            type: 'bar',
            data: values,
            barWidth: 18,
            itemStyle: {
              borderRadius: [6, 6, 6, 6],
              color: (p) => (p.dataIndex === this.selectedLevelIndex ? '#5b5cf6' : '#d9dde6')
            },
            label: {
              show: true,
              position: [0, -18],
              distance: 0,
              align: 'left',
              verticalAlign: 'bottom',
              color: '#2c3e50',
              fontWeight: 700,
              fontSize: 12,
              formatter: (p) => p.name
            }
          }
        ]
      })
    },
    handleResize() {
      this.syncMiddleBodyHeight()
    },
    getHomeRiskStyle(level) {
      const styles = {
        1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
        2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
        3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
        4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
        5: { color: '#7c3aed', backgroundColor: '#f3e8ff', border: 'none' }
      }
      return styles[level] || { color: '#64748b', backgroundColor: '#f8fafc', border: 'none' }
    },
    handleSourceClick() {
    },
    handleCompleteList() {
    }
  }
}
</script>

<style lang="scss" scoped>
.cockpit {
  padding: 40px;
  background: #f5f7fb;
}

.section {
  margin-bottom: 16px;
}

.middle-section {
  height: clamp(28rem, 60vh, 42rem);
  overflow: hidden;
}

.top-section {
  align-items: stretch;
}

.top-left-row {
  height: 100%;
}

.top-col {
  display: flex;
}

.top-right-col {
  display: flex;
}

.top-right-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.middle-col {
  display: flex;
  height: 100%;
  min-height: 0;
}

.middle-col>.panel-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.middle-col>.panel-card>>>.el-card__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.panel-card {
  border-radius: 12px;
  border: 1px solid rgba(225, 232, 245, 0.8);
  box-shadow: 0 2px 10px rgba(16, 24, 40, 0.04);
}

.panel-card>>>.el-card__body {
  padding: 16px;
}

.panel-card>>>.el-card__header {
  border-bottom: none;
  padding: 14px 16px 10px;
}

.hoverable {
  transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.hoverable:hover {
  box-shadow: 0 10px 26px rgba(18, 27, 66, 0.10);
  border-color: rgba(171, 195, 255, 0.65);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222;
}

.form-label {
  font-weight: 600;
  color: #26244ce0;
  font-size: 14px;
  margin-right: 10px;
}

.header-operations {
  display: flex;
  align-items: center;
}

.standard-select {
  width: 240px;
}

.top-section .panel-card>>>.el-card__body {
  padding: 18px 18px 14px;
}

.top-card {
  flex: 1;
  height: 100%;
}

.top-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.top-card-icon-blue {
  background: #eef5ff;
  color: #3b82f6;
}

.top-card-icon-gray {
  background: #f4f7ff;
  color: #2c3e50;
}

.top-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #15162b;
  line-height: 1.2;
}

.top-card-sub {
  margin-top: 4px;
  font-size: 12px;
  color: #7b879f;
}

.summary-metrics {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-value {
  font-size: 24px;
  font-weight: 800;
  color: #222;
  line-height: 1;
}

.summary-unit {
  font-size: 14px;
  font-weight: 700;
  margin-left: 4px;
  color: #222;
}

.summary-key {
  margin-top: 20px;
  font-size: 12px;
  color: #1f2a44;
  font-weight: 700;
}

.summary-subkey {
  margin-top: 2px;
  font-size: 12px;
  color: #90a0b7;
}

.source-main {
  margin-top: 14px;
}

.source-split {
  height: 100%;
  display: flex;
  align-items: stretch;
}

.source-pane {
  flex: 1;
  min-width: 0;
  padding: 0 1.2rem;
  display: flex;
  flex-direction: column;
}

.source-pane:first-child {
  padding-left: 0;
}

.source-pane:last-child {
  padding-right: 0;
}

.source-divider {
  width: 1px;
  background: #eef0f6;
  align-self: stretch;
  margin: 0 0.2rem;
}

.source-main-value {
  font-size: 28px;
  font-weight: 800;
  color: #15162b;
  line-height: 1;
}

.source-unit {
  font-size: 12px;
  font-weight: 700;
  margin-left: 4px;
  color: #15162b;
}

.source-arrow {
  font-size: 12px;
  margin-left: 2px;
  color: #15162b;
}

.source-sub {
  margin-top: 8px;
  font-size: 12px;
  color: #6c7a90;
}

.badge-row {
  margin-top: 12px;
}

.warn-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 18px;
  background: #fff4f4;
  color: #ff4d4f;
  font-size: 12px;
  font-weight: 700;
}

.warn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4d4f;
}

.warn-dot.orange {
  background: #c2410c;
}

.mini-stat-card {
  flex: 1;
  height: 100%;
}

.mini-stat-card>>>.el-card__body {
  padding: 16px 18px;
}

.mini-stat {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 12px;
}

.mini-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
}

.mini-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  flex-shrink: 0;
}

.mini-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-svg {
  font-size: 1.5rem;
}

.mini-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-width: 0;
}

.mini-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-model {
  font-size: 12px;
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.1;
}

.mini-desc {
  color: #93a3bb;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}


.mini-value {
  font-size: 30px;
  font-weight: 800;
  color: #5b5cf6;
  line-height: 1;
  flex-shrink: 0;
  align-self: center;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2a44;
}

.panel-path {
  margin-left: 10px;
  font-size: 12px;
  color: #3b82f6;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-legend {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: #fff;
  border: 1px solid #e7ebf5;
  border-radius: 18px;
  font-size: 12px;
  color: #1f2a44;
  font-weight: 700;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  white-space: nowrap;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.blue {
  background: #2f63ff;
}

.legend-dot.red {
  background: #ff4d4f;
}

.asset-map-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.asset-tile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.asset-tile {
  border: 1px solid #eef0f6;
  border-radius: 12px;
  background: #fafbff;
  padding: 14px 14px 12px;
  cursor: pointer;
  transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.asset-tile:hover {
  border-color: #a8c5ff;
  box-shadow: 0 10px 22px rgba(18, 27, 66, 0.08);
  transform: translateY(-2px);
}

.tile-title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  text-align: center;
  margin-top: 2px;
}

.tile-ratios {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.tile-ratio-value {
  font-size: 14px;
  font-weight: 800;
}

.tile-blue {
  color: #2f63ff;
}

.tile-red {
  color: #ff4d4f;
}

.tile-desc {
  margin-top: 10px;
  font-size: 12px;
  color: #8a98b2;
  line-height: 1.45;
  min-height: 44px;
}

.tile-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  min-height: 28px;
}

.tile-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
  justify-content: center;
  width: 100%;
}

.source-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.more-tag {
  background: #f2f5ff;
  color: #6b7280;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.tile-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #edf2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f63ff;
  flex-shrink: 0;
  opacity: 0;
  transform: translate(4px, -50%);
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.asset-tile:hover .tile-arrow {
  opacity: 1;
  transform: translate(0, -50%);
}

.hint-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 18px;
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  font-size: 12px;
  font-weight: 700;
}

.level-dist {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  height: 100%;
}

.level-bars {
  flex: 1;
  min-width: 0;
  padding-right: 8px;
  border-right: 1px solid #eef0f6;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.level-chart {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: auto;
}

.level-table {
  flex: 1;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.chart-tip {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: #98a2b3;
  line-height: 1.2;
}

.level-table-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.level-table-title {
  font-size: 13px;
  font-weight: 800;
  color: #1f2a44;
}

.level-table-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 700;
}

.cockpit-table {
  flex: 1;
}

.cockpit-table>>>.el-table {
  height: 100%;
}

.cockpit-table>>>.el-table__row td {
  border-bottom: 1px solid #eef0f6;
}

.cockpit-table>>>.el-table__header-wrapper th {
  border-bottom: 1px solid #eef0f6;
  color: #7b879f;
  font-weight: 700;
}

.cockpit-table>>>.el-table__body tr:hover>td {
  background: #fbfcff;
}

.ratio-text {
  color: #2f63ff;
  font-weight: 800;
}

.table-sources {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.table-source-tag {
  background: #eaf0ff;
  color: #2f63ff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.table-more-tag {
  background: #f2f5ff;
  color: #6b7280;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 12px;
  white-space: nowrap;
}

.bottom-section>>>.el-card__body {
  padding: 0;
}

.bottom-section>>>.el-table {
  border-radius: 12px;
}

.source-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.source-icon {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f5ff;
  color: #5b5cf6;
}

.source-link {
  font-weight: 700;
}

.system-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0px 10px;
  border-radius: 14px;
  border: 1px solid #fde68a;
  background: #fff7e6;
  color: #fa8c16;
  font-size: 12px;
}

.risk-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.risk-level-tag {
  margin-right: 0;
  font-size: 12px;
  font-weight: 500;
  border: none;
}

.dept-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #7b879f;
  font-weight: 700;
}

.owner-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2a44;
  font-weight: 800;
}

.owner-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2f63ff;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.action-btn {
  border-radius: 16px;
  border: 1px solid #2cc98d;
  color: #2cc98d;
  background: #f4fffb;
  font-weight: 800;
  padding: 8px 14px;
}

.action-btn:hover {
  background: #e9fff7;
  border-color: #2cc98d;
  color: #2cc98d;
}
</style>
