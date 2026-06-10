<template>
  <div class="data-mapping-page" v-loading="Loading">
    <div class="page-header">
      <h2><b>数据资源摸底调查</b></h2>
      <div class="header-operations">
        <label class="form-label">所属标准</label>
        <el-select v-model="selectedStandard" class="standard-select" filterable size="small" placeholder="请选择所属标准"
          @change="handleStandardChange">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="String(item.id)" />
        </el-select>

        <el-button icon="el-icon-download" size="small" class="export-btn" @click="handleExport">
          导出报告
        </el-button>
      </div>
    </div>

    <div class="legal-basis-card">
      <div class="legal-basis-title">
        <i class="el-icon-info"></i>
        <span>法规依据：《关于进一步做好网络安全等级保护有关工作的函》（公网安〔2025〕1001号）</span>
      </div>
      <div class="legal-basis-content">
        三、全面开展数据资源摸底调查：自即日起至2025年11月30日，第二级（含）以上信息系统运营者要依托等级保护备案工作，
        填报《网络安全等级保护备案表》中的《数据摸底调查表》，摸清数据基本信息、数据使用和数据流动等情况，落实数据安全管理部门、
        联系人和各类数据的安全责任部门。
      </div>
    </div>

    <div class="section-card">
      <div class="section-head">
        <div>
          <h3>数据大类清单</h3>
          <p>落实网络安全等级保护制度，开展系统备案更新与数据资源摸底</p>
        </div>
      </div>

      <el-table :data="surveyTableData" stripe class="survey-table" row-key="rowKey">
        <template slot="empty">
          <el-empty description="暂无数据"></el-empty>
        </template>
        <el-table-column prop="categoryName" label="分类名称" min-width="250" />
        <el-table-column prop="description" label="分类描述" min-width="300" show-overflow-tooltip />
        <el-table-column label="填报情况" width="160" align="center">
          <template slot-scope="scope">
            <span class="status-tag" :class="scope.row.status === 'reported' ? 'status-reported' : 'status-pending'">
              <i :class="scope.row.status === 'reported' ? 'el-icon-success' : 'el-icon-warning-outline'"></i>
              {{ scope.row.status === 'reported' ? '已填报' : '待填报' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template slot-scope="scope">
            <el-button type="text" @click="handleViewDetails(scope.row)">
              {{ activeSurveyRow && activeSurveyRow.rowKey === scope.row.rowKey ? '收起详情' : '查看详情' }}
              <i
                :class="activeSurveyRow && activeSurveyRow.rowKey === scope.row.rowKey ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="activeSurveyRow" class="detail-card">
      <div class="detail-header">
        <div class="detail-title">
          <i class="el-icon-document-copy"></i>
          <span>数据摸底详情</span>
        </div>
        <i class="el-icon-close detail-close" @click="handleCloseDetails"></i>
      </div>

      <el-form ref="dataBaselineForm" :model="dataBaselineForm" class="detail-form" label-position="top">
        <div class="detail-section">
          <div class="detail-section-title">
            <span class="section-index">1</span>
            <span>基础数据信息</span>
          </div>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="数据名称">
                <el-input v-model="dataBaselineForm.dataName" placeholder="请输入数据名称" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="安全分级">
                <el-select v-model="dataBaselineForm.dataLevel" placeholder="请选择安全分级" style="width: 100%;">
                  <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                    :value="String(item.value)" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据安全责任部门">
                <el-input v-model="dataBaselineForm.deptName" placeholder="请输入部门名称" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="数据安全负责人">
                <el-input v-model="dataBaselineForm.dataOwner" placeholder="请输入负责人姓名" maxlength="30" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="field-group">
            <div class="field-label">个人信息涉及情况</div>
            <div class="checkbox-inline">
              <el-checkbox v-model="dataBaselineForm.sensitivePersonalData"
                @change="handlePersonalDataChange('sensitivePersonalData')">
                涉及敏感个人信息
              </el-checkbox>
              <el-checkbox v-model="dataBaselineForm.noPersonalData"
                @change="handlePersonalDataChange('noPersonalData')">
                涉及未成年人的个人信息
              </el-checkbox>
              <el-checkbox v-model="dataBaselineForm.ordinaryPersonalData"
                @change="handlePersonalDataChange('ordinaryPersonalData')">
                涉及一般个人信息
              </el-checkbox>
              <el-checkbox v-model="dataBaselineForm.personalData" @change="handlePersonalDataChange('personalData')">
                不涉及
              </el-checkbox>
            </div>
          </div>

          <div class="metric-cards">
            <div class="metric-card">
              <div class="metric-icon">
                <i class="el-icon-coin"></i>
              </div>
              <div class="metric-content">
                <span>数据总量</span>
                <strong>{{ dataBaselineForm.dateSize || '-' }}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">
                <i class="el-icon-user"></i>
              </div>
              <div class="metric-content">
                <span>涉及个人信息</span>
                <strong>{{ dataBaselineForm.piiCount || '-' }}</strong>
              </div>
            </div>
            <div class="metric-card">
              <div class="metric-icon">
                <i class="el-icon-data-analysis"></i>
              </div>
              <div class="metric-content">
                <span>数据月增长量</span>
                <strong>{{ dataBaselineForm.monthAmountOfIncrease || '-' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-section-title">
            <span class="section-index">2</span>
            <span>数据来源与流转</span>
          </div>

          <div class="field-group">
            <div class="field-label">
              数据来源
              <span class="field-tip">请选择数据的产生/获取方式（可多选）</span>
            </div>
            <div class="checkbox-grid">
              <el-checkbox v-model="dataBaselineForm.systemGather">系统采集</el-checkbox>
              <el-checkbox v-model="dataBaselineForm.systemProduction">系统生产</el-checkbox>
              <el-checkbox v-model="dataBaselineForm.artificialFillIn">人工填报</el-checkbox>
              <el-checkbox v-model="dataBaselineForm.dealBuy">交易购买</el-checkbox>
              <el-checkbox v-model="dataBaselineForm.shareExchange">共享交换</el-checkbox>
              <el-checkbox v-model="dataBaselineForm.other">其他</el-checkbox>
            </div>
          </div>

          <el-form-item v-if="dataBaselineForm.other" label="其他数据来源">
            <el-input v-model="dataBaselineForm.otherInput" placeholder="请输入其他数据来源" maxlength="30" />
          </el-form-item>

          <div class="sub-card">
            <div class="sub-card-title">
              <i class="el-icon-sort"></i>
              <span>单位间数据流转情况</span>
            </div>

            <el-form-item label="数据来源单位">
              <div v-for="(item, index) in dataBaselineForm.dataSources" :key="'source-' + index"
                class="flow-unit-item">
                <el-input v-model="item.content" placeholder="请输入来源单位" maxlength="30"></el-input>
                <el-button type="text" icon="el-icon-remove-outline"
                  :disabled="dataBaselineForm.dataSources.length <= 1" @click="handleRemoveFlowUnit(index)"></el-button>
              </div>
              <el-button type="text" icon="el-icon-plus" @click="handleAddFlowUnit">添加来源单位</el-button>
            </el-form-item>

            <el-form-item label="数据流出单位" class="flow-item-last">
              <div v-for="(item, index) in dataBaselineForm.dataflow" :key="'flow-' + index" class="flow-unit-item">
                <el-input v-model="item.content" placeholder="请输入流出单位" maxlength="30"></el-input>
                <el-button type="text" icon="el-icon-remove-outline" :disabled="dataBaselineForm.dataflow.length <= 1"
                  @click="handleRemoveFlowOutUnit(index)"></el-button>
              </div>
              <el-button type="text" icon="el-icon-plus" @click="handleAddFlowOutUnit">添加流出单位</el-button>
            </el-form-item>
          </div>
        </div>

        <div class="detail-section detail-section-last">
          <div class="detail-section-title">
            <span class="section-index">3</span>
            <span>交互与存储</span>
          </div>

          <div class="field-group">
            <div class="field-label">
              与其他数据处理者的交互
              <span class="field-tip">请选择与其他数据处理者的交互类型（可多选）</span>
            </div>
            <div class="checkbox-stack">
              <el-checkbox v-model="dataBaselineForm.externalProvisionBox" :disabled="dataBaselineForm.noInteraction">
                对外提供给
              </el-checkbox>
              <el-input v-if="dataBaselineForm.externalProvisionBox" v-model="dataBaselineForm.externalProvision"
                placeholder="请输入接收方单位名称" maxlength="30"></el-input>

              <el-checkbox v-model="dataBaselineForm.entrustBox" :disabled="dataBaselineForm.noInteraction">
                委托
              </el-checkbox>
              <el-input v-if="dataBaselineForm.entrustBox" v-model="dataBaselineForm.entrust" placeholder="请输入委托处理方单位名称"
                maxlength="30"></el-input>

              <el-checkbox v-model="dataBaselineForm.jointDisposalBox" :disabled="dataBaselineForm.noInteraction">
                与……共同处理
              </el-checkbox>
              <el-input v-if="dataBaselineForm.jointDisposalBox" v-model="dataBaselineForm.jointDisposal"
                placeholder="请输入共同处理方单位名称" maxlength="30"></el-input>

              <el-checkbox v-model="dataBaselineForm.noInteraction" @change="handleNoInteractionChange">
                无交互
              </el-checkbox>
            </div>
          </div>

          <div class="sub-card storage-card">
            <div class="sub-card-title">
              <i class="el-icon-office-building"></i>
              <span>数据存储位置</span>
            </div>

            <div class="storage-section">
              <div class="field-label">云类型（可多选）</div>
              <div class="storage-stack">
                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.privateCloudBox">私有云</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.privateCloudBox"
                    v-model="dataBaselineForm.privateCloud"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.publicCloudBox">公有云</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.publicCloudBox"
                    v-model="dataBaselineForm.publicCloud"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.mixtureCloudBox">混合云</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.mixtureCloudBox"
                    v-model="dataBaselineForm.mixtureCloud"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.governmentCloudBox">政务云</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.governmentCloudBox"
                    v-model="dataBaselineForm.governmentCloud"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.noCloudComputingPlatformBox">非云计算平台</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.noCloudComputingPlatformBox"
                    v-model="dataBaselineForm.noCloudComputingPlatform"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>
              </div>
            </div>

            <div class="storage-section">
              <div class="field-label">机房类型（可多选）</div>
              <div class="storage-stack">
                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.thisUnitMachineRoomBox">本单位机房</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.thisUnitMachineRoomBox"
                    v-model="dataBaselineForm.thisUnitMachineRoom"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.outerUnitMachineRoomBox">外单位机房</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.outerUnitMachineRoomBox"
                    v-model="dataBaselineForm.outerUnitMachineRoom"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox">第三方托管机房</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox"
                    v-model="dataBaselineForm.thirdPartyTrusteeshipMachineRoom"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>
              </div>
            </div>

            <div class="storage-section storage-section-last">
              <div class="field-label">存储地域（可多选）</div>
              <div class="storage-stack">
                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.domesticBox">境内</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.domesticBox"
                    v-model="dataBaselineForm.domestic"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>

                <div class="storage-option">
                  <el-checkbox v-model="dataBaselineForm.overseasBox">境外</el-checkbox>
                  <el-input
                    v-if="dataBaselineForm.overseasBox"
                    v-model="dataBaselineForm.overseas"
                    placeholder="请输入具体对象"
                    maxlength="30"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-footer">
          <el-button @click="handleReset">取消</el-button>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  getFrameworks,
  getDataMappingDetail,
  listDataMappingCategories
} from "@/api/system/protectCategory";
import { getCategorySchemaLevelList } from "@/api/data";

const createDefaultForm = () => ({
  id: "",
  dataName: "",
  dataLevel: "",
  dataType: "",
  dataOwner: "",
  deptName: "",
  noPersonalData: false,
  ordinaryPersonalData: false,
  sensitivePersonalData: false,
  personalData: false,
  dateSize: "",
  piiCount: "",
  monthAmountOfIncrease: "",
  systemGather: false,
  systemProduction: false,
  artificialFillIn: false,
  dealBuy: false,
  shareExchange: false,
  other: false,
  otherInput: "",
  externalProvisionBox: false,
  externalProvision: "",
  entrustBox: false,
  entrust: "",
  jointDisposalBox: false,
  jointDisposal: "",
  noInteraction: false,
  privateCloudBox: false,
  privateCloud: "",
  publicCloudBox: false,
  publicCloud: "",
  mixtureCloudBox: false,
  mixtureCloud: "",
  governmentCloudBox: false,
  governmentCloud: "",
  noCloudComputingPlatformBox: false,
  noCloudComputingPlatform: "",
  thisUnitMachineRoomBox: false,
  thisUnitMachineRoom: "",
  outerUnitMachineRoomBox: false,
  outerUnitMachineRoom: "",
  thirdPartyTrusteeshipMachineRoomBox: false,
  thirdPartyTrusteeshipMachineRoom: "",
  domesticBox: false,
  domestic: "",
  overseasBox: false,
  overseas: "",
  dataSources: [{ content: "" }],
  dataflow: [{ content: "" }]
});

export default {
  name: "dataMapping",
  data() {
    return {
      Loading: false,
      query: {},
      treeOptions: [],
      selectedStandard: "",
      levelOptions: [],
      surveyTableData: [],
      activeSurveyRow: null,
      dataBaselineForm: createDefaultForm()
    };
  },
  watch: {
    "dataBaselineForm.externalProvisionBox"(val) {
      if (!val) {
        this.dataBaselineForm.externalProvision = "";
      }
    },
    "dataBaselineForm.entrustBox"(val) {
      if (!val) {
        this.dataBaselineForm.entrust = "";
      }
    },
    "dataBaselineForm.jointDisposalBox"(val) {
      if (!val) {
        this.dataBaselineForm.jointDisposal = "";
      }
    },
    "dataBaselineForm.privateCloudBox"(val) {
      if (!val) {
        this.dataBaselineForm.privateCloud = "";
      }
    },
    "dataBaselineForm.publicCloudBox"(val) {
      if (!val) {
        this.dataBaselineForm.publicCloud = "";
      }
    },
    "dataBaselineForm.mixtureCloudBox"(val) {
      if (!val) {
        this.dataBaselineForm.mixtureCloud = "";
      }
    },
    "dataBaselineForm.governmentCloudBox"(val) {
      if (!val) {
        this.dataBaselineForm.governmentCloud = "";
      }
    },
    "dataBaselineForm.noCloudComputingPlatformBox"(val) {
      if (!val) {
        this.dataBaselineForm.noCloudComputingPlatform = "";
      }
    },
    "dataBaselineForm.thisUnitMachineRoomBox"(val) {
      if (!val) {
        this.dataBaselineForm.thisUnitMachineRoom = "";
      }
    },
    "dataBaselineForm.outerUnitMachineRoomBox"(val) {
      if (!val) {
        this.dataBaselineForm.outerUnitMachineRoom = "";
      }
    },
    "dataBaselineForm.thirdPartyTrusteeshipMachineRoomBox"(val) {
      if (!val) {
        this.dataBaselineForm.thirdPartyTrusteeshipMachineRoom = "";
      }
    },
    "dataBaselineForm.domesticBox"(val) {
      if (!val) {
        this.dataBaselineForm.domestic = "";
      }
    },
    "dataBaselineForm.overseasBox"(val) {
      if (!val) {
        this.dataBaselineForm.overseas = "";
      }
    },
    "dataBaselineForm.other"(val) {
      if (!val) {
        this.dataBaselineForm.otherInput = "";
      }
    }
  },
  created() {
    this.query = this.normalizeRouteRow(this.$route.query.row);
    this.selectedStandard = this.query.categoryId ? String(this.query.categoryId) : "";
  },
  async mounted() {
    await this.loadStandardOptions();
    await this.fetchLevelOptions();
    await this.fetchSurveyTableData();
  },
  methods: {
    normalizeRouteRow(row) {
      if (!row) {
        return {};
      }
      if (typeof row === "string") {
        try {
          return JSON.parse(row);
        } catch (error) {
          return {};
        }
      }
      return JSON.parse(JSON.stringify(row));
    },
    deepClone(data) {
      return JSON.parse(JSON.stringify(data));
    },
    createSeedForm(seed = {}) {
      return Object.assign(createDefaultForm(), seed);
    },
    loadStandardOptions() {
      return getFrameworks().then((response) => {
        this.treeOptions = Array.isArray(response.data) ? response.data : [];
        if (!this.selectedStandard && this.treeOptions.length) {
          this.selectedStandard = String(this.treeOptions[0].id);
        }
      });
    },
    fetchLevelOptions() {
      if (!this.selectedStandard) {
        this.levelOptions = [];
        return Promise.resolve();
      }
      return getCategorySchemaLevelList({ projectId: this.selectedStandard }).then((res) => {
        const payload = res && res.data ? res.data : res;
        const list = payload.records || payload.rows || payload.list || payload || [];
        this.levelOptions = list.map((item) => ({
          value: item.level,
          label: item.levelName
        }));
      }).catch(() => {
        this.levelOptions = [];
      });
    },
    getDefaultLevelValue() {
      if (this.query.minSecurityLevel) {
        return String(this.query.minSecurityLevel);
      }
      if (this.levelOptions.length) {
        return String(this.levelOptions[0].value);
      }
      return "";
    },
    normalizeSurveyStatus(value) {
      if (value === true || value === 1 || value === "1" || value === "reported") {
        return "reported";
      }
      return "pending";
    },
    hasDetailValue(value) {
      return value !== "-1" && value !== -1 && value !== null && value !== undefined && value !== "";
    },
    isChecked(value) {
      return value === true || value === 1 || value === "1" || value === "true";
    },
    mapSurveyTableItem(item = {}, index = 0) {
      const detailId = item.categoryDataId || item.id || item.attachDataId || item.categoryAttachDataId || "";
      return {
        ...item,
        id: detailId,
        rowKey: `survey-${detailId || index}`,
        categoryName: item.categoryName || item.attachData || item.dataName || "--",
        description: item.description || item.attachDescribe || item.dataType || "--",
        status: this.normalizeSurveyStatus(item.status || item.reportStatus || item.fillStatus || item.isReport),
        seedForm: this.createSeedForm({
          id: item.detailId || item.dataFeelBottomId || "",
          dataName: item.dataName || item.attachData || item.categoryName || "",
          dataLevel: item.dataLevel != null
            ? String(item.dataLevel)
            : item.minSecurityLevel != null
              ? String(item.minSecurityLevel)
              : this.getDefaultLevelValue(),
          dataType: item.dataType || item.baseParent || "",
          dataOwner: item.dataOwner || "",
          deptName: item.deptName || ""
        })
      };
    },
    async fetchSurveyTableData() {
      if (!this.selectedStandard) {
        this.surveyTableData = [];
        this.handleCloseDetails(true);
        return;
      }

      this.Loading = true;
      try {
        const res = await listDataMappingCategories({ categoryId: this.selectedStandard });
        const payload = res && res.data ? res.data : res;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload && payload.rows)
            ? payload.rows
            : Array.isArray(payload && payload.list)
              ? payload.list
              : [];

        this.surveyTableData = list.map((item, index) => this.mapSurveyTableItem(item, index));

        if (
          this.activeSurveyRow &&
          !this.surveyTableData.find((item) => item.rowKey === this.activeSurveyRow.rowKey)
        ) {
          this.handleCloseDetails(true);
        }
      } catch (error) {
        this.surveyTableData = [];
        this.handleCloseDetails(true);
        console.error("Failed to load data-mapping categories:", error);
      } finally {
        this.Loading = false;
      }
    },
    mergeSurveyForm(rawData = {}, baseForm) {
      const safeBase = this.deepClone(baseForm || createDefaultForm());
      return Object.assign(safeBase, {
        id: rawData.id || safeBase.id,
        dataName: rawData.dataName || safeBase.dataName,
        dataLevel: this.hasDetailValue(rawData.dataLevel) ? String(rawData.dataLevel) : safeBase.dataLevel,
        dataType: rawData.dataType || safeBase.dataType,
        dataOwner: rawData.dataOwner || safeBase.dataOwner,
        deptName: rawData.deptName || safeBase.deptName,
        noPersonalData: this.isChecked(rawData.noPersonalData),
        ordinaryPersonalData: this.isChecked(rawData.ordinaryPersonalData),
        sensitivePersonalData: this.isChecked(rawData.sensitivePersonalData),
        personalData: this.isChecked(rawData.personalData),
        dateSize: rawData.dateSize || safeBase.dateSize,
        piiCount: rawData.piiCount || safeBase.piiCount,
        monthAmountOfIncrease: rawData.monthAmountOfIncrease || safeBase.monthAmountOfIncrease,
        systemGather: this.isChecked(rawData.systemGather),
        systemProduction: this.isChecked(rawData.systemProduction),
        artificialFillIn: this.isChecked(rawData.artificialFillIn),
        dealBuy: this.isChecked(rawData.dealBuy),
        shareExchange: this.isChecked(rawData.shareExchange),
        other: this.hasDetailValue(rawData.other),
        otherInput: this.hasDetailValue(rawData.other) ? rawData.other : "",
        externalProvisionBox: this.hasDetailValue(rawData.externalProvision),
        externalProvision: this.hasDetailValue(rawData.externalProvision) ? rawData.externalProvision : "",
        entrustBox: this.hasDetailValue(rawData.entrust),
        entrust: this.hasDetailValue(rawData.entrust) ? rawData.entrust : "",
        jointDisposalBox: this.hasDetailValue(rawData.jointDisposal),
        jointDisposal: this.hasDetailValue(rawData.jointDisposal) ? rawData.jointDisposal : "",
        noInteraction: this.isChecked(rawData.noInteraction),
        privateCloudBox: this.hasDetailValue(rawData.privateCloud),
        privateCloud: this.hasDetailValue(rawData.privateCloud) ? rawData.privateCloud : "",
        publicCloudBox: this.hasDetailValue(rawData.publicCloud),
        publicCloud: this.hasDetailValue(rawData.publicCloud) ? rawData.publicCloud : "",
        mixtureCloudBox: this.hasDetailValue(rawData.mixtureCloud),
        mixtureCloud: this.hasDetailValue(rawData.mixtureCloud) ? rawData.mixtureCloud : "",
        governmentCloudBox: this.hasDetailValue(rawData.governmentCloud),
        governmentCloud: this.hasDetailValue(rawData.governmentCloud) ? rawData.governmentCloud : "",
        noCloudComputingPlatformBox: this.hasDetailValue(rawData.noCloudComputingPlatform),
        noCloudComputingPlatform: this.hasDetailValue(rawData.noCloudComputingPlatform) ? rawData.noCloudComputingPlatform : "",
        thisUnitMachineRoomBox: this.hasDetailValue(rawData.thisUnitMachineRoom),
        thisUnitMachineRoom: this.hasDetailValue(rawData.thisUnitMachineRoom) ? rawData.thisUnitMachineRoom : "",
        outerUnitMachineRoomBox: this.hasDetailValue(rawData.outerUnitMachineRoom),
        outerUnitMachineRoom: this.hasDetailValue(rawData.outerUnitMachineRoom) ? rawData.outerUnitMachineRoom : "",
        thirdPartyTrusteeshipMachineRoomBox: this.hasDetailValue(rawData.thirdPartyTrusteeshipMachineRoom),
        thirdPartyTrusteeshipMachineRoom: this.hasDetailValue(rawData.thirdPartyTrusteeshipMachineRoom) ? rawData.thirdPartyTrusteeshipMachineRoom : "",
        domesticBox: this.hasDetailValue(rawData.domestic),
        domestic: this.hasDetailValue(rawData.domestic) ? rawData.domestic : "",
        overseasBox: this.hasDetailValue(rawData.overseas),
        overseas: this.hasDetailValue(rawData.overseas) ? rawData.overseas : "",
        dataSources: Array.isArray(rawData.dataSources) && rawData.dataSources.length > 0 ? rawData.dataSources : [{ content: "" }],
        dataflow: Array.isArray(rawData.dataflow) && rawData.dataflow.length > 0 ? rawData.dataflow : [{ content: "" }]
      });
    },
    async handleStandardChange() {
      await this.fetchLevelOptions();
      this.handleCloseDetails(true);
      await this.fetchSurveyTableData();
    },
    handleExport() {
      this.$message.info("导出功能暂未接入");
    },
    async handleViewDetails(row, forceOpen = false) {
      if (!forceOpen && this.activeSurveyRow && this.activeSurveyRow.rowKey === row.rowKey) {
        this.handleCloseDetails(true);
        return;
      }

      this.activeSurveyRow = row;
      this.dataBaselineForm = this.deepClone(row.seedForm || createDefaultForm());
      this.Loading = true;
      try {
        const res = await getDataMappingDetail({
          rootId: this.selectedStandard,
          categoryId: row.id
        });
        if (res.code === 200 && this.activeSurveyRow && this.activeSurveyRow.rowKey === row.rowKey) {
          this.dataBaselineForm = this.mergeSurveyForm(res.data || {}, row.seedForm);
        }
      } catch (error) {
        console.error("Failed to load data-mapping detail:", error);
      } finally {
        this.Loading = false;
      }
    },
    handleCloseDetails(resetForm = false) {
      this.activeSurveyRow = null;
      if (resetForm) {
        this.dataBaselineForm = createDefaultForm();
      }
    },
    handlePersonalDataChange(type) {
      if (type === "personalData" && this.dataBaselineForm.personalData) {
        this.dataBaselineForm.sensitivePersonalData = false;
        this.dataBaselineForm.noPersonalData = false;
        this.dataBaselineForm.ordinaryPersonalData = false;
      }
      if (type !== "personalData" && this.dataBaselineForm[type]) {
        this.dataBaselineForm.personalData = false;
      }
    },
    handleNoInteractionChange(val) {
      if (val) {
        this.dataBaselineForm.externalProvisionBox = false;
        this.dataBaselineForm.externalProvision = "";
        this.dataBaselineForm.entrustBox = false;
        this.dataBaselineForm.entrust = "";
        this.dataBaselineForm.jointDisposalBox = false;
        this.dataBaselineForm.jointDisposal = "";
      }
    },
    handleAddFlowUnit() {
      const lastIndex = this.dataBaselineForm.dataSources.length - 1;
      const lastContent = this.dataBaselineForm.dataSources[lastIndex].content.trim();

      if (!lastContent) {
        this.$message.warning("请完善当前单位信息后再添加");
        return;
      }

      const hasDuplicate = this.dataBaselineForm.dataSources.some(
        (item, index) => index !== lastIndex && item.content.trim() === lastContent
      );

      if (hasDuplicate) {
        this.$message.warning("存在重复的单位，请修改后再添加");
        return;
      }

      this.dataBaselineForm.dataSources.push({ content: "" });
    },
    handleRemoveFlowUnit(index) {
      this.dataBaselineForm.dataSources.splice(index, 1);
    },
    handleAddFlowOutUnit() {
      const lastIndex = this.dataBaselineForm.dataflow.length - 1;
      const lastContent = this.dataBaselineForm.dataflow[lastIndex].content.trim();

      if (!lastContent) {
        this.$message.warning("请完善当前单位信息后再添加");
        return;
      }

      const hasDuplicate = this.dataBaselineForm.dataflow.some(
        (item, index) => index !== lastIndex && item.content.trim() === lastContent
      );

      if (hasDuplicate) {
        this.$message.warning("存在重复的单位，请修改后再添加");
        return;
      }

      this.dataBaselineForm.dataflow.push({ content: "" });
    },
    handleRemoveFlowOutUnit(index) {
      this.dataBaselineForm.dataflow.splice(index, 1);
    },
    handleSubmit() {
      let isUnitValid = true;

      this.dataBaselineForm.dataSources.forEach((item) => {
        if (!item.content.trim()) {
          isUnitValid = false;
        }
      });

      this.dataBaselineForm.dataflow.forEach((item) => {
        if (!item.content.trim()) {
          isUnitValid = false;
        }
      });

      if (!isUnitValid) {
        this.$message.warning("请完善所有单位信息");
        return;
      }

      const hasDataSource =
        this.dataBaselineForm.systemGather ||
        this.dataBaselineForm.systemProduction ||
        this.dataBaselineForm.artificialFillIn ||
        this.dataBaselineForm.dealBuy ||
        this.dataBaselineForm.shareExchange ||
        this.dataBaselineForm.other;

      if (!hasDataSource) {
        this.$message.warning("请至少选择一种数据来源");
        return;
      }

      if (!this.activeSurveyRow) {
        this.$message.warning("请先选择需要填报的数据项");
        return;
      }

      this.activeSurveyRow.seedForm = this.deepClone(this.dataBaselineForm);
      this.activeSurveyRow.status = "reported";
      this.surveyTableData = [...this.surveyTableData];
      this.$message.success("当前页面已暂存修改");
    },
    handleReset() {
      this.$router.back();
    }
  }
};
</script>

<style scoped lang="scss">
.data-mapping-page {
  min-height: 100%;
  padding: 40px;
  background: #f5f8fc;
}

.page-header {
  display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eaeaea;

  h2 {
    margin: 0;
    font-size: 20px;
    color: #0f2747;
  }
}

.header-operations {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  color: #4e6785;
  font-size: 14px;
}

.standard-select {
  width: 148px;
}

.export-btn {
  border-radius: 10px;
}

.legal-basis-card,
.section-card,
.detail-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 61, 120, 0.06);
}

.legal-basis-card {
  margin-bottom: 22px;
  padding: 28px 30px;
  border-left: 4px solid #2f7cff;
  background: linear-gradient(90deg, rgba(47, 124, 255, 0.08) 0%, rgba(47, 124, 255, 0.02) 100%);
}

.legal-basis-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #163966;
  font-size: 15px;
  font-weight: 600;

  i {
    color: #2f7cff;
    font-size: 15px;
  }
}

.legal-basis-content {
  color: #406182;
  line-height: 1.9;
  font-size: 13px;
}

.section-card {
  margin-bottom: 22px;
  padding: 20px;
}

.section-head {
  margin-bottom: 18px;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: #0f2747;
  }

  p {
    margin: 0;
    color: #5d7795;
    font-size: 13px;
  }
}

.survey-table {
  ::v-deep .el-table__header th {
    background: #f7faff;
    color: #214469;
  }
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.status-reported {
  color: #17a34a;
  background: rgba(23, 163, 74, 0.12);
}

.status-pending {
  color: #f08c2e;
  background: rgba(240, 140, 46, 0.12);
}

.detail-card {
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid #e8eff7;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f2747;
  font-size: 15px;
  font-weight: 600;

  i {
    color: #2f7cff;
    font-size: 15px;
  }
}

.detail-close {
  color: #6d829d;
  font-size: 16px;
  cursor: pointer;
}

.detail-form {
  padding: 26px 36px 32px;
}

.detail-section {
  padding-bottom: 30px;
  margin-bottom: 30px;
  border-bottom: 1px solid #edf2f8;
}

.detail-section-last {
  margin-bottom: 0;
  border-bottom: none;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  color: #0f2747;
  font-size: 16px;
  font-weight: 600;
}

.section-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(47, 124, 255, 0.12);
  border: 1px solid rgba(47, 124, 255, 0.28);
  color: #2f7cff;
  font-size: 14px;
}

.field-group {
  margin-bottom: 22px;
}

.field-label {
  margin-bottom: 14px;
  color: #163966;
  font-size: 14px;
  font-weight: 600;
}

.field-tip {
  margin-left: 8px;
  color: #98abc1;
  font-size: 12px;
  font-weight: 400;
}

.checkbox-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 16px 28px;
}

.metric-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 26px;
}

.metric-card {
  display: flex;
  align-items: center;
  min-width: 176px;
  padding: 16px 18px;
  border: 1px solid #e6edf6;
  border-radius: 14px;
  background: #fff;
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-right: 14px;
  border-radius: 50%;
  background: rgba(47, 124, 255, 0.1);
  color: #2f7cff;
  font-size: 16px;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    color: #6d829d;
    font-size: 12px;
  }

  strong {
    color: #0f2747;
    font-size: 20px;
    line-height: 1.1;
  }
}

.sub-card {
  margin-top: 20px;
  padding: 24px 28px;
  background: #f8fbff;
  border: 1px solid #e7eef7;
  border-radius: 18px;
}

.sub-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #163966;
  font-size: 15px;
  font-weight: 600;

  i {
    color: #6d829d;
  }
}

.flow-unit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  ::v-deep .el-button {
    margin-left: 0;
    color: #c0cad8;
    font-size: 18px;
  }
}

.flow-item-last {
  margin-bottom: 0;
}

.checkbox-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 420px;
}

.storage-card {
  padding-bottom: 10px;
}

.storage-section {
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e7eef7;
}

.storage-section-last {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.storage-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.storage-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  ::v-deep .el-input {
    width: 320px;
    max-width: 100%;
  }
}

.storage-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 14px 18px;
  align-items: center;

  ::v-deep .el-input {
    width: 100%;
  }
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  padding-top: 8px;
}

::v-deep .el-form-item__label {
  color: #163966;
  font-weight: 600;
  font-size: 14px;
}

::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  border-radius: 10px;
}

::v-deep .el-checkbox__label {
  color: #214469;
  font-size: 14px;
}

::v-deep .el-table {
  font-size: 14px;
}

::v-deep .el-table th,
::v-deep .el-table td {
  font-size: 14px;
}

@media (max-width: 1280px) {
  .checkbox-grid {
    grid-template-columns: repeat(3, minmax(120px, 1fr));
  }
}

@media (max-width: 900px) {
  .data-mapping-page {
    padding: 16px;
  }

  .page-header,
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-operations {
    width: 100%;
    flex-wrap: wrap;
  }

  .standard-select {
    width: 100%;
  }

  .checkbox-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
