<template>
  <div class="app-container">
    <div class="header">
      <el-button size="medium" type="primary" plain @click="addApiKeys()">
        {{ $t('capacity.createApiKey') }}
      </el-button>
      <el-button size="medium" type="primary" plain style="float:right" @click="showApiDoc = true">
        {{ $t('capacity.viewApiDoc') }}
      </el-button>
    </div>
    <el-card class="table-card" shadow="never">
      <el-table v-loading="loading" height="700px" class="tableBox" :data="tableList" ref="tableRef">
        <template slot="empty">
          <el-empty :description="$t('noData')"></el-empty>
        </template>
        <el-table-column :label="$t('capacity.apiKey')" width="300" align="center" prop="proxyToken">
          <template slot-scope="scope">
            <span>{{ scope.row.proxyToken }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('capacity.creditAddress')" width="230" align="center" prop="ip" />
        <el-table-column :label="$t('capacity.accountNumber')" width="180" align="center" prop="accountNumber" />
        <el-table-column :label="$t('description')" align="center" prop="userData" />
        <el-table-column :label="$t('capacity.callCount')" align="center" width="120" prop="callNum" />
        <el-table-column :label="$t('createdTime')" align="center" width="180" prop="updateTime" />
        <el-table-column :label="$t('operation')" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <template>
              <el-button size="mini" type="text" v-if="scope.row.passTextShow" @click="resultLookFn(scope.row)">
                {{ $t('view') }}
              </el-button>
              <el-button size="mini" type="text" v-else @click="copyApiKey(scope.row)">
                {{ $t('copy') }}
              </el-button>
            </template>
            <el-button size="mini" type="text" @click="updataFn(scope.row)">{{ $t('update') }}</el-button>
            <el-button size="mini" type="text" @click="editFn(scope.row)">{{ $t('edit') }}</el-button>
            <el-button size="mini" type="text" @click="deleteFn(scope.row)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <el-dialog class="addMsg" :title="$t(dialogTitleKey)" v-loading="formLoading" :visible.sync="dialogShow"
      append-to-body :close-on-click-modal="false" width="700px">
      <el-form :model="ApiForm" ref="ApiForm" size="small" label-width="auto" :rules="apiRules" label-position="top">
        <el-form-item :label="$t('capacity.accountNumber')" prop="accountNumber">
          <el-select v-model="ApiForm.accountNumber" :placeholder="$t('all')">
            <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('description')" prop="userData">
          <el-input v-model="ApiForm.userData" :placeholder="$t('capacity.enterDescription')" />
        </el-form-item>
        <el-form-item :label="$t('capacity.creditAddress')" prop="ip">
          <el-input v-model="ApiForm.ip" :placeholder="$t('capacity.enterCreditAddress')" />
          <div style="font-size: 12px; font-style: italic;">{{ $t('capacity.ipExample') }}</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm">{{ $t('confirm') }}</el-button>
        <el-button @click="closeFn">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <viewApiDoc ref="viewApiDocRef" :visible.sync="showApiDoc" :api-data="parsedApiData" />
  </div>
</template>

<script>
import { getApiV1List, addApiV1, deleteApiV1, generateToken, updateApiV1 } from "@/api/APIAbutment";
import viewApiDoc from '@/views/APIAbutment/capacity/viewApiDoc.vue';
import axios from 'axios';
import { selectUserListAll } from "@/api/standard";

export default {
  name: 'capacity',
  components: {
    viewApiDoc
  },
  data() {
    return {
      tableList: [{ id: 1 }],
      loading: false,
      total: 0,
      dialogShow: false,
      dialogTitleKey: 'capacity.createApiKey',
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      userList: [],
      formLoading: false,
      ApiForm: {
        accountNumber: '',
        ip: '',
        userData: '',
      },
      showApiDoc: false,
      parsedApiData: []
    }
  },
  computed: {
    apiRules() {
      return {
        accountNumber: [
          { required: true, message: this.$t('capacity.accountNumberRequired'), trigger: "blur" },
        ],
        userData: [
          { required: true, message: this.$t('capacity.descriptionRequired'), trigger: "blur" },
        ],
        ip: [
          { required: true, message: this.$t('capacity.creditAddressRequired'), trigger: "blur" },
        ],
      }
    }
  },
  created() {
    this.getList()
    this.getSelectUserListAll()
  },
  mounted() {
    this.loadMdFile()
  },
  methods: {
    parseApiDocs(mdContent) {
      const apiSections = [];
      const sectionSeparator = /\r?\n\s*---\s*\r?\n/;
      const sections = mdContent.split(sectionSeparator).filter(section => section.trim() !== '');

      sections.forEach(section => {
        if (!section.trim()) return;
        const lines = section.split('\n').map(line => line.trimEnd());
        const api = {};

        const nameLine = lines.find(line => line.match(/^##\s*\d+\.\s*.+$/));
        if (nameLine) {
          const nameMatch = nameLine.match(/^##\s*\d+\.\s*(.*)$/);
          api.name = nameMatch ? nameMatch[1].trim() : '';
        }

        const methodLine = lines.find(line => line.includes('**请求方法**:'));
        if (methodLine) {
          const methodMatch = methodLine.match(/\*\*请求方法\*\*:\s*(.*)/);
          api.method = methodMatch ? methodMatch[1].trim() : '';
        }

        const urlLine = lines.find(line => line.includes('**请求地址**:'));
        if (urlLine) {
          const urlMatch = urlLine.match(/\*\*请求地址\*\*:\s*(.*)/);
          api.url = urlMatch ? urlMatch[1].trim() : '';
        }

        const dataTypeLine = lines.find(line => line.includes('**请求数据类型**:'));
        if (dataTypeLine) {
          const dataTypeMatch = dataTypeLine.match(/\*\*请求数据类型\*\*:\s*(.*)/);
          api.dataType = dataTypeMatch ? dataTypeMatch[1].trim() : '';
        }

        const params = { header: [], body: [], path: [], query: [] };
        let currentParamType = null;
        let startParsingData = false;

        lines.forEach(line => {
          if (line.includes('### Header参数')) {
            currentParamType = 'header';
            startParsingData = false;
          } else if (line.includes('### Body参数')) {
            currentParamType = 'body';
            startParsingData = false;
          } else if (line.includes('### Path参数')) {
            currentParamType = 'path';
            startParsingData = false;
          } else if (line.includes('### Query参数')) {
            currentParamType = 'query';
            startParsingData = false;
          } else if (currentParamType && line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('|---')) {
              startParsingData = true;
            } else if (startParsingData) {
              const parts = line.split('|').map(p => p.trim()).filter(p => p);
              if (parts.length === 4) {
                params[currentParamType].push({
                  name: parts[0],
                  type: parts[1],
                  required: parts[2] === '是',
                  description: parts[3]
                });
              }
            }
          } else if (currentParamType && line.trim() === '无') {
            params[currentParamType] = [];
          }
        });
        api.params = params;

        const requestExampleLineIndex = lines.findIndex(line => line.includes('**请求示例**:'));
        if (requestExampleLineIndex !== -1) {
          const responseExampleLineIndex = lines.findIndex(line => line.includes('**响应示例**:'));
          const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
          const upperBound = responseExampleLineIndex !== -1
            ? responseExampleLineIndex
            : (responseStructureLineIndex !== -1 ? responseStructureLineIndex : lines.length);

          let startIdx = -1;
          let endIdx = -1;
          for (let i = requestExampleLineIndex; i < upperBound; i++) {
            if (lines[i].startsWith('```')) {
              if (startIdx === -1) {
                startIdx = i;
              } else {
                endIdx = i;
                break;
              }
            }
          }
          if (startIdx !== -1 && endIdx !== -1) {
            api.requestExample = lines.slice(startIdx + 1, endIdx).join('\n').trim();
          } else {
            api.requestExample = '';
          }
        } else {
          api.requestExample = '';
        }

        const responseExampleLineIndex = lines.findIndex(line => line.includes('**响应示例**:'));
        if (responseExampleLineIndex !== -1) {
          const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
          const upperBound = responseStructureLineIndex !== -1 ? responseStructureLineIndex : lines.length;

          let startIdx = -1;
          let endIdx = -1;
          for (let i = responseExampleLineIndex; i < upperBound; i++) {
            if (lines[i].startsWith('```')) {
              if (startIdx === -1) {
                startIdx = i;
              } else {
                endIdx = i;
                break;
              }
            }
          }
          if (startIdx !== -1 && endIdx !== -1) {
            api.responseExample = lines.slice(startIdx + 1, endIdx).join('\n').trim();
          } else {
            api.responseExample = '';
          }
        } else {
          api.responseExample = '';
        }

        const responseStructure = [];
        const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
        let startResponseData = false;
        if (responseStructureLineIndex !== -1) {
          for (let i = responseStructureLineIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('|') && line.endsWith('|')) {
              if (line.includes('|---')) {
                startResponseData = true;
              } else if (startResponseData) {
                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                if (parts.length === 6) {
                  responseStructure.push({
                    field: parts[0],
                    type: parts[1],
                    required: parts[2] === 'true',
                    constraint: parts[3],
                    chineseName: parts[4],
                    description: parts[5]
                  });
                }
              }
            }
          }
        }
        api.responseStructure = responseStructure;

        apiSections.push(api);
      });

      return apiSections;
    },
    async loadMdFile() {
      try {
        const response = await axios.get('/docs/API接口文档_20250820_v1.0.md');
        const mdContent = response.data;
        this.parsedApiData = this.parseApiDocs(mdContent);
      } catch (error) {
        console.error('MD file load failed:', error);
        this.$message.error(this.$t('capacity.apiDocNotFound'));
      }
    },
    getList() {
      this.loading = true;
      getApiV1List(this.queryParams).then(response => {
        this.tableList = response.data.rows;
        for (let item of this.tableList) {
          item.oldKeys = item.proxyToken
          item.proxyToken = this.maskMiddleSix(item.oldKeys)
          item.passTextShow = true
        }
        this.total = response.data.total;
        this.loading = false;
      });
    },
    addApiKeys() {
      this.formReset()
      this.dialogTitleKey = 'capacity.createApiKey'
      this.dialogShow = true
    },
    formReset() {
      this.ApiForm.userData = ''
      this.ApiForm.accountNumber = ''
      this.ApiForm.ip = ''
      delete this.ApiForm.id
    },
    maskMiddleSix(str) {
      if (!str || !str.length) {
        return ''
      }
      return str.slice(0, 13) + '******' + str.slice(19);
    },
    submitForm() {
      this.$refs["ApiForm"].validate(async valid => {
        if (valid) {
          this.formLoading = true
          let params = {
            accountNumber: this.ApiForm.accountNumber,
            userData: this.ApiForm.userData,
            ip: this.ApiForm.ip,
          }
          if (this.ApiForm.id != null) {
            params.id = this.ApiForm.id
            updateApiV1(params).then(() => {
              this.$modal.msgSuccess(this.$t('capacity.editSuccess'));
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            }).catch(() => {
              this.formLoading = false
            })
          } else {
            addApiV1(params).then(() => {
              this.$modal.msgSuccess(this.$t('capacity.addSuccess'));
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            }).catch(() => {
              this.formLoading = false
            })
          }
        }
      });
    },
    closeFn() {
      this.dialogShow = false
    },
    resultLookFn(row) {
      row.proxyToken = row.oldKeys
      row.passTextShow = false
    },
    copyApiKey(row) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(row.oldKeys)
          .then(() => {
            this.$message.success(this.$t('capacity.copySuccess'))
          })
          .catch(() => {
            this.$message.error(this.$t('capacity.copyFailed'))
          });
      } else {
        this.$message.error(this.$t('capacity.browserCopyUnsupported'))
      }
    },
    updataFn(row) {
      this.$confirm(this.$t('capacity.updateApiKeyConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.loading = true;
        generateToken({ id: row.id }).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.$message.success(this.$t('capacity.updateSuccess'))
            this.getList()
          }
        }).catch(() => {
          this.loading = false;
        })
      }).catch(() => {
      });
    },
    editFn(row) {
      this.formReset()
      this.ApiForm = JSON.parse(JSON.stringify(row))
      this.dialogTitleKey = 'edit'
      this.dialogShow = true
    },
    deleteFn(row) {
      this.$confirm(this.$t('capacity.deleteCurrentDataConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        this.loading = true;
        deleteApiV1({ ids: [row.id] }).then(res => {
          if (res.code === 200) {
            this.$message.success(this.$t('capacity.deleteSuccess'))
            this.getList()
          }
          this.loading = false;
        }).catch(() => {
          this.loading = false;
        })
      }).catch(() => {
      });
    },
    getSelectUserListAll() {
      selectUserListAll().then(res => {
        this.userList = res.data;
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.header {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.table-card {
  margin-top: 0;
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  ::v-deep .el-card__body {
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.tableBox {
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #e2e8f0;
}

.addMsg ::v-deep .el-input {
  width: 100%;
}

.addMsg ::v-deep .el-select {
  width: 100%;
}

.addMsg .el-select ::v-deep .el-input {
  width: 100%;
}

.addMsg ::v-deep.el-dialog {
  border-radius: 10px;
}

.addMsg ::v-deep.el-dialog__header {
  border-bottom: 1px solid #e6e6e6;
}

.addMsg ::v-deep.el-dialog__title {
  font-weight: bold;
}

.addMsg ::v-deep.el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep.el-form {
  margin-bottom: 0;
}
</style>
