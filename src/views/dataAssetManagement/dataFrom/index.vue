<template>
  <div class="app-container" v-loading="mainLoading">
    <el-card shadow="never" class="searchCard">
      <el-form :model="queryParams" ref="queryForm" v-show="showSearch" class="yuanDataClass" size="small"
        :inline="false" label-width="auto">
        <el-form-item :label="$t('dataFrom.sourceName')" prop="sourceName">
          <el-input v-model="queryParams.sourceName" @input="inputSearch"
            :placeholder="$t('dataFrom.pleaseInputSourceName')" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('dataFrom.sourceType')" prop="sourceType">
          <el-select clearable v-model="queryParams.sourceType" @change="inputSearch"
            :placeholder="$t('dataFrom.pleaseSelectDatabaseType')">
            <el-option v-for="item in dict.type.sys_datasource_type" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('dataFrom.businessName')" prop="businessName">
          <el-input v-model="queryParams.businessName" @input="inputSearch"
            :placeholder="$t('dataFrom.pleaseInputSourceName')" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>

        <!-- <el-form-item label="分类分级标准" prop="projectId">
        <el-select clearable v-model="queryParams.projectId" filterable @change="inputSearch" placeholder="请选择分类分级标准">
          <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item> -->
        <el-form-item :label="$t('dataFrom.databaseType')" prop="databaseType">
          <el-select clearable v-model="queryParams.databaseType" @change="inputSearch"
            :placeholder="$t('dataFrom.pleaseSelectDatabaseType')">
            <el-option v-for="item in databaseTypeList" :key="item.value" :label="item.name" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.targetIpPort')" prop="targetIpPort">
          <el-input v-model="queryParams.targetIpPort" @input="inputSearch"
            :placeholder="$t('dataFrom.pleaseInputHostIP')" clearable @keyup.enter.native="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('dataFrom.scanState')" prop="scanState">
          <el-select clearable v-model="queryParams.scanState" @change="inputSearch"
            :placeholder="$t('dataFrom.pleaseSelectDatabaseType')">
            <el-option v-for="item in executeStatus" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item class="searchBtn">
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item> -->
      </el-form>
    </el-card>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-dropdown @command="handleCommand" trigger="hover" placement="bottom-start">
          <el-button type="primary" plain size="medium" icon="el-icon-plus">
            {{ $t('dataFrom.add') }}
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="database">{{ $t('dataFrom.databaseType') }}</el-dropdown-item>
            <el-dropdown-item command="excel">Excel{{ $t('dataFrom.file') }}</el-dropdown-item>
            <el-dropdown-item command="fileDirectory">{{ $t('dataFrom.fileDirectory') }}</el-dropdown-item>
            <el-dropdown-item command="fileShareServer">{{ $t('dataFrom.fileShareServer') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-close" size="medium" @click="deleteFn">{{ $t('dataFrom.delete')
        }}</el-button>
      </el-col>
      <!-- <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar> -->
      <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click"
        style="float: inline-end; margin-right: 10px;">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedColumn" @change="handleCheckedCitiesChange" class="checkboxGroup"
          style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
          <el-checkbox style="margin-bottom: 10px;" v-for="item in setList" :label="item" :key="item.label">{{
            item.label }}</el-checkbox>
        </el-checkbox-group>
        <el-button size="medium" slot="reference">列设置</el-button>
      </el-popover>
    </el-row>
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" height="860px" class="tableBox" :data="proxysList" :key="checkedColumn.length"
        @selection-change="handleSelectionChange" ref="tableRef">
        <template slot="empty">
          <el-empty :description="$t('dataFrom.noData')"></el-empty>
        </template>
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column :label="$t('dataFrom.sourceName')" align="left" width="140" prop="sourceName"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <span class="source-name" @click="scanContentEdit(scope.row)">
              <svg-icon :icon-class="databaseTypeIcon(scope.row.sourceTypeName)"
                style="font-size: 14px; margin-right: 5px;" />
              {{ scope.row.sourceName }}
            </span>
          </template>
        </el-table-column>

        <template v-for="item in filteredCheckedColumn">
          <el-table-column v-if="item.prop === 'targetIpPort'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.targetIpPort }}</span>
            </template>
          </el-table-column>

          <el-table-column v-else-if="item.prop === 'sourceTypeName'" :key="item.prop" :label="item.label"
            align="center" :prop="item.prop" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ emptyHandler(scope.row.sourceTypeName) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.prop === 'databaseType'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ emptyHandler(scope.row.databaseType) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.prop === 'businessName'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip />
          <!-- <el-table-column label="分类分级标准" align="center" prop="projectName" /> -->
          <el-table-column v-else-if="item.prop === 'scanState'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop">
            <template slot-scope="scope">
              <div style="display: flex; align-items: center;justify-content: center;">
                <img style="display: block; width: 20px;margin-right: 10px;"
                  :src="imgSrc[scope.row.scanState ? scope.row.scanState : 'NONE']" alt="">
                <span> {{ stateMsg(scope.row.scanState) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.prop === 'scanTime'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip />
          <el-table-column v-else-if="item.prop === 'updateTime'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip />
          <el-table-column v-else-if="item.prop === 'scanProgress'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-progress :percentage="normalizeProgressValue(scope.row.scanProgress)" :stroke-width="6"
                :show-text="false"></el-progress>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.prop === 'dataScore'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-progress class="data-score-progress" type="circle" :width="42" color="#e6a23c" :stroke-width="2"
                :percentage="normalizeProgressValue(scope.row.dataScore)"></el-progress>
            </template>
          </el-table-column>
          <el-table-column v-else-if="item.prop === 'tableCount'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip />
          <el-table-column v-else-if="item.prop === 'fieldCount'" :key="item.prop" :label="item.label" align="center"
            :prop="item.prop" show-overflow-tooltip />
          <el-table-column v-else-if="item.prop === 'featureName'" :key="item.prop" :label="item.label" align="center"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span>{{ scope.row.feature && scope.row.feature.featureName || '-' }}</span>
            </template>
          </el-table-column>
        </template>

        <el-table-column :label="$t('dataFrom.operation')" align="center" class-name="small-padding fixed-width"
          min-width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="scanStateClickFn(scope.row)"
              :disabled="scope.row.scanState == 'RUNNING' || !isScanOperableSource(scope.row) || btnLoading"
              :loading="btnLoading">{{ $t('dataFrom.startScan') }}</el-button>
            <el-button size="mini" type="text" @click="stopScan(scope.row)"
              :disabled="!isScanOperableSource(scope.row) || btnLoading" :loading="btnLoading">{{
                $t('dataFrom.terminateScan') }}</el-button>
            <!-- 添加关联数据字典按钮和下拉菜单 -->
            <el-dropdown trigger="click" @command="handleDictionaryCommand"
              @click.native="handleDropdownClick(scope.row)">
              <el-button size="mini" type="text">
                {{ $t('dataFrom.linkDataDictionary') }}
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
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
        :page-size.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改数据库代理对话框 -->
    <el-dialog class="addMsg unified-dialog" :title="title" :visible.sync="open" append-to-body
      :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" ref="form" :model="form" :rules="rules" label-width="auto" @submit.native.prevent
        label-position="top">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.databaseType')" prop="databaseType" :rules="rules.databaseType">
              <el-select v-model="form.databaseType" :placeholder="$t('dataFrom.pleaseSelectDatabaseType')"
                @change="databaseTypeChange($event)">
                <el-option v-for="item in databaseTypeList" :key="item.id" :label="item.name" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.sourceName')" prop="sourceName" :rules="rules.sourceName">
              <el-input v-model="form.sourceName" maxlength="50" :placeholder="$t('dataFrom.pleaseInputSourceName')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="$t('dataFrom.businessName')" prop="businessName" :rules="rules.businessName">
          <el-input v-model="form.businessName" maxlength="50" :placeholder="$t('dataFrom.pleaseInputBusinessName')" />
          <div style="font-size: 12px; font-style: italic;">{{ $t('dataFrom.businessSystemExample') }}</div>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.businessSystemDescription')" prop="businessComment"
          :rules="rules.businessComment">
          <el-input type="textarea" v-model="form.businessComment" maxlength="1000" show-word-limit
            :placeholder="$t('dataFrom.pleaseInputBusinessDescription')" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.host')" prop="targetIp" :rules="rules.targetIp">
              <el-input v-model="form.targetIp" @input="targetIpRulesFn"
                :placeholder="$t('dataFrom.pleaseInputHostIP')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.port')" prop="targetPort" :rules="rules.targetPort">
              <el-input v-model="form.targetPort" :placeholder="$t('dataFrom.pleaseInputDatabasePort')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.user')" prop="targetUserName" :rules="rules.targetUserName">
              <el-input v-model="form.targetUserName" :placeholder="$t('dataFrom.pleaseInputDatabaseUser')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.password')" prop="targetUserPassword" :rules="rules.targetUserPassword">
              <el-input type="password" v-model="form.targetUserPassword" :show-password="passwordVisible"
                maxlength="100" :placeholder="$t('dataFrom.pleaseInputDatabasePassword')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-show="form.databaseType == 'ORACLE' || form.databaseType == 'OCEAN_BASE_ORACLE'"
          :label="$t('dataFrom.serviceName')" prop="connectionValue" :rules="rules.connectionValue()">
          <el-input v-model="form.connectionValue" maxlength="50" @input="serviesNameInput()"
            :placeholder="$t('dataFrom.pleaseInput')" />
        </el-form-item>
        <el-form-item v-show="form.databaseType == 'ORACLE' || form.databaseType == 'OCEAN_BASE_ORACLE'"
          :label="$t('dataFrom.connectionMethod')">
          <el-radio v-model="connectionType" label="0">{{ $t('dataFrom.SID') }}</el-radio>
          <el-radio v-model="connectionType" label="1">{{ $t('dataFrom.serviceNameConnection') }}</el-radio>
        </el-form-item>
        <el-form-item v-show="form.databaseType != 'ORACLE' && form.databaseType != 'OCEAN_BASE_ORACLE'"
          :label="$t('dataFrom.instanceName')" prop="examplesName" :rules="rules.examplesName()">
          <el-input v-model="form.examplesName" :placeholder="$t('dataFrom.pleaseInputInstanceName')" />
        </el-form-item>
        <el-form-item :label="$t('dataFrom.scanContent')" prop="tabelCheckedName">
          <div @click="scanContentFn()"><el-input style="position: relative;" readonly>
            </el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;">{{ form.tabelCheckedName ? form.tabelCheckedName :
              $t('dataFrom.clickToSelectScanContent') }}</el-tag>
          </div>
        </el-form-item>
        <el-form-item>
          <el-radio v-model="form.proceedOrOverwrite" label="0">{{ $t('dataFrom.fullCoverage') }}</el-radio>
          <el-radio v-model="form.proceedOrOverwrite" label="1">{{ $t('dataFrom.incrementalAdd') }}</el-radio>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.cycle')" prop="scheduleType">
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
            @change="handleTimeChange" value-format='HH:mm' format="HH:mm" :placeholder="$t('dataFrom.anyTimePoint')"
            :append-to-body="true">
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
      <div slot="footer">
        <el-button type="primary" plain @click="submitForm" :loading="submitLoading">{{ $t('confirm') }}</el-button>
        <el-button @click="scanContentCanlce">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog class="addMsg unified-dialog" :title="titleExcel" v-loading="importDataLoading"
      :visible.sync="importData.importShow" append-to-body :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" :rules="importDataRules" :model="importData" size="medium" ref="importData"
        :inline="true" label-width="120px" label-position="top">
        <el-form-item :label="$t('dataFrom.sourceNameImport')" prop="sourceName">
          <el-input v-model="importData.sourceName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputDataSourceName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.businessSystem')" prop="businessName">
          <el-input v-model="importData.businessName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputSourceBusinessSystem')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.businessSystemDescription')" prop="businessComment">
          <el-input type="textarea" v-model="importData.businessComment" maxlength="1000" show-word-limit
            :placeholder="$t('dataFrom.pleaseInputBusinessSystemDescription')" />
        </el-form-item>
        <el-form-item :label="$t('dataFrom.importFile')" prop="importFile" class="uploadClass">
          <el-input v-model="importData.importFile" readonly
            :placeholder="$t('dataFrom.supportExcelFormat')"></el-input>
          <el-upload ref="uploadRef" class="upload-demo" :limit="1" :file-list="importData.fileList"
            :auto-upload="false" :http-request="submitFormExcelFn" action="" accept=".xls,.xlsx,csv"
            :show-file-list="false" :on-change="handleFileChange" :on-exceed="handleFileExceed"
            style="margin-left: 10px;">
            <el-button size="mini" type="primary" plain>{{ $t('dataFrom.selectFile') }}</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <el-button size="small" type="text" @click="downloadFile" id="btnDownload" icon="el-icon-download">{{
        $t('dataFrom.sampleDownload') }}</el-button>
      <div slot="footer">
        <el-button type="primary" plain @click="submitFormExcelFn">{{ $t('confirm') }}</el-button>
        <el-button @click="importcancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-drawer :title="$t('dataFrom.resultView')" class="dialogClass" :visible.sync="drawerShow"
      :destroy-on-close="true" direction="rtl" size="80%" :before-close="handleClose">
      <Result :treeOptions="treeOptions" :drawerData="drawerData" />
    </el-drawer>

    <el-dialog :title="$t('dataFrom.scanConfiguration')" class="addMsg" v-loading="scanContentLoading"
      :visible.sync="scanContentShow" width="950px" append-to-body :close-on-click-modal="false">
      <TableSelector v-if="scanContentShow" :treeCheckedData="treeCheckedData"
        :scanContentTreeData="scanContentTreeData" :databaseTableNameParama="databaseTableNameParama"
        ref="scanContentTreeRef" />
      <div slot="footer">
        <el-button type="primary" plain @click="scanContentSubmitFn">{{ $t('confirm') }}</el-button>
        <el-button @click="scanContentShow = false">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 新增文件目录表单对话框 -->
    <el-dialog class="addMsg unified-dialog" :title="titleFileDirectory" v-loading="fileDirectoryLoading"
      :visible.sync="fileDirectoryData.show" append-to-body :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" :rules="fileDirectoryRules" :model="fileDirectoryData" size="medium"
        ref="fileDirectoryForm" label-width="auto" label-position="top">
        <el-form-item :label="$t('dataFrom.sourceName')" prop="sourceName">
          <el-input v-model="fileDirectoryData.sourceName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputSourceName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.businessName')" prop="businessName">
          <el-input v-model="fileDirectoryData.businessName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputBusinessName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('dataFrom.businessSystemDescription')" prop="businessComment">
          <el-input type="textarea" v-model="fileDirectoryData.businessComment" maxlength="1000" show-word-limit
            :placeholder="$t('dataFrom.pleaseInputBusinessDescription')" />
        </el-form-item>
        <el-form-item :label="$t('dataFrom.fileUpload')" prop="uploadFiles">
          <el-upload ref="fileDirectoryUploadRef" class="upload-dragger-area" drag :action="''" :auto-upload="false"
            :multiple="true" :show-file-list="false" :limit="20" :file-list="fileDirectoryData.uploadFiles"
            :on-change="handleFileDirectoryChange" :on-remove="handleFileDirectoryRemove"
            :on-exceed="handleFileDirectoryExceed"
            accept=".doc,.docx,.pdf,.txt,.md,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp">
            <div class="upload-dragger-content">
              <i class="el-icon-upload upload-icon"></i>
              <div class="upload-text">{{ $t('dataFrom.clickOrDragToUpload') }}</div>
              <div class="upload-tip">{{ $t('dataFrom.supportFormats') }}</div>
            </div>
          </el-upload>
          <div v-if="fileDirectoryData.uploadFiles && fileDirectoryData.uploadFiles.length > 0"
            class="selected-files-container">
            <div class="selected-files-header">
              <span>{{ $t('dataFrom.selectedFiles') }} ({{ fileDirectoryData.uploadFiles.length }})</span>
              <el-button type="text" size="small" @click="clearAllFileDirectoryFiles" style="color: #909399;">{{
                $t('dataFrom.clearAll') }}</el-button>
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
                      <span>{{ $t('dataFrom.size') }}: {{ formatFileSize(file.size) }}</span>
                      <span class="file-meta-separator">|</span>
                      <span>{{ $t('dataFrom.modifiedTime') }}: {{ formatFileTime(file.raw ? file.raw.lastModified :
                        Date.now()) }}</span>
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
      <div slot="footer">
        <el-button type="primary" plain @click="submitFileDirectoryForm">{{ $t('confirm') }}</el-button>
        <el-button @click="fileDirectoryCancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 新增文件共享服务器表单对话框 -->
    <el-dialog class="addMsg unified-dialog" :title="titleFileShareServer" :visible.sync="fileShareServerOpen"
      append-to-body :close-on-click-modal="false" width="700px">
      <el-form class="dialogForm" ref="fileShareServerForm" :model="fileShareServerForm" :rules="fileShareServerRules"
        label-width="auto" @submit.native.prevent label-position="top">


        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.sourceName')" prop="sourceName">
              <el-input v-model="fileShareServerForm.sourceName" maxlength="50"
                :placeholder="$t('dataFrom.pleaseInputSourceName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.fileDirectoryType')" prop="databaseType">
              <el-select v-model="fileShareServerForm.databaseType"
                :placeholder="$t('dataFrom.pleaseSelectFileDirectoryType')">
                <el-option :label="$t('dataFrom.SMB')" value="SMB"></el-option>
                <el-option :label="$t('dataFrom.FTP')" value="FTP"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="$t('dataFrom.businessName')" prop="businessName">
          <el-input v-model="fileShareServerForm.businessName" maxlength="50"
            :placeholder="$t('dataFrom.pleaseInputBusinessName')" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.businessSystemDescription')" prop="businessComment">
          <el-input type="textarea" v-model="fileShareServerForm.businessComment" maxlength="1000" show-word-limit
            :placeholder="$t('dataFrom.pleaseInputBusinessDescription')" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.host')" prop="targetIp">
              <el-input v-model="fileShareServerForm.targetIp" :placeholder="$t('dataFrom.pleaseInputHostIP')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.port')" prop="targetPort">
              <el-input v-model="fileShareServerForm.targetPort" :placeholder="$t('dataFrom.pleaseInputPort')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.user')" prop="targetUserName">
              <el-input v-model="fileShareServerForm.targetUserName"
                :placeholder="$t('dataFrom.pleaseInputUserName')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('dataFrom.password')" prop="targetUserPassword">
              <el-input type="password" v-model="fileShareServerForm.targetUserPassword" :show-password="true"
                maxlength="100" :placeholder="$t('dataFrom.pleaseInputPassword')" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="fileShareServerForm.databaseType == 'SMB'" :label="$t('dataFrom.share')" prop="share">
          <el-input v-model="fileShareServerForm.share" :placeholder="$t('dataFrom.shareExample')" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.startingPath')"
          :prop="fileShareServerForm.databaseType == 'SMB' ? '' : 'targetDatabase'">
          <el-input v-model="fileShareServerForm.targetDatabase" placeholder="例如：/data/foldor/a" />
        </el-form-item>

        <el-form-item :label="$t('dataFrom.scanContent')" prop="fileDataList">
          <div @click="openFileDirectoryDialog" style="cursor: pointer;">
            <el-input style="position: relative;" readonly></el-input>
            <el-tag style="position: absolute;top: 4px;left: 6px;" v-if="fileShareServerForm.fileDataList">
              {{ getFileShareScanContentDisplay() }}
            </el-tag>
            <el-tag style="position: absolute;top: 4px;left: 6px;" v-else type="info">
              {{ $t('dataFrom.clickToSelectScanContent') }}
            </el-tag>
          </div>
        </el-form-item>


        <el-form-item :label="$t('dataFrom.executionCycle')" prop="scheduleType">
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
            v-model="fileShareServerForm.scheduleTime" value-format='HH:mm' format="HH:mm"
            :placeholder="$t('dataFrom.anyTimePoint')" :append-to-body="true">
          </el-time-picker>
        </el-form-item>

      </el-form>
      <div slot="footer">
        <el-button type="primary" plain @click="submitFileShareServerForm" :loading="fileShareServerSubmitLoading">{{
          $t('confirm') }}</el-button>
        <el-button @click="fileShareServerCancel">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>

    <FileDirectoryTransfer ref="fileDirectoryTransferRef" @confirm="handleFileDirectoryConfirm" />
  </div>
</template>

<script>
import {
  listProxys, getProxys, connectTestI, delProxys, addProxys, updateProxys,
  importExcel, publish, saveDatabaseAndTables, startI, stopI, databaseMaskI, strategyPushI, strategyAll, databaseMask, getListTables, databaseListI, getDatabaseNameList, getDatabaseTableNameList, stopDataScan
} from "@/api/system/proxys";
import {
  forceLogout, nameTesting, dataSacn, getFrameworks, getDatabaseAndTablesById, updateDatabaseAndTables, addOrUpdateFileDataList, checkSourceName, saveFileServer, updateFileServer, dataScanByFileServer
} from "@/api/system/protectCategory"
import Result from './components/result.vue'
import TableSelector from './components/TableSelector.vue'
import FileDirectoryTransfer from "./components/FileDirectoryTransfer.vue";
import { getFeatureSelect, relevancyDataDict } from "@/api/system/IndustryExperience";
export default {
  dicts: ['sys_datasource_type', 'sys_db_type'],
  name: "Proxys",
  components: { Result, TableSelector, FileDirectoryTransfer },
  data() {
    return {
      databaseTableNameParama: {}, // 数据库表名传参
      checkedColumn: [],
      checkAll: false,
      isIndeterminate: false,
      setList: [
        {
          label: this.$t('dataFrom.targetIpPort'),
          prop: "targetIpPort"
        },
        {
          label: this.$t('dataFrom.dataSourceType'),
          prop: "sourceTypeName"
        },
        {
          label: this.$t('dataFrom.databaseTypeCol'),
          prop: "databaseType"
        },
        {
          label: this.$t('dataFrom.sourceBusinessSystem'),
          prop: "businessName"
        },
        {
          label: this.$t('dataFrom.scanStatus'),
          prop: "scanState"
        },
        {
          label: this.$t('dataFrom.timeConsuming'),
          prop: "scanTime"
        },
        {
          label: this.$t('dataFrom.updateTime'),
          prop: "updateTime"
        },
        {
          label: '扫描进度',
          prop: "scanProgress"
        },
        {
          label: this.$t('dataFrom.dataQualityAssessment'),
          prop: "dataScore"
        },
        {
          label: this.$t('dataFrom.tableCount'),
          prop: "tableCount"
        },
        {
          label: this.$t('dataFrom.fieldCount'),
          prop: "fieldCount"
        },
        {
          label: this.$t('dataFrom.dataDictionary'),
          prop: "featureName"
        }
      ],
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
          label: this.$t('dataFrom.manual')
        }, {
          value: '1',
          label: this.$t('dataFrom.daily')
        }, {
          value: '2',
          label: this.$t('dataFrom.weekly')
        }, {
          value: '3',
          label: this.$t('dataFrom.monthly')
        }
      ],
      weekList: [this.$t('dataFrom.monday'), this.$t('dataFrom.tuesday'), this.$t('dataFrom.wednesday'), this.$t('dataFrom.thursday'), this.$t('dataFrom.friday'), this.$t('dataFrom.saturday'), this.$t('dataFrom.sunday')],
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
          label: this.$t('dataFrom.unpublished')
        }, {
          value: 1,
          label: this.$t('dataFrom.published')
        },
      ],
      executeStatus: [
        {
          value: 'COMPLETE',
          label: this.$t('dataFrom.scanComplete')
        }, {
          value: 'RUNNING',
          label: this.$t('dataFrom.scanning')
        }, {
          value: 'NONE',
          label: this.$t('dataFrom.toBeScanned')
        }, {
          value: 'ERR',
          label: this.$t('dataFrom.scanFailed')
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
        databaseType: 'SMB', // 文件目录类型
        share: '', // SMB共享目录
        targetDatabase: '', // 文件目录地址(起始路径)
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDataList: '', // 扫描内容 (存JSON字符串以便表单校验)
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0', // 默认传0
        id: null,
      },
      fileShareServerRules: {
        sourceName: [
          { required: true, message: "数据源名称不能为空", trigger: "blur" }
        ],
        databaseType: [
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
        share: [
          { required: true, message: this.$t('dataFrom.pleaseInputShare'), trigger: "blur" }
        ],
        targetDatabase: [
          { required: true, message: "请输入起始路径", trigger: "blur" }
        ],
        fileDataList: [
          { required: true, message: "请选择扫描内容", trigger: "change" }
        ],
      },
    };
  },
  computed: {
    filteredCheckedColumn() {
      return this.checkedColumn;
    }
  },
  created() {
    this.checkedColumn = this.setList.filter(item =>
      ['targetIpPort', 'businessName', 'scanState', 'scanProgress'].includes(item.prop)
    );
    this.checkAll = false;
    // this.queryParams.projectId = 0
    this.gettreeOptionsList()
    this.getList()
  },
  methods: {
    normalizeProgressValue(value) {
      const rawValue = typeof value === 'string' ? value.replace('%', '').trim() : value;
      const numericValue = Number(rawValue);
      if (!Number.isFinite(numericValue)) {
        return 0;
      }
      return Math.min(Math.max(numericValue, 0), 100);
    },
    isScanOperableSource(row) {
      return ['FILE_SERVER', 'DATABASE'].includes(row.sourceType);
    },
    triggerDataScan(row) {
      const params = { proxyIds: row.id };
      return row.sourceType === 'FILE_SERVER' ? dataScanByFileServer(params) : dataSacn(params);
    },
    async executeScan(row) {
      this.btnLoading = true;
      try {
        await this.triggerDataScan(row);
        await this.getList();
      } catch (error) {
        this.$message.error('扫描失败');
      } finally {
        this.btnLoading = false;
      }
    },
    // 获取文件共享扫描内容展示文字
    getFileShareScanContentDisplay() {
      if (!this.fileShareServerForm.fileDataList) return '';
      try {
        let parsed = this.fileShareServerForm.fileDataList;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0].fileName || '';
          if (parsed.length === 1) return firstItem;
          return `${firstItem} 等 ${parsed.length} 个项目`;
        }
      } catch (e) {
        return '';
      }
      return '';
    },
    // 打开文件目录选择弹窗
    openFileDirectoryDialog() {
      // 在打开弹窗前先校验这五个字段是否已填
      const fieldsToValidate = ['targetIp', 'targetPort', 'targetUserName', 'targetUserPassword', this.fileShareServerForm.databaseType == 'SMB' ? 'share' : 'targetDatabase'];
      let validCount = 0;
      let hasError = false;

      this.$refs.fileShareServerForm.validateField(fieldsToValidate, (errorMessage) => {
        if (errorMessage) {
          hasError = true;
        }
        validCount++;

        // 当所有字段都校验完毕后，再决定是否打开弹窗
        if (validCount === fieldsToValidate.length) {
          if (hasError) {
            return;
          }

          let initialSelected = [];
          if (this.fileShareServerForm.fileDataList) {
            try {
              let parsed = this.fileShareServerForm.fileDataList;
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              initialSelected = parsed;
              if (!Array.isArray(initialSelected)) {
                initialSelected = [];
              }
            } catch (e) {
              initialSelected = [];
            }
          }

          // 构建请求所需的参数
          const requestParams = {
            targetIp: this.fileShareServerForm.targetIp,
            targetPort: this.fileShareServerForm.targetPort,
            targetUserName: this.fileShareServerForm.targetUserName,
            targetUserPassword: this.fileShareServerForm.targetUserPassword,
            startingPath: this.fileShareServerForm.targetDatabase,
            databaseType: this.fileShareServerForm.databaseType,
            share: this.fileShareServerForm.share,
          };

          this.$refs.fileDirectoryTransferRef.open(initialSelected, requestParams);
        }
      });
    },
    // 处理文件目录选择确认
    handleFileDirectoryConfirm(selectedData) {
      if (selectedData && selectedData.length > 0) {
        this.fileShareServerForm.fileDataList = JSON.stringify(selectedData);
      } else {
        this.fileShareServerForm.fileDataList = '';
      }
      // 触发校验
      if (this.$refs.fileShareServerForm) {
        this.$refs.fileShareServerForm.validateField('fileDataList');
      }
    },
    handleCheckAllChange(val) {
      this.checkedColumn = val ? this.setList : [];
      this.isIndeterminate = false;
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.setList.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.setList.length;
    },
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
      return msg || this.$t('dataFrom.toBeScanned')
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
      this.$confirm(this.$t('dataFrom.confirmScan'), this.$t('dataFrom.tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
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
          this.$alert(this.$t('dataFrom.dataAlreadySubmitted'), this.$t('dataFrom.dataScanning'), {
            confirmButtonText: this.$t('confirm'),
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
          this.$confirm(this.$t('dataFrom.confirmDeleteWithResult'), this.$t('dataFrom.tip'), {
            confirmButtonText: this.$t('confirm'),
            cancelButtonText: this.$t('cancel'),
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
        this.$confirm(this.$t('dataFrom.confirmDelete'), this.$t('dataFrom.tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
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
      if (!this.isScanOperableSource(row)) return;
      if (row.scanState == 'COMPLETE') {
        this.$confirm(this.$t('dataFrom.confirmRescan'), this.$t('dataFrom.tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          this.executeScan(row)
        }).catch(() => {
        })
        return;
      }
      this.executeScan(row)
      return;
      /*
      if (row.scanState == 'COMPLETE') {
        this.$confirm(this.$t('dataFrom.confirmRescan'), this.$t('dataFrom.tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
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
      */
    },
    stopScan(row) {
      if (this.btnLoading) return;
      if (!this.isScanOperableSource(row)) return;
      this.$confirm(this.$t('dataFrom.confirmStopScan', { name: row.sourceName }), this.$t('dataFrom.tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
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
        this.fileShareServerForm.databaseType = row.databaseType || 'SMB';
        this.fileShareServerForm.businessName = row.businessName;
        this.fileShareServerForm.businessComment = row.businessComment;
        this.fileShareServerForm.targetIp = row.targetIp || '';
        this.fileShareServerForm.targetPort = row.targetPort || '';
        this.fileShareServerForm.targetUserName = row.targetUserName || '';
        this.fileShareServerForm.targetUserPassword = row.targetUserPassword || '';
        this.fileShareServerForm.targetDatabase = row.targetDatabase || '';
        this.fileShareServerForm.fileDataList = row.fileDataList ? (typeof row.fileDataList === 'string' ? row.fileDataList : JSON.stringify(row.fileDataList)) : '';
        this.fileShareServerForm.scheduleType = row.databaseProxysTimer?.scheduleType || '0';
        this.fileShareServerForm.scheduleInterval = row.databaseProxysTimer?.scheduleInterval || '';
        this.fileShareServerForm.scheduleTime = row.databaseProxysTimer?.scheduleTime || '00:00';
        this.fileShareServerForm.proceedOrOverwrite = row.proceedOrOverwrite || '0';
        this.fileShareServerForm.share = row.share || '';
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
      this.form.tabelCheckedName = this.$t('dataFrom.tableSelector.selectedTablesWithCount', { count: this.$refs.scanContentTreeRef.selectedTableCount })
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
          let fileDataListArray = [];
          if (this.fileShareServerForm.fileDataList) {
            try {
              let parsed = this.fileShareServerForm.fileDataList;
              if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              fileDataListArray = parsed;
            } catch (e) {
              console.error(e);
            }
          }

          const params = {
            ...this.fileShareServerForm,
            targetIpPort: this.fileShareServerForm.targetIp + ":" + this.fileShareServerForm.targetPort,
            fileDataList: fileDataListArray,
            sourceType: 'FILE_SERVER', // 如果后端需要区分数据源类型
          }

          if (this.fileShareServerForm.id) {
            params.id = this.fileShareServerForm.id;
            updateFileServer(params).then(res => {
              this.$modal.msgSuccess("修改成功");
              this.fileShareServerOpen = false
              this.fileShareServerSubmitLoading = false
              this.getList()
            }).catch(() => {
              this.fileShareServerSubmitLoading = false
            })
          } else {
            saveFileServer(params).then(res => {
              this.$modal.msgSuccess("新增成功");
              this.fileShareServerOpen = false
              this.fileShareServerSubmitLoading = false
              this.getList()
            }).catch(() => {
              this.fileShareServerSubmitLoading = false
            })
          }
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
        databaseType: 'SMB',
        targetDatabase: '',
        businessName: '',
        businessComment: '',
        targetIp: '',
        targetPort: '',
        targetUserName: '',
        targetUserPassword: '',
        fileDataList: '',
        scheduleType: '0',
        scheduleInterval: '',
        scheduleTime: '00:00',
        proceedOrOverwrite: '0',
        share: '', // SMB共享目录
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

/deep/.searchCard {
  border-radius: 10px;
  margin-bottom: 30px;

  & .el-card__body {
    padding: 24px;
  }
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass /deep/ .el-form-item {
  width: 30%;
  margin-bottom: 18px;
}

.yuanDataClass /deep/ .el-form-item:nth-child(3n) {
  margin-right: 0;
}

.yuanDataClass /deep/ .el-form-item:nth-last-child(-n+3) {
  margin-bottom: 0;
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

.table-card {
  margin-top: 20px;
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .el-card__body {
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
  color: #3b82f6;
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
.data-score-progress /deep/ .el-progress__text {
  font-size: 12px !important;
  font-weight: 600;
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

/* 统一弹窗骨架与滚动区域 */
.unified-dialog ::v-deep .el-dialog {
  width: 860px !important;
  max-width: 92vw;
}

.unified-dialog ::v-deep .el-dialog__body {
  max-height: calc(70vh - 120px);
  overflow: auto;
  padding: 20px 24px;
}

.unified-dialog ::v-deep .el-dialog__footer,
.unified-dialog ::v-deep .dialog-footer {
  border-top: 1px solid #e6e6e6;
}
</style>
