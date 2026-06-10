<template>
  <div class="app-container result-push-page" v-loading="mainLoading">
    <el-row :gutter="20" class="result-layout">
      <el-col :span="5" :xs="24">
        <el-card shadow="never" class="left-sidebar-card">
          <div class="platform-list" v-if="platformList.length">
            <div
              v-for="item in platformList"
              :key="item.id"
              class="platform-card"
              :class="[
                `platform-card--${getPlatformTheme(item)}`,
                { 'is-active': activePlatformId === item.id }
              ]"
              @click="handlePlatformSelect(item)"
            >
              <div class="platform-card__header">
                <div class="platform-card__title-wrap">
                  <div class="platform-card__icon">
                    <i :class="getPlatformIcon(item)"></i>
                  </div>
                  <div class="platform-card__title">{{ item.providerName || "--" }}</div>
                </div>
                <div class="status-badge" :class="`status-badge--${getStatusTheme(item.connectStatus)}`">
                  <i class="el-icon-success" v-if="item.connectStatus === '1'"></i>
                  <i class="status-dot" v-else></i>
                  <span>{{ getConnectStatusLabel(item.connectStatus) }}</span>
                </div>
              </div>

              <div class="platform-card__meta">
                <div class="platform-card__stat">
                  <span class="platform-card__label">{{ getMetricLabel(item) }}</span>
                  <strong class="platform-card__value">{{ getMetricValue(item) }}</strong>
                </div>
                <div class="platform-card__time">
                  <span class="platform-card__label">最近推送</span>
                  <strong class="platform-card__datetime">{{ item.updateTime || "--" }}</strong>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无平台配置"></el-empty>
        </el-card>
      </el-col>

      <el-col :span="19" :xs="24">
        <el-card shadow="never" class="right-content-card">
          <template v-if="currentConfig.id">
            <div class="content-header">
              <div class="content-header__title">
                <div class="content-header__icon" :class="`content-header__icon--${getPlatformTheme(currentConfig)}`">
                  <i :class="getPlatformIcon(currentConfig)"></i>
                </div>
                <span>{{ currentConfig.providerName || "--" }}</span>
              </div>
            </div>

            <el-form
              ref="configForm"
              :model="currentConfig"
              :rules="configRules"
              label-position="top"
              class="config-form"
            >
              <el-row :gutter="48">
                <el-col :span="12">
                  <el-form-item label="主机" prop="host">
                    <el-input v-model="currentConfig.host" placeholder="请输入主机"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="端口" prop="port">
                    <el-input v-model="currentConfig.port" placeholder="请输入端口"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="账号" prop="userName">
                    <el-input v-model="currentConfig.userName" placeholder="请输入账号"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码" prop="passWord">
                    <el-input :type="showPassword ? 'text' : 'password'" v-model="currentConfig.passWord" placeholder="请输入内容">
                      <i
                        slot="suffix"
                        class="el-input__icon"
                        :class="showPassword ? 'el-icon-view' : 'el-icon-view'"
                        @click="showPassword = !showPassword"
                      ></i>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <template v-if="isDefaultPushMode">
                <div class="section-block">
                  <div class="section-title">推送内容</div>
                  <el-form-item class="full-width" label="推送内容">
                    <el-input value="数据分级分类结果" readonly></el-input>
                  </el-form-item>
                </div>

                <div class="section-block section-block--cert">
                  <div class="section-title">证书来源</div>
                  <div class="cert-row">
                    <span>使用内置证书</span>
                    <el-switch v-model="currentConfig.useInnerCert"></el-switch>
                    <span class="cert-row__current">
                      当前：{{ currentConfig.useInnerCert ? "内置证书" : "手动上传" }}
                    </span>
                  </div>
                  <div v-if="!currentConfig.useInnerCert" class="upload-area">
                    <el-upload
                      ref="p12Upload"
                      action=""
                      :limit="1"
                      drag
                      :auto-upload="false"
                      accept=".p12"
                    >
                      <i class="el-icon-upload"></i>
                      <div class="el-upload__text">点击或拖拽上传 `.p12` 证书文件</div>
                    </el-upload>
                    <el-form-item label="证书密钥" prop="p12Password">
                      <el-input
                        :type="showCertPassword ? 'text' : 'password'"
                        v-model="currentConfig.p12Password"
                        placeholder="请输入证书密钥"
                      >
                        <i
                          slot="suffix"
                          class="el-input__icon"
                          :class="showCertPassword ? 'el-icon-view' : 'el-icon-view'"
                          @click="showCertPassword = !showCertPassword"
                        ></i>
                      </el-input>
                    </el-form-item>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="push-panel">
                  <div class="push-panel__header">推送内容</div>
                  <div class="push-panel__body">
                    <el-tabs v-model="activePushTab" class="push-tabs" @tab-click="handlePushTabChange">
                      <el-tab-pane label="关键字字典" name="1"></el-tab-pane>
                      <el-tab-pane label="正则表达式" name="2"></el-tab-pane>
                    </el-tabs>

                    <template v-if="activePushTab === '1'">
                      <el-form-item label="分类分级标准" prop="standardId">
                        <el-select v-model="currentConfig.standardId" placeholder="请选择分类分级标准" filterable @change="handleStandardChange">
                          <el-option
                            v-for="item in standardList"
                            :key="item.id"
                            :label="item.categoryName"
                            :value="item.id"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </template>

                    <template v-else>
                      <el-form-item label="数据源名称" prop="sourceId">
                        <el-select v-model="currentConfig.sourceId" placeholder="请选择数据源名称" filterable @change="handleSourceIdChange">
                          <el-option
                            v-for="item in sourceNameList"
                            :key="item.id"
                            :label="item.sourceName"
                            :value="item.id"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </template>

                    <el-form-item label="推送内容" prop="pushBodyList">
                      <div class="push-content-display" @click="openPushContentDialog">
                        <span>{{ selectedCountText }}</span>
                        <i class="el-icon-arrow-right"></i>
                      </div>
                    </el-form-item>
                  </div>
                </div>
              </template>
            </el-form>

            <div class="footer-actions">
              <el-button plain icon="el-icon-lightning" @click="handleTest">测试链接</el-button>
              <el-button type="primary" icon="el-icon-upload2" @click="handleSave">保存配置</el-button>
            </div>
          </template>
          <el-empty v-else description="请选择左侧平台配置"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog class="pushContent" title="推送内容" :visible.sync="contentShow" width="950px" append-to-body>
      <template v-if="activePushTab === '1'">
        <Result
          v-if="contentShow"
          ref="ResultSon"
          :treeData="categoryList"
          :checkList="currentConfig.pushBodyList || []"
        />
      </template>
      <template v-else>
        <Result2
          v-if="contentShow"
          ref="Result2Son"
          :id="currentConfig.id"
          :databaseId="currentConfig.sourceId"
        />
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmPushContent">确定</el-button>
        <el-button @click="contentShow = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getResultPushList,
  getStandardList,
  addResultPush,
  updateResultPush,
  selectPublishDataBase,
  testLink
} from "@/api/APIAbutment";
import { resultPushByParentId } from "@/api/system/protectCategory";
import Result from "./components/result.vue";
import Result2 from "./components/result2.vue";

const createDefaultConfig = () => ({
  id: "",
  taskName: "",
  taskType: "",
  pushType: "",
  provider: "",
  providerName: "",
  host: "",
  port: "",
  userName: "",
  passWord: "",
  standardId: "",
  sourceId: "",
  sourceName: "",
  pushBodyList: [],                                                                                                                                                           
  updateTime: "",
  connectStatus: "0",
  useInnerCert: true,
  p12Password: ""
});

export default {
  name: "resultPush",
  components: { Result, Result2 },
  data() {
    return {
      mainLoading: false,
      contentShow: false,
      showPassword: false,
      showCertPassword: false,
      platformList: [],
      activePlatformId: "",
      currentConfig: createDefaultConfig(),
      standardList: [],
      sourceNameList: [],
      categoryList: [],
      activePushTab: "1"
    };
  },
  computed: {
    isDefaultPushMode() {
      return String(this.currentConfig.pushType || "") === "3";
    },
    selectedCountText() {
      const count = Array.isArray(this.currentConfig.pushBodyList) ? this.currentConfig.pushBodyList.length : 0;
      return `已选${count}个子类`;
    },
    configRules() {
      const needKeyword = !this.isDefaultPushMode && this.activePushTab === "1";
      const needRegex = !this.isDefaultPushMode && this.activePushTab === "2";
      return {
        host: [{ required: true, message: "请输入主机", trigger: "blur" }],
        port: [{ required: true, message: "请输入端口", trigger: "blur" }],
        userName: [{ required: true, message: "请输入账号", trigger: "blur" }],
        passWord: [{ required: true, message: "请输入密码", trigger: "blur" }],
        standardId: needKeyword ? [{ required: true, message: "请选择分类分级标准", trigger: "change" }] : [],
        sourceId: needRegex ? [{ required: true, message: "请选择数据源名称", trigger: "change" }] : [],
        pushBodyList: !this.isDefaultPushMode ? [{ required: true, message: "请选择推送内容", trigger: "change" }] : [],
        p12Password: !this.currentConfig.useInnerCert && this.isDefaultPushMode
          ? [{ required: true, message: "请输入证书密钥", trigger: "blur" }]
          : []
      };
    }
  },
  async mounted() {
    this.mainLoading = true;
    try {
      await Promise.all([
        this.fetchPlatformList(),
        this.getStandardListFn(),
        this.getSourceNameListFn()
      ]);
    } finally {
      this.mainLoading = false;
    }
  },
  methods: {
    normalizeConfig(row = {}) {
      const pushType = row.pushType != null ? String(row.pushType) : "";
      return {
        ...createDefaultConfig(),
        ...row,
        id: row.id != null ? String(row.id) : "",
        pushType,
        standardId: row.standardId != null ? String(row.standardId) : "",
        sourceId: pushType === "2" && row.standardId != null ? String(row.standardId) : row.sourceId != null ? String(row.sourceId) : "",
        pushBodyList: row.pushBody ? String(row.pushBody).split(",").filter(Boolean) : [],
        useInnerCert: !(row.useInnerCert === "0" || row.useInnerCert === 0 || row.useInnerCert === false)
      };
    },
    async fetchPlatformList() {
      const params = {
        pageNum: 1,
        pageSize: 999
      };
      const res = await getResultPushList(params);
      const rows = res && res.data && Array.isArray(res.data.rows) ? res.data.rows : [];
      this.platformList = rows.map((item) => this.normalizeConfig(item));
      if (this.platformList.length) {
        const current = this.platformList.find((item) => item.id === this.activePlatformId) || this.platformList[0];
        this.handlePlatformSelect(current);
      } else {
        this.activePlatformId = "";
        this.currentConfig = createDefaultConfig();
      }
    },
    async getStandardListFn() {
      const res = await getStandardList();
      this.standardList = Array.isArray(res.data)
        ? res.data.map((item) => ({
            ...item,
            id: String(item.id)
          }))
        : [];
    },
    async getSourceNameListFn() {
      const res = await selectPublishDataBase();
      this.sourceNameList = Array.isArray(res.data)
        ? res.data.map((item) => ({
            ...item,
            id: String(item.id)
          }))
        : [];
    },
    handlePlatformSelect(item) {
      this.activePlatformId = item.id;
      this.currentConfig = JSON.parse(JSON.stringify(item));
      this.activePushTab = String(this.currentConfig.pushType || "1") === "2" ? "2" : "1";
      this.showPassword = false;
      this.showCertPassword = false;
    },
    getPlatformTheme(item) {
      return String(item.pushType) === "3" ? "cyan" : "red";
    },
    getPlatformIcon(item) {
      return String(item.pushType) === "3" ? "el-icon-lock" : "el-icon-s-check";
    },
    getStatusTheme(status) {
      return String(status) === "1" ? "success" : "muted";
    },
    getConnectStatusLabel(connectStatus) {
      if (String(connectStatus) === "1") return "已连接";
      return "未连接";
    },
    getMetricLabel(item) {
      return String(item.pushType) === "3" ? "推送次数" : "推送规则";
    },
    getMetricValue(item) {
      return item.pushCount || "N";
    },
    handlePushTabChange() {
      this.currentConfig.pushBodyList = [];
    },
    handleStandardChange() {
      this.currentConfig.pushBodyList = [];
    },
    handleSourceIdChange(value) {
      this.currentConfig.sourceId = String(value);
      const selected = this.sourceNameList.find((item) => item.id === this.currentConfig.sourceId);
      this.currentConfig.sourceName = selected ? selected.sourceName : "";
      this.currentConfig.pushBodyList = [];
    },
    async getProtectCategory() {
      const data = {
        parentId: this.currentConfig.standardId,
        needSub: 1
      };
      const resp = await resultPushByParentId(data);
      this.categoryList = this.handleTree(resp.data, "id");
    },
    async openPushContentDialog() {
      if (this.isDefaultPushMode) {
        return;
      }

      if (this.activePushTab === "1") {
        if (!this.currentConfig.standardId) {
          this.$message.warning("请先选择分类分级标准");
          return;
        }
        await this.getProtectCategory();
      } else if (!this.currentConfig.sourceId) {
        this.$message.warning("请先选择数据源名称");
        return;
      }

      this.contentShow = true;
    },
    confirmPushContent() {
      if (this.activePushTab === "1") {
        this.currentConfig.pushBodyList = this.$refs.ResultSon.lastChildList.map((item) => String(item.id));
      } else {
        this.currentConfig.pushBodyList = this.$refs.Result2Son.lastChildList.map((item) => String(item.id));
      }
      this.contentShow = false;
      this.$refs.configForm && this.$refs.configForm.validateField("pushBodyList");
    },
    buildSubmitFormData() {
      const formData = new FormData();
      const pushType = this.isDefaultPushMode ? "3" : this.activePushTab;

      if (pushType === "3" && this.currentConfig.useInnerCert === false) {
        const uploader = this.$refs.p12Upload;
        const files = uploader && uploader.uploadFiles ? uploader.uploadFiles : [];
        if (!files || !files[0] || !files[0].raw) {
          throw new Error("请上传证书文件");
        }
        formData.append("file", files[0].raw);
      }

      formData.append("id", this.currentConfig.id);
      formData.append("taskName", this.currentConfig.taskName);
      formData.append("pushType", pushType);
      formData.append("provider", this.currentConfig.provider);
      formData.append("host", this.currentConfig.host);
      formData.append("port", this.currentConfig.port);
      formData.append("userName", this.currentConfig.userName);
      formData.append("passWord", this.currentConfig.passWord);
      formData.append("useInnerCert", this.currentConfig.useInnerCert ? "1" : "0");
      formData.append("p12Password", this.currentConfig.p12Password || "");
      formData.append("pushBody", Array.isArray(this.currentConfig.pushBodyList) ? this.currentConfig.pushBodyList.join() : "");

      if (pushType === "1") {
        formData.append("standardId", this.currentConfig.standardId || "");
      } else if (pushType === "2") {
        formData.append("standardId", this.currentConfig.sourceId || "");
        formData.append("sourceName", this.currentConfig.sourceName || "");
      } else {
        formData.append("standardId", "");
      }

      return formData;
    },
    async handleSave() {
      this.$refs.configForm.validate(async (valid) => {
        if (!valid) return;
        try {
          const formData = this.buildSubmitFormData();
          if (this.currentConfig.id) {
            await updateResultPush(formData);
            this.$message.success("保存配置成功");
          } else {
            await addResultPush(formData);
            this.$message.success("新增配置成功");
          }
          await this.fetchPlatformList();
        } catch (error) {
          this.$message.error(error.message || "保存失败");
        }
      });
    },
    async handleTest() {
      if (!this.currentConfig.id) {
        this.$message.warning("当前平台暂无可测试配置");
        return;
      }
      const res = await testLink({ id: this.currentConfig.id });
      if (res.code === 200) {
        this.$message.success("测试链接成功");
        await this.fetchPlatformList();
      }
    }
  }
};
</script>

<style>
input[aria-hidden=true] {
  display: none !important;
}
</style>

<style scoped lang="scss">
.result-push-page {
  min-height: calc(100vh - 84px);
  background: #f4f7fb;
  padding: 28px 24px;
}

.result-layout {
  min-height: calc(100vh - 140px);
}

.left-sidebar-card,
.right-content-card {
  border-radius: 18px;
  border: 1px solid #e7edf5;
  box-shadow: 0 10px 30px rgba(15, 35, 95, 0.05);
  background: #fff;
}

.left-sidebar-card ::v-deep .el-card__body,
.right-content-card ::v-deep .el-card__body {
  padding: 0;
}

.right-content-card ::v-deep .el-card__body {
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.platform-list {
  padding: 10px;
}

.platform-card {
  border: 1px solid #dfe7f2;
  border-radius: 16px;
  padding: 22px 20px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
}

.platform-card + .platform-card {
  margin-top: 18px;
}

.platform-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(31, 53, 110, 0.08);
}

.platform-card.is-active.platform-card--cyan {
  border-color: #20c4f4;
  box-shadow: inset 0 0 0 1px #20c4f4;
}

.platform-card.is-active.platform-card--red {
  border-color: #ff6666;
  box-shadow: inset 0 0 0 1px #ff6666;
}

.platform-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.platform-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.platform-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.platform-card--cyan .platform-card__icon {
  color: #17b9ea;
  background: #ecfbff;
}

.platform-card--red .platform-card__icon {
  color: #ff6767;
  background: #fff2f2;
}

.platform-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #14233d;
  line-height: 1.4;
}

.status-badge {
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  border: 1px solid #dbe4ef;
  color: #8a97aa;
  background: #fff;
  flex-shrink: 0;
}

.status-badge--success {
  color: #1fb86c;
  border-color: #b9efcd;
  background: #f0fff6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #aeb8c5;
}

.platform-card__meta {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.platform-card__label {
  display: block;
  font-size: 14px;
  color: #8d99ad;
  margin-bottom: 8px;
}

.platform-card__value {
  display: block;
  font-size: 26px;
  line-height: 1;
}

.platform-card--cyan .platform-card__value {
  color: #13b7e8;
}

.platform-card--red .platform-card__value {
  color: #ff6666;
}

.platform-card__datetime {
  display: block;
  font-size: 14px;
  line-height: 1.4;
  color: #243450;
  font-weight: 500;
  text-align: right;
}

.right-content-card {
  min-height: calc(100vh - 140px);
}

.content-header {
  padding: 28px 32px 22px;
  border-bottom: 1px solid #edf1f7;
}

.content-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #14233d;
}

.content-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.content-header__icon--cyan {
  color: #17b9ea;
}

.content-header__icon--red {
  color: #ff6767;
}

.config-form {
  padding: 30px 32px 0;
}

.config-form ::v-deep .el-form-item {
  margin-bottom: 28px;
}

.config-form ::v-deep .el-form-item__label {
  padding-bottom: 10px;
  color: #15243e;
  font-weight: 600;
}

.config-form ::v-deep .el-form-item.is-required .el-form-item__label::before {
  color: #ff5e5e;
}

.config-form ::v-deep .el-input__inner,
.config-form ::v-deep .el-select .el-input__inner {
  height: 42px;
  line-height: 42px;
  border-radius: 8px;
  border-color: #dbe3ef;
  color: #243450;
}

.config-form ::v-deep .el-select {
  width: 100%;
}

.section-block {
  padding: 6px 0 16px;
  border-top: 1px solid #edf1f7;
}

.section-block--cert {
  padding-top: 24px;
}

.section-title {
  margin-bottom: 18px;
  font-size: 15px;
  font-weight: 700;
  color: #14233d;
}

.full-width {
  width: 100%;
}

.cert-row {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #31415f;
  font-size: 14px;
  margin-bottom: 18px;
}

.cert-row__current {
  color: #5d6b85;
}

.upload-area ::v-deep .el-upload,
.upload-area ::v-deep .el-upload-dragger {
  width: 100%;
}

.push-panel {
  margin-bottom: 22px;
  border: 1px solid #e5ebf3;
  border-radius: 16px;
  overflow: hidden;
}

.push-panel__header {
  padding: 18px 24px;
  font-size: 16px;
  font-weight: 700;
  color: #14233d;
  border-bottom: 1px solid #edf1f7;
  background: linear-gradient(180deg, #fbfcfe 0%, #f7f9fc 100%);
}

.push-panel__body {
  padding: 18px 24px 8px;
}

.push-tabs {
  margin-bottom: 14px;
}

.push-tabs ::v-deep .el-tabs__header {
  margin-bottom: 18px;
}

.push-tabs ::v-deep .el-tabs__nav-wrap::after {
  background-color: #edf1f7;
}

.push-tabs ::v-deep .el-tabs__item {
  font-weight: 600;
  color: #5c6b86;
}

.push-tabs ::v-deep .el-tabs__item.is-active {
  color: #3c78ff;
}

.push-tabs ::v-deep .el-tabs__active-bar {
  background-color: #3c78ff;
}

.push-content-display {
  height: 48px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #f7f9fc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: #3c4a64;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.push-content-display:hover {
  border-color: #8fb2ff;
  background: #f4f8ff;
}

.footer-actions {
  padding: 22px 32px 32px;
  border-top: 1px solid #edf1f7;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: auto;
}

.footer-actions ::v-deep .el-button {
  min-width: 112px;
  height: 38px;
  border-radius: 8px;
}

@media (max-width: 1200px) {
  .platform-card__meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .platform-card__datetime {
    text-align: left;
  }
}

@media (max-width: 768px) {
  .result-push-page {
    padding: 16px;
  }

  .config-form,
  .content-header,
  .footer-actions {
    padding-left: 18px;
    padding-right: 18px;
  }

  .push-panel__body,
  .push-panel__header {
    padding-left: 16px;
    padding-right: 16px;
  }

  .cert-row {
    flex-wrap: wrap;
  }
}
.pushContent ::v-deep .el-dialog {
  border-radius: 16px;
}
</style>
