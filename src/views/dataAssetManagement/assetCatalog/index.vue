<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <!-- 1. 原有搜索输入框(保持不变,位于最上方) -->
          <div class="head-container" style="margin-bottom: 15px;">
            <el-input class="serachInput" v-model="filterText" :placeholder="$t('assetCatalog.pleaseInputSearch')"
              clearable>
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>

          <!-- 2. 新增:全选框(左) + 导出按钮(右) 区域 -->
          <div class="tree-operation-bar"
            style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <!-- 左侧全选框(带文字说明) -->
            <el-checkbox v-model="isTreeAllChecked" @change="handleTreeAllCheck"
              :indeterminate="isTreeAllChecked === null" style="font-size: 14px; margin-left: 20px;">
              {{ $t('assetCatalog.selectAll') }}
            </el-checkbox>
            <!-- 右侧导出按钮(无选中节点时禁用) -->
            <el-button type="text" @click="handleTreeExport" :disabled="selectedTreeNodeIds.length === 0"
              style="color: #26244ce0;">
              <svg-icon icon-class="导出" />
              {{ $t('assetCatalog.export') }}
            </el-button>
          </div>

          <div class="head-container" v-loading="treeLoading">
            <div class="tree-scroll-container">
              <el-tree class="treeBox" :data="categoryList" :props="defaultProps" :default-expanded-keys="[treeID]"
                :current-node-key="treeID" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree"
                node-key="id" highlight-current show-checkbox :check-strictly="false"
                :default-checked-keys="defaultCheckedKeys" @node-click="handleTreeNodeClick" @check="handleTreeCheck"
                :render-content="renderContent" />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 根据currentNodeType动态切换显示内容 -->
      <!--用户数据-->
      <el-col :span="19" :xs="24">
        <!-- type = 0 时显示原有表格卡片内容 -->
        <template v-if="currentNodeType == '0'">
          <el-card class="search-card" shadow="never">
            <el-form :model="queryParams" class="yuanDataClass" ref="queryParams" size="small" :inline="true">
              <el-form-item :label="$t('assetCatalog.tableName')" prop="tableName">
                <el-input v-model="queryParams.tableName" :placeholder="$t('assetCatalog.pleaseInputTableName')"
                  @input="handleInputChange" clearable>
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
              </el-form-item>
              <el-form-item :label="$t('assetCatalog.semanticFilling')" prop="paddingStatus">
                <el-select v-model="queryParams.paddingStatus" @change="selectProjectIdChange"
                  :placeholder="$t('assetCatalog.all')" clearable>
                  <el-option :label="$t('assetCatalog.notStarted')" value="1"></el-option>
                  <el-option :label="$t('assetCatalog.success')" value="2"></el-option>
                  <el-option :label="$t('assetCatalog.failed')" value="3"></el-option>
                  <el-option :label="$t('assetCatalog.executing')" value="4"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('assetCatalog.sampleFeatureExtraction')" prop="featureExtractionStatus">
                <el-select v-model="queryParams.featureExtractionStatus" @change="selectProjectIdChange"
                  :placeholder="$t('assetCatalog.all')" clearable>
                  <el-option :label="$t('assetCatalog.notStarted')" value="1"></el-option>
                  <el-option :label="$t('assetCatalog.success')" value="2"></el-option>
                  <el-option :label="$t('assetCatalog.failed')" value="3"></el-option>
                  <el-option :label="$t('assetCatalog.executing')" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card class="table-card" shadow="never">
            <div class="mian_box" id="main_box">
              <div v-for="(item, index) in dataAll" v-loading="loading" :key="index" class="table-info-card">
                <!-- 头部区域：表名 + 字段信息按钮 -->
                <div class="card-header">
                  <h3 class="table-name">
                    <svg-icon icon-class="table1" style="margin-right: 5px;" />
                    {{ item.tableName }}
                  </h3>
                  <button class="field-info-btn" @click="fieldInformationFn(item)">
                    <i class="el-icon-warning-outline" style="margin-right: 5px;"></i>{{
                      $t('assetCatalog.fieldInformation') }}
                  </button>
                </div>

                <!-- 内容区域：分三行布局 -->
                <div class="card-content">
                  <!-- 第一行：4 列 -->
                  <div class="row row-1">
                    <!-- CHANGE: 添加点击事件打开评估详情弹窗 -->
                    <div class="col col-4" @click="showScoreDialog(item)" style="cursor: pointer;">
                      <div class="label">{{ $t('assetCatalog.dataQualityScore') }}</div>
                      <div class="value" :title="item.score || '--'">{{ item.score ? item.score : '--' }}</div>
                      <svg-icon icon-class="xingxing" class="info-icon" />
                      <div class="progress-bar">
                        <el-progress :percentage="Number(item.score)" color="#f4a63e" :show-text="false"></el-progress>
                      </div>
                    </div>
                    <div class="col col-1">
                      <div class="label">{{ $t('assetCatalog.tableComment') }}</div>
                      <div class="value" :title="item.oldTableRemark || '--'">{{ item.oldTableRemark ?
                        item.oldTableRemark
                        :
                        '--' }}</div>
                      <svg-icon icon-class="xinxi" class="info-icon" />
                    </div>
                    <div class="col col-2">
                      <div class="label">{{ $t('assetCatalog.dataSize') }}</div>
                      <div class="value" :title="item.dataSize || '--'">{{ item.dataSize ? item.dataSize : '--' }}</div>
                      <svg-icon icon-class="database" class="info-icon" />
                    </div>
                    <div class="col col-3">
                      <div class="label">{{ $t('assetCatalog.dataVolume') }}</div>
                      <div class="value"
                        :title="item.dataMagnitude ? item.dataMagnitude + ' ' + $t('assetCatalog.row') : '--'">{{
                          item.dataMagnitude ? item.dataMagnitude + ' ' + $t('assetCatalog.row') : '--' }}</div>
                      <svg-icon icon-class="list2" class="info-icon" />
                    </div>
                  </div>

                  <!-- 第二行：6 列 -->
                  <div class="row row-2">
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.aiTableComment') }}</div>
                      <div class="value" :title="item.craftTableRemark || '--'">{{ item.craftTableRemark ?
                        item.craftTableRemark : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.dataSourceName') }}</div>
                      <div class="value" :title="item.dataSourceName || '--'">{{ item.dataSourceName ?
                        item.dataSourceName : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.classificationLevelStandard') }}</div>
                      <div class="value" :title="item.categoryName || '--'">{{ item.categoryName ?
                        item.categoryName : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.businessSystem') }}</div>
                      <div class="value" :title="item.businessName || '--'">{{ item.businessName ?
                        item.businessName : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.libraryName') }}</div>
                      <div class="value" :title="item.affiliationDatabaseName || '--'">{{ item.affiliationDatabaseName ?
                        item.affiliationDatabaseName : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.tableClassification') }}</div>
                      <div class="value" :title="item.tableCategoryName || '--'">{{ item.tableCategoryName ?
                        item.tableCategoryName : '--' }}</div>
                    </div>
                  </div>

                  <!-- 第三行：6 列 -->
                  <div class="row row-3">
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.tableLevel') }}</div>
                      <div class="value" :title="item.tableSecurityLevel || '--'">{{ item.tableSecurityLevel ?
                        item.tableSecurityLevel : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.personalInfoCount') }}</div>
                      <div class="value green"
                        :title="item.personalInformation ? item.personalInformation + ' ' + $t('assetCatalog.recordUnit') : '--'">
                        {{
                          item.personalInformation ? item.personalInformation + ' ' + $t('assetCatalog.recordUnit') : '--'
                        }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.minorInfoCount') }}</div>
                      <div class="value" :title="item.minorsInformation || '--'">{{ item.minorsInformation ?
                        item.minorsInformation : '--' }}</div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.fieldCount') }}</div>
                      <div class="value" :title="item.fieldCount || '--'">{{ item.fieldCount ? item.fieldCount : '--' }}
                      </div>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.semanticFilling') }}</div>
                      <el-tag
                        :type="item.paddingStatus == $t('assetCatalog.notStarted') ? 'info' : item.paddingStatus == $t('assetCatalog.success') ? 'success' : item.paddingStatus == $t('assetCatalog.failed') ? 'danger' : item.paddingStatus == $t('assetCatalog.executing') ? 'primary' : 'info'"
                        class="status-tag" :title="item.paddingStatus">
                        <i
                          :class="item.paddingStatus == $t('assetCatalog.notStarted') ? 'el-icon-time' : item.paddingStatus == $t('assetCatalog.success') ? 'el-icon-circle-check' : item.paddingStatus == $t('assetCatalog.failed') ? 'el-icon-warning-outline' : item.paddingStatus == $t('assetCatalog.executing') ? 'el-icon-refresh' : 'el-icon-time'"></i>
                        {{ item.paddingStatus }}
                      </el-tag>
                    </div>
                    <div class="col">
                      <div class="label">{{ $t('assetCatalog.sampleFeatureExtraction') }}</div>
                      <el-tag
                        :type="item.featureExtractionStatus == $t('assetCatalog.notStarted') ? 'info' : item.featureExtractionStatus == $t('assetCatalog.success') ? 'success' : item.featureExtractionStatus == $t('assetCatalog.failed') ? 'danger' : item.featureExtractionStatus == $t('assetCatalog.executing') ? 'primary' : 'primary'"
                        class="status-tag" :title="item.featureExtractionStatus">
                        <i
                          :class="item.featureExtractionStatus == $t('assetCatalog.notStarted') ? 'el-icon-time' : item.featureExtractionStatus == $t('assetCatalog.success') ? 'el-icon-circle-check' : item.featureExtractionStatus == $t('assetCatalog.failed') ? 'el-icon-warning-outline' : item.featureExtractionStatus == $t('assetCatalog.executing') ? 'el-icon-refresh' : 'el-icon-time'"></i>
                        {{ item.featureExtractionStatus }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="dataAll.length === 0" class="no-data">
                <el-empty :description="$t('assetCatalog.noData')"></el-empty>
              </div>
            </div>
            <!-- type = 0 时才显示此分页组件 -->
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
              :pageSize.sync="queryParams.pageSize" @pagination="handlePagination" />
          </el-card>
        </template>

        <!-- type = 1 时显示文件管理界面 -->
        <template v-else-if="currentNodeType == '1'">
          <el-card class="file-manager-card" shadow="never">
            <div class="file-manager-content">
              <!-- (1) 面包屑导航 -->
              <div class="breadcrumb-container">
                <el-breadcrumb separator=">" class="breadcrumb-nav">
                  <el-breadcrumb-item @click.native="handleBreadcrumbClick(null)">
                    <i class="el-icon-s-home"></i>
                  </el-breadcrumb-item>
                  <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index"
                    @click.native="handleBreadcrumbClick(item, index)">
                    <i class="el-icon-folder"></i>
                    {{ item.name }}
                  </el-breadcrumb-item>
                </el-breadcrumb>
              </div>

              <!-- (2) 当前文件夹名称 + 总数量 -->
              <div class="folder-header">
                <div class="folder-title">
                  <span class="folder-name">{{ currentFolderName }}</span>
                  <span class="folder-count">{{ totalItems }} {{ $t('assetCatalog.item') }}</span>
                </div>
                <!-- (3) 排序组件 -->
                <!-- 修改排序组件，支持所有字段的升降序 -->
                <!-- <div class="sort-selector">
                  <el-dropdown @command="handleSortChange" trigger="click">
                    <span class="sort-button">
                      {{ currentSortLabel }}
                      <i :class="sortOrderIcon"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="add_time">
                        <span>{{ $t('assetCatalog.uploadTime') }}</span>
                        <i :class="getSortIcon('add_time')"></i>
                      </el-dropdown-item>
                      <el-dropdown-item command="file_name">
                        <span>{{ $t('assetCatalog.fileName') }}</span>
                        <i :class="getSortIcon('file_name')"></i>
                      </el-dropdown-item>
                      <el-dropdown-item command="file_size">
                        <span>{{ $t('assetCatalog.fileSize') }}</span>
                        <i :class="getSortIcon('file_size')"></i>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div> -->
              </div>

              <!-- (4) 文件夹展示区域 -->
              <div v-if="folderList.length > 0" class="folder-section">
                <div class="section-title">{{ $t('assetCatalog.folder') }}</div>
                <div class="folder-grid">
                  <div v-for="folder in folderList" :key="folder.id" class="folder-item"
                    @click="handleFolderClick(folder)">
                    <i class="el-icon-folder folder-icon"></i>
                    <span class="folder-item-name">{{ folder.name }}</span>
                  </div>
                </div>
              </div>

              <!-- (5) 文件列表展示 -->
              <div v-if="fileList.length > 0" class="file-section">
                <div class="section-title">{{ $t('assetCatalog.file') }}</div>
                <div class="file-list">
                  <div v-for="file in fileList" :key="file.id" class="file-item" @click="openFileDetailDrawer(file)">
                    <div class="file-content">
                      <div class="file-info">
                        <i class="el-icon-document file-icon"></i>
                        <span class="file-name"><b>{{ file.fileName }}</b>{{ file.name }}</span>
                      </div>
                      <div class="file-meta">
                        <span class="file-time">{{ currentFileTimeLabel }}: {{ file.createTime }}</span>
                        <span class="file-size">{{ file.fileSize }}</span>
                      </div>
                    </div>
                    <!-- <span class="file-footer"><b>{{ $t('assetCatalog.summary') }}：</b>{{ file.digest }}</span> -->
                  </div>
                </div>

              </div>
            </div>
          </el-card>
        </template>
      </el-col>
    </el-row>
    <Drawer custom-class="assetCatalogDrawer" :title="drawerTitle" :visible.sync="drawerShow" :destroy-on-close="true"
      direction="rtl" size="51%">
      <!-- 新增筛选区域 -->
      <template slot="body">
        <el-card class="search-card" shadow="never">
          <el-form :model="drawerQueryParams" class="yuanDataClass" ref="drawerQueryForm" size="small" :inline="true"
            label-width="80px">
            <el-form-item :label="$t('assetCatalog.fieldName')" prop="fieldName">
              <el-input v-model="drawerQueryParams.fieldName" :placeholder="$t('assetCatalog.pleaseInputFieldName')"
                @input="handleDrawerSearch" size="mini"></el-input>
            </el-form-item>
            <el-form-item :label="$t('assetCatalog.fieldType')" prop="fieldType">
              <el-input v-model="drawerQueryParams.fieldType" :placeholder="$t('assetCatalog.pleaseInputFieldType')"
                @input="handleDrawerSearch" size="mini"></el-input>
            </el-form-item>
            <el-form-item :label="$t('assetCatalog.fieldComment')" prop="oldFieldRemark">
              <el-input v-model="drawerQueryParams.oldFieldRemark"
                :placeholder="$t('assetCatalog.pleaseInputFieldComment')" @input="handleDrawerSearch"
                size="mini"></el-input>
            </el-form-item>
            <!-- <el-form-item label="脏数据" prop="dirtyData">
          <el-select v-model="drawerQueryParams.dirtyData" placeholder="全部" @change="handleDrawerSearch"
            style="width: 120px;">
            <el-option label="是" value="是"></el-option>
            <el-option label="否" value="否"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="样本特征" prop="sampleFeature">
          <el-select v-model="drawerQueryParams.sampleFeature" placeholder="全部" @change="handleDrawerSearch"
            style="width: 120px;">
            <el-option label="包含" value="包含"></el-option>
            <el-option label="不包含" value="不包含"></el-option>
          </el-select>
        </el-form-item> -->
            <!-- <el-form-item> -->
            <!-- <el-button icon="el-icon-refresh" size="small" @click="resetDrawerSearch">重置</el-button> -->
            <!-- </el-form-item> -->
          </el-form>
        </el-card>
        <el-card class="table-card drawer-table-card" shadow="never">
          <el-table :data="filteredDrawerData" ref="tableRef" :key="tableKey" border class="tableBox" height="100%">
            <el-table-column :label="$t('assetCatalog.fieldName')" align="center" prop="fieldName" width="200"
              show-overflow-tooltip />
            <el-table-column :label="$t('assetCatalog.fieldType')" align="center" prop="fieldType" width="200"
              show-overflow-tooltip />
            <el-table-column :label="$t('assetCatalog.fieldComment')" align="center" width="200" prop="oldFieldRemark"
              show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row.oldFieldRemark }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('assetCatalog.aiFieldComment')" align="center" prop="aiFieldRemark"
              min-width="200" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="!scope.row.drawerEdit" @click="drawerEditFn(scope.row, 'aiFieldRemark')">{{
                  scope.row.aiFieldRemark }}</span>
                <el-input v-else id="editInput" v-model="editMsg" @blur="drawerEditBlurFn(scope.row, 'aiFieldRemark')"
                  size="small" />
              </template>
            </el-table-column>
            <!-- <el-table-column label="样本是否为空" align="center" prop="dataIsNull" width="100" show-overflow-tooltip />
        <el-table-column label="样本重复率" align="center" prop="dataIsRepeat" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.dataIsRepeat ? scope.row.dataIsRepeat + '%' : '' }}</span>
          </template>
        </el-table-column> -->
            <!-- <el-table-column label="样本长度过短" align="center" prop="sampleLengthShort" width="100" show-overflow-tooltip />
        <el-table-column label="是否为脏数据（可编辑）" align="center" prop="dirtyData" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="!scope.row.drawerEditDirtyData" @click="drawerEditFn(scope.row, 'dirtyData')">{{
              scope.row.dirtyData }}</span>
            <el-select v-else v-model="scope.row.dirtyDataEditMsg" placeholder="全部"
              @change="drawerEditBlurFn(scope.row, 'dirtyData')">
              <el-option v-for="item in dirtyDataList" :key="item.value" :label="item.label" :value="item.label">
              </el-option>
            </el-select>
          </template>
        </el-table-column> -->
            <el-table-column :label="$t('assetCatalog.sample')" align="center" width="80"
              class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-tooltip placement="bottom" effect="light">
                  <div slot="content">
                    <el-table :data="scope.row.sampleList" height="250" border class="tableCla" style="width: 100%">
                      <el-table-column type="index" :label="$t('assetCatalog.sequenceNumber')" width="50" />
                      <el-table-column prop="value" :label="$t('assetCatalog.fieldValue')" width="100"
                        show-overflow-tooltip>
                      </el-table-column>
                    </el-table>
                  </div>
                  <el-button size="mini" type="text">{{ $t('assetCatalog.view') }}</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
            <!-- <el-table-column label="是否包含特征" align="center" prop="featureData" width="100" show-overflow-tooltip />
        <el-table-column label="数据特征" align="center" min-width="150" prop="dataFeature" show-overflow-tooltip /> -->
            <!-- <el-table-column label="是否添加为匹配策略" align="center" min-width="150" prop="isMatchStrategy"
          show-overflow-tooltip /> -->
          </el-table>

          <!-- 新增分页组件 -->
          <Pagination v-show="drawerTotal > 0" :total="drawerTotal" :page.sync="drawerQueryParams.pageNum"
            :pageSize.sync="drawerQueryParams.pageSize" @pagination="handleDrawerPagination"
            style="margin-top: 15px;" />
        </el-card>
      </template>
    </Drawer>

    <Drawer custom-class="fileDetailDrawer" :title="$t('assetCatalog.fileDetailsTitle')"
      :visible.sync="fileDetailDrawerVisible" :destroy-on-close="false" direction="rtl" size="540px">
      <template slot="body">
        <div class="file-detail-panel">
          <div class="file-detail-item">
            <div class="file-detail-label">{{ $t('assetCatalog.fileName') }}</div>
            <div class="file-detail-value">{{ fileDetailData.fileName }}</div>
          </div>
          <div class="file-detail-item">
            <div class="file-detail-label">{{ $t('assetCatalog.fileSize') }}</div>
            <div class="file-detail-value">{{ fileDetailData.fileSize }}</div>
          </div>
          <div class="file-detail-item">
            <div class="file-detail-label">{{ $t('assetCatalog.fileType') }}</div>
            <div class="file-detail-value">{{ fileDetailData.fileType }}</div>
          </div>
          <div class="file-detail-item">
            <div class="file-detail-label">{{ $t('assetCatalog.absolutePath') }}</div>
            <div class="file-detail-value">{{ fileDetailData.filePath }}</div>
          </div>
          <!-- <div class="file-detail-item">
            <div class="file-detail-label">MD5</div>
            <div class="file-detail-value">{{ fileDetailData.md5 }}</div>
          </div>
          <div class="file-detail-item">
            <div class="file-detail-label">{{ currentFileTimeLabel }}</div>
            <div class="file-detail-value">{{ fileDetailData.createTime }}</div>
          </div> -->
        </div>
      </template>
    </Drawer>

    <!-- 导出列配置弹窗 -->
    <el-dialog :title="$t('assetCatalog.exportColumn')" :visible.sync="exportColumnDialog.visible" width="760px"
      custom-class="export-column-dialog-wrapper" @close="cancelExport">
      <!-- <div slot="title" class="dialog-header">
        <span class="title-text"><b>{{ $t('assetCatalog.exportColumn') }}</b></span>
      </div> -->

      <div v-loading="exportColumnDialog.loading" class="export-column-dialog">
        <div class="column-options">
          <div v-for="column in exportColumnDialog.allColumns" :key="column.value"
            :class="['column-btn', { active: exportColumnDialog.selectedColumns.includes(column.value) }]"
            @click="toggleExportColumn(column)">
            {{ column.label }}
          </div>
        </div>

        <div class="dialog-footer-custom">
          <div class="footer-left">
            <el-checkbox v-model="exportColumnDialog.saveAsDefault">{{ $t('assetCatalog.saveAsDefault') }}</el-checkbox>
            <a class="restore-link" @click="restoreInitialConfig"><i class="el-icon-refresh-right"></i>{{
              $t('assetCatalog.restoreInitial') }}</a>
          </div>
          <div class="footer-right">
            <el-button @click="cancelExport">{{ $t('assetCatalog.cancel') }}</el-button>
            <el-button type="primary" plain @click="confirmExport">{{ $t('assetCatalog.confirm') }}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增评估详情弹窗 -->
    <el-dialog :visible.sync="scoreDialog.visible" width="740px" custom-class="score-detail-dialog"
      :close-on-click-modal="false">

      <div slot="title" class="score-dialog-title">
        <span class="title-text">{{ $t('assetCatalog.evaluationDetails') }}</span>
        <el-tag type="primary" style="border-radius: 10px;"><b>{{ $t('assetCatalog.fullScore') }} 100</b></el-tag>
      </div>

      <div class="score-content">
        <div class="score-item">
          <div class="max-score">60</div>
          <div class="score-detail">
            <div class="detail-title">{{ $t('assetCatalog.fieldComment') }}</div>
            <div class="detail-desc">{{ $t('assetCatalog.detailValidFieldComment') }}</div>
          </div>
          <div class="actual-score">{{ scoreDialog.data.fieldCommentActual }}<span class="score-unit">{{
            $t('assetCatalog.scoreUnit') }}</span></div>
        </div>

        <div class="score-item">
          <div class="max-score">5</div>
          <div class="score-detail">
            <div class="detail-title">{{ $t('assetCatalog.tableAnnotation') }}</div>
            <div class="detail-desc">{{ $t('assetCatalog.detailValidTableComment') }}</div>
          </div>
          <div class="actual-score">{{ scoreDialog.data.tableCommentActual }}<span class="score-unit">{{
            $t('assetCatalog.scoreUnit') }}</span></div>
        </div>

        <div class="score-item">
          <div class="max-score">30</div>
          <div class="score-detail">
            <div class="detail-title">{{ $t('assetCatalog.namingConvention') }}</div>
            <div class="detail-desc">{{ $t('assetCatalog.detailNamingConvention') }}</div>
          </div>
          <div class="actual-score">{{ scoreDialog.data.namingActual }}<span class="score-unit">{{
            $t('assetCatalog.scoreUnit') }}</span></div>
        </div>

        <div class="score-item">
          <div class="max-score">5</div>
          <div class="score-detail">
            <div class="detail-title">{{ $t('assetCatalog.structuralUniqueness') }}</div>
            <div class="detail-desc">{{ $t('assetCatalog.detailStructuralUniqueness') }}</div>
          </div>
          <div class="actual-score">{{ scoreDialog.data.uniquenessActual }}<span class="score-unit">{{
            $t('assetCatalog.scoreUnit') }}</span></div>
        </div>
      </div>

      <div class="score-footer">
        <span class="footer-label">{{ $t('assetCatalog.totalScore') }}</span>
        <span class="footer-score">{{ scoreDialog.data.totalScore }}</span>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  getAllProxys, getTableListByProxysId, getAllFieldListByTableIdAndDatabaseId,
  getSelectTableNames, callAIPaddingComments, updateDataQualityAssessment, updateFieldListByFieldId,
  callAIPaddingCommentsByAll, updateDataQualityAssessmentByAll, propertyCatalogueExport
} from "@/api/system/protectCategory";
import { getDicts } from "@/api/system/dict/data";
// 引入getProjectFileList接口
import { getProjectFileList } from "@/api/system/unstructured";
export default {
  dicts: ['sys_export_column'],
  name: "assetCatalog",
  components: {},
  data() {
    return {
      currentNodeType: '0', // 当前节点的type值,默认为'0'
      currentFolderName: '', // 当前文件夹名称
      breadcrumbList: [], // 面包屑路径数组
      currentFolderId: null, // 当前目录ID（根目录为 null）
      currentSortField: 'add_time', // 当前排序字段
      currentSortLabel: this.$t('assetCatalog.uploadTime'), // 当前排序显示文本
      sortOrders: {
        add_time: 'asc',
        file_name: 'asc',
        file_size: 'asc'
      },
      currentNodeData: null, // 存储当前选中的节点数据
      folderList: [], // 文件夹列表
      fileList: [], // 文件列表
      fileTotal: 0, // 总条目数（后端 titleNum）
      rootFolderTitle: '', // 根文件夹标题（从接口获取）

      fileListTimer: null, // 防抖定时器

      fileDetailDrawerVisible: false,
      fileDetailData: {
        fileName: '--',
        fileSize: '--',
        fileType: '--',
        filePath: '--',
        md5: '--',
        createTime: '--',
      },

      drawerShow: false,
      drawerTitle: '',
      drawerData: [],
      overflowStatus: {}, // 用于存储每个盒子的溢出状态
      filterText: '',// 过滤条件tree
      Loading: false,// 全局loading
      loading: false,
      total: 10,
      tableNameList: [],
      inputTimer: null,
      filedRowData: {},// 字段信息用来记录目录的rowdata
      dataAll: [
      ],
      dirtyDataList: [
        {
          label: this.$t('assetCatalog.yes'),
          value: 1,
        },
        {
          label: this.$t('assetCatalog.no'),
          value: 0,
        }
      ],
      categoryList: [],
      isChildrenNode: true,
      debounceTimeout: null,//防抖动
      treeLoading: false,
      treeID: '', //tree 父节点id
      databaseName: '',// tree 子节点label
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        dataSourceId: '',//来源
        levelId: [],//安全级别
      },
      // 抽屉筛选参数
      drawerQueryParams: {
        fieldName: '',
        dirtyData: '',
        sampleFeature: '',
        fieldType: '',
        oldFieldRemark: '',
        pageNum: 1,
        pageSize: 10
      },
      filteredDrawerData: [],
      drawerTotal: 0,
      defaultProps: {
        children: "children",
        label: "label"
      },
      tableKey: 0,
      editMsg: '',

      // 新增：树复选框相关状态
      isTreeAllChecked: false, // 全选框的勾选状态（双向绑定）
      selectedTreeNodeIds: [], // 存储所有勾选的节点ID（用于导出和状态判断）
      defaultCheckedKeys: [], // 树初始化时默认勾选的节点ID（可空）

      // 导出列配置相关数据
      exportColumnDialog: {
        visible: false,
        loading: false,
        selectedColumns: [], // 当前选中的导出列
        allColumns: [
          {
            "label": this.$t('assetCatalog.database'),
            "value": "databaseName"
          },
          {
            "label": this.$t('assetCatalog.tableName'),
            "value": "tableName"
          },
          {
            "label": this.$t('assetCatalog.tableComment'),
            "value": "tableRemark"
          },
          {
            "label": this.$t('assetCatalog.dataSize'),
            "value": "dataSize"
          },
          {
            "label": this.$t('assetCatalog.dataVolume'),
            "value": "dataMagnitude"
          },
          {
            "label": this.$t('assetCatalog.dataQualityScore'),
            "value": "dataQualityScore"
          },
          {
            "label": this.$t('assetCatalog.aiTableComment'),
            "value": "aiTableRemark"
          },
          {
            "label": this.$t('assetCatalog.dataSourceName'),
            "value": "dataSourceName"
          },
          {
            "label": this.$t('assetCatalog.classificationLevelStandard'),
            "value": "categoryName"
          },
          {
            "label": this.$t('assetCatalog.businessSystem'),
            "value": "businessName"
          },
          {
            "label": this.$t('assetCatalog.libraryName'),
            "value": "affiliationDatabaseName"
          },
          {
            "label": this.$t('assetCatalog.tableClassification'),
            "value": "tableClassify"
          },
          {
            "label": this.$t('assetCatalog.tableLevel'),
            "value": "tableLevel"
          },
          {
            "label": this.$t('assetCatalog.personalInfoCount'),
            "value": "personalInformationNum"
          },
          {
            "label": this.$t('assetCatalog.minorInfoCount'),
            "value": "nonagePersonalInformationNum"
          },
          {
            "label": this.$t('assetCatalog.fieldCount'),
            "value": "fieldNum"
          },
          {
            "label": this.$t('assetCatalog.semanticFilling'),
            "value": "annotationFill"
          },
          {
            "label": this.$t('assetCatalog.sampleFeatureExtraction'),
            "value": "featureExtractionStatus"
          },
          {
            "label": this.$t('assetCatalog.fileName'),
            "value": "fileName"
          },
          {
            "label": this.$t('assetCatalog.fileFormat'),
            "value": "fileFormat"
          },
          {
            "label": this.$t('assetCatalog.fileSize'),
            "value": "fileSize"
          },
          {
            "label": this.$t('assetCatalog.absolutePath'),
            "value": "fileAbsolutePath"
          },
          {
            "label": this.$t('assetCatalog.fileParentPath'),
            "value": "fileParentPath"
          },
          {
            "label": this.$t('assetCatalog.updateTime'),
            "value": "updateTime"
          },
          {
            "label": this.$t('assetCatalog.createTime'),
            "value": "createTime"
          }
        ],
        saveAsDefault: false
      },
      // 初始默认配置（固定不变，用于恢复初始配置）
      initialDefaultColumns: [
        "databaseName",
        "businessName",
        "tableName",
        "tableRemark",
        "fieldNum",
        "fileName",
        "fileFormat",
        "fileParentPath",
        "fileSize"
      ],
      scoreDialog: {
        visible: false,
        data: {
          fieldCommentActual: 0,
          tableCommentActual: 0,
          namingActual: 0,
          uniquenessActual: 0,
          totalScore: 0
        }
      },
    };
  },
  computed: {
    // 文件+文件夹总数
    totalItems() {
      return Number(this.fileTotal) || 0;
    },
    currentFileTimeLabel() {
      return String(this.currentNodeData && this.currentNodeData.fileType) === '1' ? this.$t('assetCatalog.lastModifiedTime') : this.$t('assetCatalog.uploadTime');
    },
    sortOrderIcon() {
      const order = this.sortOrders[this.currentSortField];
      if (order === 'asc') {
        return 'el-icon-top';
      } else if (order === 'desc') {
        return 'el-icon-bottom';
      }
      return 'el-icon-d-caret';
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    // 监听全选框状态变化，同步树的勾选状态
    isTreeAllChecked(newVal) {
      if (newVal === null) return; // 半选状态不处理

      const treeRef = this.$refs.tree;
      if (!treeRef) return;

      if (newVal) {
        // 全选：勾选所有树节点
        const allNodeIds = this.getAllTreeIds(this.categoryList);
        treeRef.setCheckedKeys(allNodeIds);
        this.selectedTreeNodeIds = [...allNodeIds];
      } else {
        // 取消全选：清空所有勾选
        treeRef.setCheckedKeys([]);
        this.selectedTreeNodeIds = [];
      }
      // 全选状态变更后调用getList方法
    },

    // 监听选中节点ID数组变化，同步全选框状态
    selectedTreeNodeIds(newVal) {
      const allNodeIds = this.getAllTreeIds(this.categoryList);
      if (allNodeIds.length === 0) {
        this.isTreeAllChecked = false;
        return;
      }

      // 计算选中节点占比
      const checkedCount = newVal.length;
      if (checkedCount === 0) {
        this.isTreeAllChecked = false; // 未选
      } else if (checkedCount === allNodeIds.length) {
        this.isTreeAllChecked = true; // 全选
      } else {
        this.isTreeAllChecked = null; // 半选
      }
    }
  },
  created() {
    this.getProtectCategory()
  },
  mounted() {
  },
  methods: {


    handleBreadcrumbClick(item, index) {
      if (item === null) {
        // 点击首页图标,返回根目录（顶层）
        this.breadcrumbList = [];
        this.currentFolderId = null;
        this.currentFolderName = this.rootFolderTitle;
        // 重新加载顶层数据
        if (this.currentNodeData) {
          this.loadFileListData(this.currentNodeData, {
            folderId: null,
            keepCurrentFolderName: false
          });
        }
      } else {
        // 点击路径中的某一层
        this.breadcrumbList = this.breadcrumbList.slice(0, index + 1);
        this.currentFolderId = item.id;
        this.currentFolderName = item.name;
        this.loadFolderData(item.id);
      }
    },

    handleSortChange(field) {
      if (this.currentSortField === field) {
        this.sortOrders[field] = this.sortOrders[field] === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSortField = field;
        this.sortOrders[field] = 'asc';
      }

      const labelMap = {
        'add_time': this.$t('assetCatalog.uploadTime'),
        'file_name': this.$t('assetCatalog.fileName'),
        'file_size': this.$t('assetCatalog.fileSize')
      };
      this.currentSortLabel = labelMap[field] || this.$t('assetCatalog.uploadTime');

      if (this.currentNodeData) {
        this.loadFileListData(this.currentNodeData, {
          folderId: this.currentFolderId,
          keepCurrentFolderName: this.currentFolderId !== null && this.currentFolderId !== undefined && this.currentFolderId !== ''
        });
      }
    },

    getSortIcon(field) {
      if (this.currentSortField !== field) {
        return 'el-icon-sort';
      }
      return this.sortOrders[field] === 'asc' ? 'el-icon-top' : 'el-icon-bottom';
    },

    openFileDetailDrawer(file) {
      const fileName = file.fileName || file.name || '--';
      const suffixByName = fileName && fileName.includes('.') ? fileName.split('.').pop() : '';
      const fileType = file.fileType || file.type || file.fileFormat || file.suffix || file.ext || suffixByName || '--';

      this.fileDetailData = {
        fileName: this.formatFileDetailValue(fileName),
        fileSize: this.formatFileDetailValue(file.fileSize || file.fileSizeName),
        fileType: this.formatFileDetailValue(fileType),
        filePath: this.formatFileDetailValue(file.filePath || file.absolutePath || file.path || file.fileAbsolutePath),
        md5: this.formatFileDetailValue(file.md5 || file.fileMd5),
        createTime: this.formatFileDetailValue(file.createTime || file.fileCreateTime),
      };
      this.fileDetailDrawerVisible = true;
    },

    formatFileDetailValue(value) {
      if (value === null || value === undefined || value === '') {
        return '--';
      }
      return String(value);
    },


    handleFolderClick(folder) {
      // 添加到面包屑
      this.breadcrumbList.push({
        id: folder.id,
        name: folder.name
      });
      this.currentFolderId = folder.id;
      this.currentFolderName = folder.name;

      this.loadFolderData(folder.id);
    },

    loadFolderData(folderId) {
      if (!this.currentNodeData) return;
      this.currentFolderId = (folderId === null || folderId === undefined || folderId === '') ? null : folderId;
      this.loadFileListData(this.currentNodeData, {
        folderId: this.currentFolderId,
        keepCurrentFolderName: this.currentFolderId !== null && this.currentFolderId !== undefined && this.currentFolderId !== ''
      });
    },


    loadFileListData(data, options = {}) {
      if (this.fileListTimer) {
        clearTimeout(this.fileListTimer);
      }
      this.fileListTimer = setTimeout(() => {
        const { folderId = null, keepCurrentFolderName = false } = options;
        const sortField = this.currentSortField;
        const order = this.sortOrders[sortField];
        const isAsc = order === 'asc';

        const response = {
          sortField: sortField,
          isAsc: isAsc,
          // 调整databaseList参数结构,使其符合getProjectFileList接口要求
          databaseList: [{
            parentId: data.id,
            label: data.label
          }]
        };
        if (folderId !== null && folderId !== undefined && folderId !== '') {
          response.folderId = folderId;
        }
        getProjectFileList(response).then(res => {
          if (res.code === 200) {
            const data = res.data || {};
            const rawFileList = data.fileList;
            const normalizedFileList = Array.isArray(rawFileList)
              ? rawFileList
              : (rawFileList && Array.isArray(rawFileList.records) ? rawFileList.records : []);
            const normalizedFolderList = Array.isArray(data.folder) ? data.folder : [];
            const parsedTitleNum = Number(data.titleNum);

            this.fileList = normalizedFileList;
            this.folderList = normalizedFolderList;
            this.fileTotal = Number.isFinite(parsedTitleNum) ? parsedTitleNum : 0;

            if (data.title) {
              this.rootFolderTitle = data.title;
              if (!keepCurrentFolderName) {
                this.currentFolderName = data.title;
              }
            }
          }
        }).catch(err => {
          console.error('加载文件列表失败:', err);
          this.$message.error(this.$t('assetCatalog.loadFileListFailed'));
        });
      }, 500);
    },


    /**
     * 新增:递归获取所有树节点的ID(适配 DataSource → Database 二级结构)
     * @param {Array} treeData - 树数据源(categoryList)
     * @returns {Array} 所有节点的ID数组
     */
    getAllTreeIds(treeData) {
      let ids = [];
      if (!Array.isArray(treeData)) return ids;

      treeData.forEach(node => {
        if (node && node.id) {
          ids.push(node.id);
          // 递归处理子节点
          if (node.children && node.children.length > 0) {
            ids = [...ids, ...this.getAllTreeIds(node.children)];
          }
        }
      });
      return ids;
    },


    /**
     * 全选框点击事件(通过watch自动处理勾选状态)
     */
    handleTreeAllCheck(checked) {
      this.isTreeAllChecked = checked;
    },
    /**
     * 树节点复选框变更事件(仅用于导出,不影响右侧列表)
     * @param {Object} currentNode - 当前操作的节点
     * @param {Object} treeStatus - 树的选中状态
     */
    handleTreeCheck(currentNode, treeStatus) {
      // 获取所有勾选的节点ID(包括半选节点的子节点)
      const checkedIds = this.getCheckedNodeIds(this.categoryList);
      this.selectedTreeNodeIds = checkedIds;
      this.updateTreeAllCheckedState();
    },
    /**
     * 更新全选框状态
     */
    updateTreeAllCheckedState() {
      const allChildren = this.collectAllChildren(this.categoryList);
      if (this.selectedTreeNodeIds.length === 0) {
        this.isTreeAllChecked = false;
      } else if (this.selectedTreeNodeIds.length === allChildren.length) {
        this.isTreeAllChecked = true;
      } else {
        this.isTreeAllChecked = null;
      }
    },
    /**
     * 点击树节点事件:点击节点展示右侧列表
     * @param {Object} data - 点击的节点数据
     */
    handleTreeNodeClick(data) {
      this.currentNodeType = data.type || '0';
      this.currentNodeData = data; // 保存当前节点数据

      if (this.currentNodeType == '1') {
        // 文件管理模式
        this.breadcrumbList = [];
        this.currentFolderId = null;
        // 加载文件列表数据（接口会返回 res.data.title 作为顶层标题）
        this.loadFileListData(data, {
          folderId: null,
          keepCurrentFolderName: false
        });
      } else {
        // 原有表格模式
        if (data.children && data.children.length > 0) {
          // 点击的是父节点
          this.getList(data.children)
        } else {
          // 点击的是子节点
          this.getList([{
            parentId: data.parentId,
            label: data.label,
          }]);
        }
      }
    },

    getCheckedNodeIds(treeData) {
      const checkedIds = [];
      if (!Array.isArray(treeData)) return checkedIds;

      treeData.forEach(node => {
        const nodeStatus = this.$refs.tree.getNode(node.id);
        if (nodeStatus && nodeStatus.checked) {
          checkedIds.push(node.id);
        }
        // 处理子节点
        if (node.children && node.children.length > 0) {
          checkedIds.push(...this.getCheckedNodeIds(node.children));
        }
      });
      return checkedIds;
    },

    findNodeById(treeData, id) {
      for (const node of treeData) {
        if (node.id === id) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const foundNode = this.findNodeById(node.children, id);
          if (foundNode) {
            return foundNode;
          }
        }
      }
      return null;
    },

    /**
     * 自定义树节点渲染,为父节点和子节点添加不同的SVG图标
     */
    renderContent(h, { node, data }) {
      let iconClass = 'database1';
      if (data.type == 1) {
        iconClass = 'file-o';
      } else if (data.children && data.children.length > 0) {
        iconClass = 'sysBusiness';
      }

      const labelPart = h('span', {
        class: 'node-label',
        attrs: { title: node.label },
        style: {
          fontSize: '14px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, node.label);

      const nodeContent = [
        h('svg-icon', {
          class: 'tree-node-icon',
          attrs: {
            iconClass: iconClass
          },
          style: { marginRight: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
        }),
        h('div', {
          class: 'node-label-wrapper',
          style: { flex: '1', minWidth: '0', overflow: 'hidden', display: 'flex', alignItems: 'center' }
        }, [labelPart])
      ];

      return h('span', {
        class: 'custom-tree-node',
        style: {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          paddingTop: '10px',
          paddingBottom: '10px',
          borderRadius: '6px',
          transition: 'background-color 0.2s'
        }
      }, nodeContent);
    },

    /**
     * 新增:导出选中的树节点数据(按图片层级格式化为 DataSource → Databases)
     */
    handleTreeExport() {
      if (this.selectedTreeNodeIds.length === 0) {
        this.$message.warning(this.$t('assetCatalog.pleaseSelectNodeFirst'));
        return;
      }

      // 打开导出列配置弹窗
      this.showExportColumnDialog();
    },

    async showExportColumnDialog() {
      this.exportColumnDialog.visible = true;
      this.exportColumnDialog.loading = true;

      try {
        let finalSelectedColumns = [];

        const res = await getDicts('sys_export_column');
        if (res.data && res.data.length > 0) {
          const dictItem = res.data.find(item => item.dictValue == '2');
          if (dictItem && dictItem.remark) {
            finalSelectedColumns = dictItem.remark.split(',').map(item => item.trim());
          }
        }

        if (finalSelectedColumns.length === 0) {
          finalSelectedColumns = [...this.initialDefaultColumns];
        }
        this.exportColumnDialog.selectedColumns = [...finalSelectedColumns];

      } catch (error) {
        console.error('获取导出列配置失败:', error);
        this.$message.warning(this.$t('assetCatalog.getExportColumnConfigFailed'));
        this.exportColumnDialog.selectedColumns = [...this.initialDefaultColumns];
      } finally {
        this.exportColumnDialog.loading = false;
      }
    },

    toggleExportColumn(column) {
      const index = this.exportColumnDialog.selectedColumns.indexOf(column.value);
      if (index > -1) {
        this.exportColumnDialog.selectedColumns.splice(index, 1);
      } else {
        this.exportColumnDialog.selectedColumns.push(column.value);
      }
      // 强制更新,确保UI同步
      this.$forceUpdate();
    },

    restoreInitialConfig() {
      this.exportColumnDialog.selectedColumns = [...this.initialDefaultColumns];
      this.exportColumnDialog.saveAsDefault = false;
      this.$message.success(this.$t('assetCatalog.restoreInitialConfig'));
    },

    cancelExport() {
      this.exportColumnDialog.visible = false;
      this.exportColumnDialog.saveAsDefault = false;
    },

    async confirmExport() {
      if (this.exportColumnDialog.selectedColumns.length === 0) {
        this.$message.warning(this.$t('assetCatalog.selectAtLeastOneColumn'));
        return;
      }

      if (this.exportColumnDialog.loading) return;
      this.exportColumnDialog.loading = true;

      try {
        if (this.exportColumnDialog.saveAsDefault) {
          this.$message.success(this.$t('assetCatalog.saveAsDefaultConfig'));
        }

        this.exportColumnDialog.visible = false;
        await this.performExport();
      } finally {
        this.exportColumnDialog.loading = false;
      }
    },

    async performExport() {
      try {
        this.loading = true;

        const selectedNodes = this.selectedTreeNodeIds
          .map(id => this.findNodeById(this.categoryList, id))
          .filter(Boolean); // 过滤无效节点

        // 提取所有选中节点的子节点,组成数组
        const allChildrenData = selectedNodes.reduce((acc, node) => {
          if (node.children && node.children.length > 0) {
            acc.push(...node.children);
          }
          return acc;
        }, []);

        // 构造请求参数
        const allColumns = this.exportColumnDialog.allColumns.map(item => item.value);
        const unselectedColumns = allColumns.filter(value => !this.exportColumnDialog.selectedColumns.includes(value));

        const params = {
          tableName: this.queryParams.tableName,
          paddingStatus: this.queryParams.paddingStatus,
          featureExtractionStatus: this.queryParams.featureExtractionStatus,
          databaseList: allChildrenData,
          columnList: unselectedColumns,
          saveAsDefault: this.exportColumnDialog.saveAsDefault
        };

        // 调用导出接口,注意需要指定responseType为blob
        await propertyCatalogueExport(params);

        //  if (res.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        //    this.$message.error('导出失败');
        //    this.getList();
        //    return;
        //  }

        //  // 创建一个Blob对象
        //  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //  const url = window.URL.createObjectURL(blob);
        //  const link = document.createElement('a');
        //  link.href = url;
        //  link.download = '资产目录.xlsx';
        //  document.body.appendChild(link);
        //  link.click();
        //  document.body.removeChild(link);
        //  window.URL.revokeObjectURL(url);
        this.loading = false;
        this.$message.success(this.$t('assetCatalog.exportSuccess'));

      } catch (error) {
        this.loading = false;
        this.$message.error(this.$t('assetCatalog.exportFailed'));
      }
    },

    /**
     * 工具方法:根据选中的ID数组,筛选出对应的节点完整数据
     * @param {Array} treeData - 树数据源
     * @param {Array} checkedIds - 选中的节点ID数组
    * @returns {Array} 选中节点的完整数据
    */
    getCheckedNodeData(checkedNodes) {
      const checkedData = [];
      if (!Array.isArray(checkedNodes)) return checkedData;

      checkedNodes.forEach(node => {
        // 处理有子节点的情况
        if (node.children && node.children.length > 0) {
          // 检查是否是半选状态
          const nodeStatus = this.$refs.tree.getNode(node.id);
          if (nodeStatus && nodeStatus.checked) {
            // 全选状态的父节点,添加所有子节点
            checkedData.push(...node.children);
          } else if (nodeStatus && nodeStatus.indeterminate) {
            // 半选状态的父节点,递归处理子节点
            const childChecked = this.getCheckedNodeData(node.children);
            checkedData.push(...childChecked);
          }
        } else {
          // 叶子节点直接添加
          checkedData.push(node);
        }
      });
      return checkedData;
    },

    //一键填充
    allFill() {
      this.$confirm(this.$t('assetCatalog.oneKeyFillConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      })
        // 用户点击确定按钮,执行相关操作
        .then(() => {
          this.loading = true
          let params = {
            proxysId: this.treeID,
            databaseName: this.databaseName,
          }
          callAIPaddingCommentsByAll(params).then(res => {
            // 获取已选节点数据并传入
            const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
            this.getList(checkedNodeData)
            this.$message.success(this.$t('assetCatalog.fillSuccess'))
            this.loading = false
          })
            .catch(() => {
              this.loading = false
            });
        }).catch(() => {
          // 用户点击了取消按钮,不做任何操作
        });
    },
    //一键评估
    allAssess() {
      this.$confirm(this.$t('assetCatalog.oneKeyEvaluationConfirm'), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      })
        // 用户点击确定按钮,执行相关操作
        .then(() => {
          this.loading = true
          let params = {
            proxysId: this.treeID,
            databaseName: this.databaseName,
          }
          updateDataQualityAssessmentByAll(params).then(res => {
            // 获取已选节点数据并传入
            const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
            this.getList(checkedNodeData)
            this.$message.success(this.$t('assetCatalog.evaluationSuccess'))
            this.loading = false
          })
            .catch(() => {
              this.loading = false
            });
        }).catch(() => {
          // 用户点击了取消按钮,不做任何操作
        });
    },
    checkOverflow(item, index) {
      // 检查 ref 是否存在,避免访问 undefined 的属性
      const containerRef = this.$refs[`container-${index}`];
      if (!containerRef || !containerRef[0]) {
        this.$set(this.overflowStatus, index, false);
        return;
      }
      const container = containerRef[0];
      const isOverflowing = container.scrollWidth > container.clientWidth;
      this.$set(this.overflowStatus, index, isOverflowing);
    },
    isOverflow(index) {
      return this.overflowStatus[index] || false; // 返回当前盒子的溢出状态
    },
    // 数字输入框input事件
    numberInputFn(val) {
      this.addOrEditDataRuls.ruleValue = val.replace(/[^0-9]/g, '');
      let numberVal = parseInt(val)
      if (numberVal > 100) {
        this.addOrEditDataRuls.ruleValue = '100'
      }
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}${this.$t('assetCatalog.countSuffix')}`)
    },
    // ai数据填充
    aiDataSetFn(row) {
      this.loading = true
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      callAIPaddingComments(params).then(res => {
        if (res.code == 200) {
          // 获取已选节点数据并传入
          const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
          this.getList(checkedNodeData)
          this.loading = false
          this.$message.success(this.$t('assetCatalog.fillSuccess'))
        }
      }).catch(err => {
        this.loading = false
      })
    },
    // 质量评估
    qualityEvaluationFn(row) {
      this.loading = true
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      updateDataQualityAssessment(params).then(res => {
        if (res.code == 200) {
          // 获取已选节点数据并传入
          const checkedNodeData = this.getCheckedNodeData(this.selectedTreeNodeIds);
          this.getList(checkedNodeData)
          this.loading = false
          this.$message.success(this.$t('assetCatalog.evaluationCompleted'))
        }
      })
        .catch(err => {
          this.loading = false
        })
    },
    drawerEditFn(row, flag) {
      const tableBody = this.$refs.tableRef.$el.querySelector('.el-table__body-wrapper');
      let scrollTop = tableBody.scrollTop;
      let scrollLeft = tableBody.scrollLeft;
      this.tableKey += 1
      // 数据更新后恢复滚动位置
      this.$nextTick(() => {
        setTimeout(() => {
          const tableBody = this.$refs.tableRef.$el.querySelector('.el-table__body-wrapper');
          tableBody.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
          });
        }, 0);
      });
      if (flag == 'aiFieldRemark') {
        row.drawerEdit = true
        this.editMsg = row.aiFieldRemark
        this.$nextTick(() => {
          document.getElementById('editInput').focus();
        })
      } else {
        row.drawerEditDirtyData = true
        row.dirtyDataEditMsg = row.dirtyData
      }
    },
    async drawerEditBlurFn(row) {
      const params = {
        craftRemark: this.editMsg || row.aiFieldRemark,
        dirtyData: row.dirtyDataEditMsg || row.dirtyData,
        fieldId: row.fieldId,
      }

      try {
        await updateFieldListByFieldId(params);
        this.$message.success(this.$t('assetCatalog.modifySuccess'));
        row.drawerEdit = false;
        row.dirtyDataEditMsg = '';
        this.editMsg = '';
        this.tableKey += 1;
        this.fieldInformationFn(this.filedRowData);
      } catch (error) {
        this.$message.error(this.$t('assetCatalog.modifyFailed'));
      }
    },
    // 字段信息
    async fieldInformationFn(row) {
      this.filedRowData = row
      this.drawerTitle = this.$t('assetCatalog.tableNameLabel') + row.tableName
      let params = {
        tableId: row.tableId,
        databaseId: row.databaseId,
      }
      getAllFieldListByTableIdAndDatabaseId(params).then(res => {
        if (res.code == 200) {
          // 处理原始数据,补充必要字段
          this.drawerData = res.data.map(ele => {
            if (ele.data) {
              ele.sampleList = JSON.parse(ele.data).map(item => ({ value: item }))
            }
            ele.drawerEdit = false
            ele.drawerEditDirtyData = false
            ele.aiFieldRemarkEdit = ''
            ele.dirtyDataEditMsg = ''
            // 确保状态字段有默认值
            ele.dirtyData = ele.dirtyData || this.$t('assetCatalog.no')
            ele.featureData = ele.featureData || this.$t('assetCatalog.notInclude')
            return ele
          })
          this.drawerShow = true
          // 初始化筛选
          this.handleDrawerSearch()
        }
      })
    },
    // 抽屉筛选处理
    handleDrawerSearch() {
      // 重置页码
      this.drawerQueryParams.pageNum = 1
      // 执行筛选
      let filtered = this.drawerData.filter(item => {
        // 字段名称筛选
        const matchField = !this.drawerQueryParams.fieldName ||
          (item.fieldName && item.fieldName.includes(this.drawerQueryParams.fieldName))

        // 字段类型筛选
        const matchType = !this.drawerQueryParams.fieldType ||
          (item.fieldType && item.fieldType.includes(this.drawerQueryParams.fieldType))

        // 字段注释筛选
        const matchRemark = !this.drawerQueryParams.oldFieldRemark ||
          (item.oldFieldRemark && item.oldFieldRemark.includes(this.drawerQueryParams.oldFieldRemark))

        return matchField && matchType && matchRemark
      })

      // 计算总条数和分页数据
      this.drawerTotal = filtered.length
      this.filteredDrawerData = this.getPagedData(filtered)
    },
    // 分页处理
    getPagedData(data) {
      const start = (this.drawerQueryParams.pageNum - 1) * this.drawerQueryParams.pageSize
      const end = start + this.drawerQueryParams.pageSize
      return data.slice(start, end)
    },
    // 分页切换
    handleDrawerPagination() {
      this.filteredDrawerData = this.getPagedData(
        this.drawerData.filter(item => {
          const matchField = !this.drawerQueryParams.fieldName ||
            (item.fieldName && item.fieldName.includes(this.drawerQueryParams.fieldName))

          // 字段类型筛选
          const matchType = !this.drawerQueryParams.fieldType ||
            (item.fieldType && item.fieldType.includes(this.drawerQueryParams.fieldType))

          // 字段注释筛选
          const matchRemark = !this.drawerQueryParams.oldFieldRemark ||
            (item.oldFieldRemark && item.oldFieldRemark.includes(this.drawerQueryParams.oldFieldRemark))

          return matchField && matchType && matchRemark
        })
      )
    },

    // 分页事件处理
    handlePagination() {
      // 获取当前选中的节点数据
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      const checkedNodeData = this.getCheckedNodeData(checkedNodes);
      // 调用列表刷新方法
      this.getList(checkedNodeData);
    },
    // 重置筛选条件
    resetDrawerSearch() {
      // 先手动重置筛选参数
      this.drawerQueryParams = {
        fieldName: '',
        fieldType: '',
        oldFieldRemark: '',
        pageNum: 1,
        pageSize: 10
      };
      // 再调用表单重置方法(双重保障)
      if (this.$refs.drawerQueryForm) {
        this.$refs.drawerQueryForm.resetFields();
      }
      // 重新执行筛选
      this.handleDrawerSearch();
    },
    // 树节点过滤方法
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    selectProjectIdChange(val) {
      console.log('val', val);
      console.log('queryParams', this.queryParams);
      this.handleQuery()
    },
    // 处理input输入事件,添加防抖
    handleInputChange() {
      clearTimeout(this.inputTimer);
      this.inputTimer = setTimeout(() => {
        this.handleQuery();
      }, 500); // 500毫秒防抖
    },
    // 左侧树数据
    getProtectCategory() {
      this.treeLoading = true;
      this.Loading = true;
      getAllProxys().then((resp) => {
        this.Loading = false;
        if (resp.data.length === 0) {
          this.categoryList = [];
        } else {
          this.categoryList = resp.data;
          this.treeID = resp.data[0].id;
          this.$nextTick(() => {
            this.$refs.tree.setCurrentKey(this.treeID);
            // 页面初次加载时全选所有节点
            this.isTreeAllChecked = true;

            // 示例:获取所有children并打印(可根据需要调整调用时机)
            if (this.categoryList[0].type == '0') {
              const allChildren = this.collectAllChildren([this.categoryList[0]]);
              this.getList(allChildren);
            } else {
              this.currentNodeData = this.categoryList[0];
              this.currentNodeType = this.categoryList[0].type || '0';
              this.currentFolderId = null;
              this.breadcrumbList = [];
              this.loadFileListData(this.categoryList[0], {
                folderId: null,
                keepCurrentFolderName: false
              });
            }
          });
        }
        this.treeLoading = false;
        // this.getSelectTableNamesFn();
      });
    },
    /**
 * 收集所有树节点的children,构建成指定结构数组
 * @param {Array} treeData - 树数据源
 * @returns {Array} 包含所有children节点的label和parentId的数组
 */
    collectAllChildren(treeData) {
      const result = [];
      const traverse = (nodes) => {
        nodes.forEach(node => {
          // 如果当前节点有children,处理每个child
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
              // 构建目标结构并添加到结果数组
              result.push({
                label: child.label,
                parentId: node.id // parentId为当前节点的id
              });
              // 递归处理子节点的children(如果有多层嵌套)
              if (child.children && child.children.length > 0) {
                traverse([child]);
              }
            });
          }
        });
      };
      // 开始遍历整棵树
      traverse(treeData);
      return result;
    },
    // 请求列表数据
    getList(treeNode) {
      this.loading = true;
      let params = {
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize,
      }
      const response = {
        tableName: this.queryParams.tableName,
        paddingStatus: this.queryParams.paddingStatus,
        featureExtractionStatus: this.queryParams.featureExtractionStatus,
        databaseList: treeNode,
      }
      getTableListByProxysId(params, response).then((response) => {
        this.dataAll = response.data?.rows || [];
        this.dataAll.forEach(ele => {
          ele.isShowTooltip = true
        })
        this.total = response.data?.total || 0;
        this.overflowStatus = {}
        this.Loading = false
        this.loading = false
        document.getElementById('main_box').scrollTop = 0;
        this.$nextTick(() => {
          this.dataAll.forEach((ele, index) => {
            this.checkOverflow(ele, index)
          })
        })
      });
    },
    async getSelectTableNamesFn() {
      let params = {
        proxysId: this.treeID,
        databaseName: this.databaseName,
      }
      getSelectTableNames(params).then(res => {
        if (res.code == 200) {
          this.tableNameList = res.data
        }
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // 重置页码
      this.queryParams.pageNum = 1;
      // 获取当前选中的节点数据(完整结构)
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      // 通过getCheckedNodeData处理成需要的格式
      const processedNodes = this.getCheckedNodeData(checkedNodes);
      console.log('processedNodes', processedNodes);
      // 传入处理后的节点数据调用getList
      this.getList(processedNodes);
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.treeID = this.categoryList[0].id
      this.isChildrenNode = this.categoryList[0].nodeLayerIndex
      this.$refs.tree.setCurrentKey(this.treeID);
      this.resetForm("queryParams");
      this.handleQuery();
    },
    showScoreDialog(item) {
      let scoreData = {
        fieldCommentActual: 0,
        tableCommentActual: 0,
        namingActual: 0,
        uniquenessActual: 0,
        totalScore: item.score || 0
      };
      if (item.scoreJson) {
        const scoreJson = JSON.parse(item.scoreJson);
        scoreData = {
          fieldCommentActual: scoreJson.validScore || 0,
          tableCommentActual: scoreJson.validTableScore || 0,
          namingActual: scoreJson.normScore || 0,
          uniquenessActual: scoreJson.structureScore || 0,
          totalScore: item.score || 0
        };
      }
      this.scoreDialog.data = scoreData;
      this.scoreDialog.visible = true;
    },
  }
};
</script>
<style lang="scss" scoped>
::v-deep .el-row {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

::v-deep .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.right-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}


/* (1) 面包屑导航样式 */
.breadcrumb-container {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.breadcrumb-nav {
  font-size: 14px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  ::v-deep .el-breadcrumb__item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    max-width: 100%;

    &:hover {
      color: #409eff;
    }

    .el-breadcrumb__inner {
      display: inline-block;
      vertical-align: middle;
      color: #606266;
      font-weight: 400;
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
        color: #409eff;
      }

      i {
        font-size: 16px;
        vertical-align: middle;
        margin-right: 4px;
      }
    }

    .el-breadcrumb__separator {
      flex-shrink: 0;
    }

    &:last-child .el-breadcrumb__inner {
      color: #303133;
      font-weight: 500;
    }
  }
}

/* (2) 文件夹头部样式 */
.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  padding: 0 20px;
}

.folder-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex: 1;
  min-width: 0;

  .folder-name {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  .folder-count {
    font-size: 14px;
    color: #909399;
    flex-shrink: 0;
  }
}

/* (3) 排序选择器样式 */
.sort-selector {
  .sort-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    transition: all 0.3s;

    &:hover {
      color: #409eff;
      border-color: #409eff;
    }

    i {
      font-size: 12px;
    }
  }

  ::v-deep .el-dropdown-menu__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;

    .sort-icon {
      margin-left: 12px;
      color: #909399;
    }
  }
}

/* (4) 文件夹展示区域样式 */
.folder-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding: 0 20px;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 0 20px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    border-color: #409eff;

    .folder-icon {
      color: #409eff;
    }
  }

  .folder-icon {
    font-size: 24px;
    color: #909399;
    transition: color 0.3s;
  }

  .folder-item-name {
    font-size: 14px;
    color: #606266;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* (5) 文件列表样式 */
.file-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }
}

.file-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  // border: 1px solid #ebeef5;
  // border-radius: 4px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.file-item {
  padding: 16px 20px;
  // margin: 5px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: background 0.3s;
  cursor: pointer;

  .file-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    // margin-bottom: 20px;
  }

  .file-footer {
    font-size: 14px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background: #f5f7fa;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    .file-icon {
      font-size: 20px;
      color: #909399;
    }

    .file-name {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: 24px;

    .file-time,
    .file-size {
      font-size: 14px;
      color: #909399;
      white-space: nowrap;
    }

    .file-time {
      min-width: 150px;
    }

    .file-size {
      min-width: 80px;
      text-align: right;
    }
  }
}

.el-drawer__wrapper ::v-deep .el-drawer__body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.el-drawer__wrapper ::v-deep .el-drawer__body::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.el-drawer__wrapper ::v-deep .el-drawer__body::-webkit-scrollbar-track {
  border-radius: 10px;
}

.el-drawer__wrapper ::v-deep .el-drawer__body {
  padding: 20px;
  background-color: #f8fafc;
}

.mian_box_item {
  margin-top: 15px;
  margin-right: 10px;
  margin-left: 10px;
}

.mian_box_item ::v-deep .el-card {
  box-shadow: none;
}

.addMsg ::v-deep .el-input--medium {
  width: 237px;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.el-tree-node ::v-deep .el-tree-node {
  display: none;
}

.serachInput {
  margin-bottom: 20px;

  .el-input__inner {
    background-color: #f8fafc;
  }
}

::v-deep .el-tree-node__content {
  height: auto;
  min-height: 28px;
  line-height: 1.5;
  border-radius: 10px;
}

::v-deep .el-tree-node.is-current>.el-tree-node__content {
  background-color: #eff6ff;
  color: #3b84f6;
  border-radius: 10px;
}

::v-deep .el-tree-node__content:hover {
  background-color: #f8fafc !important;
  border-radius: 10px;
}

::v-deep .el-tree-node {
  padding: 0;
}

.tree-node-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 8px;
}

.node-level {
  font-size: 12px;
  font-weight: 500;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.node-label-wrapper {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-label {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.treeBox {
  overflow-y: auto;
  border: none;
  border-radius: 0;
}

.tree-scroll-container {
  overflow-y: auto;
  max-height: calc(100vh - 350px);
}

.treeBox ::v-deep .el-tree__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.treeBox ::v-deep .el-tree__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  transition: all .2s ease-in-out;
}

.mian_box {
  width: 100%;
  flex: 1;
  height: 100%;
  overflow: auto;
  margin-bottom: 20px;
}

.mian_box_head {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f1fafe;
}

.mian_box_center {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  padding: 20px;
}

.mian_box_center div {
  width: 23%;
  margin: 10px 5px 10px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.box-card ::v-deep .el-card__body {
  padding: 0;
}

.btnImg {
  width: 25px;
  height: 25px;
  display: block;
}

.btnItem {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 15px;
  font-size: 14px;
}

.btnItem:hover {
  cursor: pointer;
}

.treeBox::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.treeBox::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.treeBox::-webkit-scrollbar-track {
  border-radius: 10px;
}

.status-tag {
  border-radius: 50px;
  font-size: 10px;
  height: 20px;
  line-height: 20px;
}

::v-deep .el-drawer__header {
  padding-bottom: 20px;
  margin-bottom: 0;
}

::v-deep .el-drawer__header> :first-child {
  font-size: 18px;
  color: black;
  font-weight: bold;
}

.yuanDataClass {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
}

.yuanDataClass ::v-deep .el-form-item {
  width: 30%;
}

.yuanDataClass ::v-deep .el-form-item:nth-child(3n) {
  margin-right: 0;
}

.yuanDataClass ::v-deep .el-form-item:nth-last-child(-n+3) {
  margin-bottom: 0;
}

.yuanDataClass ::v-deep .el-form-item__label {
  width: 25%;
  white-space: nowrap;
}

.yuanDataClass ::v-deep .el-form-item__content {
  width: 75%;
}

.yuanDataClass ::v-deep .el-select {
  width: 100%;
}

/* 新增:树操作栏(全选框+导出按钮)样式 */
.tree-operation-bar {
  padding: 0 3px;
  /* 与输入框、树组件保持一致的内边距 */
}

/* 优化:树复选框与文字的间距(避免拥挤) */
.treeBox ::v-deep .el-tree-node__content .el-checkbox {
  margin-right: 7px;
}

.table-info-card {
  background-color: #fff;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
  /* padding: 20px; */
  font-family: "Microsoft YaHei", sans-serif;
  border: 0.5px solid #e6e8ee;
  border-radius: 15px;
  margin-bottom: 50px;
  overflow: hidden;
  /* 新增:添加最大宽度和水平滚动 */
  max-width: 100%;
  overflow-x: auto;
}

/* 头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f9fafd;

}

.table-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.field-info-btn {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.field-info-btn .icon {
  margin-right: 6px;
}

/* 内容区域样式 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  /* 新增:确保内容区域有足够空间 */
  min-width: 0;
}

.row {
  display: flex;
  gap: 20px;
  /* 新增:确保行内容不会压缩列 */
  flex-wrap: nowrap;
}

/* 第一行列样式 */
.row-1 .col {
  flex: 1;
  background-color: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 0.5px solid #e6e8ee;
  border-radius: 10px;
  /* 新增:限制列的最小宽度,防止过窄 */
  min-width: 230px;
}

.row-1 .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.row-1 .label,
.value,
.row-2 .label,
.value,
.row-3 .label,
.value {
  font-weight: 600;

}

.row-1 .value {
  font-size: 16px;
  color: #333;
  padding: 10px 0;
  /* 添加单行显示和省略号样式 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.row-1 .info-icon,
.row-1 .db-icon,
.row-1 .list-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 16px;
  height: 16px;
}

.row-1 .rating-star {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 16px;
  height: 16px;
}

.progress-bar {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #ff9f43;
  border-radius: 2px;
}

/* 第二、三行列样式 */
.row-2 .col,
.row-3 .col {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 12px;
  border: 0.5px solid #e6e8ee;
  border-radius: 10px;
  /* 新增:限制列的最小宽度,防止过窄 */
  min-width: 147px;
}

.row-2 .label,
.row-3 .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.row-2 .value,
.row-3 .value {
  font-size: 14px;
  color: #333;
  padding: 5px 0;
  /* 添加单行显示和省略号样式 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.row-3 .green {
  color: #67c23a;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag .status-icon {
  margin-right: 4px;
}

.status-tag.gray {
  background-color: #e4e7ed;
  color: #909399;
}

.status-tag.red {
  background-color: #ffe3e3;
  color: #f56c6c;
}

/* 调整滚动条样式,提升用户体验 */
.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.table-info-card::-webkit-scrollbar {
  height: 6px;
}

.table-info-card::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.table-info-card::-webkit-scrollbar-track {
  border-radius: 10px;
}

/* 导出列配置弹窗样式 */
::v-deep .export-column-dialog-wrapper {
  border-radius: 10px;
}

.export-column-dialog-wrapper .dialog-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.export-column-dialog-wrapper .dialog-header .title-bar {
  width: 4px;
  height: 16px;
  background: #1890ff;
  margin-right: 8px;
}

.export-column-dialog-wrapper .dialog-header .title-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.export-column-dialog-wrapper .column-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.export-column-dialog-wrapper .column-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  white-space: nowrap;
}

.export-column-dialog-wrapper .column-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.export-column-dialog-wrapper .column-btn.active {
  border-color: #1890ff;
  background: #e6f7ff;
  color: #1890ff;
}

.export-column-dialog-wrapper .dialog-footer-custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.export-column-dialog-wrapper .footer-left {
  display: flex;
  align-items: center;
}

.export-column-dialog-wrapper .footer-right {
  display: flex;
  align-items: center;
}

.export-column-dialog-wrapper .restore-link {
  margin-left: 16px;
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
}

.export-column-dialog-wrapper .restore-link:hover {
  color: #40a9ff;
}

/* 新增评分详情弹窗样式 */
::v-deep .score-detail-dialog {
  border-radius: 8px;

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #e8e8e8;

    &::before {
      display: none;
    }
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__headerbtn {
    top: 24px;
    right: 24px;
    font-size: 18px;

    .el-dialog__close {
      color: #999;
      font-weight: 400;

      &:hover {
        color: #333;
      }
    }
  }
}

.score-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #3b82f6;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .title-text {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }

}

.score-content {
  padding: 24px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #f7f8fa;
  border-radius: 8px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .max-score {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e6f4ff;
    border-radius: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #1890ff;
  }

  .score-detail {
    flex: 1;

    .detail-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .detail-desc {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
  }

  .actual-score {
    flex-shrink: 0;
    min-width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f94;
    border-radius: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #52c41a;

    .score-unit {
      font-size: 14px;
      margin-left: 4px;
    }
  }
}

.score-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-top: 1px solid #e8e8e8;

  .footer-label {
    font-size: 16px;
    font-weight: 600;
    color: #464545;
  }

  .footer-score {
    font-size: 36px;
    font-weight: 600;
    color: #1890ff;
  }
}

.left-card {
  border-radius: 10px;
  height: 100%;
  max-height: 100%;
  overflow: auto;

  .el-card__body {
    height: 100%;
    max-height: 100%;
    overflow: auto;
  }
}

.search-card {
  border-radius: 10px;
  margin-bottom: 20px;
}

::v-deep .table-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .el-card__body {
    flex: 1;
    height: 93%;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}

::v-deep .assetCatalogDrawer {
  display: flex;
  flex-direction: column;
  height: 100%;

  .el-drawer__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
}

::v-deep .fileDetailDrawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 18px 20px;
    border-bottom: 1px solid #e3e8f0;
    background: #f3f5f8;
  }

  .el-drawer__header> :first-child {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .el-drawer__close-btn {
    font-size: 20px;
    color: #97a3b7;
  }

  .el-drawer__body {
    padding: 0;
    background: #f3f5f8;
  }
}

.file-detail-panel {
  padding: 12px 18px 18px;
  background: #f3f5f8;
}

.file-detail-item {
  padding: 14px 0 12px;
  border-bottom: 1px dashed #d6dee9;
}

.file-detail-label {
  margin-bottom: 8px;
  color: #9aa6b8;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}

.file-detail-value {
  color: #1f2937;
  font-size: 16px;
  line-height: 1.45;
  word-break: break-all;
  white-space: pre-wrap;
}

::v-deep .drawer-table-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 15px;

  .el-card__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
}

::v-deep .file-manager-card {
  border-radius: 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .el-card__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
}

.file-manager-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
