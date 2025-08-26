<template>
  <div class="app-container" v-loading="Loading">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px"
      @submit.native.prevent>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['system:project:add']">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['system:project:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['system:project:remove']">删除</el-button>
      </el-col> -->
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['system:project:export']">导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
      <el-table-column width="55" align="center" />
      <!-- <el-table-column label="ID" align="center" prop="id" /> -->
      <el-table-column label="项目名称" width="100" align="center">
        <template slot-scope="scope">
          <a class="projecClass" @click="projectNameJump(scope.row.name, scope.row.id, scope.row.agentServerId)">
            {{ scope.row.name }}
          </a>
        </template>
      </el-table-column>
      <!-- <el-table-column  label="项目名称" align="center" prop="name" /> -->
      <el-table-column label="URL" width="350" align="center" prop="url" />
      <el-table-column label="Agent状态" width="100" align="center" prop="remark">
        <template slot-scope="scope">
          <div v-if="scope.row.agentStatus == 0">
            <el-button @click="agentStatusBtn(scope.row.agentServerId)" size="mini" type="text">
              <el-tooltip :content="msg" placement="top">
                <div class="agentClassBack"></div>
              </el-tooltip>
            </el-button>
          </div>
          <div v-if="scope.row.agentStatus == 1">
            <el-button size="mini" type="text">
              <el-tooltip :content="msgVal" placement="top">
                <div class="agentClass"></div>

              </el-tooltip>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="API防护" align="center" prop="remark">
        <template slot-scope="scope">
          <div v-if="scope.row.protectStatus == 1">
            <!-- 防护中 -->
            <el-button @click="protectedView(scope.row)" size="mini" type="text">
              <el-tooltip content="防护中,点击关闭" placement="top">
                <div class="agentClass"></div>
              </el-tooltip>
            </el-button>
          </div>
          <div class="protionDiv" v-if="scope.row.protectStatus == -1">
            <!-- <el-button size="mini" type="text" @click="portionBtn()">  -->
            <el-button size="mini" type="text" @click="portionBtn(scope.row.id)">
              <el-tooltip placement="top">
                <!-- <div class="protectionClass"></div> -->
              </el-tooltip>
              开启防护
            </el-button>
          </div>
          <div v-if="scope.row.protectStatus == 0">
            <el-button size="mini" type="text">
              <el-tooltip content="未开启,点击开启" placement="top">
                <div class="agentClassBack" @click="protectedView(scope.row)"></div>
              </el-tooltip>
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="API数量" width="120" align="center">
        <template slot-scope="scope">
          <a class="projecClass" @click="projectName(scope.row.name, scope.row.id)">
            {{ scope.row.apiNum }}
          </a>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="350" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['system:project:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['system:project:remove']">删除</el-button>
          <el-button size="mini" type="text" icon="el-icon-tickets" @click="markingStatistics(scope.row)"
            v-hasPermi="['system:project:remove']">打标统计</el-button>

          <el-button size="mini" type="text" icon="el-icon-delete-solid" @click="deleteApi(scope.row)"
            v-hasPermi="['system:project:remove']">删除API</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加或修改项目列表对话框 -->
    <div>
      <el-dialog class="addOpen" :close-on-click-modal="false" :title="title" :visible.sync="open" width="500px"
        append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="URL" prop="url">
            <el-input v-model="form.url" type="textarea" placeholder="请输入内容" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" plain @click="submitForm">确定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 添加服务 -->
    <div class="dialog">
      <el-dialog :modal="true" :close-on-click-modal="false" :close-on-press-escape="false" class="log"
        :visible.sync="centerDialogVisible" width="40%">
        <div v-loading="AgentLoading">
          <span class="order">使用Agent运行项目</span>
          <div class="orderCla">
            <div style="height: 300px; margin-top: 20px">
              <el-steps direction="vertical" :space="100" :active="2">
                <el-step title="下载Agent">
                  <template slot="description">
                    <a class="agentSpan" @click="agentBtn()">点击下载Agent</a>
                  </template>
                </el-step>
                <el-step title="运行项目" class="el-step__main1" description="">
                  <template slot="description">
                    <!-- <button type="button" class="ourBtn" @click="outerBtn"> -->
                    <div type="button" class="ourBtn">
                      <div class="copyDiv">
                        <el-link @click="outerBtn" :underline="false" icon="el-icon-document-copy"
                          style="float:right">复制</el-link>
                      </div>
                      <div class="pClass1">
                        {{ java }}<div class="divRed">Agent-Path</div>{{ dsky }}<div class="divNormal">{{ proName }}</div>
                        {{ collector }}<div class="divNormal">{{ serviceIp }}</div>{{ Dbackend }}<div class="divNormal">
                          {{ backendIp }}</div> -jar
                        <div class="divRed"> project-name.jar</div>
                      </div>
                    </div>
                    <p class="pClass">
                      参数说明：<br />
                      Agent-Path:第一步所下载的agent.jar文件的绝对路径<br />
                      project-name.jar:替换为自已的项目<br />
                      java配置参数正常写，红色的字体为需要替换的内容<br />
                    </p>
                    <div class="pClass">
                      例:java -javaagent:<div class="divRed">D:\project\agent\agent.jar</div>
                      --Dservice_name=<div class="divNormal">demo_name</div>
                      -Dbackend_service=<div class="divNormal">10.10.1.101:11800</div>
                      -jar
                      <div class="divRed">demo.jar</div>
                    </div>
                  </template>
                </el-step>
                <el-button class="sure" type="primary" @click="AaddServiceBtn">确 定</el-button>
              </el-steps>
            </div>
            <!-- <span slot="footer" class="dialog-footer"> -->
          </div>
        </div>
      </el-dialog>
    </div>
    <!-- 开启防护 -->
    <div>
      <el-dialog title="开启防护" :modal="true" :close-on-click-modal="false" :close-on-press-escape="false" class="logdiv"
        :visible.sync="protionlogVisible" width="30%">
        <!-- <el-steps :align-center=true :active="0" finish-status="success">
          <el-step title="填写网站信息"></el-step>
          <el-step title="默认配置信息"></el-step>
          <el-step title="选配配置信息"></el-step>
          <el-step title="选配配置信息"></el-step>
        </el-steps> -->
        <div>
          <div class="site">目标站点设置</div>
          <el-form ref="protectionForm" :model="protectionForm" :rules="rules" label-width="80px">
            <el-form-item label="目标站点" prop="endAddress">
              <el-input v-model="protectionForm.endAddress" placeholder="请输入IP或域名" />
            </el-form-item>
            <el-form-item label="端口号" prop="port">
              <el-input v-model="protectionForm.port" placeholder="请输入端口号" />
            </el-form-item>
            <div class="daili">
              <el-form-item>
                <div>
                  <div class="site1">代理站点设置</div>
                  <div class="kaiguan">
                    <span class="yvming">域名匹配</span>
                    <el-switch v-model="switchVal" active-color="#13ce66" inactive-color="#999">
                    </el-switch>
                  </div>
                </div>
              </el-form-item>
            </div>
            <div id="divId">
              <el-form-item v-if="switchVal" label="代理站点" prop="domainName">
                <el-input v-model="protectionForm.domainName" placeholder="请输入IP或域名" />
              </el-form-item>
            </div>
            <el-form-item label="端口号" prop="portNum">
              <el-input v-model="protectionForm.portNum" placeholder="请输入端口号" />
            </el-form-item>
            <el-form-item class="kaiqifanghu">
              <el-button type="primary" plain @click="openGuard('protectionForm')">开启防护</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </div>
    <div>
      <el-dialog :modal="true" :close-on-click-modal="false" :close-on-press-escape="false"
        :visible.sync="protionlogVisible_one" width="80%" title="站点及防护配置">
        <el-steps :align-center=true :active="1" finish-status="success">
          <el-step title="填写网站信息"></el-step>
          <el-step title="默认配置信息"></el-step>
          <el-step title="选配配置信息"></el-step>
          <el-step title="选配配置信息"></el-step>
        </el-steps>
        <div>
          <div class="flex-col">
            <span class="thumbnail_21"></span>
            <div class="text_32ss">站点相关</div>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button>重置表单</el-button>
          <el-button type="primary" plain>下一步</el-button>
        </div>
      </el-dialog>
    </div>
    <!-- 防护查看 -->
    <div>
      <el-drawer :modal="false" :wrapperClosable="false" :close-on-press-escape="false" class="drawerDiv"
        :visible.sync="protectedViewVisible">
        <div class="section_3">
          <div class="box_4"></div>
          <div class="text_31">站点详情概览</div>
        </div>
        <div class="flex-row">
          <div class="box_5">
            <div class="flex-col">
              <span class="thumbnail_21"></span>
              <div class="text_32">基本信息</div>
            </div>
            <div class="flex-col1">
              <div class="text_33">站点名称：</div>
              <div class="text_34">mncjkshjsjndjs </div>
            </div>
            <div class="flex-col1">
              <div class="text_33">策略：</div>
              <div class="text_35">mncjkshjsjndjs </div>
            </div>
            <div class="flex-col1">
              <div class="text_33">防护引擎：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
            <div class="flex-col1">
              <div class="text_33">域名：</div>
              <div class="text_34">无</div>
            </div>
          </div>
          <div class="box_5">
            <div class="flex-col">
              <span class="thumbnail_21"></span>
              <div class="text_32">代理配置</div>
            </div>
            <div class="flex-col1">
              <div class="text_33">证书信息：</div>
              <div class="text_34">- - </div>
            </div>
            <div class="flex-col1">
              <div class="text_33">策略：</div>
              <div class="text_35">低级防护 </div>
            </div>
            <div class="flex-col1">
              <div class="text_33S">客户端长链接：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
            <div class="flex-col1">
              <div class="text_33S">服务端长链接：</div>
              <span class="text_spas"></span>
              <div class="text_36S"> 已开启 </div>
            </div>
          </div>
          <div class="box_5">
            <div class="flex-cols">
              <span class="thumbnail_21"></span>
              <div class="text_32">防护配置</div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">IP来源：</div>
              <div class="text_34">X-Foxsnjshuhs </div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">日志等级：</div>
              <div class="text_34">全部(请求头+请求体+响应头+响应体) </div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">请求体检测：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">响应体检测：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">阻断页面：</div>
              <div class="text_34">默认阻断页面 </div>
            </div>
          </div>
          <div class="box_5">
            <div class="flex-cols">
              <span class="thumbnail_21"></span>
              <div class="text_32">高级配置</div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">访问审计：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
            <div class="flex-col1s">
              <div class="text_33S">病毒防护：</div>
              <span class="text_spa"></span>
              <div class="text_36"> 已开启 </div>
            </div>
          </div>
        </div>
        <div class="section_3">
          <div class="box_4"></div>
          <div class="text_31">透明防护</div>
        </div>
        <div class="text-wrapper_15">
          <table class="wrapper">
            <tr class="text_81">
              <th>名称</th>
              <th>协议</th>
              <th>防护实例</th>
              <th>地址</th>
              <th>后端地址</th>
              <th>后端端口</th>
            </tr>
            <tr>
              <td colspan="6">暂无数据</td>
              <!-- <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td> -->
            </tr>
          </table>
        </div>
        <div class="section_3">
          <div class="box_4"></div>
          <div class="text_31">透明防护</div>
        </div>
        <div class="text-wrapper_15">
          <table class="wrapper">
            <tr class="text_81">
              <th>名称</th>
              <th>协议</th>
              <th>防护实例</th>
              <th>地址</th>
              <th>后端地址</th>
              <th>后端端口</th>
            </tr>
            <tr>
              <td colspan="6">暂无数据</td>
              <!-- <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td> -->
            </tr>
          </table>
        </div>
        <div class="section_3">
          <div class="box_4"></div>
          <div class="text_31">旁路监听</div>
        </div>
        <div class="text-wrapper_15">
          <table class="wrapper">
            <tr class="text_81">
              <th>名称</th>
              <th>协议</th>
              <th>防护实例</th>
              <th>地址</th>
              <th>后端地址</th>
              <th>后端端口</th>
            </tr>
            <tr>
              <td>Peter</td>
              <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td>
              <td>Peter</td>
              <td>Griffin</td>
            </tr>
          </table>
        </div>
      </el-drawer>
    </div>
    <!-- 打标统计 -->
    <div>
      <el-dialog class="dabiao" title="打标统计" :modal="true" :close-on-click-modal="true" :close-on-press-escape="false"
        :visible.sync="markingVisible" width="40%">
        <el-table height="500" :data="tableData" style="width: 100%;height: 500px; overflow: auto;">
          <el-table-column prop="fieldName" label="策略">
          </el-table-column>
          <el-table-column prop="count" label="命中次数">
          </el-table-column>
        </el-table>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {
  listProject,
  getProject,
  delProject,
  addProject,
  updateProject,
  groupI,
  enableSecurityI,
  protectionSwitchI,
  delApi
} from "@/api/system/project";
import { getIpsI } from "@/api/system/monitor";
export default {
  name: "Project",
  data () {
    return {

      openGuardId: "",
      switchVal: false,
      Loading: false,
      tableData: [],
      markingVisible: false,
      AgentLoading: false,
      protionlogVisible_one: false,
      Dbackend: " -Dbackend.ip=",
      collector: " -Dbackend_service=",
      dsky: " -Dservice_name=",
      java: "java -javaagent:",
      protectionForm: {
        endAddress: '',
        port: null,
        portNum: null,
        domainName: '',
      },
      active: 0,
      protectedViewVisible: false,
      protionlogVisible: false,
      msgVal: "正在运行",
      msg: "未运行(点击查看启动参数)",
      // AaddService: true,
      // addOrder: false,
      serIp: "",
      serviceIp: "",
      backendIp: "",
      proName: "",
      inpName: "",
      ruleForm: {
        // pass: '',
        //   checkPass: '',
        //   age: '',
        name: "",
      },
      centerDialogVisible: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 项目列表表格数据
      projectList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        url: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        portNum: [
          { required: true, message: "请输入端口号", trigger: "change" },
          {
            pattern:
              /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
            message:
              "请输入1~65535之间的数字，禁止输入空格、中文、英文等.",
          },
          {
            min: 1,
            max: 5,
            message: "长度在 1 到 5 个字符",
          },
        ],
        port: [
          { required: true, message: "请输入端口号", trigger: "change" },
          {
            pattern:
              /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
            message:
              "请输入1~65535之间的数字，禁止输入空格、中文、英文等.",
          },
          {
            min: 1,
            max: 5,
            message: "长度在 1 到 5 个字符",
          },
        ],
        endAddress: [
          { required: true, message: "请输入IP或域名", trigger: "change" }, ,
          {
            pattern:
              /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)|((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/,
            message: "请输入正确的IP或域名。例如:IP地址:192.168.0.1, 域名:google.com",
          },
          // {
          //   min: 6,
          //   max: 18,
          //   message: "长度在 6 到 18 个字符",
          // },
        ],
        domainName: [
          { required: true, message: "请输入域名" },
          {
            pattern:
              /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)|((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/,
            message: "请输入正确的IP或域名。例如:IP地址:192.168.0.1, 域名:google.com",
          },
          {
            min: 6,
            max: 18,
            message: "长度在 6 到 18 个字符",
          },
        ],
        name: [
          { required: true, message: "请输入服务名称" },
          // {
          //   pattern: /^[a-zA-Z][a-zA-Z0-9-]{5,17}$/,
          //   message:
          //     "请输入以字母开头的6~18之间字母、数字和连接线，禁止输入空格。",
          // },
          {
            min: 1,
            max: 100,
            message: "长度在 1 到 100 个字符",
          },
        ],
        url: [
          {
            required: true,
            pattern:
              /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
            message: "请输入格式正确的路由",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created () {
    this.getList();
  },
  methods: {
    //删除Api
    deleteApi (row) {
      this.$confirm('是否要删除此列表下的所有API', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let data = {
          projectId: row.id,
        }
        delApi(data).then((res => {
          this.$message({
            message: res.msg,
            duration: 3000,
            type: 'success'
          });
          this.getList();
        }))
        // 用户点击确定按钮，执行相关操作
      }).catch(() => {
        // 用户点击了取消按钮，不做任何操作
      });

    },
    // 开启防护
    portionBtn (id) {
      this.openGuardId = id
      this.protectionForm = {
        endAddress: '',
        port: null,
        portNum: null,
        domainName: '',
      }
      this.switchVal = false
      this.protionlogVisible = true;
      // if (this.switchVal == false) {
      //   const div = document.querySelector("#divId");
      //   if (div) {
      //     div.parentNode.removeChild(div); // 删除 div 元素
      //   }
      // }
      this.resetForm("protectionForm")
    },
    openGuard (formName) {
      // if (this.switchVal == true) {
      //   const div = document.querySelector("#divId");
      //   if (div) {
      //     div.parentNode.removeChild(div); // 删除 div 元素
      //   }
      // }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let data = {
            projectId: this.openGuardId,
            targetSite: this.protectionForm.endAddress,
            targetSitePort: this.protectionForm.port,
            proxySite: this.protectionForm.domainName,
            proxySitePort: this.protectionForm.portNum
          }
          enableSecurityI(data).then((res => {
            if (res.code == 200) {
              this.$alert(res.msg, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.protionlogVisible = false;
                  this.Loading = true
                  this.getList()
                  this.Loading = false
                }
              })
            } else {
              this.$alert(res.msg, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                  this.protionlogVisible = true;
                }
              })
            }
          }))

        }

      })
    },
    /**打标统计 */
    markingStatistics (row) {
      this.Loading = true
      let data = {
        projectId: row.id,
        order: "desc"
      }
      groupI(data).then((res => {
        this.tableData = res.data
        this.markingVisible = true
        this.Loading = false
      }))
    },
    protionlogCik () {
      this.protionlogVisible = false;
      this.protionlogVisible_one = true
    },
    // 防护查看
    protectedView (row) {
      if (row.protectStatus == 0) {
        this.$confirm('您是否要开启防护？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {
            projectId: row.id,
            status: 1
          }
          protectionSwitchI(data).then((res => {
            row.protectStatus = 1

          }))

          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      } else {
        this.$confirm('您是否要关闭防护？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let data = {
            projectId: row.id,
            status: 0
          }
          protectionSwitchI(data).then((res => {
            row.protectStatus = 0
          }))
          // 用户点击确定按钮，执行相关操作
        }).catch(() => {
          // 用户点击了取消按钮，不做任何操作
        });
      }
      // this.protectedViewVisible = true
    },
    AaddServiceBtn () {
      this.centerDialogVisible = false;
      // this.addOrder=true
      // this.AaddService=false
    },
    outerBtn () {
      // alert("复制按钮");
      const input = document.createElement("input"); // 创建input对象
      const testDiv = document.querySelector(".pClass1"); // 获取需要复制文字的容器
      input.value = testDiv.innerText; // 设置复制内容
      document.body.appendChild(input); // 添加临时实例
      input.select(); // 选择实例内容
      document.execCommand("Copy"); // 执行复制
      document.body.removeChild(input); // 删除临时实例
      this.$message.success("复制成功！");
    },
    // handlerChange(e) {
    //   this.inpName = e;
    // },
    agentBtn () {
      getIpsI().then((res) => {
        window.location.href = res.data.agentUrl;
      });
    },
    // Agent 状态按钮
    agentStatusBtn (agentServerId) {
      // this.AgentLoading = true
      this.Loading = true;
      this.proName = agentServerId;
      getIpsI().then((res) => {
        this.serviceIp = res.data.serverIp;
        this.backendIp = res.data.backendIp;
        this.Loading = false
        this.centerDialogVisible = true;
      });
    },
    projectName (i, id) {
      this.$router.push({
        path: "/systemInfo/api",
        query: { id: id, name: i },
      });
    },
    projectNameJump (i, id, agentServerId) {
      this.$router.push({
        path: "/systemInfo/monitor",
        query: { name: i, id: id, agentServerId: agentServerId },
      });
    },
    /** 查询项目列表列表 */
    getList () {
      this.loading = true;
      listProject(this.queryParams).then((response) => {
        this.projectList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        name: null,
        url: null,
        remark: null,
        endAddress: null,
        port: null,
        domainName: null,
        portNum: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加项目";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids;
      getProject(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改项目";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.form.id != null) {
            updateProject(this.form).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.loading = false;
            });
          } else {
            addProject(this.form).then((response) => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.loading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除项目列表编号为"' + ids + '"的数据项？')
        .then(function () {
          return delProject(ids);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download(
        "system/project/export",
        {
          ...this.queryParams,
        },
        `project_${new Date().getTime()}.xlsx`
      );
    },
  },
};
</script>
<style scoped>
.kaiqifanghu /deep/ .el-form-item__content {
  /* float: right !important; */
  /* margin-left: 300px !important; */
  margin-left: 200px !important;
}

.daili /deep/ .kaiguan {
  text-align: center;
}

.daili /deep/ .el-form-item__content {
  margin-left: 0 !important;
}

.daili /deep/ .site1 {
  /* margin-left: -150px !important; */
  position: absolute;
  left: 3%;
  top: -10px;
}

.daili {
  width: 100%;
}

.yvming {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  padding-right: 20px;
}

.kaiguan {
  margin-top: 23px;
}

.site1 {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 24px;
  margin-left: 34px;

  /* margin-left: 20px; */
  /* margin-top: 20px; */
}

.target {
  width: 100%;
  border-bottom: 1px dashed #eee;
}

.site {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 24px;
  margin-left: 50px;
}

.copyDiv {
  margin: 10px 10px 0px 0px;
  height: 20px;
  line-height: 20px;
  /* border: 0;
  background-color: transparent; */
}

::v-deep .el-step__head.is-success {
  color: rgb(52, 158, 250);
  border-color: rgb(52, 158, 250);
}

::v-deep .el-step__title.is-success {
  font-weight: bold;
  color: rgb(52, 158, 250);
}

::v-deep .el-step__description.is-success {
  color: rgb(52, 158, 250);
}

.text-wrapper_15 {
  border-radius: 2px 2px 0px 0px;
  margin: 5px 0 0 25px;
}

.text_36S {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #FF4D4F;
  padding-left: 5px;
}

.text_36 {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #52C41A;
  padding-left: 5px;

}

.box_5 :nth-last-child(1) {
  border: 0px;
}

.text_spas {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 15px 0 0 8px;
  background-color: #FF4D4F;
}

.text_spa {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin: 15px 0 0 8px;
  background-color: #52C41A;
}

.flex-col1s {
  display: flex;
  margin-left: 12px;
  width: 355px;
  height: 30px;
  border-bottom: 1px solid #F1F1F1;
}

.flex-cols {
  position: relative;
  display: flex;
}

.flex-col1 {
  display: flex;
  margin-left: 12px;
  /* position: absolute;
  left: 50%;
  transform:  translateX(-50%); */
  width: 355px;
  height: 36px;
  border-bottom: 1px solid #F1F1F1;
}

.text_35 {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  color: #1890FF;
}

.text_34 {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}

.flex-col {
  position: relative;
  display: flex;
}

.thumbnail_21 {
  width: 2px;
  height: 11px;
  margin-top: 12px;
  margin-left: 10px;
  background: #1890FF !important;
}

.text_33S {
  width: 98px;
  text-align: right;
  height: 36px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 36px;
}

.text_33 {
  width: 70px;
  text-align: right;
  height: 36px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  line-height: 36px;
  /* padding-left: 10px; */
}

.text_32ss {
  /* border-left: 1px solid #1890FF; */
  width: 94%;
  height: 36px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  font-family: PingFangSC-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 36px;
  padding-left: 10px;
}

.text_32 {
  /* border-left: 1px solid #1890FF; */
  width: 94%;
  height: 36px;
  border-bottom: 1px solid #F1F1F1;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  font-family: PingFangSC-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 36px;
  padding-left: 10px;
}

.flex-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.text_81 {
  background-color: rgba(250, 250, 250, 1);
}

.wrapper {
  width: 770px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  text-align: center;
  height: 33px;
  line-height: 33px;
}



.box_5 {
  position: relative;
  background-color: rgba(250, 250, 250, 1);
  border-radius: 2px;
  width: 375px;
  height: 185px;
  margin-left: 24px;
  margin-top: 12px;
}

.drawerDiv /deep/ .el-drawer__body {
  position: relative;
}

.section_3 {
  display: flex;
  width: 760px;
  height: 24px;
  margin: 24px 0 0 32px;
}

.text_31 {
  width: 96px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(0, 0, 0, 0.65);
  font-size: 16px;
  font-family: PingFangSC-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 24px;
  margin-left: 8px;
}

.thumbnail_20 {
  width: 10px;
  height: 10px;
  margin: 7px 0 0 639px;
}

.box_4 {
  background-color: rgba(24, 144, 255, 1);
  border-radius: 50%;
  width: 7px;
  height: 7px;
  margin-top: 9px;
}

.drawerDiv /deep/ .el-drawer__header {
  margin-bottom: 0px;
  /* padding: 0px; */
  /* display: none; */
}

.drawerDiv /deep/ .el-drawer {
  width: 819px !important;

  /* width: 80% !important; */

  box-shadow: -6px 3px 21px 0px rgba(0, 0, 0, 0.13);
}

.projecClass {
  border: 0;
  color: #409eff;
}

.el-form-item__label {
  font-size: 12px !important;
  color: #a7aebb !important;
}

.agentSpan {
  color: #409eff;
}

.order {
  font-size: 16px;
  padding: 10px;
  display: block;
  margin-top: 10px;
  color: #000;
  margin-bottom: 10px;
}

.orderCla {
  padding-bottom: 50px;
}

.orderCla .el-steps--vertical div:nth-of-type(2) .el-step__main {
  background: #f4f7fa;
}

.demo-ruleForm {
  /* background-color: #ff5263; */
  width: 100%;
  height: 500px;
  border-top: 1px solid #ececec;
}

.demo-ruleForm /deep/.el-form-item--medium {
  margin-top: 20px;
}

.demo-ruleForm /deep/.el-form-item__content {
  margin-left: 0 !important;
}

.form-footer {
  padding-left: 100px;
}


.log /deep/ .el-dialog__body {
  padding: 0 20px 80px 20px;
}

.log /deep/.el-step__main1 .el-step__main .el-step__description .ourBtn {
  background-color: #f4f7fa;
  /* height: 20px; */
  border: 1px solid #e8ebed;
  border-radius: 5px;
}

.log /deep/.el-step__description {
  color: #000;
  font-size: 14px;
}

.log /deep/.el-step {
  flex-basis: 25% !important;
}

.log /deep/.el-step__title {
  color: #000;
}

.log /deep/.el-step__main1 .el-step__main .el-step__description .pClass1 {
  padding: 10px;
  padding-top: 0;
  background-color: #f4f7fa;
  /* height: 20px; */
  width: 98%;
  border-radius: 5px;
  /* border: 1px solid #e8ebed; */
  text-align: left;
}

.log /deep/.el-step__main1 .el-step__main .el-step__description .pClass {
  padding: 10px;
  background-color: #f4f7fa;
  /* height: 20px; */
  width: 98%;
  border-radius: 5px;
  border: 1px solid #e8ebed;
}

.pClass {
  margin-bottom: 10px;
}

.ourBtn {
  cursor: pointer;
  /* height: 20px; */
  padding: 0;
  border: 0;
  width: 98%;
  background: transparent;
}

.divRed {
  display: inline;
  color: #ec0c0c;
}

.divNormal {
  display: inline-block;
}

.log /deep/ .add-el-form {
  text-align: center;
}

/* .dialog-footer {
  position: absolute;
  right: 100px;
  bottom: 50px;
} */
.sure {
  /* float: right; */
  position: absolute;
  right: 20px;
  margin-right: 20px;
  bottom: 20px;
}

.agentClass {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #13ce66;
}

.agentClassBack {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #ccc;
}

.protectionClass {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  display: inline-block;
}

.protionDiv {
  /* display: flex; */
}

.logdiv /deep/ .el-dialog {
  margin-top: 300px !important;
  /* height: 284px; */
  background: #ffffff;
  border-radius: 3px;
}

.logdiv /deep/ .el-dialog__title {
  height: 24px;
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 24px;
}

.el-steps--horizontal {
  width: 99%;
}

.logdiv /deep/ .el-form {
  width: 100%;
  margin-top: 20px;
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
}

.logdiv /deep/ .el-form-item {
  padding-bottom: 10px;
  /* 高度 */
}

.logdiv /deep/.el-dialog__footer {
  position: absolute;
  right: 20px;
  bottom: 5px;
}

.logdiv /deep/ .dialog-footer .cancelClass {
  background: #FFF3EF;
  border-radius: 2px;
  border: 1px solid #ffccc6;
  color: #F5222D;
  font-family: PingFangSC-Regular, PingFang SC;
  margin-right: 20px;
}

.el-message-box {
  width: 400px !important;
}

.el-message-box__status {
  font-size: 16px !important;
}

.dialog /deep/ .el-dialog__wrapper {
  background-color: rgba(0, 0, 0, 0.15);
}

.addOpen /deep/ .el-dialog:not(.is-fullscreen) {
  margin-top: 321px !important;
  height: 322px;
  width: 551px !important;
  position: relative;
}

.addOpen /deep/ .el-dialog__footer {
  position: absolute;
  bottom: 0px;
  right: 0;
}

.addOpen /deep/ .el-textarea__inner {
  max-height: 50px !important;
}

/* .dabiao {
  height: 80%;
} */

.dabiao /deep/ .el-table::before {
  background-color: transparent;
}
</style>
