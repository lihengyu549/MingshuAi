<template>
  <div class="app-container" v-loading="mainLoading">
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small" :inline="false"
      label-width="auto">
      <el-form-item label="数据源名称" prop="sourceName">
        <el-input v-model="queryParams.sourceName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据源类型" prop="sourceType">
        <el-select clearable v-model="queryParams.sourceType" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in dict.type.sys_datasource_type" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="来源业务系统" prop="businessName">
        <el-input v-model="queryParams.businessName" @input="inputSearch" placeholder="请输入数据源名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>

      <!-- <el-form-item label="分类分级标准" prop="projectId">
        <el-select clearable v-model="queryParams.projectId" filterable @change="inputSearch" placeholder="请选择分类分级标准">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item label="数据库类型" prop="databaseType">
        <el-select clearable v-model="queryParams.databaseType" @change="inputSearch" placeholder="请选择数据库类型">
          <el-option v-for="item in databaseTypeList" :key="item.value" :label="item.name" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="主机信息" prop="targetIpPort">
        <el-input v-model="queryParams.targetIpPort" @input="inputSearch" placeholder="请输入主机信息" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="扫描状态" prop="scanState">
        <el-select clearable v-model="queryParams.scanState" @change="inputSearch" placeholder="请选择扫描状态">
          <el-option v-for="item in executeStatus" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item> -->
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-dropdown @command="handleCommand" trigger="click">
          <el-button type="primary" plain size="medium" icon="el-icon-plus">
            新增
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="database">数据库</el-dropdown-item>
            <el-dropdown-item command="excel">Excel文件</el-dropdown-item>
            <el-dropdown-item command="fileDirectory">文件目录</el-dropdown-item>
            <el-dropdown-item command="fileShareServer">文件共享服务器</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-close" size="medium" @click="deleteFn">删除</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
    </el-row>
    <el-table v-loading="loading" height="570px" class="tableBox" :data="proxysList"
      @selection-change="handleSelectionChange" ref="tableRef">
      <template slot="empty">
        <el-empty description="暂无数据"></el-empty>
      </template>
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="数据源名称" align="left" width="140" prop="sourceName" show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="source-name" @click="scanContentEdit(scope.row)">
            <svg-icon :icon-class="databaseTypeIcon(scope.row.sourceTypeName)"
              style="font-size: 14px; margin-right: 5px;" />
            {{ scope.row.sourceName }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="主机信息" align="center" prop="targetIpPort" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.targetIpPort) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据源类型" align="center" prop="sourceTypeName" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.sourceTypeName) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据库类型" align="center" prop="databaseType" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.databaseType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源业务系统" align="center" prop="businessName" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.businessName) }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="分类分级标准" align="center" prop="projectName" /> -->
      <el-table-column label="扫描状态" align="center" prop="scanState">
        <template slot-scope="scope">
          <div style="display: flex; align-items: center;justify-content: center;">
            <img style="display: block; width: 20px;margin-right: 10px;"
              :src="imgSrc[scope.row.scanState ? scope.row.scanState : 'NONE']" alt="">
            <span> {{ stateMsg(scope.row.scanState) }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="耗时(毫秒)" align="center" prop="scanTime" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.scanTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据质量评估" align="center" prop="dataScore" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.dataScore) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="表数量" align="center" prop="tableCount" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.tableCount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字段数量" align="center" prop="fieldCount" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.fieldCount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件" align="center" prop="fileCount" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ emptyHandler(scope.row.fileCount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="数据字典" align="center" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.feature && scope.row.feature.featureName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)"
            :disabled="scope.row.scanState == 'RUNNING' || scope.row.sourceType == 'FILE' || scope.row.sourceType == 'API' || scope.row.sourceType == 'FILE_CATALOGUE' || scope.row.sourceType == 'FILE_SERVER' || btnLoading"
            :loading="btnLoading">开始扫描</el-button>
          <el-button size="mini" type="text" @click="stopScan(scope.row)"
            :disabled="scope.row.sourceType == 'FILE' || scope.row.sourceType == 'API' || scope.row.sourceType == 'FILE_CATALOGUE' || scope.row.sourceType == 'FILE_SERVER' || btnLoading"
            :loading="btnLoading">终止扫描</el-button>
          <!-- 添加关联数据字典按钮和下拉菜单 -->
          <el-dropdown trigger="click" @command="handleDictionaryCommand" @click.native="handleDropdownClick(scope.row)"
            :disabled="scope.row.sourceType == 'FILE' || scope.row.sourceType == 'API' || scope.row.sourceType == 'FILE_CATALOGUE' || scope.row.sourceType == 'FILE_SERVER'">
            <el-button size="mini" type="text">
              关联数据字典
            </el-button>
            <el-dropdown-menu slot="dropdown" class="dictionary-dropdown-menu">
              <el-dropdown-item v-for="item in dictionaryList" :key="item.id"
                :command="{ action: 'link', row: scope.row, dictionary: item }">
                <div class="dictionary-menu-item">
                  <span>{{ item.featureName }}</span>
                  <svg-icon iconClass="lightning" style="font-size: 14px;" />
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg" :title="title" :visible.sync="open" append-to-body :close-on-click-modal="false"
      width="700px">
      <el-form class="dialogForm" ref="form" :model="form" :rules="rules" label-width="auto" @submit.native.prevent
        label-position="top">
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据库类型" prop="databaseType" :rules="rules.databaseType">
              <el-select v-model="form.databaseType" placeholder="请选择数据库类型" @change="databaseTypeChange($event)">
                <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据源名称" prop="sourceName" :rules="rules.sourceName">
              <el-input v-model="form.sourceName" maxlength="50" placeholder="请输入数据源名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-form-item label="分类分级标准" prop="projectName" :rules="rules.projectName">
          <el-select v-model="form.projectName" :disabled="editIsFlag" placeholder="请输入分类分级框架" clearable
            @change="projectChangeEdit($event)">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="来源业务系统" prop="businessName" :rules="rules.businessName">
          <!-- @input="businessNameFn(form.businessName)" -->
          <el-input v-model="form.businessName" maxlength="50" placeholder="请输入来源业务系统" />
          <div style="font-size: 12px; font-style: italic;">示例:个人健康生理信息管理系统(建议使用中文进行描述)</div>
        </el-form-item>
        <el-form-item label="来源业务系统描述" prop="businessComment" :rules="rules.businessComment">
          <el-input type="textarea" v-model="form.businessComment" maxlength="1000" show-word-limit
            placeholder="请输入来源业务系统描述" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="主机" prop="targetIp" :rules="rules.targetIp">
              <el-input v-model="form.targetIp" @input="targetIpRulesFn" placeholder="请输入主机IP地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="targetPort" :rules="rules.targetPort">
              <el-input v-model="form.targetPort" placeholder="请输入数据库端口" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户" prop="targetUserName" :rules="rules.targetUserName">
              <el-input v-model="form.targetUserName" placeholder="请输入数据库用户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="targetUserPassword" :rules="rules.targetUserPassword">
              <el-input type="password" v-model="form.targetUserPassword" :show-password="passwordVisible"
                maxlength="100" placeholder="请输入数据库密码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-show="form.databaseType == 'ORACLE' || form.databaseType == 'OCEAN_BASE_ORACLE'" label="服务名"
          prop="connectionValue" :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput()" placeholder="请输入" />
        </el-form-item>
        <el-form-item v-show="form.databaseType == 'ORACLE' || form.databaseType == 'OCEAN_BASE_ORACLE'" label="连接方式">
          <el-radio v-model="connectionType" label="0">SID</el-radio>
          <el-radio v-model="connectionType" label="1">Service Name</el-radio>
        </el-form-item>
        <el-form-item v-show="form.databaseType != 'ORACLE' && form.databaseType != 'OCEAN_BASE_ORACLE'" label="实例名/库名"
          prop="examplesName" :rules="rules.examplesName()">
          <el-input v-model="form.examplesName" placeholder="请输入实例名/库名" />
        </el-form-item>
        <el-form-item label="扫描内容" prop="tabelCheckedName">
          <div @click="scanContentFn()"><el-input style="position: relative;" readonly>
            </el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;">{{ form.tabelCheckedName ? form.tabelCheckedName :
              '点击选择扫描内容' }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item>
          <el-radio v-model="form.proceedOrOverwrite" label="0">全量覆盖</el-radio>
          <el-radio v-model="form.proceedOrOverwrite" label="1">增量添加</el-radio>
        </el-form-item>
        <el-form-item label="周期" prop="scheduleType">
          <el-select v-model="form.scheduleType" @change="scheduleTypeChange">
            <el-option v-for="item in weekTimeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-select v-show="form.scheduleType == '2' || form.scheduleType == '3'" v-model="form.scheduleInterval"
            @change="handleIntervalChange">
            <el-option v-for="item in weekList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-time-picker v-show="form.scheduleType != '0' && form.scheduleType != ''" v-model="form.scheduleTime"
            @change="handleTimeChange" value-format='HH:mm' format="HH:mm" placeholder="任意时间点" :append-to-body="true">
          </el-time-picker>
        </el-form-item>

        <!-- <p>代理数据库信息</p>
        <el-form-item label="代理端口" prop="proxyPort">
          <el-input v-model="form.proxyPort" placeholder="请输入代理端口" />
        </el-form-item>
        <el-form-item label="代理ip" prop="proxyIp">
          <el-input v-model="form.proxyIp" placeholder="请输入代理ip" />
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitForm" :loading="submitLoading">确 定</el-button>
        <el-button @click="scanContentCanlce">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog class="addMsg" :title="titleExcel" v-loading="importDataLoading" :visible.sync="importData.importShow"
      append-to-body :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" :rules="importDataRules" :model="importData" size="medium" ref="importData"
        :inline="true" label-width="120px" label-position="top">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="importData.sourceName" maxlength="50" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <!-- <el-form-item class="addSelectClass" label="分类分级框架" prop="categoryId">
          <el-select v-model="importData.categoryId" :disabled="editIsFlag" class="serachInput" placeholder="全部">
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="来源业务系统" prop="businessName">
          <el-input v-model="importData.businessName" maxlength="50" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item label="来源业务系统描述" prop="businessComment">
          <el-input type="textarea" v-model="importData.businessComment" maxlength="1000" show-word-limit
            placeholder="请输入来源业务系统描述" />
        </el-form-item>
        <el-form-item label="导入文件" prop="importFile" class="uploadClass">
          <el-input v-model="importData.importFile" readonly placeholder="支持EXCEL格式文件导入（.xls, .xlsx)"></el-input>
          <el-upload ref="uploadRef" class="upload-demo" :limit="1" :file-list="importData.fileList"
            :auto-upload="false" :http-request="submitFormExcelFn" action="" accept=".xls,.xlsx,csv"
            :show-file-list="false" :on-change="handleFileChange" :on-exceed="handleFileExceed"
            style="margin-left: 10px;">
            <el-button size="mini" type="primary" plain>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button size="small" type="text" @click="downloadFile" id="btnDownload"
        icon="el-icon-download">样例下载</el-button>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFormExcelFn">确 定</el-button>
        <el-button @click="importcancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-drawer title="结果查看" class="dialogClass" :visible.sync="drawerShow" :destroy-on-close="true" direction="rtl"
      size="80%" :before-close="handleClose">
      <Result :treeOptions="treeOptions" :drawerData="drawerData" />
    </el-drawer>

    <el-dialog title="扫描配置" class="addMsg" v-loading="scanContentLoading" :visible.sync="scanContentShow" width="950px"
      append-to-body :close-on-click-modal="false">
      <TableSelector v-if="scanContentShow" :treeCheckedData="treeCheckedData"
        :scanContentTreeData="scanContentTreeData" :databaseTableNameParama="databaseTableNameParama"
        ref="scanContentTreeRef" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="scanContentSubmitFn">确 定</el-button>
        <el-button @click="scanContentShow = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 新增文件目录表单对话框 -->
    <el-dialog class="addMsg" :title="titleFileDirectory" v-loading="fileDirectoryLoading"
      :visible.sync="fileDirectoryData.show" append-to-body :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" :rules="fileDirectoryRules" :model="fileDirectoryData" size="medium"
        ref="fileDirectoryForm" label-width="auto" label-position="top">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="fileDirectoryData.sourceName" maxlength="50" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item label="来源业务系统" prop="businessName">
          <el-input v-model="fileDirectoryData.businessName" maxlength="50" placeholder="请输入来源业务系统"></el-input>
        </el-form-item>
        <el-form-item label="来源业务系统描述" prop="businessComment">
          <el-input type="textarea" v-model="fileDirectoryData.businessComment" maxlength="1000" show-word-limit
            placeholder="请输入来源业务系统描述" />
        </el-form-item>
        <!-- 将文件目录路径改为文件上传，1:1还原参考图效果 -->
        <el-form-item label="文件上传" prop="uploadFiles">
          <el-upload ref="fileDirectoryUploadRef" class="upload-dragger-area" drag :action="''" :auto-upload="false"
            :multiple="true" :show-file-list="false" :limit="20" :file-list="fileDirectoryData.uploadFiles"
            :on-change="handleFileDirectoryChange" :on-remove="handleFileDirectoryRemove"
            :on-exceed="handleFileDirectoryExceed"
            accept=".doc,.docx,.pdf,.txt,.md,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp">
            <div class="upload-dragger-content">
              <i class="el-icon-upload upload-icon"></i>
              <div class="upload-text">点击或拖拽上传文件</div>
              <div class="upload-tip">支持
                .doc,.docx,.pdf,.txt,.md,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif等格式（支持多文件上传，最多20个，总大小不超过50MB）
              </div>
            </div>
          </el-upload>
          <!-- 添加已选择文件列表显示区域 -->
          <div v-if="fileDirectoryData.uploadFiles && fileDirectoryData.uploadFiles.length > 0"
            class="selected-files-container">
            <div class="selected-files-header">
              <span>已选择文件 ({{ fileDirectoryData.uploadFiles.length }})</span>
              <el-button type="text" size="small" @click="clearAllFileDirectoryFiles"
                style="color: #909399;">清空所有</el-button>
            </div>
            <div class="selected-files-list">
              <div v-for="(file, index) in fileDirectoryData.uploadFiles" :key="index" class="file-item">
                <div class="file-info">
                  <i class="el-icon-document file-icon"></i>
                  <div class="file-details">
                    <div class="file-name-row">
                      <span class="file-name"><b>{{ file.name }}</b></span>
                      <el-tag type="info" dark size="small">{{ getFileExtension(file.name) }}</el-tag>
                    </div>
                    <div class="file-meta">
                      <span>大小: {{ formatFileSize(file.size) }}</span>
                      <span class="file-meta-separator">|</span>
                      <span>修改时间: {{ formatFileTime(file.raw ? file.raw.lastModified : Date.now()) }}</span>
                    </div>
                  </div>
                </div>
                <el-button type="text" icon="el-icon-close" class="remove-file-btn"
                  @click="removeFileDirectoryFile(index)"></el-button>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFileDirectoryForm">确 定</el-button>
        <el-button @click="fileDirectoryCancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 新增文件共享服务器表单对话框 -->
    <el-dialog class="addMsg" :title="titleFileShareServer" :visible.sync="fileShareServerOpen" append-to-body
      :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" ref="fileShareServerForm" :model="fileShareServerForm" :rules="fileShareServerRules" label-width="auto"
        @submit.native.prevent label-position="top">

        <!-- 基本信息 -->
        <div class="form-section-title">基本信息</div>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数据源名称" prop="sourceName">
              <el-input v-model="fileShareServerForm.sourceName" maxlength="50" placeholder="请输入数据源名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文件目录类型" prop="fileServerType">
              <el-select v-model="fileShareServerForm.fileServerType" placeholder="请选择文件目录类型">
                <el-option label="SMB" value="SMB"></el-option>
                <el-option label="NFS" value="NFS"></el-option>
                <el-option label="FTP" value="FTP"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="来源业务系统" prop="businessName">
          <el-input v-model="fileShareServerForm.businessName" maxlength="50" placeholder="请输入来源业务系统" />
        </el-form-item>

        <el-form-item label="来源业务系统描述" prop="businessComment">
          <el-input type="textarea" v-model="fileShareServerForm.businessComment" maxlength="1000" show-word-limit
            placeholder="请输入来源业务系统描述" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="主机" prop="targetIp">
              <el-input v-model="fileShareServerForm.targetIp" placeholder="请输入主机IP地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="targetPort">
              <el-input v-model="fileShareServerForm.targetPort" placeholder="请输入端口" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="用户" prop="targetUserName">
              <el-input v-model="fileShareServerForm.targetUserName" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="targetUserPassword">
              <el-input type="password" v-model="fileShareServerForm.targetUserPassword" :show-password="true"
                maxlength="100" placeholder="请输入密码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文件夹目录" prop="fileDirectory">
          <el-input v-model="fileShareServerForm.fileDirectory" placeholder="请输入文件夹目录路径" />
        </el-form-item>

        <!-- 扫描配置 -->
        <div class="form-section-title">扫描配置</div>
        <el-form-item label="扫描内容" prop="scanContent">
          <el-input v-model="fileShareServerForm.scanContent" placeholder="请输入扫描内容" />
        </el-form-item>
        <el-form-item label="扫描逻辑" prop="proceedOrOverwrite">
          <el-checkbox v-model="fileShareServerForm.proceedOrOverwrite">全量扫描</el-checkbox>
          <el-tooltip class="item" effect="dark" content="全量扫描：清空，上一次的所有扫描结果，以本次勾选的内容为准" placement="top-start">
            <svg-icon icon-class="dengpao" style="margin-left:8px;" />
          </el-tooltip>
        </el-form-item>

        <!-- 过滤配置 -->
        <div class="form-section-title">过滤配置</div>

        <!-- 文件大小过滤器 -->
        <el-form-item>
          <el-checkbox v-model="fileShareServerForm.enableFileSizeFilter">文件大小过滤器</el-checkbox>
        </el-form-item>

        <el-form-item v-if="fileShareServerForm.enableFileSizeFilter">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>扫描</span>
            <el-input v-model="fileShareServerForm.fileSizeMin" style="width: 120px;" placeholder="0"></el-input>
            <el-select v-model="fileShareServerForm.fileSizeMinUnit" style="width: 100px;">
              <el-option label="KB" value="KB"></el-option>
              <el-option label="MB" value="MB"></el-option>
              <el-option label="GB" value="GB"></el-option>
            </el-select>
            <span>至</span>
            <el-input v-model="fileShareServerForm.fileSizeMax" style="width: 120px;" placeholder="全部"></el-input>
            <el-select v-model="fileShareServerForm.fileSizeMaxUnit" style="width: 100px;">
              <el-option label="KB" value="KB"></el-option>
              <el-option label="MB" value="MB"></el-option>
              <el-option label="GB" value="GB"></el-option>
            </el-select>
            <span>的文件</span>
          </div>
        </el-form-item>

        <!-- 文件日期过滤器 -->
        <el-form-item>
          <el-checkbox v-model="fileShareServerForm.enableFileDateFilter">文件日期过滤器</el-checkbox>
        </el-form-item>

        <el-form-item v-if="fileShareServerForm.enableFileDateFilter">
          <el-radio-group v-model="fileShareServerForm.fileDateFilterType">
            <el-radio label="monthsWithin">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span>仅扫描</span>
                <el-input v-model="fileShareServerForm.fileDateMonths" style="width: 100px;" placeholder="3"></el-input>
                <span>个月之内的文件</span>
              </div>
            </el-radio>
            <el-radio label="monthsBefore">
              <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                <span>仅扫描</span>
                <el-input v-model="fileShareServerForm.fileDateMonthsBefore" style="width: 100px;"
                  placeholder=""></el-input>
                <span>个月之前的文件</span>
              </div>
            </el-radio>
            <el-radio label="dateRange">
              <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                <span>仅扫描</span>
                <el-date-picker v-model="fileShareServerForm.fileDateStart" type="date" placeholder="请选择时间"
                  value-format="yyyy-MM-dd" style="width: 160px;">
                </el-date-picker>
                <span>-</span>
                <el-date-picker v-model="fileShareServerForm.fileDateEnd" type="date" placeholder="请选择时间"
                  value-format="yyyy-MM-dd" style="width: 160px;">
                </el-date-picker>
                <span>之间的文件</span>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 调度周期 -->
        <div class="form-section-title">调度周期</div>
        <el-form-item label="执行周期" prop="scheduleType">
          <el-select v-model="fileShareServerForm.scheduleType" @change="fileShareServerScheduleTypeChange">
            <el-option v-for="item in weekTimeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-select v-show="fileShareServerForm.scheduleType == '2' || fileShareServerForm.scheduleType == '3'"
            v-model="fileShareServerForm.scheduleInterval">
            <el-option v-for="item in weekList" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-time-picker v-show="fileShareServerForm.scheduleType != '0' && fileShareServerForm.scheduleType != ''"
            v-model="fileShareServerForm.scheduleTime" value-format='HH:mm' format="HH:mm" placeholder="任意时间点"
            :append-to-body="true">
          </el-time-picker>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="submitFileShareServerForm" :loading="fileShareServerSubmitLoading">确
          定</el-button>
        <el-button @click="fileShareServerCancel">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys,
  importExcel, publish, saveDatabaseAndTables, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseMask, getListTables, databaseListI, getDatabaseNameList, getDatabaseTableNameList, stopDataScan
} from "@/api/system/proxys";
import {
  forceLogout, nameTesting, dataSacn, getFrameworks, getDatabaseAndTablesById, updateDatabaseAndTables, addOrUpdateFileDataList, checkSourceName
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
import TableSelector from './components/TableSelector.vue'
import { getFeatureSelect, relevancyDataDict } from "@/api/system/IndustryExperience";
export default {
  dicts: ['sys_datasource_type', 'sys_db_type'],
  name: "Proxys",
  components: { Result, TableSelector, },
  data() {
    return {
      databaseTableNameParama: {}, // 数据库表名传参
      scanContentShow: false, // 扫描配置弹框
      scanStateName: false,// 扫描中展示
      scanContentLoading: false,
      editIsFlag: false,
      passwordVisible: true,
      treeOptions: [],
      scanStateBtnDisabled: false,// 扫描按钮禁用条件
      treeCheckedData: [],//树节点已选中数据
      scanContentTreeData: [],//// 扫描配置树数据
      drawerShow: false,
      samplingNum: 10,
      drawerData: null,
      checkList: true,
      show: true,
      serialNumber: "",
      deleteVisible: false,
      markingId: '',
      radio: '0',
      markingVisible: false,
      addUserId: 0,
      mainLoading: false,
      submitLoading: false,
      btnLoading: false,
      imgSrc: {
        'ERR': require('@/assets/stateImg/stateDanger.png'),
        'COMPLETE': require('@/assets/stateImg/stateSuess.png'),
        'NONE': require('@/assets/stateImg/stateWaiting.png'),
        'RUNNING': require('@/assets/stateImg/stateing.png'),
      },
      weekTimeList: [
        {
          value: '0',
          label: '手动'
        }, {
          value: '1',
          label: '每天'
        }, {
          value: '2',
          label: '每周'
        }, {
          value: '3',
          label: '每月'
        }
      ],
      weekList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日',],
      databaseTypeList: [
        { name: "MYSQL", id: 0, value: "MYSQL", defaultPort: '3306' },
        { name: "SQL_SERVER", id: 1, value: "SQL_SERVER", defaultPort: '1433' },
        { name: "ORACLE", id: 2, value: "ORACLE", defaultPort: '1521' },
        { name: "POSTGRESQL", id: 3, value: "POSTGRESQL", defaultPort: '5432' },
        { name: "DM", id: 4, value: "DM", defaultPort: '5236' },
        { name: "GREENPLUM", id: 5, value: "GREENPLUM", defaultPort: '5432' },
        { name: "OCEAN_BASE_MYSQL", id: 6, value: "OCEAN_BASE_MYSQL", defaultPort: '3306' },  //mq
        { name: "OCEAN_BASE_ORACLE", id: 7, value: "OCEAN_BASE_ORACLE", defaultPort: '1521' },  //oracle
        { name: "KING_BASE", id: 8, value: "KING_BASE", defaultPort: '54321' }, // pg
        { name: "MARIA_DB", id: 9, value: "MARIA_DB", defaultPort: '3306' },    //mq
      ],
      publishStatus: [
        {
          value: 0,
          label: '未发布'
        }, {
          value: 1,
          label: '已发布'
        },
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: '扫描完成'
        }, {
          value: 'RUNNING',
          label: '扫描中'
        }, {
          value: 'NONE',
          label: '待扫描'
        }, {
          value: 'ERR',
          label: '扫描失败'
        }
      ],
      formProjectListEdit: [],
      selectProjectListEdit: [{ name: "全部", id: 0 }],
      projectNameEdit: "",
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      showSucType: 0,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 数据库代理表格数据
      proxysList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sourceType: '',
        sourceName: '',
        databaseType: '',
        businessName: '',
        proxyId: '',
        publishStatus: '',
        maskComplete: '',
        projectId: '',
      },
      // 表单参数
      form: {
        projectId: null,
        sourceName: '',
        databaseType: '',
        // targetPort:'3306',
        // targetIp:'192.168.2.38',
        // targetUserName:'root',
        // targetUserPassword:'your_password',
        tables: {},
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0',
      },
      connectionType: '1',
      titleExcel: '新增Excel文件',
      addForm: {},
      // 表单校验
      rules: {
        userPassword: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        sourceName: [{
          required: true, message: "数据源名称不能为空", trigger: "blur"
        }],
        businessName: [{
          required: true, message: "来源业务系统不能为空", trigger: "blur"
        }],
        databaseType: [{ required: true, message: '请选择数据库类型', trigger: 'blur' }],
        projectName: [{ required: true, message: '请选择选分类分级框架', trigger: 'blur' }],
        targetUserName: [
          { required: true, message: "请输入数据库用户名称", trigger: "change" },
        ],
        targetDatabase: [
          { required: true, message: "请选择数据库名称", trigger: "change" },
        ],
        targetUserPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        examplesName: () => {
          return [{
            required: ['SQL_SERVER', 'POSTGRESQL', 'GREENPLUM', 'KING_BASE'].includes(this.form.databaseType),
            message: '请输入',
            trigger: 'blur'
          }]
        },
        connectionValue: () => {
          return [{
            required: this.isServiesNameRequired,
            message: '请输入',
            trigger: 'blur'
          }]
        },
        tabelCheckedName: [{
          required: true,
          validator: this.tabelCheckedNameRules,
          trigger: 'blur'
        }],
        scheduleType: [{ required: true, message: '请选择周期', trigger: 'blur' }],
        scheduleInterval: [{ required: true, message: '请选择间隔', trigger: 'blur' }],
        scheduleTime: [{ required: true, message: '请选择时间', trigger: 'blur' }],
        targetIp: [
          { required: true, message: "请输入数据库地址", trigger: "blur" },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: "请输入有效的IP地址"
          },
        ],
        targetPort: [
          { required: true, message: "请输入端口号", trigger: "blur" },
          {
            pattern:
              /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message:
              "请输入0~65535之间的5个数字",
          },
          // {
          //   min: 1,
          //   max: 5,
          //   message: "长度在 1 ~ 5 个字符",
          // },
        ],
        businessComment: [
          { required: true, message: "请输入来源业务系统描述", trigger: "blur" },
        ],
      },
      importDataLoading: false,
      importData: {
        importFile: '', // 导入魔板文件名
        fileList: [],//导入模板的文件数据
        categoryId: '',//框架名称
        importShow: false,
        businessName: '',
        businessComment: '',
        sourceName: '',
        id: '' // 添加id字段用于编辑
      },
      isServiesNameRequired: false,
      debounceTimeout: null,
      // 表单校验
      importDataRules: {
        businessComment: [
          { required: true, message: "请输入来源业务系统描述", trigger: "blur" },
        ],
        sourceName: [
          {
            required: true, message: "请输入数据源名称", trigger: "blur"
          }
        ],
        businessName: [
          {
            required: true, message: "请输入来源业务系统", trigger: "blur"
          }
        ],
        categoryId: [
          {
            required: true, message: "请选择所属分类", trigger: "blur"
          }
        ],
        importFile: [
          { required: true, message: "请选择导入文件", trigger: "blur" },
        ],
      },
      tabelCheckedName: '',
      dictionaryList: [], // 数据字典列表
      currentRow: null, // 当前操作的行数据

      titleFileDirectory: '上传文件',
      fileDirectoryLoading: false,
      fileDirectoryData: {
        show: false,
        sourceName: '',
        businessName: '',
        businessComment: '',
        uploadFiles: [], // 将directoryPath改为uploadFiles数组
        id: '', // 添加id字段用于编辑
      },
      fileDirectoryRules: {
        sourceName: [
          { required: true, message: "请输入数据源名称", trigger: "blur" }
        ],
        businessName: [
          { required: true, message: "请输入来源业务系统", trigger: "blur" }
        ],
        businessComment: [
          { required: true, message: "请输入来源业务系统描述", trigger: "blur" }
        ],
        uploadFiles: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error('请上传文件'));
              } else {
                callback();
              }
            },
            trigger: "change"
          }
        ],
      },

      titleFileShareServer: '添加文件共享服务器',
      fileShareServerOpen: false,
      fileShareServerSubmitLoading: false,
      fileShareServerForm: {
        sourceName: '',
        fileServerType: 'SMB',
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDirectory: '',
        scanContent: '',
        enableFileSizeFilter: false,
        fileSizeMin: '0',
        fileSizeMinUnit: 'KB',
        fileSizeMax: '',
        fileSizeMaxUnit: 'KB',
        enableFileDateFilter: false,
        fileDateFilterType: 'monthsWithin',
        fileDateMonths: '3',
        fileDateMonthsBefore: '',
        fileDateStart: '',
        fileDateEnd: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: false,
        id: null, // 添加id字段用于编辑
      },
      fileShareServerRules: {
        sourceName: [
          { required: true, message: "数据源名称不能为空", trigger: "blur" }
        ],
        fileServerType: [
          { required: true, message: "请选择文件目录类型", trigger: "change" }
        ],
        businessName: [
          { required: true, message: "来源业务系统不能为空", trigger: "blur" }
        ],
        businessComment: [
          { required: true, message: "请输入来源业务系统描述", trigger: "blur" }
        ],
        targetIp: [
          { required: true, message: "请输入主机IP地址", trigger: "blur" },
          {
            pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: "请输入有效的IP地址"
          },
        ],
        targetPort: [
          { required: true, message: "请输入端口号", trigger: "blur" },
          {
            pattern: /^([1-9]\d{0,3}|0)$|^([1-5]\d{4})$|^6[0-4]\d{3}$|^65[0-4]\d{2}$|^655[0-2]\d$|^6553[0-5]$/,
            message: "请输入0~65535之间的端口号",
          },
        ],
        targetUserName: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        targetUserPassword: [
          { required: true, message: "请输入密码", trigger: "blur" }
        ],
        fileDirectory: [
          { required: true, message: "请输入文件夹目录路径", trigger: "blur" }
        ],
        scanContent: [
          { required: true, message: "请输入扫描内容", trigger: "blur" }
        ],
        scheduleType: [
          { required: true, message: "请选择执行周期", trigger: "change" }
        ],
        proceedOrOverwrite: [
          { required: true, message: "请选择扫描逻辑", trigger: "change" }
        ],
      },
    };
  },
  computed: {
  },
  created() {
    // this.queryParams.projectId = 0
    this.gettreeOptionsList()
    this.getList()
  },
  methods: {
    // 自定义校验规则
    tabelCheckedNameRules(rule, value, callback) {
      callback();
    },
    databaseTypeChange(e) {
      // ORACLE和OCEAN_BASE_ORACLE需要服务名
      if (e == 'ORACLE' || e == 'OCEAN_BASE_ORACLE') {
        this.isServiesNameRequired = true
      } else {
        this.isServiesNameRequired = false
      }
      this.form.targetPort = this.databaseTypeList.find(item => item.name === e)?.defaultPort || ''
    },
    scanContentCanlce() {
      this.open = false
      this.reset()
    },
    async getNameTestingFn() {
      let params = {
        sourceName: this.form.sourceName,
        id: this.form.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },

    async getimortantNameTestingFn() {
      let params = {
        sourceName: this.importData.sourceName,
        id: this.importData.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },

    async checkFileDirectoryNameFn() {
      let params = {
        sourceName: this.fileDirectoryData.sourceName,
        id: this.fileDirectoryData.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },

    async checkFileShareServerNameFn() {
      let params = {
        sourceName: this.fileShareServerForm.sourceName,
        id: this.fileShareServerForm.id || ''
      }
      let res = await checkSourceName(params)
      return res.code == 200
    },
    nameTestingFn(val) {
      this.form.sourceName = val.replace(/[^a-zA-Z0-9]/g, "")
    },
    stateMsg(val) {
      let msg = ''
      for (let item of this.executeStatus) {
        if (item.value == val) {
          msg = item.label
        }
      }
      return msg || '待扫描'
    },
    databaseTypeIcon(val) {
      if (val == 'Excel表') {
        return 'excel-o'
      } else if (val == 'API') {
        return 'api-o'
      } else if (val == '数据库') {
        return 'mysql-o'
      } else if (val == '文件目录') {
        return 'file-o'
      } else if (val == '文件服务器') {
        return 'fileServe-o'
      } else {
        return 'unknow-o'
      }
    },
    emptyHandler(val) {
      return val === null || val === undefined || val === '' ? '-' : val;
    },
    businessNameFn(val) {
      this.form.businessName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    serviesNameInput(val) {
      this.form.connectionValue = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    targetIpRulesFn() {

    },
    importNameTestingFn(val) {
      this.importData.sourceName = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    gettreeOptionsList() {
      this.mainLoading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        this.mainLoading = false
      });
    },
    findDatabaseValueByName(name) {
      let value;
      for (let i = 0; i < this.databaseTypeList.length; i++) {
        if (name == this.databaseTypeList[i].name) {
          value = this.databaseTypeList[i].value
        }
      }
      return value
    },

    handleInput(e) {
      this.samplingNum = e
    },
    async rulsNameIsRight(id, name) {
      let params = {
        nodeId: id,
        name,
      }
      let res = await nameTesting(params)
      this.isName = res.data
    },

    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    async submitFormExcelFn() {
      this.$refs["importData"].validate(async valid => {
        if (valid) {
          if (!await this.getimortantNameTestingFn()) {
            return
          }
          this.importDataLoading = true
          const formData = new FormData();
          if (this.importData.id) {
            formData.append('id', this.importData.id || '');
            // updateDatabaseAndTables(data)
          }
          // 将文件数组添加到 FormData 对象中
          if (this.importData.fileList && this.importData.fileList.length) {
            formData.append('file', this.importData.fileList[0].raw);
          }
          formData.append('frameworkNameId', this.importData.categoryId);
          formData.append('sourceName', this.importData.sourceName);
          formData.append('businessName', this.importData.businessName);
          formData.append('businessComment', this.importData.businessComment);
          formData.append('tabelCheckedName', this.importData.importFile);
          await importExcel(formData).then(res => {
            this.messsucc(res, '导入条目数量共');
            // this.getList();
            this.importData.categoryName = ''
            this.importData.importFile = ''
            this.importData.sourceName = ''
            this.importData.categoryId = ''
            this.importData.fileList = []
            this.importData.businessName = ''
            this.importData.businessComment = ''
            this.resetQuery()
            this.importData.importShow = false
            this.importDataLoading = false
          })
            .catch((err) => {
              this.importDataLoading = false
              this.importData.importFile = ''
              this.importData.fileList = []
            })
          // await this.rulsNameIsRight(this.importData.categoryId, params.name)

        } else {
          return false
        }
      });
    },
    handleClose() {
      this.drawerShow = false
    },
    handleFileExceed(files, fileList) {
      this.$refs.uploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.uploadRef.handleStart(files[0]); // 开始上传新文件
      });
    },
    markingCli() {
      this.$confirm('您是否要开始数据扫描？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ck = ''
        if (this.checkList == true) {
          ck = '1'
        } else {
          ck = '0'
        }
        let data = {
          nlp: ck,
          proxyId: this.markingI,
          type: this.radio,
          samplingSize: this.samplingNum

        }
        databaseMaskI(data).then((res => {
          this.$alert('数据已提交', '数据扫描', {
            confirmButtonText: '确定',
            type: 'success'
          });
          this.markingVisible = false
          this.getList();
        }))
        // 用户点击确定按钮，执行相关操作
      }).catch(() => {
        // 用户点击了取消按钮，不做任何操作
      });

    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500); // 设置防抖的时间间隔为300毫秒
    },
    handleChange(value) {
      this.radio = value
    },
    projectChangeEdit(e) {
      this.projectNameEdit = e
      this.form.projectId = e
    },
    /** 查询数据库代理列表 */
    getList() {
      this.loading = true;
      listProxys(this.queryParams).then(response => {
        this.proxysList = response.rows;
        // for (let item of this.proxysList) {
        //   item.showTag = 0
        //   item.oldPassword = item.targetUserPassword
        //   item.targetUserPassword = '******'
        // }
        this.total = response.total;
        this.loading = false;
      });
    },
    reset() {
      this.form = {
        targetIp: null,
        targetPort: null,
        targetDatabase: [],
        targetUserName: null,
        targetUserPassword: null,
        databaseType: '',
        //  protocolPort: null,
        projectId: null,
        // proxyStatus: "0"
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0',
      };
      this.isServiesNameRequired = false
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.projectId = null
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleCommand(command) {
      if (command === 'database') {
        this.handleAdd()
      } else if (command === 'excel') {
        this.handleEcelFn()
      } else if (command === 'fileDirectory') {
        this.handleFileDirectoryFn()
      } else if (command === 'fileShareServer') {
        this.handleFileShareServerFn()
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.editIsFlag = false
      this.passwordVisible = true
      this.showSucType = 0
      this.projectNameEdit = null
      this.connectionType = '1'
      this.reset();
      this.open = true;
      this.title = "添加数据库";
    },
    /** 提交按钮 */
    async submitForm() {
      if (this.submitLoading) return;
      this.submitLoading = true;
      try {
        await this.$refs["form"].validate(async valid => {
          let data = JSON.parse(JSON.stringify(this.form))
          delete data.projectName
          if (!Array.isArray(data.targetDatabase)) {
            let str = data.targetDatabase
            data.targetDatabase = str.trim() // 去除字符串首尾的空白字符
              .replace(/^"|"$/g, '') // 移除首尾的引号
              .split(',') // 按逗号分割字符串
              .filter(Boolean); // 过滤掉空字符串
          }
          data.targetDatabase = JSON.stringify(data.targetDatabase)
          data.connectionType = this.connectionType
          data.targetIpPort = this.form.targetIp + ":" + this.form.targetPort
          console.log(data);
          if (!this.editIsFlag && !data.tables) {
            this.$message({ message: '请选择扫描内容', type: 'warning' })
            this.submitLoading = false;
            return
          } else if (this.editIsFlag && data.targetDatabase == '[]' || this.editIsFlag && !data.targetDatabase) {
            this.$message({ message: '请选择扫描内容', type: 'warning' })
            this.submitLoading = false;
            return
          }
          if (valid) {
            if (!await this.getNameTestingFn()) {
              this.submitLoading = false;
              return
            }
            if (this.form.id != null) {
              data.id = this.form.id
              await updateDatabaseAndTables(data)
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            } else {
              await saveDatabaseAndTables(data)
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }
          } else {
            this.submitLoading = false;
          }
        });
      } catch (error) {
        console.error('提交表单出错:', error);
      } finally {
        this.submitLoading = false;
      }
    },
    /** 删除按钮操作 */
    deleteClick(ids) {
      delProxys(ids).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
        this.deleteVisible = false
      }).catch(() => { })
    },
    handleEcelFn() {
      this.editIsFlag = false
      this.importData.importShow = true
      this.importData.categoryId = ''
      this.importData.importFile = ''
      this.importData.sourceName = ''
      this.importData.businessName = ''
      this.importData.id = ''
      this.titleExcel = '新增Excel文件'
      this.importData.fileList = []
    },
    handleFileChange(file, fileList) {
      this.importData.importFile = file.raw.name
      this.importData.fileList = fileList;
    },
    // 导入取消
    importcancel() {
      this.importData.categoryId = ''
      this.importData.importFile = ''
      this.importData.sourceName = ''
      this.importData.businessName = ''
      this.importData.fileList = []
      this.importData.importShow = false
    },
    downloadFile() {
      const link = document.createElement('a');
      link.href = '/importFile.xlsx'; // 替换为你的文件路径
      link.download = '元数据导入样例.xlsx'; // 设置下载后的文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/proxys/export', {
        ...this.queryParams
      }, `proxys_${new Date().getTime()}.xlsx`)
    },
    scheduleTypeChange(val) {
      if (val == '3') {
        // 获取当前月的天数
        this.form.scheduleInterval = '1'
        const daysInMonth = this.getDaysInCurrentMonth();
        // 将天数转换为数组
        this.weekList = this.createDaysArray(daysInMonth);
      } else if (val == '2') {
        this.form.scheduleInterval = '周一'
        this.weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      } else {
        // 对于手动(0)和每天(1)类型，清空scheduleInterval并重置weekList
        this.form.scheduleInterval = ''
        // 重置为默认的星期数组，确保Vue响应式系统正确更新
        this.weekList = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        // 强制更新视图
        this.$forceUpdate()
      }
    },
    getDaysInCurrentMonth() {
      const now = new Date(); // 获取当前日期
      const year = now.getFullYear(); // 当前年份
      const month = now.getMonth(); // 当前月份（0-11，0表示1月）

      // 创建下个月的第一天的日期对象
      const firstDayNextMonth = new Date(year, month + 1, 1);
      // 减去一天，得到当前月的最后一天
      const lastDayCurrentMonth = new Date(firstDayNextMonth - 1);

      // 返回当前月的天数
      return lastDayCurrentMonth.getDate();
    },
    createDaysArray(days) {
      const daysArray = [];
      for (let i = 1; i <= days; i++) {
        daysArray.push(i);
      }
      return daysArray;
    },
    deleteFn() {
      let dataS = this.$refs.tableRef.selection
      let flagList // 为1 代表选中数据中有执行中的，2为没有执行中，但是有执行完成的
      if (dataS && dataS.length > 0) {
        flagList = dataS.map(item => {
          return item.scanState
        })
        if (flagList.includes('RUNNING')) {
          this.$message({ message: '选中任务包含执行中任务，无法批量删除', type: 'warning' })
          return
        }
        if (flagList.includes('COMPLETE')) {
          this.$confirm(`删除任务，将会删除数据源所关联的所有执行结果,确定删除吗`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let ids = dataS.map(item => {
              return item.id
            })
            let idsParams = ids.join(',')
            delProxys(idsParams).then(res => {
              if (res.code == 200) {
                this.$message.success(res.msg)
                this.getList()
              }
            })
          })
          return
        }
        this.$confirm(`确定删除所选中的项吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let idsParams = ids.join(',')
          delProxys(idsParams).then(res => {
            if (res.code == 200) {
              this.$message.success(res.msg)
              this.getList()
            }
          })
        })
      } else {
        this.$message({ message: '至少选择一条数据', type: 'warning' })
      }
    },
    scanStateClickFn(row) {
      if (this.btnLoading) return;
      if (row.scanState == 'COMPLETE') {
        this.$confirm(`再次扫描将会覆盖之前的所有扫描结果，确定继续吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.btnLoading = true;
          dataSacn({ proxyIds: row.id }).then(async res => {
            await this.getList()
          }).catch(() => {
            this.$message.error('扫描失败')
          }).finally(() => {
            this.btnLoading = false;
          })
        })
          .catch(() => {
            this.getList()
          })
      } else {
        this.btnLoading = true;
        dataSacn({ proxyIds: row.id }).then(async res => {
          await this.getList()
        }).catch(() => {
          this.$message.error('扫描失败')
        }).finally(() => {
          this.btnLoading = false;
        })
      }
    },
    stopScan(row) {
      if (this.btnLoading) return;
      this.$confirm(`确定要终止"${row.sourceName}"的扫描任务吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.btnLoading = true;
        stopDataScan({ proxyIds: row.id }).then(async res => {
          this.$message.success(res.msg || '终止扫描成功')
          await this.getList()
        }).catch(() => {
          this.$message.error('终止扫描失败')
        }).finally(() => {
          this.btnLoading = false;
        })
      }).catch(() => {
      })
    },
    handleTimeChange(time) {
      if (time) {
        this.form.scheduleTime = time
      }
      this.$forceUpdate()
    },
    handleIntervalChange(val) {
      this.form.scheduleInterval = val
      this.$forceUpdate()
    },
    scanContentEdit(row) {
      console.log('row', row);
      this.passwordVisible = false
      if (row.isAddTasks == 1) {
        this.editIsFlag = true
      } else {
        this.editIsFlag = false
      }
      if (row.sourceType == "FILE") {
        this.importData.importFile = row.fileName
        this.titleExcel = "编辑Excel";
        this.importData.categoryId = row.projectId
        this.importData.id = row.id
        this.importData.sourceName = row.sourceName
        this.importData.businessName = row.businessName
        this.importData.businessComment = row.businessComment
        this.importData.importShow = true
      } else if (row.sourceType == "DATABASE") {
        this.form = JSON.parse(JSON.stringify(row))
        this.form.tabelCheckedName = row.scanContent
        let targetDatabaseCopy = row.targetDatabase
        let targetDatabaseArr
        if (targetDatabaseCopy?.length > 1) {
          targetDatabaseArr = targetDatabaseCopy.split(',')
          targetDatabaseArr.splice(targetDatabaseArr.length - 1, 1)
        }
        // this.form.targetDatabase = targetDatabaseArr
        this.form.tables = row.tables || {}
        this.title = "编辑数据库";
        this.open = true
        this.scanContentLoading = true
        this.form.scheduleInterval = row.databaseProxysTimer?.scheduleInterval || ''
        this.form.scheduleTime = row.databaseProxysTimer?.scheduleTime || '00:00'
        this.form.scheduleType = row.databaseProxysTimer?.scheduleType || '0'
        this.form.proceedOrOverwrite = row.proceedOrOverwrite || '0'
        getDatabaseAndTablesById(row.id).then(res => {
          this.scanContentLoading = false
          if (res.data && res.data.options && res.data.options.length) {
            console.log('res.data', res.data);
            this.treeCheckedData = res.data.options.map(item => {
              return item.value
            })
          } else {
            this.treeCheckedData = ['0']
          }
        })
        // if (row.state == 'RUNNING') {
        //   this.$message({ message: '当前状态为运行中，无法发布', type: 'warning' })
        //   return
        // }
        // this.form = row

      } else if (row.sourceType == "FILE_CATALOGUE") { // 添加文件目录编辑支持
        // 文件目录编辑：回显数据到表单并打开弹窗
        this.titleFileDirectory = "编辑文件目录";
        this.fileDirectoryData.id = row.id;
        this.fileDirectoryData.sourceName = row.sourceName;
        this.fileDirectoryData.businessName = row.businessName;
        this.fileDirectoryData.businessComment = row.businessComment;
        // 如果有已上传的文件信息，可以在这里处理回显
        // this.fileDirectoryData.uploadFiles = row.uploadFiles || [];
        this.fileDirectoryData.show = true;

      } else if (row.sourceType == "FILE_SERVER") { // 添加文件共享服务器编辑支持
        // 文件共享服务器编辑：回显数据到表单并打开弹窗
        this.titleFileShareServer = "编辑文件共享服务器";
        this.fileShareServerForm.id = row.id;
        this.fileShareServerForm.sourceName = row.sourceName;
        this.fileShareServerForm.fileServerType = row.fileServerType || 'SMB';
        this.fileShareServerForm.businessName = row.businessName;
        this.fileShareServerForm.businessComment = row.businessComment;
        this.fileShareServerForm.targetIp = row.targetIp || '';
        this.fileShareServerForm.targetPort = row.targetPort || '';
        this.fileShareServerForm.targetUserName = row.targetUserName || '';
        this.fileShareServerForm.targetUserPassword = row.targetUserPassword || '';
        this.fileShareServerForm.fileDirectory = row.fileDirectory || '';
        this.fileShareServerForm.scanContent = row.scanContent || '';
        this.fileShareServerForm.enableFileSizeFilter = row.enableFileSizeFilter || false;
        this.fileShareServerForm.fileSizeMin = row.fileSizeMin || '0';
        this.fileShareServerForm.fileSizeMinUnit = row.fileSizeMinUnit || 'KB';
        this.fileShareServerForm.fileSizeMax = row.fileSizeMax || '';
        this.fileShareServerForm.fileSizeMaxUnit = row.fileSizeMaxUnit || 'KB';
        this.fileShareServerForm.enableFileDateFilter = row.enableFileDateFilter || false;
        this.fileShareServerForm.fileDateFilterType = row.fileDateFilterType || 'monthsWithin';
        this.fileShareServerForm.fileDateMonths = row.fileDateMonths || '3';
        this.fileShareServerForm.fileDateMonthsBefore = row.fileDateMonthsBefore || '';
        this.fileShareServerForm.fileDateStart = row.fileDateStart || '';
        this.fileShareServerForm.fileDateEnd = row.fileDateEnd || '';
        this.fileShareServerForm.scheduleType = row.databaseProxysTimer?.scheduleType || '0';
        this.fileShareServerForm.scheduleInterval = row.databaseProxysTimer?.scheduleInterval || '';
        this.fileShareServerForm.scheduleTime = row.databaseProxysTimer?.scheduleTime || '00:00';
        this.fileShareServerForm.proceedOrOverwrite = row.proceedOrOverwrite || false;
        this.fileShareServerOpen = true;
      }
    },
    // 扫描内容点击事件
    async scanContentFn() {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          this.databaseTableNameParama = {
            targetIp: this.form.targetIp,
            targetPort: this.form.targetPort,
            targetUserName: this.form.targetUserName,
            targetUserPassword: this.form.targetUserPassword,
            connectionType: this.connectionType,
            connectionValue: this.form.connectionValue,
            databaseType: this.form.databaseType,
            examplesName: this.form.examplesName,
            sourceName: this.form.sourceName,
          }
          let res = await getDatabaseNameList(this.databaseTableNameParama)
          if (res.data.length == 0) {
            this.$message({ message: '暂无数据，请稍后再试', type: 'warning' })
          } else {
            this.scanContentTreeData = res.data
            this.scanContentShow = true
            if (this.title == "添加数据库") {
              this.treeCheckedData = ['0']
            }
          }
        }
      })

    },
    scanContentSubmitFn() {
      let returnArr = this.$refs.scanContentTreeRef.returnArr
      let result = {}
      returnArr.forEach(element => {
        if ((element.checked || element.isBanxuan) && element.children.length > 0) {
          result[element.name] = [...element.children.filter(item => item.checked)]
        }
      });
      this.form.targetDatabase = []
      returnArr.forEach((item) => {
        if ((item.checked || item.isBanxuan) && item.children.length > 0) {
          this.form.targetDatabase.push(item.name)
        }
      })
      this.form.tables = result
      this.form.tabelCheckedName = `已选${this.$refs.scanContentTreeRef.selectedTableCount}张表`
      this.scanContentShow = false
    },
    // 点击下拉按钮
    handleDropdownClick(row) {
      this.currentRow = row;
      this.getDictionaryList();
    },

    // 处理下拉菜单命令
    handleDictionaryCommand(command) {
      const data = {
        id: this.currentRow.id,
        featureId: command.dictionary.id,
        isBindingFeature: true
      }
      relevancyDataDict(data).then(res => {
        if (res.code == 200) {
          this.$message.success(res.msg || '关联数据字典成功')
          this.getList()
        }
      })
    },

    // 获取数据字典列表
    async getDictionaryList() {
      try {
        const refResponse = await getFeatureSelect({ featureType: '3' }); // 自定义接口，需实际实现
        this.dictionaryList = refResponse.data;

      } catch (error) {
        this.$message.error('获取数据字典列表失败');
        this.dictionaryList = [];
      }
    },

    handleFileDirectoryFn() {
      this.titleFileDirectory = '上传文件'
      this.fileDirectoryData.show = true
      this.fileDirectoryData.sourceName = ''
      this.fileDirectoryData.businessName = ''
      this.fileDirectoryData.businessComment = ''
      this.fileDirectoryData.uploadFiles = []
      this.fileDirectoryData.id = ''
    },

    handleFileDirectoryChange(file, fileList) {
      // 检查文件总大小
      const totalSize = fileList.reduce((sum, f) => sum + f.size, 0);
      const maxSize = 50 * 1024 * 1024; // 50MB

      if (totalSize > maxSize) {
        this.$message.warning('文件总大小不能超过50MB');
        fileList.pop(); // 移除最后添加的文件
        return;
      }

      this.fileDirectoryData.uploadFiles = fileList;
      // 触发表单验证
      this.$refs.fileDirectoryForm.validateField('uploadFiles');
    },

    handleFileDirectoryRemove(file, fileList) {
      this.fileDirectoryData.uploadFiles = fileList;
      this.$refs.fileDirectoryForm.validateField('uploadFiles');
    },

    handleFileDirectoryExceed(files, fileList) {
      this.$message.warning(`最多只能上传20个文件，当前已选择${fileList.length}个文件`);
    },

    removeFileDirectoryFile(index) {
      this.fileDirectoryData.uploadFiles.splice(index, 1);
      this.$refs.fileDirectoryForm.validateField('uploadFiles');
    },

    clearAllFileDirectoryFiles() {
      this.fileDirectoryData.uploadFiles = [];
      this.$refs.fileDirectoryForm.validateField('uploadFiles');
    },

    getFileExtension(filename) {
      const ext = filename.substring(filename.lastIndexOf('.') + 1).toUpperCase();
      return ext;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatFileTime(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    },

    async submitFileDirectoryForm() {
      this.$refs["fileDirectoryForm"].validate(async valid => {
        if (valid) {
          if (!await this.checkFileDirectoryNameFn()) {
            this.fileDirectoryLoading = false
            return
          }
          this.fileDirectoryLoading = true
          // TODO: 调用API保存文件目录数据
          const formData = new FormData();
          formData.append('sourceName', this.fileDirectoryData.sourceName);
          formData.append('businessName', this.fileDirectoryData.businessName);
          formData.append('businessComment', this.fileDirectoryData.businessComment);

          if (this.fileDirectoryData.id) {
            formData.append('id', this.fileDirectoryData.id);
          }

          // 添加所有上传的文件到FormData
          this.fileDirectoryData.uploadFiles.forEach((file, index) => {
            formData.append('files', file.raw);
          });

          // 这里应该调用实际的API，暂时模拟成功
          addOrUpdateFileDataList(formData).then(res => {
            if (res.code == 200) {
              this.$modal.msgSuccess(this.fileDirectoryData.id ? "修改成功" : "新增成功");
              this.fileDirectoryData.show = false
              this.fileDirectoryLoading = false
              this.resetFileDirectoryForm()
              this.getList()
            }
          }).catch(() => {
            this.fileDirectoryLoading = false
          })
        } else {
          return false
        }
      })
    },

    fileDirectoryCancel() {
      this.fileDirectoryData.show = false
      this.resetFileDirectoryForm()
    },

    resetFileDirectoryForm() {
      this.fileDirectoryData.sourceName = ''
      this.fileDirectoryData.businessName = ''
      this.fileDirectoryData.businessComment = ''
      this.fileDirectoryData.uploadFiles = []
      this.fileDirectoryData.id = ''
      if (this.$refs.fileDirectoryForm) {
        this.$refs.fileDirectoryForm.resetFields()
      }
    },

    handleFileShareServerFn() {
      this.titleFileShareServer = '添加文件共享服务器'
      this.fileShareServerOpen = true
      this.resetFileShareServerForm()
    },

    async submitFileShareServerForm() {
      if (this.fileShareServerSubmitLoading) return

      this.$refs["fileShareServerForm"].validate(async valid => {
        if (valid) {
          if (!await this.checkFileShareServerNameFn()) {
            this.fileShareServerSubmitLoading = false
            return
          }

          this.fileShareServerSubmitLoading = true

          // TODO: 调用API保存文件共享服务器数据
          const params = {
            ...this.fileShareServerForm,
            targetIpPort: this.fileShareServerForm.targetIp + ":" + this.fileShareServerForm.targetPort,
            databaseType: 'FileShareServer',
          }

          if (this.fileShareServerForm.id) {
            params.id = this.fileShareServerForm.id;
          }

          // 这里应该调用实际的API，暂时模拟成功
          setTimeout(() => {
            this.$modal.msgSuccess(this.fileShareServerForm.id ? "修改成功" : "新增成功");
            this.fileShareServerOpen = false
            this.fileShareServerSubmitLoading = false
            this.getList()
          }, 500)
        } else {
          this.fileShareServerSubmitLoading = false
          return false
        }
      })
    },

    fileShareServerCancel() {
      this.fileShareServerOpen = false
      this.resetFileShareServerForm()
    },

    fileShareServerScheduleTypeChange(val) {
      if (val === '0') {
        this.fileShareServerForm.scheduleInterval = ''
        this.fileShareServerForm.scheduleTime = '00:00'
      }
    },

    resetFileShareServerForm() {
      this.fileShareServerForm = {
        sourceName: '',
        fileServerType: 'SMB',
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDirectory: '',
        scanContent: '',
        enableFileSizeFilter: false,
        fileSizeMin: '0',
        fileSizeMinUnit: 'KB',
        fileSizeMax: '',
        fileSizeMaxUnit: 'KB',
        enableFileDateFilter: false,
        fileDateFilterType: 'monthsWithin',
        fileDateMonths: '3',
        fileDateMonthsBefore: '',
        fileDateStart: '',
        fileDateEnd: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: false,
        id: null,
      }
      if (this.$refs.fileShareServerForm) {
        this.$refs.fileShareServerForm.resetFields()
      }
    },
  }
};
</script>
<style scoped>
.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.marking /deep/ .el-dialog:not(.is-fullscreen) {
  margin-top: 25vh !important;
}

.deleteCla /deep/ .el-dialog__body {
  padding-top: 0;
}

.scanContentBox /deep/ .el-dialog__body {
  padding: 20px;
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
}

.yuanDataClass /deep/ .el-form-item__label {
  width: 25%;
}

.yuanDataClass /deep/ .el-form-item__content {
  width: 75%;
}

.yuanDataClass /deep/ .el-select {
  width: 100%;
}

.searchBtn {
  margin-left: auto;
  height: 100%;
}

.searchBtn /deep/ .el-form-item__content {
  margin-left: 263px
}

.dialogForm .el-form-item {
  width: 100%;
}

.dialogForm .el-form-item /deep/ .el-form-item__content {
  width: 100%;
  padding-right: 15px;
}

.dialogForm .el-form-item /deep/ .el-select {
  width: 100%;
}

.uploadClass /deep/.el-form-item__content {
  display: flex;
  justify-content: space-between;
}

.addSelectClass /deep/ .el-select {
  width: calc(100%);
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox /deep/ .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.source-name {
  cursor: pointer;
  color: #409EFF;
}

/* 关联数据字典下拉菜单 */
.dictionary-dropdown-menu {
  width: 150px;
  border-radius: 10px;
}

.dictionary-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 新增表单区块标题样式 */
.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 12px 0 8px 0;
  margin-top: 10px;
  border-bottom: 2px solid #409eff;
  margin-bottom: 15px;
}

.form-section-title:first-child {
  margin-top: 0;
}

/* 添加文件上传样式，1:1还原参考图效果 */
.upload-dragger-area {
  width: 100%;
}

.upload-dragger-area /deep/ .el-upload {
  width: 100%;
}

.upload-dragger-area /deep/ .el-upload-dragger {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.upload-dragger-area /deep/ .el-upload-dragger:hover {
  border-color: #409eff;
}

.upload-dragger-content {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* 已选择文件列表样式 */
.selected-files-container {
  margin-top: 20px;
  border-radius: 4px;
}

.selected-files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.selected-files-header span {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.selected-files-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 10px;
  background-color: #fafafa;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 24px;
  color: #909399;
  margin-right: 12px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.file-name {
  font-size: 14px;
  color: #303131;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  font-size: 12px;
  color: #909399;
}

.file-meta-separator {
  margin: 0 8px;
}

.remove-file-btn {
  color: #909399;
  font-size: 16px;
  padding: 4px;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  color: #f56c6c;
}

/* 滚动条样式 */
.selected-files-list::-webkit-scrollbar {
  width: 6px;
}

.selected-files-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.selected-files-list::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}

.selected-files-list::-webkit-scrollbar-track {
  background-color: #f5f7fa;
  border-radius: 3px;
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