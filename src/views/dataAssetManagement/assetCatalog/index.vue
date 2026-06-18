<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <!-- 1. 原有搜索输入框(保持不变,位于最上方) -->
          <div class="head-container" style="margin: 20px;">
            <el-input class="serachInput" v-model="filterText" :placeholder="$t('assetCatalog.pleaseInputSearch')"
              clearable>
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </div>

          <!-- 2. 新增:全选框(左) + 导出按钮(右) 区域 -->
          <div class="tree-operation-bar">
            <!-- 左侧全选框(带文字说明) -->
            <el-checkbox v-model="isTreeAllChecked" @change="handleTreeAllCheck"
              :indeterminate="isTreeAllChecked === null" style="font-size: 14px;">
              {{ $t('assetCatalog.selectAll') }}
            </el-checkbox>
            <!-- 右侧导出按钮(无选中节点时禁用) -->
            <el-button type="text" @click="handleTreeExport" :disabled="selectedTreeNodeIds.length === 0"
              style="color: #26244ce0;">
              <svg-icon icon-class="导出" />
              {{ $t('assetCatalog.export') }}
            </el-button>
          </div>

          <div class="head-container" v-loading="treeLoading" style="margin: 20px;">
            <div class="tree-scroll-container">
              <el-tree class="treeBox" :data="categoryList" :props="defaultProps" :current-node-key="treeID"
                :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" node-key="id"
                highlight-current show-checkbox :check-strictly="false" :accordion="true"
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
          <!-- 第一层：数据源 (Level 1) -->
          <template v-if="currentNodeLevel === 1">
            <div class="file-manager-wrapper" style="display: flex; flex-direction: column; height: 100%;">
              <el-card class="file-manager-card" shadow="never" style="flex: 1; display: flex; flex-direction: column;"
                :body-style="{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }">
                <div slot="header" class="header-title">
                  <div>
                    <span
                      style="font-size: 18px; font-weight: bold; display: flex; align-items: center; margin-bottom: 10px;">
                      <svg-icon icon-class="home-dataAsset" style="font-size: 18px;margin-right: 10px;"></svg-icon>
                      数据源：{{ currentNodeData ? currentNodeData.label : '' }}
                    </span>
                    <span style="color: #909399; font-size: 13px;">共 {{ dataSourceDetail.databaseCount }} 个数据库</span>
                    <div style="margin-top: 10px; font-size: 13px; color: #606266;"
                      v-if="dataSourceDetail.systemName || dataSourceDetail.systemRemark">
                      {{ dataSourceDetail.systemName }}：{{ dataSourceDetail.systemRemark }}
                    </div>
                  </div>
                </div>

                <div class="file-manager-content" style="flex: 1; display: flex; flex-direction: column; height: 100%;">
                  <div class="file-section" style="flex: 1; overflow-y: auto; padding: 20px;" v-loading="loading">
                    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                      <div v-for="db in dataSourceDetail.databaseList" :key="db.id"
                        style="width: calc(33.33% - 13.33px);">
                        <el-card shadow="hover" @click.native="handleDatabaseCardClick(db)"
                          style="cursor: pointer; border-radius: 8px; border: 1px solid #ebeef5;">
                          <div slot="header" style="display: flex; align-items: center; margin-bottom: 15px;">
                            <div
                              style="width: 40px; height: 40px; background-color: #f0f2f5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                              <svg-icon icon-class="databaseSolid" style="font-size: 18px;" />
                            </div>
                            <div>
                              <div style="font-weight: bold; font-size: 16px; color: #303133;">{{ db.label ||
                                db.databaseName }}</div>
                              <div style="font-size: 12px; color: #909399; margin-top: 5px;">{{ db.databaseType ||
                                'UTF-8 / MySQL' }}</div>
                            </div>
                          </div>
                          <div
                            style="padding: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                            <span style="color: #606266;">包含表数量</span>
                            <span style="color: #409EFF; font-weight: bold; font-size: 16px;">{{ db.tableCount || 0
                            }}</span>
                          </div>
                        </el-card>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </template>

          <!-- 第二层：数据库 (Level 2) -->
          <template v-else-if="currentNodeLevel === 2">
            <div class="file-manager-wrapper" style="display: flex; flex-direction: column; height: 100%;">
              <el-card class="file-manager-card" shadow="never" style="flex: 1; display: flex; flex-direction: column;"
                :body-style="{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }">
                <div slot="header" class="header-title"
                  style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <span
                      style="font-size: 18px; font-weight: bold; display: flex; align-items: center; margin-bottom: 10px;">
                      <svg-icon icon-class="databaseSolid" style="font-size: 18px;margin-right: 10px;" />
                      数据库：{{ currentNodeData ? currentNodeData.label : '' }}
                    </span>
                    <span style="color: #909399; font-size: 13px;">共 {{ total }} 张表</span>
                  </div>
                </div>

                <div class="file-manager-content"
                  style="flex: 1; display: flex; flex-direction: column; height: 100%; padding: 20px;">
                  <div class="file-section" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                    <el-table :data="dataAll" v-loading="loading" class="tableBox"
                      style="width: 100%; margin-top: 20px;" height="100%"
                      :header-cell-style="{ background: '#f8f8f9', color: '#606266' }">
                      <el-table-column label="表名" width="180">
                        <template slot-scope="scope">
                          <div style="display: flex; align-items: center; cursor: pointer; color: #409EFF;"
                            @click="handleTableClick(scope.row)">
                            <svg-icon icon-class="table1" style="margin-right: 8px;" />
                            {{ scope.row.tableName || '--' }}
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="表注释" prop="tableRemark" width="120">
                        <template slot-scope="scope">
                          {{ scope.row.tableRemark || '--' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="AI表注释" prop="aiTableRemark">
                        <template slot-scope="scope">
                          <el-tag type="info" size="mini" v-if="scope.row.aiTableRemark">{{
                            scope.row.aiTableRemark }}</el-tag>
                          <span v-else>--</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="数据质量评分" width="150">
                        <template slot-scope="scope">
                          <div style="display: flex; align-items: center; cursor: pointer;"
                            @click="showScoreDialog(scope.row)">
                            <el-progress :percentage="Number(scope.row.score)" color="#f4a63e" :show-text="false"
                              style="width: 60px; margin-right: 10px;"></el-progress>
                            <span style="color: #f4a63e; font-weight: bold;">{{ scope.row.score || '--' }}</span>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column label="数据量(行)" prop="dataMagnitude" width="120">
                        <template slot-scope="scope">
                          {{ scope.row.dataMagnitude || '--' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="数据大小" prop="dataSize" width="120">
                        <template slot-scope="scope">
                          {{ scope.row.dataSize || '--' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="分类" width="300" align="left">
                        <template slot-scope="scope">
                          <el-tag type="primary" size="mini">{{ scope.row.categoryName || '--'
                          }}</el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column label="安全分级" width="150" align="left">
                        <template slot-scope="scope">
                          <el-tag type="danger" size="mini" v-if="scope.row.tableSecurityLevel"
                            :style="getRiskStyle(scope.row.tableSecurityLevel)">{{
                              scope.row.tableSecurityLevelName }}</el-tag>
                          <span v-else>--</span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>

                  <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
                    :pageSize.sync="queryParams.pageSize" @pagination="handlePagination" />
                </div>
              </el-card>
            </div>
          </template>

          <!-- 第三层：表 (Level 3) -->
          <template v-else-if="currentNodeLevel === 3">
            <div class="file-manager-wrapper" style="display: flex; flex-direction: column; height: 100%;">
              <!-- 新增：搜索区域 (移动到上方) -->
              <el-collapse-transition>
                <div v-show="showFieldSearch" class="file-search-container"
                  style="margin-bottom: 15px; flex-shrink: 0;">
                  <el-card class="search-card" shadow="never">
                    <el-form :model="drawerQueryParams" size="small" :inline="true" class="yuanDataClass">
                      <el-form-item label="字段名">
                        <el-input v-model="drawerQueryParams.fieldName" placeholder="请输入字段名" clearable
                          @input="handleDrawerSearch" @clear="handleDrawerSearch"></el-input>
                      </el-form-item>
                      <el-form-item label="分类">
                        <el-select ref="categorySelect" v-model="drawerQueryParams.categoryName" placeholder="全部"
                          clearable @clear="handleCategoryClear" collapse-tags :filter-method="filterCategoryTree">
                          <el-option style="height: 100%; padding: 0" value="">
                            <el-tree :data="categoryOptions" :props="{ label: 'categoryName', children: 'children' }"
                              node-key="id" :expand-on-click-node="false" show-checkbox @check="handleCategoryCheck"
                              ref="categoryTree" :filter-node-method="filterNode" />
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="分类状态">
                        <el-select v-model="drawerQueryParams.classificationStateIds" multiple placeholder="全部"
                          clearable @change="handleDrawerSearch">
                          <el-option v-for="item in dict.type.sys_classification_state" :key="item.value"
                            :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="安全分级">
                        <el-select v-model="drawerQueryParams.securityLevel" multiple placeholder="全部" clearable
                          @change="handleDrawerSearch">
                          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="确认状态">
                        <el-select v-model="drawerQueryParams.confirm" placeholder="全部" clearable
                          @change="handleDrawerSearch">
                          <el-option v-for="item in confirmList" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="归类原因">
                        <el-select v-model="drawerQueryParams.classificationReasons" placeholder="全部" clearable
                          @change="handleDrawerSearch">
                          <el-option v-for="item in dict.type.sys_classification_reasons" :key="item.value"
                            :label="item.label" :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="自动审查">
                        <el-select v-model="drawerQueryParams.confidenceLevel" placeholder="全部" clearable
                          @change="handleDrawerSearch">
                          <el-option v-for="item in confidenceLevelList" :key="item.value" :label="item.name"
                            :value="item.value"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="个保合规">
                        <el-select ref="ppSelect" v-model="drawerQueryParams.piiDetectionName" placeholder="全部"
                          clearable @clear="handlePPClear" collapse-tags :filter-method="filterPPTree">
                          <el-option style="height: 100%; padding: 0" value="">
                            <el-tree :data="personalProtectionOptions"
                              :props="{ label: 'categoryName', children: 'children' }" node-key="id"
                              :expand-on-click-node="false" show-checkbox @check="handlePPCheck" ref="ppTree"
                              :filter-node-method="filterNode" />
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="样本特征">
                        <el-select v-model="drawerQueryParams.featureData" placeholder="全部" clearable
                          @change="handleDrawerSearch">
                          <el-option label="是" value="1" />
                          <el-option label="否" value="0" />
                        </el-select>
                      </el-form-item>
                    </el-form>
                  </el-card>
                </div>
              </el-collapse-transition>

              <el-card class="file-manager-card" shadow="never" style="flex: 1; display: flex; flex-direction: column;"
                :body-style="{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }">
                <div slot="header" class="header-title">
                  <div>
                    <span
                      style="font-size: 18px; font-weight: bold; display: flex; align-items: center; margin-bottom: 10px;">
                      <svg-icon icon-class="table1" style="margin-right: 8px; color: #409EFF;" />
                      {{ currentNodeData ? currentNodeData.label : '' }}
                    </span>
                    <span style="color: #909399; font-size: 13px;">共 {{ drawerTotal }} 个字段</span>
                    <div style="font-size: 13px; color: #606266; margin-top: 10px;">
                      {{ currentTableRemark }}
                    </div>
                  </div>
                </div>

                <div class="file-manager-content"
                  style="display: flex; flex-direction: column; height: 100%; padding: 20px">
                  <div style="overflow: hidden; display: flex; flex-direction: column;margin: 15px 0;">
                    <!-- 操作按钮区域 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                      <div>
                        <template v-if="canShowNodeActionButtons">
                        <el-dropdown trigger="click">
                          <el-button type="primary" plain size="medium">确认结果<i
                              class="el-icon-arrow-down el-icon--right"></i></el-button>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="handleAdd">
                              <i class="el-icon-aim"></i> 确认勾选项
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="handleEcelFn">
                              <i class="el-icon-more"></i> 确认过滤项
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                        <el-dropdown trigger="click" style="margin-left: 10px;">
                          <el-button type="danger" plain size="medium">取消操作<i
                              class="el-icon-arrow-down el-icon--right"></i></el-button>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="handleAddFnClose">
                              <i class="el-icon-refresh-left"></i> 取消勾选项
                            </el-dropdown-item>
                            <el-dropdown-item @click.native="handleEcelFnClose">
                              <i class="el-icon-magic-stick"></i> 取消过滤项
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                        <el-button type="primary" plain size="medium" @click="handleBatchFix"
                          style="margin-left: 10px;">批量修改</el-button>
                        </template>
                      </div>
                      <div>
                        <el-button type="text" size="medium" @click="showFieldSearch = !showFieldSearch"
                          style="margin-right: 10px; color: #7c8592;">
                          <svg-icon icon-class="过滤" />
                          {{ showFieldSearch ? '收起筛选' : '展开筛选' }}
                        </el-button>
                        <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click">
                          <el-checkbox :indeterminate="isIndeterminateFieldCol" v-model="checkAllFieldCol"
                            @change="handleFieldCheckAllChange">全选</el-checkbox>
                          <el-checkbox-group v-model="checkedFieldColumns" @change="handleFieldCheckedCitiesChange"
                            class="checkboxGroup"
                            style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
                            <el-checkbox style="margin-bottom: 10px;" v-for="item in fieldColumnList" :label="item.prop"
                              :key="item.prop">{{ item.label }}</el-checkbox>
                          </el-checkbox-group>
                          <el-button type="text" size="medium" slot="reference" icon="el-icon-s-tools"
                            style="color: #7c8592;">列设置</el-button>
                        </el-popover>
                      </div>
                    </div>
                  </div>

                  <!-- 字段表格 -->
                  <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                    <el-table ref="tableRefMain" :data="filteredDrawerData" style="width: 100%;" height="100%"
                      :header-cell-style="{ background: '#f8f8f9', color: '#606266' }">
                      <el-table-column type="selection" width="55" align="center"></el-table-column>
                      <el-table-column v-for="item in checkedFieldColumnDef" :key="item.prop" :label="item.label"
                        :prop="item.prop" :width="item.width" align="left">
                        <template slot-scope="scope">
                          <template v-if="item.prop === 'fieldName'">
                            <span style="color: #409EFF; cursor: pointer;" @click="openFixResultsDrawer(scope.row)">
                              {{ scope.row.fieldName }}
                            </span>
                            <el-tag size="mini" type="warning" v-if="scope.row.isPk">PK</el-tag>
                          </template>
                          <template v-else-if="item.prop === 'confirm'">
                            <span>
                              <el-tag :type="scope.row.confirm === 1 ? 'primary' : 'info'" size="mini">{{
                                scope.row.confirm === 1 ? '已确认' : '未确认' }}</el-tag>
                            </span>
                          </template>
                          <template v-else-if="item.prop === 'securityLevelName'">
                            <el-tag v-if="scope.row.securityLevelName" plain
                              :style="getRiskStyle(scope.row.securityLevel)">{{
                                scope.row.securityLevelName }}</el-tag>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'craftRemark'">
                            <el-tag type="info" size="mini" v-if="scope.row.craftRemark">{{
                              scope.row.craftRemark }}</el-tag>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'categoryName'">
                            <el-tag type="primary" size="mini" v-if="scope.row.categoryName">{{
                              scope.row.categoryName }}</el-tag>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'tableCraftRemark'">
                            <el-tag type="primary" size="mini" v-if="scope.row.tableCraftRemark">{{
                              scope.row.tableCraftRemark }}</el-tag>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'sampleData'">
                            <el-tooltip placement="bottom" effect="light"
                              v-if="scope.row.sampleData && scope.row.sampleData.length > 0">
                              <div slot="content">
                                <el-table :data="scope.row.sampleData" height="250" border class="tableCla"
                                  style="width: 100%">
                                  <el-table-column type="index" label="序号" width="50" align="center" />
                                  <el-table-column prop="value" label="字段值" width="100" show-overflow-tooltip
                                    align="left" />
                                </el-table>
                              </div>
                              <span>
                                {{ scope.row.sampleData[0].value }}
                                <i class="el-icon-view" style="font-size: 18px; cursor: pointer;"></i>
                              </span>
                            </el-tooltip>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'confidenceLevel'">
                            <el-tag :type="getAiReviewTagType(scope.row)" effect="plain" class="table-ai-review-tag">
                              <svg-icon v-if="isAiReviewSvgIcon(scope.row)" :icon-class="getAiReviewIcon(scope.row)"></svg-icon>
                              <i v-else :class="getAiReviewIcon(scope.row)"></i>
                              <span>{{ getAiReviewLabel(scope.row) }}</span>
                            </el-tag>
                          </template>
                          <template v-else>
                            {{ scope.row[item.prop] || '--' }}
                          </template>
                        </template>
                      </el-table-column>
                    </el-table>

                    <pagination v-show="drawerTotal > 0" :total="drawerTotal" :page.sync="drawerQueryParams.pageNum"
                      :pageSize.sync="drawerQueryParams.pageSize" @pagination="handleDrawerPagination" />
                  </div>
                </div>
              </el-card>
            </div>
          </template>
        </template>

        <!-- type = 1 时显示文件管理界面 -->
        <template v-else-if="currentNodeType == '1'">
          <div class="file-manager-wrapper" style="display: flex; flex-direction: column; height: 100%;">
            <!-- 新增：搜索区域 (移动到上方, 并在 card 外) -->
            <el-collapse-transition>
              <div v-show="showFileSearch" class="file-search-container" style="margin-bottom: 15px;">
                <el-card class="search-card" shadow="never">
                  <el-form :model="fileQueryParams" size="small" :inline="true" class="yuanDataClass">
                    <el-form-item label="文件名">
                      <el-input v-model="fileQueryParams.fileName" placeholder="请输入文件名" clearable
                        @input="handleFileQuery" @clear="handleFileQuery"></el-input>
                    </el-form-item>
                    <el-form-item label="分类">
                      <el-select ref="fileCategorySelect" v-model="fileQueryParams.categoryName" placeholder="全部"
                        clearable @clear="handleCategoryClear" collapse-tags :filter-method="filterFileCategoryTree">
                        <el-option style="height: 100%; padding: 0" value="">
                          <el-tree :data="categoryOptions" :props="{ label: 'categoryName', children: 'children' }"
                            node-key="id" :expand-on-click-node="false" show-checkbox @check="handleCategoryCheck"
                            ref="fileCategoryTree" :filter-node-method="filterNode" />
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="分类状态">
                      <el-select v-model="fileQueryParams.classificationStateIds" multiple placeholder="全部" clearable
                        @change="handleFileQuery">
                        <el-option v-for="item in dict.type.sys_classification_state" :key="item.value"
                          :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="安全分级">
                      <el-select v-model="fileQueryParams.securityLevel" multiple placeholder="全部" clearable
                        @change="handleFileQuery">
                        <el-option v-for="item in levelOptions" :key="item.value" :label="item.label"
                          :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="确认状态">
                      <el-select v-model="fileQueryParams.confirm" placeholder="全部" clearable @change="handleFileQuery">
                        <el-option v-for="item in confirmList" :key="item.value" :label="item.label"
                          :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- <el-form-item label="所属文件夹">
                      <el-input v-model="fileQueryParams.fileParentPath" placeholder="请输入所属文件夹" clearable
                        @input="handleFileQuery" @clear="handleFileQuery"></el-input>
                    </el-form-item> -->
                    <el-form-item label="归类原因">
                      <el-select v-model="fileQueryParams.classificationReasons" placeholder="全部" clearable
                        @change="handleFileQuery">
                        <el-option v-for="item in dict.type.sys_classification_reasons_un" :key="item.value"
                          :label="item.label" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="自动审查">
                      <el-select v-model="fileQueryParams.confidenceLevel" placeholder="全部" clearable
                        @change="handleFileQuery">
                        <el-option v-for="item in confidenceLevelList" :key="item.value" :label="item.name"
                          :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>
                </el-card>
              </div>
            </el-collapse-transition>

            <el-card class="file-manager-card" shadow="never" style="flex: 1;">
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
                      <span class="folder-item-name">{{ folder.name }}<span style="font-size: 12px; color: #909399;">（{{
                        folder.itemCount || 0 }}）</span></span>
                    </div>
                  </div>
                </div>

                <!-- (5) 文件列表展示 -->
                <div v-if="fileList.length > 0" class="file-section"
                  style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                  <div class="section-title"
                    style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0;">
                    <span>{{ $t('assetCatalog.file') }}</span>
                  </div>

                  <!-- 新增：操作按钮区域 -->
                  <div
                    style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-shrink: 0;">
                    <!-- 左侧按钮 -->
                    <div>
                      <template v-if="canShowNodeActionButtons">
                      <el-dropdown trigger="click">
                        <el-button type="primary" plain size="medium">确认结果<i
                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="handleFileAdd">
                            <i class="el-icon-aim"></i> 确认勾选项
                          </el-dropdown-item>
                          <el-dropdown-item @click.native="handleFileEcelFn">
                            <i class="el-icon-more"></i> 确认过滤项
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                      <el-dropdown trigger="click" style="margin-left: 10px;">
                        <el-button type="danger" plain size="medium">取消操作<i
                            class="el-icon-arrow-down el-icon--right"></i></el-button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="handleFileAddFnClose">
                            <i class="el-icon-refresh-left"></i> 取消勾选项
                          </el-dropdown-item>
                          <el-dropdown-item @click.native="handleFileEcelFnClose">
                            <i class="el-icon-magic-stick"></i> 取消过滤项
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                      <el-button type="primary" plain size="medium" @click="handleFileBatchFix"
                        style="margin-left: 10px;">批量修改</el-button>
                      </template>
                    </div>
                    <!-- 右侧按钮 -->
                    <div>
                      <el-button type="text" size="medium" @click="toggleFileSearch"
                        style="margin-right: 10px; color: #7c8592;">
                        <svg-icon icon-class="过滤" />
                        {{ showFileSearch ? '收起筛选' : '展开筛选' }}
                      </el-button>
                      <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click">
                        <el-checkbox :indeterminate="isIndeterminateFileCol" v-model="checkAllFileCol"
                          @change="handleFileCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="checkedUnstructuredColumns" @change="handleFileCheckedCitiesChange"
                          class="checkboxGroup"
                          style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
                          <el-checkbox style="margin-bottom: 10px;" v-for="item in unstructuredColumnList"
                            :label="item.prop" :key="item.prop">{{ item.label }}</el-checkbox>
                        </el-checkbox-group>
                        <el-button type="text" size="medium" slot="reference" icon="el-icon-s-tools"
                          style="color: #7c8592;">列设置</el-button>
                      </el-popover>
                    </div>
                  </div>

                  <!-- 新增：表格区域 -->
                  <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                    <el-table ref="fileTableRef" :data="fileList" class="tableBox" style="width: 100%" height="100%"
                      @selection-change="handleFileSelectionChange">
                      <el-table-column type="selection" width="55" align="center"></el-table-column>
                      <el-table-column v-for="item in checkedFileColumn" :key="item.prop" :label="item.label"
                        :prop="item.prop" :width="item.width" align="left">
                        <template slot-scope="scope">
                          <!-- 确认状态样式定制 -->
                          <template v-if="item.prop === 'confirm'">
                            <span>
                              <el-tag :type="scope.row.confirm === '0' || scope.row.confirm === 0 ? 'info' : 'primary'"
                                size="mini">{{ scope.row.confirm === 0 ? '未确认' : '已确认' }}</el-tag>
                            </span>
                          </template>
                          <template v-else-if="item.prop === 'fileContext'">
                            <el-tag type="info">{{ scope.row[item.prop] || '--' }}</el-tag>
                          </template>
                          <template v-else-if="item.prop === 'categoryName'">
                            <el-tag type="primary">{{ scope.row[item.prop] || '--' }}</el-tag>
                          </template>
                          <template v-else-if="item.prop === 'securityLevelName'">
                            <el-tag v-if="scope.row.securityLevelName" size="small" plain
                              :style="getRiskStyle(scope.row.securityLevel)">{{
                                scope.row.securityLevelName
                              }}</el-tag>
                            <span v-else>--</span>
                          </template>
                          <template v-else-if="item.prop === 'fileName'">
                            <span style="color: #409EFF; cursor: pointer;" @click="openFixResultsDrawer(scope.row)">
                              <i class="el-icon-document" style="margin-right: 5px;"></i>{{ scope.row.fileName ||
                                scope.row.name }}
                            </span>
                          </template>
                          <template v-else-if="item.prop === 'confidenceLevel'">
                            <el-tag :type="getAiReviewTagType(scope.row)" effect="plain" class="table-ai-review-tag">
                              <svg-icon v-if="isAiReviewSvgIcon(scope.row)" :icon-class="getAiReviewIcon(scope.row)"></svg-icon>
                              <i v-else :class="getAiReviewIcon(scope.row)"></i>
                              <span>{{ getAiReviewLabel(scope.row) }}</span>
                            </el-tag>
                          </template>
                          <template v-else>
                            {{ scope.row[item.prop] || '--' }}
                          </template>
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <pagination v-show="fileTotal > 0" :total="fileTotal" :page.sync="fileQueryParams.pageNum"
                      :pageSize.sync="fileQueryParams.pageSize" @pagination="handleFileQuery" />
                  </div>
                </div>

                <!-- 文件夹和文件都为空时显示的占位 -->
                <div v-if="folderList.length === 0 && fileList.length === 0" class="no-data"
                  style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #909399;">
                  <i class="el-icon-folder-opened" style="font-size: 64px; margin-bottom: 10px; color: #c0c4cc;"></i>
                  <span>此文件夹为空</span>
                </div>
              </div>
            </el-card>
          </div>
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
                @input="handleDrawerSearch" size="mini" clearable @clear="handleDrawerSearch"></el-input>
            </el-form-item>
            <el-form-item :label="$t('assetCatalog.fieldType')" prop="fieldType">
              <el-input v-model="drawerQueryParams.fieldType" :placeholder="$t('assetCatalog.pleaseInputFieldType')"
                @input="handleDrawerSearch" @clear="handleDrawerSearch" size="mini"></el-input>
            </el-form-item>
            <el-form-item :label="$t('assetCatalog.fieldComment')" prop="oldFieldRemark">
              <el-input v-model="drawerQueryParams.oldFieldRemark"
                :placeholder="$t('assetCatalog.pleaseInputFieldComment')" @input="handleDrawerSearch"
                @clear="handleDrawerSearch" size="mini"></el-input>
            </el-form-item>
            <!-- <el-form-item label="脏数据" prop="dirtyData">
          <el-select v-model="drawerQueryParams.dirtyData" placeholder="全部" @change="handleDrawerSearch"
            style="width: 120px;">
            <el-option label="是" value="是"></el-option>
            <el-option label="否" value="否"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="样本特征" prop="featureData">
          <el-select v-model="drawerQueryParams.featureData" placeholder="全部" @change="handleDrawerSearch"
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
            <el-table-column :label="$t('assetCatalog.fieldName')" align="left" prop="fieldName" width="200" />
            <el-table-column :label="$t('assetCatalog.fieldType')" align="left" prop="fieldType" width="200" />
            <el-table-column :label="$t('assetCatalog.fieldComment')" align="left" width="200" prop="oldFieldRemark">
              <template slot-scope="scope">
                <span>{{ scope.row.oldFieldRemark }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('assetCatalog.aiFieldComment')" align="left" prop="aiFieldRemark"
              min-width="200">
              <template slot-scope="scope">
                <span v-if="!scope.row.drawerEdit" @click="drawerEditFn(scope.row, 'aiFieldRemark')">{{
                  scope.row.aiFieldRemark }}</span>
                <el-input v-else id="editInput" v-model="editMsg" @blur="drawerEditBlurFn(scope.row, 'aiFieldRemark')"
                  size="small" />
              </template>
            </el-table-column>
            <!-- <el-table-column label="样本是否为空" align="left" prop="dataIsNull" width="100" show-overflow-tooltip />
        <el-table-column label="样本重复率" align="left" prop="dataIsRepeat" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.dataIsRepeat ? scope.row.dataIsRepeat + '%' : '' }}</span>
          </template>
        </el-table-column> -->
            <!-- <el-table-column label="样本长度过短" align="left" prop="sampleLengthShort" width="100" show-overflow-tooltip />
        <el-table-column label="是否为脏数据（可编辑）" align="left" prop="dirtyData" width="200" show-overflow-tooltip>
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
            <el-table-column :label="$t('assetCatalog.sample')" align="left" width="80"
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
            <!-- <el-table-column label="是否包含特征" align="left" prop="featureData" width="100" show-overflow-tooltip />
        <el-table-column label="数据特征" align="left" min-width="150" prop="dataFeature" show-overflow-tooltip /> -->
            <!-- <el-table-column label="是否添加为匹配策略" align="left" min-width="150" prop="isMatchStrategy"
          show-overflow-tooltip /> -->
          </el-table>

          <!-- 新增分页组件 -->
          <Pagination v-show="drawerTotal > 0" :total="drawerTotal" :page.sync="drawerQueryParams.pageNum"
            :pageSize.sync="drawerQueryParams.pageSize" @pagination="handleDrawerPagination"
            style="margin-top: 15px;" />
        </el-card>
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

    <el-dialog title="批量修改" class="addMsg" :visible.sync="deleteVisible" width="700px" append-to-body
      :close-on-click-modal="false">
      <el-form v-if="deleteVisible" :model="resultForm" ref="resultForm" size="small" label-width="auto"
        label-position="top">
        <el-form-item label="分类" class="addSelectClass">
          <el-select ref="resultSelectRef" v-model="resultFormNodeName" filterable
            :filter-method="handleResultFormSearch">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryOptions" :props="{ label: 'categoryName', children: 'children' }" filterable
                :expand-on-click-node="true" :filter-node-method="filterNode" ref="treeSelectSec" node-key="id"
                highlight-current @node-click="resultHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="安全分级" class="addSelectClass" prop="securityLevel">
          <el-select v-model="resultForm.securityLevel" disabled placeholder="请选择">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <template v-if="currentNodeType != '1'">
          <el-form-item label="个保合规" class="addSelectClass" prop="piiDetection">
            <el-select ref="piiSelectRef" v-model="piiNodeName">
              <el-option style="height: 100%; padding: 0" value="">
                <el-tree :data="personalProtectionOptions" :props="{ label: 'categoryName', children: 'children' }"
                  :expand-on-click-node="true" :filter-node-method="filterNode" ref="treeSelect" node-key="id"
                  highlight-current @node-click="piiHandleNodeClick" />
              </el-option>
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span>
          <el-button type="primary" plain @click="updataResultFn">确定</el-button>
          <el-button @click="updataResultCanelFn">取消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- ======== 新增 fixResults 抽屉 开始 ======== -->
    <Drawer title=" " :visible.sync="fixResultsDrawerVisible" direction="rtl" size="60%"
      :destroy-on-close="true" custom-class="fix-results-drawer" :wrapperClosable="true">
      <div slot="body" class="fix-results-container" v-loading="fixResultsLoading" v-if="fixResultsRow">
        <!-- 顶部标题和按钮区域 -->
        <el-card class="top-section" shadow="never"
          style="margin-bottom: 20px; border-radius: 10px; border: 1px solid #ebeef5;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 style="margin: 0;"><el-tag type="info" style="font-size: 18px;">ID：{{ fixResultsRow.id }}</el-tag> {{
              fixResultsTitleText }}</h2>
            <div v-if="canShowNodeActionButtons" class="top-buttons" style="display: flex; gap: 10px;">
              <el-button type="primary" plain @click="fixResultsHandleModifyResult">{{
                $t('fixResults.sections.modifyResult')
              }}</el-button>
              <el-button type="primary" plain @click="fixResultsHandleManualConfirm">{{
                $t('fixResults.top.manualConfirm')
              }}</el-button>
            </div>
          </div>

        </el-card>

        <!-- 下方左右分栏区域 -->
        <div class="content-section" style="display: flex; justify-content: space-between;">
          <div class="left-section" style="width: 65%;">
            <el-card class="box-card" shadow="never" style="border-radius: 10px; border: 1px solid #e2e8f0;">
              <!-- 非结构化 -->
              <template v-if="fixResultsIsFileSource">
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.fileType') }}：</label>
                  <div class="info-content">{{ fixResultsRow.fileFormat || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.fileSize') }}：</label>
                  <div class="info-content">{{ fixResultsRow.fileSizeName || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.fileSummary') }}：</label>
                  <div class="info-content">{{ fixResultsRow.fileContext || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.filePath') }}：</label>
                  <div class="info-content">{{ fixResultsRow.filePath || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.sampleFeature') }}：</label>
                </div>
                <div style="margin-top: 10px;">
                  <el-table :data="fixResultsRow.unSampleList" max-height="650" border
                    style="width: 100%; border-radius: 8px;">
                    <template slot="empty">
                      <el-empty :description="$t('noData')"></el-empty>
                    </template>
                    <el-table-column prop="key" :label="$t('fixResults.texts.keyword')"
                      show-overflow-tooltip></el-table-column>
                    <el-table-column prop="value" :label="$t('fixResults.texts.keyValue')"
                      show-overflow-tooltip></el-table-column>
                  </el-table>
                </div>
              </template>
              <!-- 结构化 -->
              <template v-else>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.fieldRemark') }}：</label>
                  <div class="info-content">{{ fixResultsRow.fieldRemark || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.aiFieldRemark') }}：</label>
                  <div class="info-content">{{ fixResultsRow.craftRemark || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.fieldTopic') }}：</label>
                  <div class="info-content">
                    <el-tag v-for="tag in (fixResultsRow.fieldTopic ? JSON.parse(fixResultsRow.fieldTopic) : [])"
                      :key="tag" style="margin-right: 5px; border-radius: 8px;">{{ tag ||
                        '--' }}</el-tag>
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.dataPath') }}：</label>
                  <div class="info-content">
                    {{ fixResultsRow.businessName + ' / ' + fixResultsRow.databaseName + ' / ' + fixResultsRow.tableName
                    }}
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.tableRemark') }}：</label>
                  <div class="info-content">
                    {{ fixResultsRow.tableRemark || '--' }}
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.aiTableRemark') }}：</label>
                  <div class="info-content">{{ fixResultsRow.tableCraftRemark || '--' }}</div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.tableTopic') }}：</label>
                  <div class="info-content">
                    <el-tag type="success"
                      v-for="tag in (fixResultsRow.tableTopic ? JSON.parse(fixResultsRow.tableTopic) : [])" :key="tag"
                      style="margin-right: 5px; border-radius: 8px;">{{ tag ||
                        '--' }}</el-tag>
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.sampleFeature') }}：</label>
                  <div class="info-content">
                    <el-tag type="info" style="margin-right: 5px; border-radius: 8px;">{{
                      fixResultsRow.regularExpression
                      ||
                      '--' }}</el-tag>
                  </div>
                </div>
                <div class="info-item">
                  <label class="info-label">{{ $t('fixResults.top.samplePreview') }}：</label>
                </div>
                <div style="margin-top: 10px;">
                  <el-table :data="fixResultsRow.sampleList" max-height="650" border
                    style="width: 100%; border-radius: 8px;">
                    <template slot="empty">
                      <el-empty :description="$t('noData')"></el-empty>
                    </template>
                    <el-table-column type="index" :label="$t('fixResults.texts.index')" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="value" :label="$t('fixResults.texts.sampleValue')"
                      show-overflow-tooltip></el-table-column>
                  </el-table>
                </div>
              </template>
            </el-card>

          </div>

          <div class="right-section" style="width: 32%;">
            <el-card class="box-card ai-review-card" :class="`ai-review-card--${fixResultsAiReviewStatus}`"
              shadow="never">
              <div class="ai-review-card__header">
                <div class="ai-review-card__title">
                  <svg-icon icon-class="home-aiAuto" style="font-size: 24px;"></svg-icon>
                  <span>AI智能审查结果</span>
                </div>
                <el-tag :type="fixResultsAiReviewTagType" effect="plain" class="ai-review-card__status-tag">
                  <svg-icon v-if="fixResultsAiReviewUseSvgIcon" :icon-class="fixResultsAiReviewIcon"></svg-icon>
                  <i v-else :class="fixResultsAiReviewIcon"></i>
                  <span>{{ fixResultsAiReviewLabel }}</span>
                </el-tag>
              </div>
              <div class="ai-review-card__body">
                <div class="ai-review-card__section">
                  <div class="ai-review-card__label">分类</div>
                  <div class="ai-review-card__value-box">{{ fixResultsRow.categoryName || '--' }}</div>
                </div>
                <div class="ai-review-card__section">
                  <div class="ai-review-card__label-row">
                    <span class="ai-review-card__label">综合置信度</span>
                    <span class="ai-review-card__score">{{ fixResultsConfidenceText }}</span>
                  </div>
                  <el-progress :percentage="fixResultsConfidencePercentage" :stroke-width="8" :show-text="false"
                    :color="fixResultsProgressColor"></el-progress>
                </div>
                <div class="ai-review-card__section">
                  <div class="ai-review-card__reason-box">
                    <span class="ai-review-card__reason-title">分类研判：</span>
                    <span class="ai-review-card__reason-text">{{ fixResultsClassificationReasonText }}</span>
                  </div>
                </div>
                <div class="ai-review-card__section">
                  <div class="ai-review-card__label">安全分级</div>
                  <div class="ai-review-card__tag-wrap">
                    <el-tag v-if="fixResultsRow.securityLevelName" plain
                      :style="getRiskStyle(Number(fixResultsRow.securityLevel))">{{ fixResultsRow.securityLevelName
                      }}</el-tag>
                    <el-tag v-else plain :style="getRiskStyle()">{{ '--' }}</el-tag>
                  </div>
                </div>
                <div class="ai-review-card__section">
                  <div class="ai-review-card__reason-box">
                    <span class="ai-review-card__reason-title">敏感分级研判：</span>
                    <span class="ai-review-card__reason-text">{{ fixResultsSecurityReasonText }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <el-dialog class="addMsg" :title="$t('fixResults.dialog.title')" :visible.sync="fixResultsDialogVisible"
          width="700px" append-to-body>
          <el-form :model="fixResultsResultForm" ref="fixResultsResultForm" size="small" label-width="auto"
            label-position="top">
            <el-form-item :label="$t('fixResults.dialog.category')" class="addSelectClass">
              <el-select ref="fixResultsResultSelectRef" v-model="fixResultsResultFormNodeName" filterable
                :filter-method="fixResultsHandleSearch" clearable @focus="fixResultsClearResultFilter">
                <el-option style="height: 100%; padding: 0" value="">
                  <el-tree :data="categoryOptions" :props="{ label: 'categoryName', children: 'children' }" filterable
                    :expand-on-click-node="true" :filter-node-method="filterNode" ref="fixResultsTreeSelectSec"
                    node-key="id" highlight-current @node-click="fixResultsResultHandleNodeClick" />
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('fixResults.dialog.securityLevel')" class="addSelectClass" prop="securityLevel">
              <el-select v-model="fixResultsResultForm.securityLevel" disabled :placeholder="$t('pleaseSelect')">
                <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('fixResults.dialog.piiReview')" class="addSelectClass" prop="piiDetection"
              v-if="!fixResultsIsFileSource">
              <el-select ref="fixResultsPiiSelectRef" v-model="fixResultsPiiNodeName" clearable>
                <el-option style="height: 100%; padding: 0" value="">
                  <el-tree :data="personalProtectionOptions" :props="{ label: 'categoryName', children: 'children' }"
                    :expand-on-click-node="true" :filter-node-method="filterNode" ref="fixResultsTreeSelect"
                    node-key="id" highlight-current @node-click="fixResultsPiiHandleNodeClick" />
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span>
              <el-button type="primary" plain @click="fixResultsUpdataResultFn">{{ $t('confirm') }}</el-button>
              <el-button @click="fixResultsUpdataResultCanelFn">{{ $t('cancel') }}</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </Drawer>
    <!-- ======== 新增 fixResults 抽屉 结束 ======== -->

  </div>
</template>
<script>
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  getAllProxys, getTableListByProxysId, getAllFieldListByTableIdAndDatabaseId,
  getSelectTableNames, callAIPaddingComments, updateDataQualityAssessment, updateFieldListByFieldId,
  callAIPaddingCommentsByAll, updateDataQualityAssessmentByAll, propertyCatalogueExport,
  getTables, getPropertyList, getCategorySchemaLevelList, treeListI, getProtectTableFieldById
} from "@/api/system/protectCategory";
import { getDicts } from "@/api/system/dict/data";
// 引入getProjectFileList接口
import { getProjectFileList, updateResultByFile, confirmListByFile, cancelConfirmByFile, selectLastOrNextByFileId } from "@/api/system/unstructured";
import { confirmIds, confirmList, cancelConfirm, cancelConfirmData, updateFiledRule, getCategoryAttachData } from "@/api/system/proxys";
import Treeselect from "@riophae/vue-treeselect";
export default {
  dicts: ['sys_export_column', 'sys_classification_state', 'sys_classification_reasons', 'sys_classification_reasons_un', 'sys_confidence_level_status'],
  name: "assetCatalog",
  components: { Treeselect },
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
      currentProjectId: '', // 当前上下文对应的 projectId
      routeTaskRow: null, // 从 hierarchicalTask 跳转携带的行数据
      folderList: [], // 文件夹列表
      fileList: [], // 文件列表
      fileTotal: 0, // 总条目数（后端 titleNum）
      rootFolderTitle: '', // 根文件夹标题（从接口获取）

      fileListTimer: null, // 防抖定时器
      folderClickTimer: null, // 文件夹点击节流定时器
      treeNodeClickLock: false, // 左侧树节点切换锁，防止快速点击并发请求




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
      confirmList: [
        {
          value: '1',
          label: this.$t('viewResults.options.confirm.confirmed')
        },
        {
          value: '0',
          label: this.$t('viewResults.options.confirm.unconfirmed')
        },
      ],
      confidenceLevelList: [
        { name: '需人工介入', id: 1, value: "1" }, //需人工介入
        { name: '审查通过', id: 2, value: "2" }, //审查通过
      ],
      categoryList: [],
      isChildrenNode: true,
      debounceTimeout: null,//防抖动
      treeLoading: false,
      treeID: '', //tree 父节点id
      // 第一层数据源详情及数据库列表
      dataSourceDetail: {
        systemName: '', // OA系统
        systemRemark: '', // 一体化协同办公 OA 系统...
        databaseCount: 0,
        databaseList: []
      },
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
        featureData: '',
        fieldType: '',
        oldFieldRemark: '',
        category: '',
        categoryName: '',
        piiDetection: '',
        piiDetectionName: '',
        classificationStateIds: [],
        securityLevel: [],
        confirm: '',
        classificationReasons: '',
        confidenceLevel: '',
        pageNum: 1,
        pageSize: 10
      },
      filteredDrawerData: [],
      drawerTotal: 0,
      defaultProps: {
        children: "children",
        label: "label"
      },
      personalProtectionOptions: [],
      deleteVisible: false,
      resultFormNodeName: '',
      piiNodeName: '',
      resultForm: {
        categoryId: '',
        securityLevel: '',
        id: '',
        piiDetection: '',
        selectedIds: null,
      },
      categoryOptions: [],
      tableKey: 0,
      editMsg: '',

      // 新增：树复选框相关状态
      isTreeAllChecked: false, // 全选框的勾选状态（双向绑定）
      selectedTreeNodeIds: [], // 存储所有勾选的节点ID（用于导出和状态判断）
      defaultCheckedKeys: [], // 树初始化时默认勾选的节点ID（可空）

      // ======== 新增 fixResults 抽屉 相关数据 开始 ========
      fixResultsDrawerVisible: false,
      fixResultsLoading: false,
      fixResultsRow: null,
      fixResultsIsFileSource: false,
      fixResultsIsAllReasoningExpanded: false,
      fixResultsDialogVisible: false,
      fixResultsResultForm: {
        categoryId: '',
        securityLevel: '',
        id: '',
        piiDetection: '',
        confidenceLevel: '',
        auditRecommendation: '',
        detectionProcess: '',
        classificationLogic: '',
        reasoningProcess: ''
      },
      fixResultsResultFormNodeName: '',
      fixResultsPiiNodeName: '',
      // ======== 新增 fixResults 抽屉 相关数据 结束 ========

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
      // 新增：文件搜索与列配置相关
      fileQueryParams: {
        fileName: '',
        category: '',
        categoryName: '',
        classificationStateIds: [],
        securityLevel: [],
        confirm: '',
        fileParentPath: '',
        classificationReasons: '',
        confidenceLevel: '',
        pageNum: 1,
        pageSize: 10
      },
      showFileSearch: false,
      isIndeterminateFileCol: false,
      checkAllFileCol: false,
      unstructuredColumnList: [
        { label: '文件名', prop: 'fileName', width: '200' },
        { label: '文件大小', prop: 'fileSizeName', width: '100' },
        { label: '文件类型', prop: 'fileType', width: '100' },
        { label: '内容摘要', prop: 'fileContext' },
        { label: '分类', prop: 'categoryName', width: '300' },
        { label: '安全分级', prop: 'securityLevelName', width: '150' },
        { label: '自动审查', prop: 'confidenceLevel', width: '150' },
        { label: '确认状态', prop: 'confirm', width: '150' },
        { label: '归类原因', prop: 'classificationReasons', width: '150' },
        { label: '置信度分数', prop: 'confidenceScore', width: '120' },
        { label: '敏感数据', prop: 'sensitiveDataName', width: '150' },
        { label: '最后修改时间', prop: 'fileModifiedTime', width: '180' },
        { label: '文件上传时间', prop: 'fileUploadTime', width: '180' }
      ],
      checkedUnstructuredColumns: ['fileName', 'fileSizeName', 'fileType', 'fileContext', 'categoryName', 'securityLevelName', 'confidenceLevel'],
      selectedFileNodes: [],

      levelOptions: [], // 安全分级下拉选项数据

      // 新增：结构化表字段相关状态
      showFieldSearch: false,
      isIndeterminateFieldCol: false,
      checkAllFieldCol: false,
      fieldColumnList: [
        { label: '字段名', prop: 'fieldName', width: '180' },
        { label: '数据类型', prop: 'fieldType', width: '120' },
        { label: '字段注释', prop: 'fieldRemark', width: '120' },
        { label: 'AI字段注释', prop: 'craftRemark' },
        { label: '分类', prop: 'categoryName', width: '300' },
        { label: '安全分级', prop: 'securityLevelName', width: '150' },
        { label: '样本', prop: 'sampleData', width: '150' },
        { label: '自动审查', prop: 'confidenceLevel', width: '150' },
        { label: '确认状态', prop: 'confirm', width: '120' },
        { label: '所属库', prop: 'databaseName' },
        { label: '所属表', prop: 'tableName' },
        { label: '表注释', prop: 'tableRemark' },
        { label: 'AI表注释', prop: 'tableCraftRemark' },
        { label: '分类状态', prop: 'classificationStateName' },
        { label: '归类原因', prop: 'classificationReasons' },
        { label: '个保合规', prop: 'piiDetectionName' },
        { label: '识别过程', prop: 'detectionProcess' },
        { label: '置信度分数', prop: 'confidenceScore' },
        { label: '敏感数据', prop: 'sensitiveDataName' },
        { label: '样本特征', prop: 'regularExpression' }
      ],
      checkedFieldColumns: ['fieldName', 'fieldType', 'fieldRemark', 'craftRemark', 'categoryName', 'securityLevelName', 'sampleData', 'confidenceLevel'],
      selectedFieldNodes: [],
    };
  },
  computed: {
    // ======== 新增 fixResults 抽屉 computed 开始 ========
    fixResultsTitleText() {
      if (!this.fixResultsRow) return '';
      return this.fixResultsRow.id + ' ' + (this.fixResultsIsFileSource ? this.fixResultsRow.fileName : this.fixResultsRow.fieldName);
    },
    fixResultsConfidencePercentage() {
      const score = Number(this.fixResultsRow && this.fixResultsRow.confidenceScore);
      if (Number.isNaN(score) || score <= 0) {
        return 0;
      }
      return score <= 1 ? Math.round(score * 100) : Math.round(score);
    },
    fixResultsConfidenceText() {
      const score = Number(this.fixResultsRow && this.fixResultsRow.confidenceScore);
      if (Number.isNaN(score) || score <= 0) {
        return '--';
      }
      return `${this.fixResultsConfidencePercentage}%`;
    },
    fixResultsAiReviewStatus() {
      return this.getAiReviewTagType(this.fixResultsRow);
    },
    fixResultsAiReviewTagType() {
      return this.getAiReviewTagType(this.fixResultsRow);
    },
    fixResultsAiReviewLabel() {
      return this.getAiReviewLabel(this.fixResultsRow);
    },
    fixResultsAiReviewIcon() {
      return this.getAiReviewIcon(this.fixResultsRow);
    },
    fixResultsAiReviewUseSvgIcon() {
      return this.isAiReviewSvgIcon(this.fixResultsRow);
    },
    fixResultsProgressColor() {
      return this.getAiReviewProgressColor(this.fixResultsRow);
    },
    fixResultsClassificationReasonText() {
      const row = this.fixResultsRow || {};
      return row.reasoningProcess || '--';
    },
    fixResultsSecurityReasonText() {
      const row = this.fixResultsRow || {};
      return row.dynamicGrading || '--';
    },
    // ======== 新增 fixResults 抽屉 computed 结束 ========
    checkedFieldColumnDef() {
      return this.fieldColumnList.filter(item => this.checkedFieldColumns.includes(item.prop));
    },
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
    },
    currentTableRemark() {
      const currentTableId = this.currentNodeData?.row?.tableId || this.currentNodeData?.id;
      const currentTableName = this.currentNodeData?.row?.tableName || this.currentNodeData?.label;
      const matchedTable = (this.dataAll || []).find(item => {
        const itemTableId = item.tableId || item.id;
        if (currentTableId !== undefined && currentTableId !== null && itemTableId !== undefined && itemTableId !== null) {
          return String(itemTableId) === String(currentTableId);
        }
        return item.tableName === currentTableName;
      });

      if (matchedTable?.aiTableRemark) {
        return matchedTable.aiTableRemark;
      }
      if (this.currentNodeData?.row?.aiTableRemark) {
        return this.currentNodeData.row.aiTableRemark;
      }
      if (this.currentNodeData?.aiTableRemark) {
        return this.currentNodeData.aiTableRemark;
      }
      return '暂无表注释信息';
    },
    checkedFileColumn() {
      return this.unstructuredColumnList.filter(item => this.checkedUnstructuredColumns.includes(item.prop));
    },
    canShowNodeActionButtons() {
      const projectId = this.pickProjectId(
        this.resolveProjectId(this.currentNodeData),
        this.currentProjectId
      )
      return String(projectId) !== '0'
    },
    currentNodeLevel() {
      if (this.currentNodeType == '1') return 0;
      if (!this.currentNodeData) return 1;

      // 优先使用后端返回的 level 字段
      if (this.currentNodeData.level !== undefined && this.currentNodeData.level !== null) {
        return Number(this.currentNodeData.level);
      }

      // 如果后端没有返回，或者异常情况下，作为兜底依然尝试通过树节点获取层级
      const node = this.$refs.tree ? this.$refs.tree.getNode(this.currentNodeData.id) : null;
      if (node) return node.level;

      if (this.currentNodeData.parentId) {
        const parentNode = this.$refs.tree ? this.$refs.tree.getNode(this.currentNodeData.parentId) : null;
        if (parentNode) return parentNode.level + 1;
      }
      return 1;
    }
  },
  watch: {
    '$route.fullPath'() {
      this.routeTaskRow = this.getRouteTaskRow();
      if (this.categoryList.length > 0) {
        this.applyInitialTreeSelection();
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val);

      // 如果清空了搜索框，强制折叠所有节点，并仅展开当前选中的节点
      if (!val) {
        this.$nextTick(() => {
          // 1. 折叠所有节点
          const rootNodes = this.$refs.tree.store.root.childNodes;
          if (rootNodes) {
            rootNodes.forEach(child => {
              child.expanded = false;
              if (child.childNodes && child.childNodes.length > 0) {
                child.childNodes.forEach(subChild => {
                  subChild.expanded = false;
                  if (subChild.childNodes && subChild.childNodes.length > 0) {
                    subChild.childNodes.forEach(leaf => {
                      leaf.expanded = false;
                    });
                  }
                });
              }
            });
          }

          // 2. 展开当前选中的节点
          if (this.currentNodeData) {
            const currentKey = this.currentNodeData.id;
            let node = this.$refs.tree.getNode(currentKey);
            // 逐级向上展开父节点
            while (node) {
              node.expanded = true;
              node = node.parent;
            }
          }
        });
      }
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
    this.routeTaskRow = this.getRouteTaskRow();
    this.getProtectCategory()
  },
  mounted() {
  },
  methods: {
    getAiReviewConfidenceLevel(row) {
      const confidenceLevel = row && row.confidenceLevel;
      return confidenceLevel
    },
    getAiReviewStatusConfig(row) {
      const confidenceLevel = this.getAiReviewConfidenceLevel(row);
      const configMap = {
        '0': {
          type: 'info',
          icon: 'el-icon-info',
          label: this.selectDictLabel(this.dict.type.sys_confidence_level_status, '0') || '待审查',
          useSvgIcon: false,
          progressColor: '#909399',
        },
        '1': {
          type: 'warning',
          icon: 'el-icon-warning-outline',
          label: this.selectDictLabel(this.dict.type.sys_confidence_level_status, '1') || '需要人工介入',
          useSvgIcon: false,
          progressColor: '#f97316',
        },
        '2': {
          type: 'primary',
          icon: 'deepseek',
          label: this.selectDictLabel(this.dict.type.sys_confidence_level_status, '2') || '审查通过',
          useSvgIcon: true,
          progressColor: '#3b82f6',
        },
        '3': {
          type: 'primary',
          icon: 'pass',
          label: this.selectDictLabel(this.dict.type.sys_confidence_level_status, '3') || '人工审查通过',
          useSvgIcon: true,
          progressColor: '#3b82f6',
        }
      };
      return configMap[confidenceLevel] || configMap['0'];
    },
    getAiReviewTagType(row) {
      return this.getAiReviewStatusConfig(row).type;
    },
    getAiReviewIcon(row) {
      return this.getAiReviewStatusConfig(row).icon;
    },
    isAiReviewSvgIcon(row) {
      return this.getAiReviewStatusConfig(row).useSvgIcon;
    },
    getAiReviewLabel(row) {
      return this.getAiReviewStatusConfig(row).label;
    },
    getAiReviewProgressColor(row) {
      return this.getAiReviewStatusConfig(row).progressColor;
    },
    getRouteTaskRow() {
      const routeTaskRow = this.$route?.query?.taskRow || this.$route?.query?.row || this.$route?.query?.drawerData;
      if (!routeTaskRow) return null;
      if (typeof routeTaskRow === 'string') {
        try {
          return JSON.parse(routeTaskRow);
        } catch (error) {
          return null;
        }
      }
      return routeTaskRow;
    },
    findMatchedSourceNode(taskRow) {
      if (!taskRow || !Array.isArray(this.categoryList) || this.categoryList.length === 0) {
        return null;
      }

      const taskSourceId = taskRow.id || taskRow.sourceId || taskRow.datasourceId || taskRow.databaseId;
      const taskSourceName = (taskRow.sourceName || taskRow.label || '').trim();

      return this.categoryList.find(node => {
        const nodeId = node.id || node.sourceId || node.datasourceId || node.databaseId;
        const nodeLabel = (node.label || node.sourceName || '').trim();

        if (taskSourceId !== undefined && taskSourceId !== null && taskSourceId !== '') {
          return String(nodeId) === String(taskSourceId);
        }
        return taskSourceName && nodeLabel === taskSourceName;
      }) || null;
    },
    applyInitialTreeSelection() {
      const matchedNode = this.findMatchedSourceNode(this.routeTaskRow);
      const targetNode = matchedNode || this.categoryList[0];
      if (!targetNode) return;

      this.treeID = targetNode.id;
      this.currentProjectId = this.resolveProjectId(targetNode);
      this.$nextTick(() => {
        if (this.$refs.tree) {
          this.$refs.tree.setCurrentKey(targetNode.id);
        }
        this.isTreeAllChecked = true;
        this.handleTreeNodeClick(targetNode);
      });
    },
    // ======== 新增 fixResults 抽屉 methods 开始 ========
    openFixResultsDrawer(row) {
      const projectId = this.resolveProjectId(row);
      if (projectId !== undefined && projectId !== null && projectId !== '') {
        this.currentProjectId = projectId;
      }
      this.fixResultsDrawerVisible = true;
      this.fixResultsIsFileSource = this.currentNodeType == '1';
      this.fixResultsRow = { ...row };

      // 归一化当前行的 sampleData，兼容后端字符串和页面内已转成数组的两种形态
      this.fixResultsRow.sampleList = this.normalizeFixResultsSampleList(
        this.fixResultsRow.sampleData,
        this.fixResultsIsFileSource
      );

      // 展开 inferenceProcessList 属性
      if (this.fixResultsRow.inferenceProcessList) {
        this.fixResultsRow.inferenceProcessList = this.fixResultsRow.inferenceProcessList.map(item => ({
          ...item,
          expanded: this.fixResultsIsAllReasoningExpanded
        }));
      }

      if (this.fixResultsRow.reasoningProcess !== undefined) {
        this.fixResultsResultForm.reasoningProcess = this.fixResultsRow.reasoningProcess;
      }

      if (this.levelOptions.length === 0) {
        this.fixResultsFetchLevelOptions(this.fixResultsRow.categoryId);
      }
      if (this.personalProtectionOptions.length === 0) {
        this.fixResultsGetPiiList();
      } else {
        this.piiList = this.personalProtectionOptions; // 借用原页面的
      }
    },
    fixResultsToggleAllReasoning() {
      this.fixResultsIsAllReasoningExpanded = !this.fixResultsIsAllReasoningExpanded;
      if (this.fixResultsRow && this.fixResultsRow.inferenceProcessList) {
        this.fixResultsRow.inferenceProcessList.forEach(item => {
          item.expanded = this.fixResultsIsAllReasoningExpanded;
        });
      }
    },
    normalizeFixResultsSampleList(sampleData, isFileSource) {
      if (!sampleData) {
        return [];
      }

      let parsedData = sampleData;
      if (typeof sampleData === 'string') {
        try {
          parsedData = JSON.parse(sampleData);
        } catch (e) {
          return [];
        }
      }

      if (!Array.isArray(parsedData)) {
        return [];
      }

      return parsedData.map(item => {
        if (isFileSource) {
          if (item && typeof item === 'object' && !Array.isArray(item)) {
            const entries = Object.entries(item);
            if (entries.length > 0) {
              return { key: entries[0][0], value: entries[0][1] };
            }
          }
          return { value: item };
        }

        if (item && typeof item === 'object' && !Array.isArray(item)) {
          if (Object.prototype.hasOwnProperty.call(item, 'value')) {
            return { value: item.value };
          }
          const entries = Object.entries(item);
          if (entries.length > 0) {
            return { value: entries[0][1] };
          }
        }

        return { value: item };
      });
    },
    fixResultsFetchLevelOptions(categoryId) {
      const params = {};
      if (categoryId) params.projectId = categoryId;
      getCategorySchemaLevelList(params).then(res => {
        const payload = res && res.data ? res.data : res;
        const list = payload.records || payload.rows || payload.list || payload || [];
        this.levelOptions = list.map(it => ({
          value: String(it.level),
          label: it.levelName
        }));
      });
    },
    fixResultsGetPiiList() {
      let data = {
        parentId: 1,
        needSub: 1,
        ifAddUnclassified: 2
      };
      treeListI(data).then((resp) => {
        this.piiList = resp.data;
        if (resp.data.length > 0) {
          let tempList = JSON.parse(JSON.stringify(this.piiList));
          for (let item of tempList) {
            item.label = item.categoryName;
          }
          this.piiList = this.handleTree(tempList, "id");
        }
      });
    },
    fixResultsUpdataResultFn() {
      this.fixResultsLoading = true;
      let params = {
        reasoningProcess: this.fixResultsResultForm.reasoningProcess,
        tableFieldIds: [this.fixResultsRow.id],
        categoryId: this.fixResultsResultForm.categoryId,
        securityLevel: this.fixResultsResultForm.securityLevel,
        auditRecommendation: this.fixResultsResultForm.auditRecommendation,
        confidenceLevel: this.fixResultsResultForm.confidenceLevel,
        piiDetection: this.fixResultsResultForm.piiDetection,
        detectionProcess: this.fixResultsResultForm.detectionProcess,
      };
      if (this.fixResultsIsFileSource) {
        let fileParams = {
          fileIds: [this.fixResultsRow.id],
          categoryId: this.fixResultsResultForm.categoryId,
          securityLevel: this.fixResultsResultForm.securityLevel
        };
        updateResultByFile(fileParams).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg);
            this.handleFileQuery().then(() => {
              this.syncFixResultsRowFromLatestList();
              this.fixResultsHandleNext('2');
            });
          }
          this.fixResultsDialogVisible = false;
          this.fixResultsResultFormNodeName = '';
          this.fixResultsPiiNodeName = '';
          this.fixResultsLoading = false;
        }).catch(() => {
          this.fixResultsDialogVisible = false;
          this.fixResultsLoading = false;
        });
      } else {
        updateFiledRule(params).then(res => {
          if (res.code == 200) {
            this.$message.success(res.msg);
            this.getTableFieldsData().then(() => {
              this.syncFixResultsRowFromLatestList();
              this.fixResultsHandleNext('2');
            });
          }
          this.fixResultsDialogVisible = false;
          this.fixResultsResultFormNodeName = '';
          this.fixResultsPiiNodeName = '';
          this.fixResultsLoading = false;
        }).catch(() => {
          this.fixResultsDialogVisible = false;
          this.fixResultsLoading = false;
        });
      }
    },
    fixResultsUpdataResultCanelFn() {
      this.fixResultsDialogVisible = false;
      this.fixResultsResultFormNodeName = '';
      this.fixResultsPiiNodeName = '';
    },
    fixResultsResultHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryOptions, node.id);
        if (parentLabels) {
          this.fixResultsResultFormNodeName = parentLabels.join('-') + '-' + (node.categoryName || node.label || '');
        } else {
          this.fixResultsResultFormNodeName = node.categoryName || node.label || '';
        }
        this.fixResultsResultForm.categoryId = node.id;
        this.$refs.fixResultsResultSelectRef.blur();
        getCategoryAttachData({ categoryId: node.id, piiId: this.fixResultsResultForm.piiDetection }).then(res => {
          this.fixResultsResultForm.securityLevel = res.data.minSecurityLevel + '';
        });
      }
    },
    fixResultsPiiHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.personalProtectionOptions, node.id);
        if (parentLabels) {
          this.fixResultsPiiNodeName = parentLabels.join('-') + '-' + (node.categoryName || node.label || '');
        } else {
          this.fixResultsPiiNodeName = node.categoryName || node.label || '';
        }
        this.fixResultsResultForm.piiDetection = node.id;
        this.$refs.fixResultsPiiSelectRef.blur();
        getCategoryAttachData({ piiId: node.id, categoryId: this.fixResultsResultForm.categoryId }).then(res => {
          this.fixResultsResultForm.securityLevel = res.data.minSecurityLevel + '';
        });
      }
    },
    fixResultsHandleSearch(val) {
      this.$refs.fixResultsTreeSelectSec.filter(val);
    },
    fixResultsClearResultFilter() {
      this.$refs.fixResultsTreeSelectSec.filter('');
    },
    syncFixResultsRowFromLatestList() {
      if (!this.fixResultsRow || !this.fixResultsRow.id) {
        return;
      }
      const currentList = this.fixResultsIsFileSource ? this.fileList : this.filteredDrawerData;
      if (!Array.isArray(currentList) || currentList.length === 0) {
        return;
      }
      const latestRow = currentList.find(item => String(item.id) === String(this.fixResultsRow.id));
      if (!latestRow) {
        return;
      }
      const normalizedRow = {
        ...latestRow,
        sampleList: this.normalizeFixResultsSampleList(latestRow.sampleData, this.fixResultsIsFileSource)
      };
      if (latestRow.inferenceProcessList) {
        normalizedRow.inferenceProcessList = latestRow.inferenceProcessList.map(item => ({
          ...item,
          expanded: this.fixResultsIsAllReasoningExpanded
        }));
      }
      this.fixResultsRow = normalizedRow;
    },
    fixResultsHandleManualConfirm() {
      confirmIds([this.fixResultsRow?.id]).then(res => {
        if (res.code === 200) {
          this.$message.success(this.$t('fixResults.messages.manualConfirmSuccess'));
          if (this.fixResultsRow) {
            this.fixResultsRow.confirm = 1;
          }
          if (this.fixResultsIsFileSource) {
            this.handleFileQuery().then(() => {
              this.syncFixResultsRowFromLatestList();
            });
          } else {
            this.handleDrawerSearch().then(() => {
              this.syncFixResultsRowFromLatestList();
            });
          }
        } else {
          this.$message.error(res.msg || this.$t('fixResults.messages.manualConfirmFailed'));
        }
      });
    },
    fixResultsHandleModifyResult() {
      this.fixResultsResultForm = {
        categoryId: this.fixResultsRow.categoryId || '',
        securityLevel: this.fixResultsRow.securityLevel || '',
        id: this.fixResultsRow.id || '',
        piiDetection: this.fixResultsRow.piiDetection || '',
        confidenceLevel: this.fixResultsRow.confidenceLevel || '',
        auditRecommendation: this.fixResultsRow.auditRecommendation || '',
        detectionProcess: this.fixResultsRow.detectionProcess || '',
        reasoningProcess: this.fixResultsRow.reasoningProcess || '',
        classificationLogic: ''
      };
      if (this.fixResultsRow.categoryName) {
        this.fixResultsResultFormNodeName = this.fixResultsRow.categoryName;
      }
      if (this.fixResultsRow.piiDetection) {
        this.fixResultsPiiNodeName = this.fixResultsRow.piiDetectionName;
      }
      this.fixResultsDialogVisible = true;
    },
    // ======== 新增 fixResults 抽屉 methods 结束 ========
    // 获取安全分级 

    // 敏感等级与安全分级tag样式
    getRiskStyle(level) {
      const styles = {
        1: { color: '#16a34a', backgroundColor: '#f0fdf4', border: 'none' },
        2: { color: '#f97316', backgroundColor: '#fff7ed', border: 'none' },
        3: { color: '#c2410c', backgroundColor: '#ffedd5', border: 'none' },
        4: { color: '#dc2626', backgroundColor: '#fee2e2', border: 'none' },
        5: { color: '#991b1b', backgroundColor: '#fecaca', border: 'none' }
      };
      return styles[level] || { color: '#6b7280', backgroundColor: '#f3f4f6', border: 'none' };
    },
    // 动态获取左侧树数据
    getProtectCategory() {
      this.Loading = true;
      getAllProxys().then((resp) => {
        this.Loading = false;
        if (resp.code == 200) {
          if (resp.data && resp.data.length > 0) {
            this.categoryList = this.processTreeData(resp.data);
            this.applyInitialTreeSelection();
          } else {
            this.categoryList = [];
          }
        }
      }).catch(() => {
        this.Loading = false;
      });
    },
    // 处理树节点数据，初始化状态
    processTreeData(data) {
      return data.map(item => {
        // 如果是结构化数据源节点（后端只返回到库层级），确保有 children 数组
        if (item.type === '0' || item.type === 0) {
          item.children = item.children || []
        }
        return item
      })
    },

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
            keepCurrentFolderName: false,
            immediate: true
          });
        }
      } else {
        // 点击路径中的某一层
        this.breadcrumbList = this.breadcrumbList.slice(0, index + 1);
        this.currentFolderId = item.id;
        this.currentFolderName = item.name;
        this.loadFolderData(item.id, true);
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
          keepCurrentFolderName: this.currentFolderId !== null && this.currentFolderId !== undefined && this.currentFolderId !== '',
          immediate: true
        });
      }
    },

    getSortIcon(field) {
      if (this.currentSortField !== field) {
        return 'el-icon-sort';
      }
      return this.sortOrders[field] === 'asc' ? 'el-icon-top' : 'el-icon-bottom';
    },



    // 新增：文件相关方法 (添加防抖)
    handleFileQuery() {
      clearTimeout(this.fileInputTimer);
      return new Promise((resolve) => {
        this.fileInputTimer = setTimeout(() => {
          if (this.currentNodeData) {
            // 在此处将多选参数和其他参数结构与 viewResults 页面对齐并传入请求
            const queryParams = {
              ...this.fileQueryParams,
              categoryIds: this.fileQueryParams.category, // 将 category 映射为 categoryIds
              securityLevelIds: Array.isArray(this.fileQueryParams.securityLevel) ? [...this.fileQueryParams.securityLevel] : [],
              securityLevel: Array.isArray(this.fileQueryParams.securityLevel) ? this.fileQueryParams.securityLevel.join(',') : '',
              // classificationStateIds 和 classificationReasons 由于在模板中 v-model 直接绑定的数组/字符串，直接透传即可
            };
            delete queryParams.category;
            this.loadFileListData(this.currentNodeData, {
              folderId: this.currentFolderId,
              keepCurrentFolderName: true,
              immediate: true,
              queryParams: queryParams
            }).then(resolve).catch(resolve);
          } else {
            resolve();
          }
        }, 500);
      });
    },
    refreshCurrentVisibleList() {
      if (this.currentNodeType === '1') {
        return this.handleFileQuery();
      }
      return this.getTableFieldsData();
    },
    toggleFileSearch() {
      this.showFileSearch = !this.showFileSearch;
    },
    handleFileCheckAllChange(val) {
      this.checkedUnstructuredColumns = val ? this.unstructuredColumnList.map(item => item.prop) : [];
      this.isIndeterminateFileCol = false;
    },
    handleFileCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAllFileCol = checkedCount === this.unstructuredColumnList.length;
      this.isIndeterminateFileCol = checkedCount > 0 && checkedCount < this.unstructuredColumnList.length;
    },
    handleFileSelectionChange(val) {
      this.selectedFileNodes = val;
    },

    /**
     * 获取数据库表分页数据 (第二层)
     */
    getDatabaseTablesData() {
      this.loading = true;
      const data = this.currentNodeData;
      const params = {
        queryType: '2',
        databaseId: data.parentId, // 数据源ID
        databaseName: data.label,  // 数据库名称
        pageNum: this.queryParams.pageNum,
        pageSize: this.queryParams.pageSize
      };

      getPropertyList(params).then(res => {
        if (res.code === 200) {
          this.dataAll = res.data.list || res.data.records || [];
          this.total = res.data.total || 0;
        }
      }).finally(() => {
        this.loading = false;
      });
    },

    /**
     * 获取表字段分页数据 (第三层)
     */
    getTableFieldsData() {
      this.loading = true;
      const data = this.currentNodeData;
      // 寻找最顶层的数据源ID
      let sourceId = '';
      const parentNode = this.$refs.tree.getNode(data.parentId);
      if (parentNode && parentNode.data.parentId) {
        sourceId = parentNode.data.parentId;
      }

      // 如果由于节点不存在导致sourceId为空，尝试从row中获取更准确的顶层数据源ID，否则兜底使用 data.parentId
      if (!sourceId) {
        sourceId = (data.row && (data.row.proxysId || data.row.databaseId)) || data.parentId;
      }

      // 合并基础参数和表单查询参数
      // 因为现在category和piiDetection已经是字符串了，所以不需要再处理了
      const processedParams = { ...this.drawerQueryParams };
      processedParams.categoryIds = processedParams.category;
      delete processedParams.categoryName;
      delete processedParams.piiDetectionName;
      delete processedParams.category;

      const params = {
        ...processedParams,
        securityLevelIds: Array.isArray(processedParams.securityLevel) ? [...processedParams.securityLevel] : [],
        securityLevel: Array.isArray(processedParams.securityLevel) ? processedParams.securityLevel.join(',') : '', // 防止后端获取不到数据，转为字符串传参
        queryType: '3',
        databaseId: sourceId,      // 数据源ID
        tableId: data.row.tableId || data.id, // 表ID
        tableName: data.label,     // 表名
      };

      return getPropertyList(params).then(res => {
        if (res.code === 200) {
          const resData = res.data || {};
          const listData = resData.list || resData.records || resData.rows || [];
          this.filteredDrawerData = listData.map(ele => {
            if (ele.sampleData) {
              try {
                // 如果后端返回的是字符串，则解析；否则当做数组处理
                const parsedData = typeof ele.sampleData === 'string' ? JSON.parse(ele.sampleData) : ele.sampleData;
                ele.sampleData = parsedData.map(item => ({ value: item }))
              } catch (e) {
                ele.sampleData = []
              }
            } else {
              ele.sampleData = []
            }
            ele.drawerEdit = false
            ele.drawerEditDirtyData = false
            ele.aiFieldRemarkEdit = ''
            ele.dirtyDataEditMsg = ''
            ele.dirtyData = ele.dirtyData || this.$t('assetCatalog.no')
            ele.featureData = ele.featureData || this.$t('assetCatalog.notInclude')
            return ele
          });
          this.drawerTotal = resData.total || 0;
        }
      }).finally(() => {
        this.loading = false;
      });
    },

    // 新增：结构化视图相关方法
    handleDatabaseCardClick(db) {
      // 通过树组件模拟点击左侧树节点，以保持参数传递完全一致
      const node = this.$refs.tree.getNode(db.id);
      if (node) {
        node.data.projectId = this.pickProjectId(
          node.data.projectId,
          node.data.projectID,
          db.projectId,
          db.projectID,
          this.resolveProjectId(this.currentNodeData)
        );
        this.$refs.tree.setCurrentKey(db.id);
        this.handleTreeNodeClick(node.data);
      } else {
        // 如果树上没找到，则手动构造数据
        const data = {
          id: db.id,
          label: db.databaseName || db.label,
          parentId: this.currentNodeData.id,
          type: '0',
          level: 2,
          projectId: this.pickProjectId(
            db.projectId,
            db.projectID,
            this.resolveProjectId(this.currentNodeData)
          )
        };
        this.handleTreeNodeClick(data);
      }
    },
    handleTableClick(row) {
      let tableNode = null;
      if (this.currentNodeData && this.currentNodeData.children) {
        tableNode = this.currentNodeData.children.find(child => child.label === row.tableName);
      }
      if (tableNode) {
        tableNode.projectId = this.pickProjectId(
          tableNode.projectId,
          tableNode.projectID,
          row.projectId,
          row.projectID,
          this.resolveProjectId(this.currentNodeData)
        );
        this.$refs.tree.setCurrentKey(tableNode.id);
        this.handleTreeNodeClick(tableNode);
      } else {
        const dummyNode = {
          id: row.tableId || row.id,
          label: row.tableName,
          parentId: this.currentNodeData ? this.currentNodeData.id : null,
          type: '0',
          row: row,
          projectId: this.pickProjectId(
            row.projectId,
            row.projectID,
            this.resolveProjectId(this.currentNodeData)
          )
        };
        this.handleTreeNodeClick(dummyNode);
      }
    },
    handleFieldCheckAllChange(val) {
      this.checkedFieldColumns = val ? this.fieldColumnList.map(item => item.prop) : [];
      this.isIndeterminateFieldCol = false;
    },
    handleFieldCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAllFieldCol = checkedCount === this.fieldColumnList.length;
      this.isIndeterminateFieldCol = checkedCount > 0 && checkedCount < this.fieldColumnList.length;
    },

    handleFolderClick(folder) {
      if (this.folderClickTimer) return;
      this.folderClickTimer = setTimeout(() => {
        this.folderClickTimer = null;
      }, 500);

      // 添加到面包屑
      this.breadcrumbList.push({
        id: folder.id,
        name: folder.name
      });
      this.currentFolderId = folder.id;
      this.currentFolderName = folder.name;
      this.currentProjectId = this.pickProjectId(
        folder.projectId,
        folder.projectID,
        this.currentProjectId
      );

      this.loadFolderData(folder.id, true);
    },

    loadFolderData(folderId, immediate = false) {
      if (!this.currentNodeData) return;
      this.currentFolderId = (folderId === null || folderId === undefined || folderId === '') ? null : folderId;
      this.loadFileListData(this.currentNodeData, {
        folderId: this.currentFolderId,
        keepCurrentFolderName: this.currentFolderId !== null && this.currentFolderId !== undefined && this.currentFolderId !== '',
        immediate: immediate
      });
    },

    loadFileListData(data, options = {}) {
      const { folderId = null, keepCurrentFolderName = false, immediate = false, queryParams = null } = options;

      const fetchList = () => {
        const sortField = this.currentSortField;
        const order = this.sortOrders[sortField];
        const isAsc = order === 'asc';

        const processedParams = queryParams ? { ...queryParams } : { ...this.fileQueryParams };
        // 如果外部传了明确的 categoryIds 就保留，否则尝试从 category 取
        processedParams.categoryIds = processedParams.categoryIds || processedParams.category;

        if (Array.isArray(processedParams.securityLevel)) {
          processedParams.securityLevelIds = [...processedParams.securityLevel];
          processedParams.securityLevel = processedParams.securityLevel.join(',');
        } else {
          processedParams.securityLevelIds = processedParams.securityLevelIds || (processedParams.securityLevel ? processedParams.securityLevel.split(',') : []);
        }

        delete processedParams.categoryName;
        delete processedParams.category;

        const response = {
          sortField: sortField,
          isAsc: isAsc,
          // 调整databaseList参数结构,使其符合getProjectFileList接口要求
          databaseList: [{
            parentId: data.id,
            label: data.label,
            projectId: this.resolveProjectId(data)
          }],
          ...processedParams
        };
        if (folderId !== null && folderId !== undefined && folderId !== '') {
          response.folderId = folderId;
        }
        return getProjectFileList(response).then(res => {
          if (res.code === 200) {
            const data = res.data || {};
            const rawFileList = data.fileList;
            const normalizedFileList = Array.isArray(rawFileList)
              ? rawFileList
              : (rawFileList && Array.isArray(rawFileList.records) ? rawFileList.records : []);
            const normalizedFolderList = Array.isArray(data.folder) ? data.folder : [];
            const parsedTitleNum = Number(data.titleNum);

            this.fileList = normalizedFileList.map(item => ({
              ...item,
              projectId: this.pickProjectId(
                item.projectId,
                item.projectID,
                this.resolveProjectId(data)
              )
            }));
            this.folderList = normalizedFolderList.map(item => ({
              ...item,
              projectId: this.pickProjectId(
                item.projectId,
                item.projectID,
                this.resolveProjectId(data)
              )
            }));
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
          throw err;
        });
      };

      if (immediate) {
        if (this.fileListTimer) {
          clearTimeout(this.fileListTimer);
        }
        return fetchList();
      } else {
        return new Promise((resolve, reject) => {
          if (this.fileListTimer) {
            clearTimeout(this.fileListTimer);
          }
          this.fileListTimer = setTimeout(() => {
            fetchList().then(resolve).catch(reject);
          }, 500);
        });
      }
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
    },
    // 新增：获取安全分级下拉选项
    fetchLevelOptions(databaseId) {
      if (!databaseId) return Promise.resolve();
      return getCategorySchemaLevelList({ databaseId }).then(res => {
        const payload = res && res.data ? res.data : res;
        const list = payload.records || payload.rows || payload.list || payload || [];
        this.levelOptions = list.map(it => ({
          value: String(it.level),
          label: it.levelName
        }));
      });
    },

    // 新增：获取个保合规下拉选项
    fetchPersonalProtectionOptions() {
      let data = {
        parentId: 1,
        needSub: 1,
        ifAddUnclassified: 2
      };
      return treeListI(data).then(res => {
        const treeData = this.handleTree(res.data, "id") || res.data || [];
        this.personalProtectionOptions = treeData;
      });
    },

    // 新增：获取分类下拉选项
    fetchCategoryOptions(projectId) {
      const resolvedProjectId = this.pickProjectId(
        projectId,
        this.currentProjectId,
        this.resolveProjectId(this.currentNodeData)
      );
      let data = {
        parentId: resolvedProjectId,
        needSub: 1,
        ifAddUnclassified: 1
      };
      return treeListI(data).then(res => {
        this.categoryOptions = this.handleTree(res.data, "id") || res.data
      });
    },

    resolveProjectId(source) {
      const row = source || this.currentNodeData || {};
      return this.pickProjectId(
        row.projectId,
        row.projectID,
        row.row && row.row.projectId,
        row.row && row.row.projectID
      )
    },

    pickProjectId(...values) {
      for (const value of values) {
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return '';
    },


    /**
     * 点击树节点事件:点击节点展示右侧列表
     * @param {Object} data - 点击的节点数据
     */
    async handleTreeNodeClick(data) {
      if (this.treeNodeClickLock) {
        return
      }
      this.treeNodeClickLock = true
      this.Loading = true
      this.currentNodeType = data.type || '0';
      this.currentNodeData = data; // 保存当前节点数据
      this.currentProjectId = this.resolveProjectId(data);

      try {
        if (this.currentNodeType == '1') {
          await Promise.all([
            this.fetchLevelOptions(data.id),
            this.fetchCategoryOptions(this.currentProjectId)
          ]);

          this.breadcrumbList = [];
          this.currentFolderId = null;
          await this.loadFileListData(data, {
            folderId: null,
            keepCurrentFolderName: false,
            immediate: true
          });
        } else {
          const level = this.currentNodeLevel;
          if (level === 1) {
            const rootNodes = this.$refs.tree.store.root.childNodes;
            if (rootNodes) {
              rootNodes.forEach(child => {
                if (child.data.id !== data.id) {
                  child.expanded = false;
                  if (child.childNodes && child.childNodes.length > 0) {
                    child.childNodes.forEach(subChild => {
                      subChild.expanded = false;
                    });
                  }
                }
              });
            }
            this.$refs.tree.store.nodesMap[data.id].expanded = true;

            this.loading = true;
            const params = {
              queryType: '1',
              databaseId: data.id
            };
            const [, , propertyRes] = await Promise.all([
              this.fetchLevelOptions(data.id),
              this.fetchPersonalProtectionOptions(),
              getPropertyList(params),
              this.fetchCategoryOptions(this.currentProjectId)
            ]);
            if (propertyRes.code === 200) {
              const resData = propertyRes.data || {};
              this.dataSourceDetail = {
                systemName: resData.systemName || '',
                systemRemark: resData.systemRemark || '',
                databaseCount: resData.databaseCount || (resData.databaseList ? resData.databaseList.length : 0),
                databaseList: resData.databaseList || []
              };
            }
            this.loading = false;
          } else if (level === 2) {
            this.loading = true;
            const treeParams = {
              parentId: data.parentId,
              databaseName: data.label
            };
            const tableParams = {
              queryType: '2',
              databaseId: data.parentId,
              databaseName: data.label,
              pageNum: this.queryParams.pageNum,
              pageSize: this.queryParams.pageSize
            };
            const [tablesRes, detailRes] = await Promise.all([
              getTables(treeParams),
              getPropertyList(tableParams)
            ]);
            if (tablesRes.code === 200) {
              const tables = tablesRes.data || [];
              if (!data.children || data.children.length === 0) {
                const tableNodes = tables.map(table => ({
                  id: table.tableId || table.id || Math.random().toString(36).substr(2, 9),
                  label: table.tableName,
                  parentId: data.id,
                  type: '0',
                  level: 3,
                  row: table,
                  projectId: this.pickProjectId(
                    table.projectId,
                    table.projectID,
                    this.resolveProjectId(data)
                  )
                }));
                this.$set(data, 'children', tableNodes);
                this.$nextTick(() => {
                  const dbNode = this.$refs.tree.getNode(data.id);
                  if (dbNode && dbNode.checked) {
                    const currentCheckedKeys = this.$refs.tree.getCheckedKeys();
                    const newTableIds = tableNodes.map(node => node.id);
                    this.$refs.tree.setCheckedKeys([...new Set([...currentCheckedKeys, ...newTableIds])]);
                  }
                });
              }
              const parentNode = this.$refs.tree.getNode(data.parentId);
              if (parentNode && parentNode.childNodes) {
                parentNode.childNodes.forEach(child => {
                  if (child.data.id !== data.id) {
                    child.expanded = false;
                  }
                });
              }
              if (this.$refs.tree.store.nodesMap[data.id]) {
                this.$refs.tree.store.nodesMap[data.id].expanded = true;
              }
            }
            if (detailRes.code === 200) {
              this.dataAll = detailRes.data.list || [];
              this.total = detailRes.data.total || 0;
            }
            this.loading = false;
          } else if (level === 3) {
            const row = data.row || { tableId: data.id, databaseId: data.parentId, tableName: data.label };
            await this.fieldInformationFn(row);
          }
        }
      } finally {
        this.loading = false
        this.Loading = false
        this.treeNodeClickLock = false
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

      // 判断节点层级
      let level = 1;
      if (data.level !== undefined && data.level !== null) {
        level = data.level;
      } else if (node.level !== undefined && node.level !== null) {
        level = node.level;
      }

      // 根据层级和类型设置不同的图标
      if (data.type == 1) {
        iconClass = 'file-o';
      } else {
        if (level == 1) {
          iconClass = 'home-dataAsset';
        } else if (level == 2) {
          iconClass = 'databaseSolid';
        } else if (level == 3) {
          iconClass = 'table1';
        }
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

      // 暂时隐藏导出列配置弹窗，直接弹出确认导出的弹窗
      this.$confirm('是否确认导出选中的数据？', this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(async () => {
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
          this.exportColumnDialog.selectedColumns = [...this.initialDefaultColumns];
        }

        this.performExport();
      }).catch(() => { });
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

        let listAll = this.$refs.tree.getCheckedNodes(false, true);
        let listChecked = this.$refs.tree.getCheckedNodes();

        let exportsTreeData = [];

        this.categoryList.forEach(parent => {
          console.log(parent);
          if (listAll.some(item => item.id === parent.id)) {
            let dbNames = [];

            if (parent.children && parent.children.length > 0) {
              let checkedChildren = parent.children.filter(child => {
                return listChecked.some(checkedNode => checkedNode.id === child.id);
              });
              dbNames = checkedChildren.map(child => child.label || '').filter(name => name);
            } else if (parent.list && parent.list.length > 0) {
              let checkedChildren = parent.list.filter(child => {
                return listChecked.some(checkedNode => checkedNode.id === child.id);
              });
              dbNames = checkedChildren.map(child => child.label || '').filter(name => name);
            }

            exportsTreeData.push({
              databaseId: parent.id,
              name: parent.label,
              type: parent.type,
              databaseNames: dbNames
            });
          }
        });

        // 构造请求参数
        const allColumns = this.exportColumnDialog.allColumns.map(item => item.value);
        const unselectedColumns = allColumns.filter(value => !this.exportColumnDialog.selectedColumns.includes(value));

        const params = {
          tableName: this.queryParams.tableName,
          paddingStatus: this.queryParams.paddingStatus,
          featureExtractionStatus: this.queryParams.featureExtractionStatus,
          exportsTreeData: exportsTreeData,
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

      // 初始化筛选
      return this.handleDrawerSearch()
    },
    // 抽屉筛选处理 (添加防抖)
    handleDrawerSearch() {
      clearTimeout(this.drawerInputTimer);
      return new Promise((resolve) => {
        this.drawerInputTimer = setTimeout(() => {
          // 重置页码
          this.drawerQueryParams.pageNum = 1
          this.getTableFieldsData().then(resolve).catch(resolve);
        }, 500);
      });
    },
    // 分页处理
    getPagedData(data) {
      const start = (this.drawerQueryParams.pageNum - 1) * this.drawerQueryParams.pageSize
      const end = start + this.drawerQueryParams.pageSize
      return data.slice(start, end)
    },
    // 分页切换
    handleDrawerPagination() {
      this.getTableFieldsData()
    },

    filterCategoryTree(val) {
      if (this.$refs.categoryTree) {
        this.$refs.categoryTree.filter(val);
      }
    },
    filterFileCategoryTree(val) {
      if (this.$refs.fileCategoryTree) {
        this.$refs.fileCategoryTree.filter(val);
      }
    },
    filterPPTree(val) {
      if (this.$refs.ppTree) {
        this.$refs.ppTree.filter(val);
      }
    },
    // 新增：分类树节点勾选事件
    handleCategoryCheck(data, checkData) {
      // 筛选出选中的叶子节点（无children的节点）
      const checkedLeafNodes = checkData.checkedNodes.filter(item => !item.children);

      // 无选中节点或无选中子项（叶子节点），清空展示
      if (checkData.checkedKeys.length === 0 || checkedLeafNodes.length === 0) {
        if (this.currentNodeType == '1') {
          this.fileQueryParams.categoryName = '';
          this.fileQueryParams.category = '';
          this.handleFileQuery();
        } else {
          this.drawerQueryParams.categoryName = '';
          this.drawerQueryParams.category = '';
          this.handleDrawerSearch();
        }
        return;
      }

      // 收集所有选中叶子节点对应的根节点（去重）
      const rootNodeNames = new Set();
      checkedLeafNodes.forEach(leafNode => {
        const rootNode = this.findRootNode(this.categoryOptions, leafNode.id);
        if (rootNode) {
          rootNodeNames.add(rootNode.categoryName); // 根节点名称
        }
      });

      // 展示根节点名称（用逗号分隔）
      const categoryNameStr = Array.from(rootNodeNames).join(',');

      // 收集叶子节点及其所有祖先节点的ID
      const allCategoryIds = new Set();
      checkedLeafNodes.forEach(leafNode => {
        // 添加叶子节点自身
        allCategoryIds.add(leafNode.id);

        // 递归收集所有祖先节点（包括父节点、爷节点等）
        const ancestors = this.findAllAncestors(this.categoryOptions, leafNode.id);
        ancestors.forEach(ancestorId => allCategoryIds.add(ancestorId));
      });

      const categoryIdsStr = Array.from(allCategoryIds).join(',');

      if (this.currentNodeType == '1') {
        this.fileQueryParams.categoryName = categoryNameStr;
        // 注意：底层已经统一处理映射将 category 删除了，此处需把结果存入映射源 key 'category'
        this.fileQueryParams.category = categoryIdsStr;
        this.fileQueryParams.categoryIds = categoryIdsStr; // 冗余一份防止取值出错
        this.handleFileQuery();
      } else {
        this.drawerQueryParams.categoryName = categoryNameStr;
        this.drawerQueryParams.category = categoryIdsStr;
        this.drawerQueryParams.categoryIds = categoryIdsStr;
        this.handleDrawerSearch();
      }
    },
    // 查找节点对应的根节点
    findRootNode(tree, nodeId) {
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children && node.children.length) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const node = findNode(tree, nodeId);
      if (!node) return null;

      let currentNode = node;
      // 在 assetCatalog 中根节点的 parentId 可能是当前 databaseId
      while (currentNode.parentId !== 0 && currentNode.parentId !== null && currentNode.parentId !== undefined) {
        const parentNode = findNode(tree, currentNode.parentId);
        if (!parentNode) break;
        currentNode = parentNode;
      }
      return currentNode;
    },

    // 查找节点的所有祖先节点ID
    findAllAncestors(tree, nodeId) {
      const ancestors = [];
      const findNode = (nodes, id) => {
        for (const node of nodes) {
          if (node.id === id) {
            return node;
          }
          if (node.children && node.children.length) {
            const found = findNode(node.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const currentNode = findNode(tree, nodeId);
      if (!currentNode) return ancestors;

      let parentId = currentNode.parentId;
      while (parentId) {
        const parentNode = findNode(tree, parentId);
        if (parentNode) {
          ancestors.push(parentNode.id);
          parentId = parentNode.parentId;
        } else {
          break;
        }
      }
      return ancestors;
    },
    // 新增：分类清除事件
    handleCategoryClear() {
      if (this.currentNodeType == '1') {
        this.fileQueryParams.category = '';
        this.fileQueryParams.categoryName = '';
        this.handleFileQuery();
      } else {
        this.drawerQueryParams.category = '';
        this.drawerQueryParams.categoryName = '';
        this.handleDrawerSearch();
      }
      if (this.$refs.categoryTree) {
        this.$refs.categoryTree.setCheckedKeys([]);
      }
      if (this.$refs.fileCategoryTree) {
        this.$refs.fileCategoryTree.setCheckedKeys([]);
      }
    },
    handleFileAdd() {
      this.loading = true
      let dataS = this.$refs.fileTableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm('确认提交选中的结果？', this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => item.id)
          let data = ids.join(',')
          confirmIds(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.refreshCurrentVisibleList().finally(() => {
                this.loading = false
              })
            }
          }).catch(() => {
            this.loading = false
          });
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请至少选择一条数据', type: 'warning' })
        this.loading = false
      }
    },
    handleFileAddFnClose() {
      this.loading = true
      let dataS = this.$refs.fileTableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm('确认取消选中的结果？', this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => item.id)
          let data = ids.join(',')
          cancelConfirm(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.refreshCurrentVisibleList().finally(() => {
                this.loading = false
              })
            }
          }).catch(() => {
            this.loading = false
          });
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请至少选择一条数据', type: 'warning' })
        this.loading = false
      }
    },
    getProcessedParamsForFileConfirm() {
      return {
        ...this.fileQueryParams,
        securityLevelIds: Array.isArray(this.fileQueryParams.securityLevel) ? [...this.fileQueryParams.securityLevel] : [],
        securityLevel: Array.isArray(this.fileQueryParams.securityLevel) ? this.fileQueryParams.securityLevel.join(',') : '',
        databaseId: this.currentFolderId ? this.currentFolderId : this.currentNodeData.id,
      }
    },
    handleFileEcelFn() {
      this.loading = true
      let params = this.getProcessedParamsForFileConfirm()
      confirmListByFile(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.refreshCurrentVisibleList().finally(() => {
            this.loading = false
          })
        }
      }).catch(err => {
        this.loading = false
      })
    },
    handleFileEcelFnClose() {
      this.loading = true
      let params = this.getProcessedParamsForFileConfirm()
      cancelConfirmByFile(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.refreshCurrentVisibleList().finally(() => {
            this.loading = false
          })
        }
      }).catch(err => {
        this.loading = false
      })
    },
    handleFileBatchFix() {
      const selection = this.$refs.fileTableRef.selection
      if (!selection || selection.length === 0) {
        this.$message.warning('请至少选择一条数据进行批量修改')
        return
      }
      const selectedIds = selection.map(row => row.id)
      this.resultForm.selectedIds = selectedIds

      if (this.categoryOptions && this.categoryOptions.length > 0) {
        let unclassified = null;
        const findUnclassified = (nodes) => {
          for (let n of nodes) {
            if (n.id == '-100') return n;
            if (n.children) {
              let res = findUnclassified(n.children);
              if (res) return res;
            }
          }
          return null;
        }
        unclassified = findUnclassified(this.categoryOptions);
        if (unclassified) {
          this.resultFormNodeName = unclassified.categoryName;
          this.resultForm.categoryId = unclassified.id;
        }
      }

      if (this.levelOptions && this.levelOptions.length > 0) {
        this.resultForm.securityLevel = this.levelOptions[0].value;
      }

      this.deleteVisible = true
    },
    handlePPNodeClick(data) {
      // do nothing here, let the checkbox handle the selection
    },
    // 新增：个保合规树节点勾选事件
    handlePPCheck(data, checkData) {
      // 筛选出选中的叶子节点（无children的节点）
      const checkedLeafNodes = checkData.checkedNodes.filter(item => !item.children);

      // 无选中节点或无选中子项（叶子节点），清空展示
      if (checkData.checkedKeys.length === 0 || checkedLeafNodes.length === 0) {
        this.drawerQueryParams.piiDetectionName = '';
        this.drawerQueryParams.piiDetection = '';
        this.handleDrawerSearch();
        return;
      }

      // 收集所有选中叶子节点对应的根节点（去重）
      const rootNodeNames = new Set();
      checkedLeafNodes.forEach(leafNode => {
        const rootNode = this.findRootNode(this.personalProtectionOptions, leafNode.id);
        if (rootNode) {
          rootNodeNames.add(rootNode.categoryName); // 根节点名称
        }
      });

      // 展示根节点名称（用逗号分隔）
      this.drawerQueryParams.piiDetectionName = Array.from(rootNodeNames).join(',');

      // 收集叶子节点及其所有祖先节点的ID
      const allCategoryIds = new Set();
      checkedLeafNodes.forEach(leafNode => {
        // 添加叶子节点自身
        allCategoryIds.add(leafNode.id);

        // 递归收集所有祖先节点（包括父节点、爷节点等）
        const ancestors = this.findAllAncestors(this.personalProtectionOptions, leafNode.id);
        ancestors.forEach(ancestorId => allCategoryIds.add(ancestorId));
      });

      this.drawerQueryParams.piiDetection = Array.from(allCategoryIds).join(',');
      this.handleDrawerSearch();
    },
    // 新增：个保合规清除事件
    handlePPClear() {
      this.drawerQueryParams.piiDetection = '';
      this.drawerQueryParams.piiDetectionName = '';
      if (this.$refs.ppTree) {
        this.$refs.ppTree.setCheckedKeys([]);
      }
      this.handleDrawerSearch();
    },

    // 分页事件处理
    handlePagination() {
      // 获取当前选中的节点数据，调用新版接口
      this.getDatabaseTablesData()
    },
    // 重置筛选条件
    resetDrawerSearch() {
      // 先手动重置筛选参数
      this.drawerQueryParams = {
        fieldName: '',
        featureData: '',
        fieldType: '',
        oldFieldRemark: '',
        category: '',
        categoryName: '',
        piiDetection: '',
        piiDetectionName: '',
        classificationStateIds: [],
        securityLevel: [],
        confirm: '',
        classificationReasons: '',
        confidenceLevel: '',
        pageNum: 1,
        pageSize: 10
      }
      if (this.$refs.categoryTree) this.$refs.categoryTree.setCheckedKeys([]);
      if (this.$refs.ppTree) this.$refs.ppTree.setCheckedKeys([]);
      this.getTableFieldsData()
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
    handleAdd() {
      this.loading = true
      let dataS = this.$refs.tableRefMain.selection
      if (dataS && dataS.length > 0) {
        this.$confirm('确认提交选中的结果？', this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id || item.tableId
          })
          let data = ids.join(',')
          confirmIds(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.refreshCurrentVisibleList().finally(() => {
                this.loading = false
              })
            }
          }).catch(() => {
            this.loading = false
          });
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请至少选择一条数据', type: 'warning' })
        this.loading = false
      }
    },
    handleAddFnClose() {
      this.loading = true
      let dataS = this.$refs.tableRefMain.selection
      if (dataS && dataS.length > 0) {
        this.$confirm('确认取消选中的结果？', this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id || item.tableId
          })
          let data = ids.join(',')
          cancelConfirm(data).then(res => {
            if (res.code == 200) {
              this.$message({ message: res.msg, type: 'success' })
              this.refreshCurrentVisibleList().finally(() => {
                this.loading = false
              })
            }
          }).catch(() => {
            this.loading = false
          });
        }).catch(() => {
          this.loading = false
        });
      } else {
        this.$message({ message: '请至少选择一条数据', type: 'warning' })
        this.loading = false
      }
    },
    getProcessedParamsForConfirm() {
      const data = this.currentNodeData;
      let sourceId = '';
      const parentNode = this.$refs.tree.getNode(data.parentId);
      if (parentNode && parentNode.data.parentId) {
        sourceId = parentNode.data.parentId;
      }
      if (!sourceId) {
        sourceId = (data.row && (data.row.proxysId || data.row.databaseId)) || data.parentId;
      }
      const processedParams = { ...this.drawerQueryParams };
      processedParams.categoryIds = processedParams.category;
      delete processedParams.categoryName;
      delete processedParams.piiDetectionName;
      delete processedParams.category;

      return {
        ...processedParams,
        securityLevelIds: Array.isArray(processedParams.securityLevel) ? [...processedParams.securityLevel] : [],
        securityLevel: Array.isArray(processedParams.securityLevel) ? processedParams.securityLevel.join(',') : '',
        queryType: '3',
        databaseId: sourceId,
        tableId: data.row ? data.row.tableId || data.id : data.id,
        tableName: data.label,
      };
    },
    handleEcelFn() {
      this.loading = true
      let params = this.getProcessedParamsForConfirm()
      confirmList(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.refreshCurrentVisibleList().finally(() => {
            this.loading = false
          })
        }
      }).catch(err => {
        this.loading = false
      })
    },
    handleEcelFnClose() {
      this.loading = true
      let params = this.getProcessedParamsForConfirm()
      cancelConfirmData(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.refreshCurrentVisibleList().finally(() => {
            this.loading = false
          })
        }
      }).catch(err => {
        this.loading = false
      })
    },
    handleBatchFix() {
      const selection = this.$refs.tableRefMain.selection
      if (!selection || selection.length === 0) {
        this.$message.warning('请至少选择一条数据进行批量修改')
        return
      }
      const selectedIds = selection.map(row => row.id || row.tableId)
      this.resultForm.selectedIds = selectedIds

      if (this.categoryOptions && this.categoryOptions.length > 0) {
        let unclassified = null;
        const findUnclassified = (nodes) => {
          for (let n of nodes) {
            if (n.id == '-100') return n;
            if (n.children) {
              let res = findUnclassified(n.children);
              if (res) return res;
            }
          }
          return null;
        }
        unclassified = findUnclassified(this.categoryOptions);
        if (unclassified) {
          this.resultFormNodeName = unclassified.categoryName;
          this.resultForm.categoryId = unclassified.id;
        }
      }

      if (this.levelOptions && this.levelOptions.length > 0) {
        this.resultForm.securityLevel = this.levelOptions[0].value;
      }

      this.deleteVisible = true
    },
    handleResultFormSearch(val) {
      if (this.$refs.treeSelectSec) {
        this.$refs.treeSelectSec.filter(val);
      }
    },
    resultHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryOptions, node.id);
        if (parentLabels) {
          this.resultFormNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.resultFormNodeName = node.categoryName;
        }
        this.resultForm.categoryId = node.id
        this.$refs.resultSelectRef.blur()
        getCategoryAttachData({ categoryId: node.id, piiId: this.resultForm.piiDetection }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''
        })
      }
    },
    piiHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.personalProtectionOptions, node.id);
        if (parentLabels) {
          this.piiNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.piiNodeName = node.categoryName;
        }
        this.resultForm.piiDetection = node.id
        this.$refs.piiSelectRef.blur()
        getCategoryAttachData({ piiId: node.id, categoryId: this.resultForm.categoryId }).then(res => {
          this.resultForm.securityLevel = res.data.minSecurityLevel + ''
        })
      }
    },
    findParentLabelsById(tree, nodeId, path = []) {
      if (!Array.isArray(tree)) {
        return null;
      }
      for (const node of tree) {
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child.id === nodeId) {
              return [...path, node.categoryName || node.label];
            }
          }
          const found = this.findParentLabelsById(node.children, nodeId, [...path, node.categoryName || node.label]);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    updataResultFn() {
      this.updataLoading = true
      let params = {
        tableFieldIds: this.resultForm.selectedIds,
        categoryId: this.resultForm.categoryId,
        securityLevel: this.resultForm.securityLevel,
        piiDetection: this.resultForm.piiDetection,
      }

      if (this.currentNodeType === '1') {
        // 非结构化批量修改
        updateResultByFile(params).then(res => {
          if (res.code == 200) {
            this.$message({
              message: res.msg,
              type: 'success'
            })
          }
          this.deleteVisible = false
          this.resultFormNodeName = ''
          this.resetForm('resultForm')
          this.resultForm.selectedIds = null
          this.refreshCurrentVisibleList().finally(() => {
            this.updataLoading = false
          })
        }).catch(err => {
          this.updataLoading = false
        })
      } else {
        // 结构化批量修改
        updateFiledRule(params).then(res => {
          if (res.code == 200) {
            this.$message({
              message: res.msg,
              type: 'success'
            })
          }
          this.deleteVisible = false
          this.resultFormNodeName = ''
          this.resetForm('resultForm')
          this.resultForm.selectedIds = null
          this.refreshCurrentVisibleList().finally(() => {
            this.updataLoading = false
          })
        }).catch(err => {
          this.updataLoading = false
        })
      }
    },
    updataResultCanelFn() {
      this.deleteVisible = false
      this.resultFormNodeName = ''
      this.resetForm('resultForm')
      this.resultForm.selectedIds = null
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
/* ======== 新增 fixResults 抽屉 CSS 开始 ======== */
::v-deep .fix-results-drawer .el-drawer__body {
  padding: 0;
  overflow: hidden;
}

.fix-results-container {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

.fix-results-container .info-item {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 10px 0;
}

.fix-results-container .info-label {
  width: 120px;
  font-weight: 500;
  text-align: left;
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.fix-results-container .info-content {
  flex: 1;
  font-size: 13px;
  color: #606266;
}

.fix-results-container .box-card {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.fix-results-container .box-card ::v-deep .el-card__body {
  padding: 20px;
}

.fix-results-container .box-card ::v-deep .el-card__header {
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fix-results-container .header-name {
  font-weight: bold;
  font-size: 14px;
}

.fix-results-container .header-confidence {
  font-size: 12px;
  color: #909399;
  float: right;
}

.fix-results-container .ai-review-card {
  border-radius: 16px;
  border: 1px solid #d6e4ff;
  overflow: hidden;
}

.fix-results-container .ai-review-card ::v-deep .el-card__body {
  padding: 0;
}

.fix-results-container .ai-review-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #e7eefc;
}

.fix-results-container .ai-review-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f3f8e;
}

.fix-results-container .ai-review-card__status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.fix-results-container .ai-review-card__status-tag i {
  font-size: 14px;
}

.fix-results-container .ai-review-card__status-tag .svg-icon {
  font-size: 14px;
}

.table-ai-review-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.table-ai-review-tag i {
  font-size: 14px;
}

.table-ai-review-tag .svg-icon {
  font-size: 14px;
}

.fix-results-container .ai-review-card__body {
  padding: 20px;
}

.fix-results-container .ai-review-card__section+.ai-review-card__section {
  margin-top: 18px;
}

.fix-results-container .ai-review-card__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.fix-results-container .ai-review-card__label {
  margin-bottom: 8px;
  font-size: 14px;
  color: #7b8ba7;
}

.fix-results-container .ai-review-card__score {
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
}

.fix-results-container .ai-review-card__value-box {
  padding: 12px 14px;
  border-radius: 8px;
  background: #f5f7fb;
  color: #1f2a44;
  font-size: 16px;
  line-height: 1.6;
  word-break: break-word;
}

.fix-results-container .ai-review-card__reason-box {
  padding: 14px 16px;
  border: 1px solid #dbe7fb;
  border-radius: 10px;
  background: #f8fbff;
  color: #334155;
  font-size: 14px;
  line-height: 1.7;
}

.fix-results-container .ai-review-card__reason-title {
  color: #2f5fe3;
  font-weight: 600;
}

.fix-results-container .ai-review-card__reason-text {
  word-break: break-word;
}

.fix-results-container .ai-review-card__tag-wrap {
  display: flex;
  align-items: center;
}

.fix-results-container .ai-review-card ::v-deep .el-progress-bar__outer {
  background-color: #dbeafe;
}

.fix-results-container .ai-review-card ::v-deep .el-progress-bar__inner {
  border-radius: 999px;
}

.fix-results-container .ai-review-card--warning .ai-review-card__score {
  color: #f97316;
}

.fix-results-container .ai-review-card--warning .ai-review-card__reason-box {
  border-color: #fed7aa;
  background: #fff7ed;
}

.fix-results-container .ai-review-card--warning .ai-review-card__reason-title {
  color: #f97316;
}

.fix-results-container .ai-review-card--primary .ai-review-card__score {
  color: #3b82f6;
}

.fix-results-container .ai-review-card--primary .ai-review-card__reason-box {
  border-color: #dbe7fb;
  background: #f8fbff;
}

.fix-results-container .ai-review-card--primary .ai-review-card__reason-title {
  color: #2f5fe3;
}

.fix-results-container .ai-review-card--info .ai-review-card__score {
  color: #909399;
}

.fix-results-container .ai-review-card--info .ai-review-card__reason-box {
  border-color: #dcdfe6;
  background: #f4f4f5;
}

.fix-results-container .ai-review-card--info .ai-review-card__reason-title {
  color: #909399;
}

.fix-results-container .ai-review-card--info ::v-deep .el-progress-bar__outer {
  background-color: #ebeef5;
}

/* ======== 新增 fixResults 抽屉 CSS 结束 ======== */

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
    color: #000000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }
}

/* (5) 文件列表样式 */
.file-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 20px;

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

.addMsg ::v-deep.el-dialog {
  border-radius: 10px;
}

.addMsg ::v-deep.el-dialog__header {
  border-bottom: 1px solid #e6e6e6;
}

.addMsg ::v-deep.el-dialog__title {
  font-weight: bold;
}

.addMsg ::v-deep.el-form-item__content {
  padding-right: 15px;
}

.addMsg ::v-deep.el-select--medium,
.addMsg ::v-deep.el-select--small {
  width: 100%;
}

.addMsg ::v-deep.el-dialog__body {
  padding: 30px;
}

.addMsg ::v-deep .el-dialog:not(.is-fullscreen) {
  margin-top: 10% !important;
}

.addMsg ::v-deep .el-dialog__body {
  padding-bottom: 0;

}

.addMsg ::v-deep .el-dialog__footer {
  padding-bottom: 32px;

}

.addMsg ::v-deep .el-form-item__label {
  text-align: left;
}

.addMsg ::v-deep .el-select--medium {
  width: 100%;
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
  padding: 0 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
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

::v-deep .left-card {
  border-radius: 10px;
  height: 100%;
  max-height: 100%;
  overflow: auto;

  .el-card__body {
    height: 100%;
    max-height: 100%;
    overflow: auto;
    padding: 0;
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

/* 全局表格及其内部标签允许换行展示 */
::v-deep .el-table .cell {
  white-space: pre-wrap !important;
  word-break: break-all !important;
  line-height: normal !important;
}

::v-deep .el-table .el-tag {
  white-space: pre-wrap !important;
  height: auto !important;
  line-height: normal !important;
  padding: 5px !important;
}
</style>
