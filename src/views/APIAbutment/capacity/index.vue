<template>
  <div class="app-container">
    <div class="header">
      <el-button size="medium" type="primary" @click="addApiKeys()">创建API Key</el-button>
      <el-button size="medium" type="primary" style="float:right" @click="showApiDoc = true">查看接口文档</el-button>
    </div>
    <el-table v-loading="loading" max-height="700px" class="tableBox" :data="tableList" ref="tableRef">
      <el-table-column label="API Key" width="300" align="center" prop="proxyToken">
        <template slot-scope="scope">
          <span>{{ scope.row.proxyToken }}</span>
        </template>
      </el-table-column>
      <el-table-column label="授信地址" width="230" align="center" prop="ip" />
      <el-table-column label="归属账号" width="180" align="center" prop="accountNumber" />
      <el-table-column label="描述" align="center" prop="userData" />
      <el-table-column label="调用次数" align="center" width="120" prop="callNum" />
      <el-table-column label="创建时间" align="center" width="180" prop="updateTime" />
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <template>
            <el-button size="mini" type="text" v-if="scope.row.passTextShow"
              @click="resultLookFn(scope.row)">查看</el-button>
            <el-button size="mini" type="text" v-else @click="copyApiKey(scope.row)">复制</el-button>
          </template>
          <el-button size="mini" type="text" @click="updataFn(scope.row)">更新</el-button>
          <el-button size="mini" type="text" @click="editFn(scope.row)">编辑</el-button>
          <el-button size="mini" type="text" @click="deleteFn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加apikeys -->
    <el-dialog class="addMsg" title="创建API Key" v-loading="formLoading" :visible.sync="dialogShow" width="580px"
      append-to-body :close-on-click-modal="false">
      <el-form :model="ApiForm" ref="ApiForm" size="small" label-width="auto" :rules="apiRules"
        style="margin-top: 30px; width: 600px;">
        <!-- <el-form-item label="标准名称" prop="categoryId">
          <el-select v-model="ApiForm.categoryId" class="serachInput" placeholder="全部" style="margin-right: 20px">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
          <span>行业id：{{ ApiForm.categoryId }}</span>
        </el-form-item> -->
        <el-form-item label="所属账号" prop="accountNumber">
          <el-select v-model="ApiForm.accountNumber" placeholder="全部">
            <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="userData">
          <el-input v-model="ApiForm.userData" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="授信地址" prop="ip">
          <el-input v-model="ApiForm.ip" placeholder="请输入授信地址" />
          <div style="font-size: 12px; font-style: italic;">示例：192.168.1.1-200，多个IP以逗号隔开</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="closeFn">取消</el-button>
      </div>
    </el-dialog>
    <!-- 查看接口文档 -->
    <viewApiDoc ref="viewApiDocRef" :visible.sync="showApiDoc" :api-data="parsedApiData" />
  </div>
</template>

<script>
import { getApiV1List, addApiV1, deleteApiV1, generateToken, updateApiV1 } from "@/api/APIAbutment";
import viewApiDoc from '@/views/APIAbutment/capacity/viewApiDoc.vue';
import axios from 'axios';
import {
  selectUserListAll,
} from "@/api/standard";
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
      apiRules: {
        accountNumber: [
          { required: true, message: "所属账号不能为空", trigger: "blur" },
        ],
        userData: [
          { required: true, message: "描述不能为空", trigger: "blur" },
        ],
        ip: [
          { required: true, message: "授信地址不能为空", trigger: "blur" },
        ],
      },

      showApiDoc: false,
      parsedApiData: [] // 直接解析
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
    /**
 * 解析API文档Markdown内容为viewApiDoc组件所需的数据格式
 * @param {string} mdContent - API文档的Markdown文本内容
 * @returns {Array} 符合组件要求的API数据数组
 */
    parseApiDocs(mdContent) {
      const apiSections = [];
      const sections = mdContent.split('---\n');

      sections.forEach(section => {
        if (!section.trim()) return;

        const lines = section.split('\n').map(line => line.trimEnd()); // 移除行尾空格
        const api = {};

        // 1. 修复接口名称提取（核心问题：未取match结果的分组值）
        // 替换原name提取逻辑
        const nameLine = lines.find(line => line.match(/^##\s*\d+\.\s*.+$/));
        if (nameLine) {
          const nameMatch = nameLine.match(/^##\s*\d+\.\s*(.*)$/);
          api.name = nameMatch ? nameMatch[1].trim() : '';
        }

        // 2. 提取请求方法（method）
        const methodLine = lines.find(line => line.includes('**请求方法**:'));
        if (methodLine) {
          const methodMatch = methodLine.match(/\*\*请求方法\*\*:\s*(.*)/);
          api.method = methodMatch ? methodMatch[1].trim() : '';
        }

        // 3. 提取请求地址（url）
        const urlLine = lines.find(line => line.includes('**请求地址**:'));
        if (urlLine) {
          const urlMatch = urlLine.match(/\*\*请求地址\*\*:\s*(.*)/);
          api.url = urlMatch ? urlMatch[1].trim() : '';
        }

        // 4. 提取请求数据类型（dataType）
        const dataTypeLine = lines.find(line => line.includes('**请求数据类型**:'));
        if (dataTypeLine) {
          const dataTypeMatch = dataTypeLine.match(/\*\*请求数据类型\*\*:\s*(.*)/);
          api.dataType = dataTypeMatch ? dataTypeMatch[1].trim() : '';
        }

        // 5. 提取请求参数（Header和Body）
        const params = { header: [], body: [] };
        let currentParamType = null; // 标记当前解析的参数类型（header/body）
        let startParsingData = false; // 标记是否开始解析数据行（分隔线后）

        lines.forEach(line => {
          // 切换参数类型（Header/Body）
          if (line.includes('### Header参数')) {
            currentParamType = 'header';
            startParsingData = false; // 重置数据行标记
          } else if (line.includes('### Body参数')) {
            currentParamType = 'body';
            startParsingData = false; // 重置数据行标记
          }
          // 解析表格行（仅处理当前参数类型下的表格）
          else if (currentParamType && line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('|---')) {
              // 分隔线行：之后的行是数据行
              startParsingData = true;
            } else if (startParsingData) {
              // 数据行：分割并提取参数
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
            // 表头行（分隔线前的表格行）会被自动跳过（因startParsingData为false）
          }
          // 处理"无Body参数"的场景
          else if (currentParamType === 'body' && line.trim() === '无') {
            params.body = [];
          }
        });
        api.params = params;

        // 6. 提取请求示例（限制解析范围：仅在请求示例到响应示例之间搜索）
        const requestExampleLineIndex = lines.findIndex(line => line.includes('**请求示例**:'));
        if (requestExampleLineIndex !== -1) {
          // 确定请求示例的解析上限：优先取响应示例的位置，其次取响应结构的位置，最后取文档结尾
          const responseExampleLineIndex = lines.findIndex(line => line.includes('**响应示例**:'));
          const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
          const upperBound = responseExampleLineIndex !== -1
            ? responseExampleLineIndex
            : (responseStructureLineIndex !== -1 ? responseStructureLineIndex : lines.length);

          let startIdx = -1;
          let endIdx = -1;
          // 只在请求示例行到上限之间搜索```标记
          for (let i = requestExampleLineIndex; i < upperBound; i++) {
            if (lines[i].startsWith('```')) {
              if (startIdx === -1) {
                startIdx = i; // 记录开始标记位置
              } else {
                endIdx = i; // 记录结束标记位置（找到第二个```就停止）
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

        // 7. 提取响应示例（限制解析范围：仅在响应示例到响应结构之间搜索）
        const responseExampleLineIndex = lines.findIndex(line => line.includes('**响应示例**:'));
        if (responseExampleLineIndex !== -1) {
          // 确定响应示例的解析上限：取响应结构的位置，其次取文档结尾
          const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
          const upperBound = responseStructureLineIndex !== -1 ? responseStructureLineIndex : lines.length;

          let startIdx = -1;
          let endIdx = -1;
          // 只在响应示例行到上限之间搜索```标记
          for (let i = responseExampleLineIndex; i < upperBound; i++) {
            if (lines[i].startsWith('```')) {
              if (startIdx === -1) {
                startIdx = i; // 记录开始标记位置
              } else {
                endIdx = i; // 记录结束标记位置（找到第二个```就停止）
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

        // 8. 提取响应数据结构
        const responseStructure = [];
        const responseStructureLineIndex = lines.findIndex(line => line.includes('**响应数据结构**:'));
        let startResponseData = false; // 标记响应结构数据行开始

        if (responseStructureLineIndex !== -1) {
          for (let i = responseStructureLineIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('|') && line.endsWith('|')) {
              if (line.includes('|---')) {
                // 分隔线后为数据行
                startResponseData = true;
              } else if (startResponseData) {
                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                if (parts.length === 3) {
                  responseStructure.push({
                    field: parts[0],
                    type: parts[1],
                    description: parts[2]
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
    // 解析
    async loadMdFile() {
      try {
        // 关键：请求路径为根目录下的 docs/api-docs.md
        const response = await axios.get('/docs/api-docs.md');
        const mdContent = response.data; // 获取 MD 原始文本
        this.parsedApiData = this.parseApiDocs(mdContent); // 解析为组件所需数据
        console.log('this.parsedApiData', this.parsedApiData);
      } catch (error) {
        console.error('MD文件加载失败：', error);
        // 错误处理：如提示用户文件不存在
        this.$message.error('API文档不存在，请检查文件是否正确部署');
      }
    },
    // 查询列表数据
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
    // 新增
    addApiKeys() {
      this.formReset()
      this.dialogShow = true
    },
    // 重置form数据
    formReset() {
      this.ApiForm.userData = ''
      this.ApiForm.accountNumber = ''
      this.ApiForm.ip = ''
    },
    // apikey中间数据加密
    maskMiddleSix(str) {
      // if (str.length !== 18) {
      //   return '未知key，请联系后台人员';
      // }
      if (!str || !str.length) {
        return ''
      }
      return str.slice(0, 13) + '******' + str.slice(19);
    },
    submitForm() {
      this.$refs["ApiForm"].validate(async (valid) => {
        if (valid) {
          this.formLoading = true
          let params = {
            accountNumber: this.ApiForm.accountNumber,
            userData: this.ApiForm.userData,
            ip: this.ApiForm.ip,
          }
          if (this.ApiForm.id != null) {
            params.id = this.ApiForm.id
            updateApiV1(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            })
              .catch((err) => {
                this.formLoading = false
              })
          } else {
            addApiV1(params).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.getList();
              this.dialogShow = false
              this.formLoading = false
            })
              .catch((err) => {
                this.formLoading = false
              })
          }
        } else {
          return false
        }
      });

    },
    closeFn() {
      this.dialogShow = false
    },
    // 查看
    resultLookFn(row) {
      row.proxyToken = row.oldKeys
      row.passTextShow = false
    },
    // 复制
    copyApiKey(row) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(row.oldKeys)
          .then(() => {
            // alert('Text copied to clipboard!');
            this.$message.success('复制成功')
          })
          .catch(err => {
            // console.error('Failed to copy text: ', err);
            this.$message.error('复制失败')
          });
      } else {
        this.$message.error('当前浏览器不支持复制')
      }
    },
    //  更新
    updataFn(row) {
      this.$confirm('确定更新API Key吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          id: row.id,
        }
        this.loading = true;
        generateToken(data).then((res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success('更新成功')
            this.getList()
          }
        }))
          .catch(() => {
            this.loading = false;
          })

      }).catch(() => {
      });

    },
    //  编辑
    editFn(row) {
      this.formReset()
      this.ApiForm = JSON.parse(JSON.stringify(row))
      this.dialogShow = true
    },
    //  删除
    deleteFn(row) {
      this.$confirm('确定删除本条数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          ids: [row.id],
        }
        this.loading = true;
        deleteApiV1(data).then((res => {
          if (res.code == 200) {
            this.$message.success('操作成功')
            this.loading = false;
          }
        }))
          .catch(() => {
            this.loading = false;
          })
      }).catch(() => {
      });
    },
    //  获取用户列表
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
  height: 100px;
  width: 100%;

  .el-button {
    margin-top: 50px;
  }
}

.tableBox {}

.addMsg ::v-deep .el-input {
  width: 80%;
}

.addMsg ::v-deep .el-select {
  width: 80%;
}

.addMsg .el-select ::v-deep .el-input {
  width: 100%;
}
</style>
