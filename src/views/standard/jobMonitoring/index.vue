<template>
  <div class="app-container job-monitoring-page" v-loading="Loading">
    <el-row :gutter="20" class="page-layout">
      <!-- 左侧卡片：树形菜单 -->
      <el-col :span="5" :xs="24">
        <el-card class="left-card" shadow="never">
          <div class="head-container">
            <el-select v-model="queryParams.categoryId" class="serachSelect" @change="treeOptionsSelectChange"
              :placeholder="$t('all')" filterable>
              <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <div class="head-container tree-container" v-loading="treeLoading">
            <el-input class="serachInput" v-model="filterName" :placeholder="$t('jobMonitoring.searchTreeNodes')"
              clearable />
            <div class="tree-scroll-container">
              <el-tree class="treeBox" :data="categoryList" :props="defaultProps" :default-expanded-keys="[treeID]"
                :current-node-key="treeID" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree"
                node-key="id" highlight-current @node-click="handleNodeClick" :render-content="renderContent">
              </el-tree>
            </div>
          </div>
        </el-card>
      </el-col>
      <!-- 右侧卡片：搜索表单和数据表格 -->
      <el-col :span="19" :xs="24">
        <el-collapse-transition>
          <div v-show="showSearch" class="search-wrapper">
            <el-card class="searchCard" shadow="never">
              <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true">
                <el-form-item :label="$t('jobMonitoring.subclassName')" prop="name">
                  <el-input v-model="queryParams.name" @input="inputSearch"
                    :placeholder="$t('jobMonitoring.subclassName')" clearable @keyup.enter.native="handleQuery" />
                </el-form-item>
                <el-form-item :label="$t('jobMonitoring.confirmProtectMethod')" prop="confirmProtectMethod">
                  <el-select v-model="queryParams.confirmProtectMethod" @change="selectProjectIdChange" multiple
                    :placeholder="$t('jobMonitoring.confirmProtectMethod')">
                    <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
                      :value="item.dictLabel">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('jobMonitoring.dataSource')" prop="dataSourceId">
                  <el-select v-model="queryParams.dataSourceId" clearable @change="dataSourceIdIdChange"
                    :placeholder="$t('jobMonitoring.dataSource')" :loading="loading">
                    <el-option v-for="item in sourceList" :key="item.value" :label="translateDataSource(item.label)"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('jobMonitoring.securityLevel')" prop="levelId">
                  <el-select v-model="queryParams.levelId" @change="selectProjectIdChange" multiple
                    :placeholder="$t('jobMonitoring.securityLevel')">
                    <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('jobMonitoring.dataOwner')" prop="dataOwner">
                  <el-select v-model="queryParams.dataOwner" @change="selectProjectIdChange" clearable
                    :placeholder="$t('jobMonitoring.dataOwner')">
                    <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :label="$t('jobMonitoring.baseParent')" prop="baseParent">
                  <el-input v-model="queryParams.baseParent" @input="inputSearch"
                    :placeholder="$t('jobMonitoring.baseParent')" clearable @keyup.enter.native="handleQuery" />
                </el-form-item>
              </el-form>
            </el-card>
          </div>
        </el-collapse-transition>

        <el-card class="table-card" shadow="never">
          <div slot="header" class="table-card-header">
            <div class="content-header">
              <div class="content-header-main">
                <div style="display: flex; align-items: center;justify-content: space-between;">
                  <span class="content-title">
                    <svg-icon icon-class="表格" style="font-size: 20px;" />
                    {{ headerTitle }}
                  </span>
                  <el-button type="primary" plain icon="el-icon-back" size="medium" @click="goBackToManagement">{{
                    $t('return')
                  }}</el-button>
                </div>

                <div class="content-count">{{ headerResultText }}</div>
                <div class="content-desc">{{ headerRemark }}</div>
              </div>
            </div>
          </div>

          <div class="table-card-content">
            <div class="table-toolbar">
              <div class="toolbar-group">
                <el-button type="primary" plain icon="el-icon-plus" :disabled="isBuiltInSource(dataSource)"
                  size="medium" @click="addFn">
                  {{ $t('add') }}
                </el-button>
                <el-button type="danger" plain icon="el-icon-close" :disabled="isBuiltInSource(dataSource)"
                  size="medium" @click="enabledFn('delete')">
                  {{ $t('delete') }}
                </el-button>
              </div>
              <div class="toolbar-group toolbar-group-right">
                <el-button type="text" size="medium" @click="toggleFilters" style="color: #7c8592;">
                  <svg-icon icon-class="过滤" />
                  {{ showSearch ? '收起筛选' : '展开筛选' }}
                </el-button>
                <el-popover popper-class="popoverColumn" placement="bottom" width="150" trigger="click">
                  <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">{{
                    $t('selectAll') }}</el-checkbox>
                  <el-checkbox-group v-model="checkedColumnProps" @change="handleCheckedCitiesChange"
                    class="checkboxGroup"
                    style="display: flex;flex-direction: column;flex-wrap: nowrap;height: 180px;margin-top: 10px; overflow-y: auto;">
                    <el-checkbox style="margin-bottom: 10px;" v-for="item in setList" :label="item.prop"
                      :key="item.prop">{{
                        item.label }}</el-checkbox>
                  </el-checkbox-group>
                  <el-button type="text" size="medium" icon="el-icon-s-tools" slot="reference"
                    style="color: #7c8592;">{{ $t('columnSettings') }}</el-button>
                </el-popover>
              </div>
            </div>
            <el-table class="tableBox" style="flex: 1;" height="100%" v-loading="loading"
              :key="checkedColumnProps.join(',')" :data="protectTableFieldList" ref="tableRef">
              <template slot="empty">
                <el-empty :description="$t('noData')"></el-empty>
              </template>
              <el-table-column type="selection" width="60" align="center" />
              <el-table-column v-for="item in checkedColumn" :key="item.prop" :label="item.label"
                :align="item.prop === 'attachData' || item.prop === 'protectMethodName' ? 'left' : 'center'"
                :prop="item.prop" :width="item.width" show-overflow-tooltip>
                <template slot-scope="scope">
                  <template v-if="item.prop === 'attachData'">
                    <span class="subclass-name-cell" :class="{ readonly: !canEditRow(scope.row) }"
                      @click="handleNameClick(scope.row)">
                      <svg-icon icon-class="yezibiaoqian" style="margin-right: 5px; font-size: 14px;" />
                      {{ scope.row.attachData }}
                    </span>
                  </template>
                  <template v-else-if="item.prop === 'minSecurityLevel'">
                    <el-tag :style="getRiskStyle(Number(scope.row.minSecurityLevel))">
                      {{ scope.row.securityLevelName }}
                    </el-tag>
                  </template>
                  <template v-else-if="item.prop === 'protectMethodName'">
                    <el-tag class="tagsBox custom-plain-tag"
                      v-for="(protectItem, index) in scope.row.protectMethodNameList" :key="protectItem + index" plain>
                      {{ protectItem }}
                    </el-tag>
                  </template>
                  <template v-else-if="item.prop === 'confirmProtectMethod'">
                    <el-tag class="tagsBox custom-plain-tag" v-for="confirmItem in scope.row.confirmProtectMethodList"
                      :key="confirmItem" plain>
                      {{ confirmItem }}
                    </el-tag>
                  </template>
                  <template v-else-if="item.prop === 'dataOwner'">
                    <svg-icon iconClass="user" style="margin-right: 5px; font-size: 14px;" />
                    {{ scope.row.dataOwner || '--' }}
                  </template>
                  <template v-else>
                    {{ scope.row[item.prop] || '--' }}
                  </template>
                </template>
              </el-table-column>
            </el-table>
            <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
              :page-size.sync="queryParams.pageSize" @pagination="getList" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 新增编辑框 -->
    <Drawer :title="addOrEdit.title" v-loading="importDataLoading" :visible.sync="addOrEdit.show" append-to-body
      :close-on-click-modal="addOrEdit.flag == 3">
      <el-form slot="body" :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules"
        ref="addOrEdit" label-width="120px" label-position="top">
        <Title :title="$t('jobMonitoring.basicInformation')"></Title>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('jobMonitoring.subclassName')" prop="attachData">
              <el-input v-model="addOrEditDataRuls.attachData" :disabled="addOrEdit.flag == 3"
                @input="sonNameTestingFn(addOrEditDataRuls.attachData)" maxlength="50"
                :placeholder="$t('jobMonitoring.subclassName')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="addSelectClass" prop="dataOwner" :label="$t('jobMonitoring.dataOwner')">
              <el-select v-model="addOrEditDataRuls.dataOwner" :placeholder="$t('jobMonitoring.dataOwner')"
                :disabled="addOrEdit.flag == 3">
                <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item class="addSelectClass" :label="$t('jobMonitoring.baseParent')" prop="categoryId">
          <el-select ref="addSelectRef" v-model="addNodeName" :disabled="addOrEdit.flag == 3 || addOrEdit.flag == 2"
            filterable :filter-method="handleAddSelectInput" @visible-change="handleAddSelectVisibleChange">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" filterable :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="addHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('jobMonitoring.additional')" prop="additional">
          <el-input v-model="addOrEditDataRuls.additional" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            :disabled="addOrEdit.flag == 3" maxlength="500"
            :placeholder="$t('jobMonitoring.additionalPlaceholder')"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="24">
            <el-form-item class="addSelectClass" :label="$t('jobMonitoring.securityLevel')" prop="minSecurityLevel">
              <el-select v-model="addOrEditDataRuls.minSecurityLevel" :placeholder="$t('jobMonitoring.securityLevel')"
                :disabled="addOrEdit.flag == 3" @change="handleSecurityLevelChange">
                <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item prop="attributeType" label="属性类型">
              <el-select v-model="addOrEditDataRuls.attributeType" placeholder="全部" :disabled="addOrEdit.flag == 3">
                <el-option v-for="item in dict.type.sys_attribute_type" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-form-item v-if="true" class="addSelectClass AiStudesCont" :label="$t('jobMonitoring.tags')">
          <div class="tagsClass" :style="tagsShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in tags" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index, 'tags')" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputVisible && countIs40" maxlength="10" v-model="inputValue"
              ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm('tags')"
              @blur="handleInputConfirm('tags')">
            </el-input>
            <el-button v-if="!inputVisible && countIs40 && addOrEdit.flag != 3" class="button-new-tag" size="small"
              @click="showInput('tags')">{{ $t('jobMonitoring.addTag') }}</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="tags.length > 10" @click="tagsShow = !tagsShow">{{
            tagsShow ? $t('expand') : $t('collapse') }}</el-button>
        </el-form-item>

        <Title :title="$t('jobMonitoring.securityProtection')"></Title>
        <el-form-item class="addSelectClass" :label="$t('jobMonitoring.suggestProtectMethod')">
          <el-input v-model="addOrEditDataRuls.protectMethodName" :disabled="true" :placeholder="$t('all')">
          </el-input>
        </el-form-item>
        <el-form-item class="addSelectClass" :label="$t('jobMonitoring.confirmProtectMethod')"
          prop="confirmProtectMethod">
          <el-select v-model="addOrEditDataRuls.confirmProtectMethod" multiple :placeholder="$t('all')"
            :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictLabel">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 新增核心主题词 -->
        <!-- <el-form-item class="addSelectClass AiStudesCont" label="核心主题词" prop="coreTopic">
          <div class="tagsClass" :style="coreTopicShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in coreTopic" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index, 'coreTopic')" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="coreTopicInputVisible && coreTopicCountIs40" maxlength="10"
              v-model="coreTopicInputValue" ref="coreTopicSaveTagInput" size="small"
              @keyup.enter.native="handleInputConfirm('coreTopic')" @blur="handleInputConfirm('coreTopic')">
            </el-input>
            <el-button v-if="!coreTopicInputVisible && coreTopicCountIs40 && addOrEdit.flag != 3" class="button-new-tag"
              size="small" @click="showInput('coreTopic')">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="coreTopic.length > 10"
            @click="coreTopicShow = !coreTopicShow">{{
              coreTopicShow ? '展开' : '收起' }}</el-button>
        </el-form-item> -->

        <!-- 新增入口词 -->
        <!-- <el-form-item class="addSelectClass AiStudesCont" label="入口词" prop="entryTerm">
          <div class="tagsClass" :style="entryTermShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in entryTerm" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index, 'entryTerm')" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="entryTermInputVisible && entryTermCountIs40" maxlength="10"
              v-model="entryTermInputValue" ref="entryTermSaveTagInput" size="small"
              @keyup.enter.native="handleInputConfirm('entryTerm')" @blur="handleInputConfirm('entryTerm')">
            </el-input>
            <el-button v-if="!entryTermInputVisible && entryTermCountIs40 && addOrEdit.flag != 3" class="button-new-tag"
              size="small" @click="showInput('entryTerm')">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="entryTerm.length > 10"
            @click="entryTermShow = !entryTermShow">{{
              entryTermShow ? '展开' : '收起' }}</el-button>
        </el-form-item> -->

        <!-- 新增关联词 -->
        <!-- <el-form-item class="addSelectClass AiStudesCont" label="关联词" prop="relatedTerms">
          <div class="tagsClass" :style="relatedTermsShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in relatedTerms" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index, 'relatedTerms')" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="relatedTermsInputVisible && relatedTermsCountIs40" maxlength="10"
              v-model="relatedTermsInputValue" ref="relatedTermsSaveTagInput" size="small"
              @keyup.enter.native="handleInputConfirm('relatedTerms')" @blur="handleInputConfirm('relatedTerms')">
            </el-input>
            <el-button v-if="!relatedTermsInputVisible && relatedTermsCountIs40 && addOrEdit.flag != 3"
              class="button-new-tag" size="small" @click="showInput('relatedTerms')">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="relatedTerms.length > 10"
            @click="relatedTermsShow = !relatedTermsShow">{{
              relatedTermsShow ? '展开' : '收起' }}</el-button>
        </el-form-item> -->

        <!-- 新增反向参照 -->
        <!-- <el-form-item class="addSelectClass AiStudesCont" label="反向参照" prop="reverseRef">
          <div class="tagsClass" :style="reverseRefShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in reverseRef" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index, 'reverseRef')" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="reverseRefInputVisible && reverseRefCountIs40" maxlength="10"
              v-model="reverseRefInputValue" ref="reverseRefSaveTagInput" size="small"
              @keyup.enter.native="handleInputConfirm('reverseRef')" @blur="handleInputConfirm('reverseRef')">
            </el-input>
            <el-button v-if="!reverseRefInputVisible && reverseRefCountIs40 && addOrEdit.flag != 3"
              class="button-new-tag" size="small" @click="showInput('reverseRef')">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="reverseRef.length > 10"
            @click="reverseRefShow = !reverseRefShow">{{
              reverseRefShow ? '展开' : '收起' }}</el-button>
        </el-form-item> -->

        <Title :title="$t('jobMonitoring.securityClassification')"></Title>
        <el-form-item prop="">
          <el-switch v-model="addOrEditDataRuls.upgradeRule" @change="handleRuleSwitchChange('upgrade')"
            :active-text="$t('jobMonitoring.upgradeRule')" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <el-table ref="upgradeList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.upgradeList" :disabled="!addOrEditDataRuls.upgradeRule"
                @selection-change="handleUpgradeSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" :label="$t('jobMonitoring.ruleType')" width="180">
                  <template slot-scope="scope">
                    {{ getRuleTypeLabel(scope.row.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="matchingCondition" :label="$t('jobMonitoring.matchCondition')" min-width="180">
                  <template slot-scope="scope">
                    {{ getMatchingConditionLabel(scope.row.matchingCondition) }}
                  </template>
                </el-table-column>
                <el-table-column prop="ruleContent" :label="$t('jobMonitoring.ruleContent')" min-width="180" />
                <el-table-column prop="securityLevel" :label="$t('jobMonitoring.securityLevel')" min-width="180" />
              </el-table>
              <div class="import-format-tip"
                style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #eff6ff; border: 1px solid #eee; border-radius: 4px;">
                <i class="el-icon-warning-outline" type="info" />
                {{ $t('jobMonitoring.upgradeRuleTip') }}
              </div>
            </div>
            <div class="vertical-actions">
              <el-button type="primary" plain size="mini"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleOpenRuleDialog('upgrade')">
                <svg-icon icon-class="plus-circle" />
              </el-button>
              <el-button type="danger" plain size="mini"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleDeleteRule('upgrade')">
                <svg-icon icon-class="删除" />
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="" prop="">
          <el-switch v-model="addOrEditDataRuls.demotionRule" @change="handleRuleSwitchChange('downgrade')"
            :active-text="$t('jobMonitoring.demotionRule')" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <el-table ref="demotionList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.demotionList" :disabled="!addOrEditDataRuls.demotionRule"
                @selection-change="handleDemotionSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.demotionRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" :label="$t('jobMonitoring.ruleType')" width="180">
                  <template slot-scope="scope">
                    {{ getRuleTypeLabel(scope.row.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="matchingCondition" :label="$t('jobMonitoring.matchCondition')" min-width="180">
                  <template slot-scope="scope">
                    {{ getMatchingConditionLabel(scope.row.matchingCondition) }}
                  </template>
                </el-table-column>
                <el-table-column prop="ruleContent" :label="$t('jobMonitoring.ruleContent')" min-width="180" />
                <el-table-column prop="securityLevel" :label="$t('jobMonitoring.securityLevel')" min-width="180" />
              </el-table>
              <div class="import-format-tip"
                style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #eff6ff; border: 1px solid #eee; border-radius: 4px;">
                <i class="el-icon-warning-outline" type="info" />
                {{ $t('jobMonitoring.demotionRuleTip') }}
              </div>
            </div>
            <div class="vertical-actions">
              <el-button type="primary" plain size="mini"
                :disabled="!addOrEditDataRuls.demotionRule || addOrEdit.flag == 3"
                @click="addOrEditDataRuls.demotionRule && addOrEdit.flag != 3 && handleOpenRuleDialog('downgrade')">
                <svg-icon icon-class="plus-circle" />
              </el-button>
              <el-button type="danger" plain size="mini"
                :disabled="!addOrEditDataRuls.demotionRule || addOrEdit.flag == 3"
                @click="addOrEditDataRuls.demotionRule && addOrEdit.flag != 3 && handleDeleteRule('downgrade')">
                <svg-icon icon-class="删除" />
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addCancel">{{ $t('cancel') }}</el-button>
        <el-button type="primary" plain v-if="addOrEdit.flag == 1 || addOrEdit.flag == 2" @click="addSubmitForm">{{
          $t('confirm') }}</el-button>
      </div>
    </Drawer>
    <!-- 新增规则弹窗-->
    <el-dialog class="addMsg" :title="$t('jobMonitoring.addRule')" :visible.sync="ruleDialogVisible" width="580px"
      :close-on-click-modal="false" :show-close="false">
      <el-form :model="ruleForm" ref="ruleForm" label-width="100px" class="rule-dialog-form" size="medium"
        label-position="top" :rules="dialogRules">
        <el-form-item :label="$t('jobMonitoring.ruleType')" prop="ruleType">
          <el-select v-model="ruleForm.ruleType" name="ruleType" id="">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('jobMonitoring.matchCondition')" prop="matchType">
          <el-radio-group v-model="ruleForm.matchType" style="display: flex; justify-content: space-between">
            <el-radio label="greater" v-if="currentRuleType === 'upgrade'">{{ $t('jobMonitoring.greaterEqual')
            }}</el-radio>
            <el-radio label="less" v-if="currentRuleType === 'downgrade'">{{ $t('jobMonitoring.lessEqual') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('jobMonitoring.ruleContent')" prop="ruleContent">
          <el-input v-model="ruleForm.ruleContent" :placeholder="$t('jobMonitoring.ruleContent')"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
        </el-form-item>

        <el-form-item :label="$t('jobMonitoring.securityLevel')" prop="securityLevel">
          <el-select v-model="ruleForm.securityLevel" :placeholder="$t('jobMonitoring.securityLevel')">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"
              :disabled="!filterSecurityLevels(item)">
              <template #default>
                <span>
                  {{ item.label }}
                  <span v-if="!filterSecurityLevels(item)" style="color: #999; margin-left: 8px; font-size: 12px;">
                    ({{ currentRuleType === 'upgrade' ? $t('jobMonitoring.needGreaterCurrentLevel') :
                      $t('jobMonitoring.needLessCurrentLevel') }})
                  </span>
                </span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="handleSaveRule">{{ $t('confirm') }}</el-button>
        <el-button @click="ruleDialogVisible = false">{{ $t('cancel') }}</el-button>
      </div>
    </el-dialog>
    <!-- 数据摸底弹窗 -->
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {
  listByDataType
} from "@/api/dictData";
import { getCategorySchemaLevelList } from "@/api/data";
import {
  addAttachData,
  editAttachData,
  selectUserListAll,
  deleteAttachData,
} from "@/api/standard";
import { treeListI, getAttachData, attachStatus, nameTesting, getFrameworks, getCategoryAttachDataRuleByParentId } from "@/api/system/protectCategory";
export default {
  name: "ProtectTableField",
  components: { Treeselect },
  dicts: ['sys_attribute_type'],
  data() {
    return {
      levelOptions: [],
      heightSmall: {
        height: '75px',
        overflowY: 'auto'
      },
      heightBig: {
        height: '180px',
        overflowY: 'auto'
      },
      // 特征标签相关
      inputVisible: false,
      countIs40: true,
      tagsShow: false,
      inputValue: '',
      tags: [],

      // 核心主题词相关
      coreTopic: [],
      coreTopicInputVisible: false,
      coreTopicInputValue: '',
      coreTopicCountIs40: true,
      coreTopicShow: false,

      // 入口词相关
      entryTerm: [],
      entryTermInputVisible: false,
      entryTermInputValue: '',
      entryTermCountIs40: true,
      entryTermShow: false,

      // 关联词相关
      relatedTerms: [],
      relatedTermsInputVisible: false,
      relatedTermsInputValue: '',
      relatedTermsCountIs40: true,
      relatedTermsShow: false,

      // 反向参照相关
      reverseRef: [],
      reverseRefInputVisible: false,
      reverseRefInputValue: '',
      reverseRefCountIs40: true,
      reverseRefShow: false,

      // 核心关键词JSON字符串
      coreKeyWords: '{"coreTopic":"","entryTerm":"","relatedTerms":"","reverseRef":""}',

      categoryName: '',
      debounceTimeout: null,
      treeOptions: [],
      protectMethodIdList: [],
      confirmProtectMethodList: [],
      addOrEdit: {
        title: this.$t('add'),
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      treeLoading: false,
      // 表单校验
      addOrEditRules: {
        categoryId: [
          {
            required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.baseParent') }), trigger: "blur"
          }
        ],
        minSecurityLevel: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.securityLevel') }), trigger: "blur" },
        ],
        attributeType: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.attributeType') }), trigger: "blur" },
        ],
        dataOwner: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.dataOwner') }), trigger: "blur" },
        ],
        attachData: [
          { required: true, message: this.$t('inputRequired', { field: this.$t('jobMonitoring.subclassName') }), trigger: "blur" }
        ],
        tags: [
          { validator: this.tagsRlues, trigger: 'blur', required: true, }
        ],
        protectMethodName: [
          { required: true, message: this.$t('inputRequired', { field: this.$t('jobMonitoring.suggestProtectMethod') }), trigger: "blur" },
        ],
        // coreTopic: [
        //   { validator: this.tagsRlues, trigger: 'blur' }
        // ],
        // entryTerm: [
        //   { validator: this.tagsRlues, trigger: 'blur' }
        // ],
        // relatedTerms: [
        //   { validator: this.tagsRlues, trigger: 'blur' }
        // ],
        // reverseRef: [
        //   { validator: this.tagsRlues, trigger: 'blur' }
        // ]
      },
      dialogRules: {
        ruleType: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.ruleType') }), trigger: 'blur' }
        ],
        matchType: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.matchCondition') }), trigger: 'blur' }
        ],
        ruleContent: [
          { required: true, message: this.$t('inputRequired', { field: this.$t('jobMonitoring.ruleContent') }), trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!/^\d+$/.test(value)) {
                callback(new Error(this.$t('jobMonitoring.validNumber')));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        securityLevel: [
          { required: true, message: this.$t('selectRequired', { field: this.$t('jobMonitoring.securityLevel') }), trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!this.currentBaseSecurityLevel) {
                callback();
                return;
              }

              if (this.currentRuleType === 'upgrade' && Number(value) <= Number(this.currentBaseSecurityLevel)) {
                callback(new Error(this.$t('jobMonitoring.upgradeRuleSecurityLevelInvalid')));
              } else if (this.currentRuleType === 'downgrade' && Number(value) >= Number(this.currentBaseSecurityLevel)) {
                callback(new Error(this.$t('jobMonitoring.demotionRuleSecurityLevelInvalid')));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      },
      treeID: '',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryId: '',//左侧树id
        name: '',//子类名称
        dataSourceId: '',//来源
        confirmProtectMethod: [],
        levelId: [],//安全级别，
        dataOwner: '',
        baseParent: '',//直属父类
        dataSource: '',
      },
      dataSource: '',
      addOrEditDataRuls: {
        additional: '',
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
        attributeType: null,
        dataOwner: '',
        upgradeRule: '',
        demotionRule: '',
        upgradeList: [],
        demotionList: [],
        protectMethodName: '',
        confirmProtectMethod: [],
      },
      // 添加选中行存储变量
      selectedUpgradeRows: [],
      selectedDemotionRows: [],
      importDataLoading: false,
      filterName: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      isName: true,
      Loading: false,
      sourceList: [
        {
          value: 1,
          label: '内置'
        },
        {
          value: 2,
          label: '自定义'
        },
      ],
      // 遮罩层
      loading: false,
      // 显示搜索条件
      showSearch: false,
      isIndeterminate: true,
      checkAll: false,
      columnOptions: [
        { label: this.$t('jobMonitoring.subclassName'), prop: 'attachData', width: '220' },
        { label: this.$t('jobMonitoring.securityLevel'), prop: 'minSecurityLevel', width: '200' },
        { label: this.$t('jobMonitoring.suggestProtectMethod'), prop: 'protectMethodName' },
        { label: this.$t('jobMonitoring.dataOwner'), prop: 'dataOwner', width: '150' },
        { label: this.$t('jobMonitoring.confirmProtectMethod'), prop: 'confirmProtectMethod', width: '220' },
        { label: this.$t('jobMonitoring.dataSource'), prop: 'dataSource', width: '160' },
        { label: this.$t('jobMonitoring.baseParent'), prop: 'baseParent', width: '220' }
      ],
      checkedColumnProps: ['attachData', 'minSecurityLevel', 'protectMethodName', 'dataOwner'],
      // 总条数
      total: 0,
      // 数据库字段名表格数据
      protectTableFieldList: [],
      categoryList: [],
      yuanCategoryList: [],
      userList: [],
      categoryListEdit: null,
      addNodeName: "",

      // 新增规则弹窗相关
      ruleDialogVisible: false,
      currentRuleType: '',
      ruleForm: {
        matchType: 'greater',
        ruleType: '1',
        ruleContent: '',
        securityLevel: ''
      },
      options: [
        {
          value: '1',
          label: this.$t('jobMonitoring.dataScale')
        },
      ],
      currentBaseSecurityLevel: null,
      dataBaselineShow: false,
      dataBaselineLoading: false,
    };
  },
  watch: {
    filterName(val) {
      this.$refs.tree.filter(val);
    },
    tags: {
      deep: true,
      immediate: true,
      handler(val) {
        this.handleTagChange(val, 'tags');
      }
    },
    coreTopic: {
      deep: true,
      immediate: true,
      handler(val) {
        this.handleTagChange(val, 'coreTopic');
      }
    },
    entryTerm: {
      deep: true,
      immediate: true,
      handler(val) {
        this.handleTagChange(val, 'entryTerm');
      }
    },
    relatedTerms: {
      deep: true,
      immediate: true,
      handler(val) {
        this.handleTagChange(val, 'relatedTerms');
      }
    },
    reverseRef: {
      deep: true,
      immediate: true,
      handler(val) {
        this.handleTagChange(val, 'reverseRef');
      }
    }
  },
  created() {
    if (this.$route.query && this.$route.query.id) {
      this.queryParams.categoryId = this.$route.query.id * 1
    }
    if (this.$route.query && this.$route.query.dataSource) {
      this.dataSource = this.$route.query.dataSource
    }
    this.gettreeOptionsList(this.$route.query.id)
    this.getDictData()
    this.getSelectUserListAll()
    // this.fetchLevelOptions(this.queryParams.categoryId)
  },
  computed: {
    setList() {
      return this.columnOptions
    },
    checkedColumn() {
      return this.setList.filter(item => this.checkedColumnProps.includes(item.prop))
    },
    currentCategoryNode() {
      return this.findTreeNodeById(this.categoryList, this.treeID) || {}
    },
    headerTitle() {
      return this.currentCategoryNode.categoryName || ''
    },
    headerResultText() {
      return `共 ${this.total} 条结果`
    },
    headerRemark() {
      return this.currentCategoryNode.categoryDescribe || ''
    }
  },
  watch: {
    'queryParams.categoryId'(val) {
      this.fetchLevelOptions(val)
    }
  },
  methods: {
    goBackToManagement() {
      this.$router.push({ path: '/standard/management' })
    },
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
    fetchLevelOptions(categoryId) {
      const params = {}
      if (categoryId) params.projectId = categoryId
      getCategorySchemaLevelList(params).then(res => {
        const payload = res && res.data ? res.data : res
        const list = payload.records || payload.rows || payload.list || payload || []
        this.levelOptions = list.map(it => ({
          value: String(it.level),
          label: it.levelName,
          defaultProtectMethod: it.defaultProtectMethod
        }))
      })
    },
    // 处理安全级别变化
    handleSecurityLevelChange() {
      this.addOrEditDataRuls.protectMethodName = this.levelOptions.find(item => item.value === this.addOrEditDataRuls.minSecurityLevel)?.defaultProtectMethod || ''
      this.$nextTick(() => {
        this.$refs["addOrEdit"] && this.$refs["addOrEdit"].validateField('protectMethodName');
      });
    },
    // 处理标签变化的通用方法
    handleTagChange(val, type) {
      if (val.length >= 40) {
        this[`${type}CountIs40`] = false;
        this.$modal.msgWarning(this.$t('jobMonitoring.maxTagsWarning', { name: this.getTagName(type) }));
      } else {
        this[`${type}CountIs40`] = true;
      }
      if (val.length >= 10) {
        this[`${type}Show`] = false;
      } else {
        this[`${type}Show`] = true;
      }
    },

    // 获取标签名称
    getTagName(type) {
      const tagNames = {
        tags: this.$t('jobMonitoring.featureTags'),
        coreTopic: this.$t('jobMonitoring.coreTopic'),
        entryTerm: this.$t('jobMonitoring.entryTerm'),
        relatedTerms: this.$t('jobMonitoring.relatedTerms'),
        reverseRef: this.$t('jobMonitoring.reverseReference')
      };
      return tagNames[type] || '';
    },

    // 显示输入框
    showInput(type) {
      // 对于特征标签，需要特殊处理
      if (type === 'tags') {
        this.inputVisible = true;
      } else {
        this[`${type}InputVisible`] = true;
      }

      // 使用this.$set确保响应式更新
      if (type === 'tags') {
        this.$set(this, 'inputVisible', true);
      } else {
        this.$set(this, `${type}InputVisible`, true);
      }

      this.$nextTick(_ => {
        // 获取正确的ref名称，特征标签使用特殊的ref名
        const refName = type === 'tags' ? 'saveTagInput' : `${type}SaveTagInput`;
        const inputRef = this.$refs[refName];
        if (inputRef && inputRef.$refs && inputRef.$refs.input) {
          inputRef.$refs.input.focus();
        } else if (inputRef && inputRef.focus) {
          // 兼容直接调用focus的情况
          inputRef.focus();
        }
      });
    },

    // 处理标签关闭
    handleClose(tag, index, type) {
      this[type].splice(index, 1);
    },

    // 处理输入确认
    handleInputConfirm(type) {
      // 获取输入值，对特征标签进行特殊处理
      let inputValue;
      if (type === 'tags') {
        inputValue = this.inputValue;
      } else {
        inputValue = this[`${type}InputValue`];
      }

      // 添加空值检查，避免调用trim()时出错
      const trimmedValue = inputValue ? inputValue.trim() : '';

      if (trimmedValue) {
        this[type].push(trimmedValue);
      }

      // 清空输入值并隐藏输入框，对特征标签进行特殊处理
      if (type === 'tags') {
        this.inputVisible = false;
        this.inputValue = '';
        // 确保响应式更新
        this.$set(this, 'inputVisible', false);
        this.$set(this, 'inputValue', '');
      } else {
        this[`${type}InputVisible`] = false;
        this[`${type}InputValue`] = '';
        // 确保响应式更新
        this.$set(this, `${type}InputVisible`, false);
        this.$set(this, `${type}InputValue`, '');
      }
    },

    // 解析coreKeyWords到各个标签数组
    parseCoreKeyWords() {
      try {
        const coreKeyWordsObj = JSON.parse(this.coreKeyWords || '{"coreTopic":"","entryTerm":"","relatedTerms":"","reverseRef":""}');
        this.coreTopic = coreKeyWordsObj.coreTopic ? coreKeyWordsObj.coreTopic.split(',') : [];
        this.entryTerm = coreKeyWordsObj.entryTerm ? coreKeyWordsObj.entryTerm.split(',') : [];
        this.relatedTerms = coreKeyWordsObj.relatedTerms ? coreKeyWordsObj.relatedTerms.split(',') : [];
        this.reverseRef = coreKeyWordsObj.reverseRef ? coreKeyWordsObj.reverseRef.split(',') : [];
      } catch (e) {
        console.error('解析coreKeyWords失败:', e);
        this.coreTopic = [];
        this.entryTerm = [];
        this.relatedTerms = [];
        this.reverseRef = [];
      }
    },

    // 将标签数组转换为coreKeyWords字符串
    stringifyCoreKeyWords() {
      this.coreKeyWords = JSON.stringify({
        coreTopic: this.coreTopic.join(','),
        entryTerm: this.entryTerm.join(','),
        relatedTerms: this.relatedTerms.join(','),
        reverseRef: this.reverseRef.join(',')
      });
    },

    getRuleTypeLabel(ruleType) {
      const option = this.options.find(item => item.value === ruleType);
      return option ? option.label : '';
    },
    getMatchingConditionLabel(condition) {
      if (condition === '大于等于') {
        return this.$t('jobMonitoring.greaterEqual')
      }
      if (condition === '小于等于') {
        return this.$t('jobMonitoring.lessEqual')
      }
      return condition
    },
    translateDataSource(value) {
      if (value === '内置') {
        return this.$t('jobMonitoring.builtIn')
      }
      if (value === '自定义') {
        return this.$t('jobMonitoring.custom')
      }
      return value
    },
    isBuiltInSource(value) {
      return value === '内置'
    },
    canEditRow(row) {
      return row.dataOwner === this.$store.state.user.name
    },
    handleNameClick(row) {
      if (this.canEditRow(row)) {
        this.editFn(row)
      } else {
        this.lookFn(row)
      }
    },
    findTreeNodeById(tree, nodeId) {
      if (!Array.isArray(tree) || !nodeId) {
        return null
      }
      for (const node of tree) {
        if (node.id === nodeId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findTreeNodeById(node.children, nodeId)
          if (found) {
            return found
          }
        }
      }
      return null
    },
    toggleFilters() {
      this.showSearch = !this.showSearch
    },
    isColumnVisible(prop) {
      return this.checkedColumnProps.includes(prop)
    },
    handleCheckAllChange(val) {
      this.checkedColumnProps = val ? this.setList.map(item => item.prop) : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.setList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.setList.length
    },
    getActionText(action) {
      const actionMap = {
        enable: this.$t('enable'),
        disable: this.$t('disable'),
        delete: this.$t('delete')
      }
      return actionMap[action] || action
    },
    /**
   * 打开新增规则弹窗
   * @param {String} type 规则类型：'upgrade'升级/'downgrade'降级
   */
    handleOpenRuleDialog(type) {
      this.currentRuleType = type;
      this.currentBaseSecurityLevel = this.addOrEditDataRuls.minSecurityLevel;

      this.ruleForm = {
        matchType: type === 'upgrade' ? 'greater' : 'less',
        ruleType: '1',
        ruleContent: '',
        securityLevel: ''
      };
      this.ruleDialogVisible = true;
    },

    // 过滤安全分级选项
    filterSecurityLevels(item) {
      if (!this.currentBaseSecurityLevel) return true;

      if (this.currentRuleType === 'upgrade') {
        return Number(item.value) > Number(this.currentBaseSecurityLevel);
      } else if (this.currentRuleType === 'downgrade') {
        return Number(item.value) < Number(this.currentBaseSecurityLevel);
      }
      return true;
    },

    /**
     * 保存新增规则（弹窗确定按钮）
     */
    handleSaveRule() {
      this.$refs.ruleForm.validate(async (valid) => {
        if (!valid) return;

        if (!this.ruleForm.ruleContent.trim()) {
          this.$message.warning(this.$t('jobMonitoring.ruleValueRequired'));
          return;
        }
        const content = Number(this.ruleForm.ruleContent);
        if (isNaN(content)) {
          this.$message.warning(this.$t('jobMonitoring.validNumber'));
          return;
        }

        const upgradeValues = this.addOrEditDataRuls.upgradeList.map(item => Number(item.ruleContent));
        const demotionValues = this.addOrEditDataRuls.demotionList.map(item => Number(item.ruleContent));

        if (this.currentRuleType === 'upgrade') {
          if (demotionValues.length > 0) {
            const maxDemotion = Math.max(...demotionValues);
            if (content <= maxDemotion) {
              this.$message.warning(this.$t('jobMonitoring.upgradeValueMustBeGreater', { value: maxDemotion }));
              return;
            }
          }
        }

        if (this.currentRuleType === 'downgrade') {
          if (upgradeValues.length > 0) {
            const minUpgrade = Math.min(...upgradeValues);
            if (content >= minUpgrade) {
              this.$message.warning(this.$t('jobMonitoring.demotionValueMustBeLess', { value: minUpgrade }));
              return;
            }
          }
        }

        const matchText = this.ruleForm.matchType === 'greater' ? '大于等于' : '小于等于';

        const newRule = {
          ruleType: this.ruleForm.ruleType,
          matchingCondition: matchText,
          ruleContent: this.ruleForm.ruleContent,
          securityLevel: this.ruleForm.securityLevel
        };

        if (this.currentRuleType === 'upgrade') {
          this.addOrEditDataRuls.upgradeList.push(newRule);
        } else if (this.currentRuleType === 'downgrade') {
          this.addOrEditDataRuls.demotionList.push(newRule);
        }

        this.ruleDialogVisible = false;
        this.$message.success(this.$t('jobMonitoring.ruleAddSuccess'));
      });
    },

    /**
     * 删除升降级规则
     * @param {String} type 规则类型：'upgrade'/'downgrade'
     */
    handleDeleteRule(type) {
      const isSwitchOpen = type === 'upgrade' ? this.addOrEditDataRuls.upgradeRule : this.addOrEditDataRuls.demotionRule;
      if (!isSwitchOpen) {
        this.$message.warning(this.$t('jobMonitoring.openRuleSwitchFirst'));
        return;
      }

      const selection = type === 'upgrade' ? this.selectedUpgradeRows : this.selectedDemotionRows;

      if (selection.length === 0) {
        this.$message.warning(this.$t('jobMonitoring.selectRulesToDelete'));
        return;
      }

      this.$confirm(this.$t('jobMonitoring.deleteRulesConfirm', { count: selection.length }), this.$t('tip'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        type: 'warning'
      }).then(() => {
        const contentsToDelete = selection.map(item => item.ruleContent);

        if (type === 'upgrade') {
          this.addOrEditDataRuls.upgradeList = this.addOrEditDataRuls.upgradeList.filter(
            item => !contentsToDelete.includes(item.ruleContent)
          );
          this.selectedUpgradeRows = [];
        } else {
          this.addOrEditDataRuls.demotionList = this.addOrEditDataRuls.demotionList.filter(
            item => !contentsToDelete.includes(item.ruleContent)
          );
          this.selectedDemotionRows = [];
        }

        const tableRef = type === 'upgrade' ? 'upgradeList' : 'demotionList';
        if (this.$refs[tableRef]) {
          this.$refs[tableRef].clearSelection();
        }

        this.$message.success(this.$t('jobMonitoring.ruleDeleteSuccess'));
      });
    },

    /**
     * 处理升级规则表格选中行变化
     */
    handleUpgradeSelectionChange(selection) {
      this.selectedUpgradeRows = selection;
    },

    /**
     * 处理降级规则表格选中行变化
     */
    handleDemotionSelectionChange(selection) {
      this.selectedDemotionRows = selection;
    },

    /**
     * 升降级开关变化时的处理（关闭时清空表格选择）
     * @param {String} type 规则类型：'upgrade'/'downgrade'
     */
    handleRuleSwitchChange(type) {
      const tableRef = type === 'upgrade' ? 'upgradeList' : 'demotionList';
      const isSwitchOpen = type === 'upgrade' ? this.addOrEditDataRuls.upgradeRule : this.addOrEditDataRuls.demotionRule;

      if (!isSwitchOpen && this.$refs[tableRef]) {
        this.$refs[tableRef].clearSelection();
      }
    },


    renderContent(h, { node, data }) {
      // 判断是否为根节点
      const isRoot = this.isRootNode(data);
      // 获取节点层级（1:根节点，2-6:对应不同层级）
      const level = node.level;

      // 使用sensitiveData中的颜色方案（根节点不算等级，从二级开始算L1-L5）
      const levelColors = {
        1: '#4CAF50',  // 绿色 - L1
        2: '#FFC107',  // 黄色 - L2
        3: '#FB8C00',  // 橙色 - L3
        4: '#FF9800',  // 橙红色 - L4
        5: '#F56C6C'   // 深红色 - L5
      };

      let iconClass = '';
      let iconStyle = {};
      // 计算显示的等级：非根节点从L1开始（level-1），根节点不显示等级
      const displayLevel = isRoot ? 0 : level - 1;
      let levelLabel = displayLevel > 0 ? ` L${displayLevel}` : '';
      // 获取当前层级的颜色：根节点使用默认颜色，非根节点从L1开始计算
      const currentColor = isRoot ? '#4CAF50' : (levelColors[displayLevel] || levelColors[5]);

      if (isRoot) {
        // L1根节点
        iconClass = 'dunpai-2';
        // iconStyle = { color: currentColor, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
        iconStyle = { fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', };
      } else {
        // 二级及以下节点
        iconClass = node.expanded ? 'openFile' : 'closeFile';
        // iconStyle = { color: currentColor, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
        iconStyle = { fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
      }

      // 获取面包屑路径
      const breadcrumb = this.getBreadcrumbPath(data);

      // 右侧元素（设置图标）
      const rightElements = [];

      // 对所有层级添加setting图标（根节点）
      if (this.dataSource != '内置' && isRoot) {
        rightElements.push(
          h('svg-icon', {
            attrs: { iconClass: 'setting' },
            style: { cursor: 'pointer', flexShrink: 0, marginRight: '10px' },
            on: {
              click: (e) => {
                e.stopPropagation();
                this.goToMenuEdit(data);
              }
            }
          })
        );
      }

      // 构建节点内容
      const labelPart = [
        h('span', {
          class: 'node-label',
          attrs: { title: node.label },
          style: {
            fontSize: '14px',
            fontWeight: isRoot ? '600' : 'normal'
          }
        }, node.label)
      ];

      // 非根节点才显示等级标签，放到最右侧
      if (!isRoot) {
        rightElements.unshift(
          h('span', {
            class: 'node-level',
            style: {
              // color: currentColor,
              fontWeight: '500',
              fontSize: '10px',
              marginLeft: '8px',
              marginRight: '8px',
              padding: '2px 6px',
              backgroundColor: '#e8f4ff',
              borderRadius: '4px',
              flexShrink: 0
            }
          }, levelLabel)
        );
      }

      // 根节点：label 占满剩余空间（自动压缩），齿轮靠右
      let nodeContent = [];
      if (isRoot && this.dataSource != '内置') {
        nodeContent = [
          h('div', {
            class: 'node-label-wrapper',
            style: { flex: '1', minWidth: '0', overflow: 'hidden', display: 'flex', alignItems: 'center' }
          }, labelPart),
          ...rightElements
        ];
      } else {
        // 非根节点正常布局
        nodeContent = [
          h('div', {
            class: 'node-label-wrapper',
            style: { flex: '1', minWidth: '0', overflow: 'hidden', display: 'flex', alignItems: 'center' }
          }, labelPart),
          ...rightElements
        ];
      }

      // 所有节点图标都放在前面
      nodeContent.unshift(
        h('svg-icon', {
          class: 'tree-node-icon',
          attrs: {
            iconClass: iconClass
          },
          style: { ...iconStyle, marginRight: '8px' }
        })
      );

      const mainNode = h('span', {
        class: 'custom-tree-node',
        style: {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          paddingTop: '10px',
          paddingBottom: '10px',
          borderRadius: level > 1 ? '6px' : '0',
          transition: 'background-color 0.2s'
        }
      }, nodeContent);

      return mainNode;
    },

    goToMenuEdit(data) {
      this.$router.push({
        path: '/standard/editMenu',
        query: { id: data.id }
      });
    },

    //判断是否为根节点
    isRootNode(data) {
      return data.parentId === 0 || !data.parentId;
    },

    //  字典数据
    getDictData() {
      listByDataType({ type: 'sys_protect_method' }).then(res => {
        this.protectMethodIdList = res.data;
      })
      listByDataType({ type: 'sys_confirm_protect_method' }).then(res => {
        this.confirmProtectMethodList = res.data;
      })
    },
    //  获取用户列表
    getSelectUserListAll() {
      selectUserListAll().then(res => {
        this.userList = res.data;
      })
    },
    // 自定义校验规则
    tagsRlues(rule, value, callback) {
      if (this.tags.length < 5) {
        callback(new Error(this.$t('jobMonitoring.tagsMinRequired')));
      } else {
        callback();
      }
    },
    addFn() {
      this.addOrEdit.flag = 1
      this.addOrEdit.title = this.$t('add')
      this.addOrEdit.show = true
      // 清空表单数据
      this.addOrEditDataRuls = {
        additional: '',
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
        dataOwner: this.$store.state.user.name, // 保留当前用户作为默认数据持有者
        upgradeRule: false, // 重置为默认值false
        demotionRule: false, // 重置为默认值false
        upgradeList: [], // 清空升级规则列表
        demotionList: [], // 清空降级规则列表
        protectMethodName: '',
        confirmProtectMethod: [],
      }
      this.addOrEditDataRuls.dataOwner = this.$store.state.user.name
      this.tagsShow = true
      this.tags = []
      this.addNodeName = ''
      // 清空新增的标签数组
      this.coreTopic = [];
      this.entryTerm = [];
      this.relatedTerms = [];
      this.reverseRef = [];
    },
    /** 新增确定方法 */
    async addSubmitForm() {
      this.stringifyCoreKeyWords();
      this.$refs["addOrEdit"].validate(async (valid) => {
        let params = {
          attachData: this.addOrEditDataRuls.attachData,
          categoryId: this.addOrEditDataRuls.categoryId,
          minSecurityLevel: this.addOrEditDataRuls.minSecurityLevel,
          attributeType: this.addOrEditDataRuls.attributeType,
          attachDescribe: this.addOrEditDataRuls.additional,
          coreTags: this.tags.join(),
          confirmProtectMethod: this.addOrEditDataRuls.confirmProtectMethod.join(),
          dataOwner: this.addOrEditDataRuls.dataOwner,
          protectMethod: this.addOrEditDataRuls.minSecurityLevel,
          upgradeRule: this.addOrEditDataRuls.upgradeRule ? '1' : '0',
          demotionRule: this.addOrEditDataRuls.demotionRule ? '1' : '0',
          upgradeList: this.addOrEditDataRuls.upgradeList,
          demotionList: this.addOrEditDataRuls.demotionList,
          coreKeyWords: this.coreKeyWords // 添加核心关键词JSON字符串
        }
        if (valid) {
          this.importDataLoading = true
          await this.rulsNameIsRight(this.addOrEditDataRuls.categoryId, params.attachData, this.addOrEditDataRuls.id)
          if (!this.isName) {
            this.$modal.msgError(this.$t('jobMonitoring.duplicateSubclassName'));
            this.importDataLoading = false
            return
          }
          if (this.addOrEditDataRuls.id != null) {
            params.id = this.addOrEditDataRuls.id
            editAttachData(params).then((response) => {
              this.$modal.msgSuccess(this.$t('editSuccess'));
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          } else {
            addAttachData(params).then((response) => {
              this.$modal.msgSuccess(this.$t('addSuccess'));
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          }
        } else {
          return false
        }
      });

    },

    // 新增取消
    addCancel() {
      this.addOrEditDataRuls = {
        additional: '',
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
        attributeType: null,
        dataOwner: '',
        upgradeRule: '',
        demotionRule: '',
        upgradeList: [],
        demotionList: [],
        protectMethodName: '',
        confirmProtectMethod: [],
      }
      this.addNodeName = ''
      this.addOrEdit.show = false
      this.$refs["addOrEdit"] && this.$refs["addOrEdit"].clearValidate()
    },
    // 递归函数，查找父节点的 label 并返回完整的路径
    findParentLabelsById(tree, nodeId, path = []) {
      if (!Array.isArray(tree)) {
        return null;
      }
      for (const node of tree) {
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (child.id === nodeId) {
              return [...path, node.label];
            }
          }
          const found = this.findParentLabelsById(node.children, nodeId, [...path, node.label]);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },

    addHandleNodeClick(node) {
      if (node.children && node.children.length > 0) {
        node.disabled = true;
      } else {
        const parentLabels = this.findParentLabelsById(this.categoryList, node.id);
        if (parentLabels) {
          this.addNodeName = parentLabels.join('-') + '-' + node.categoryName;
        } else {
          this.addNodeName = node.categoryName + '-';
        }
        this.addOrEditDataRuls.categoryId = node.id
        this.$refs.addSelectRef.blur()
      }
    },

    // 处理添加选择框的输入事件
    handleAddSelectInput(value) {
      if (this.$refs.treeSelect) {
        this.$refs.treeSelect.filter(value);
      }
    },
    // 处理添加选择框的显示隐藏事件，解决搜索不到值时失焦导致下拉数据为空的问题
    handleAddSelectVisibleChange(visible) {
      if (!visible) {
        if (this.$refs.treeSelect) {
          this.$refs.treeSelect.filter('');
        }
      }
    },
    getBaseParentDisplayName(row) {
      if (row.baseParent) {
        return row.baseParent
      }
      if (row.categoryId) {
        const pathArray = this.getNodePath(this.categoryList, row.categoryId)
        if (pathArray.length > 0) {
          return pathArray.join('-')
        }
      }
      return row.owner || ''
    },
    async editFn(row) {
      this.addOrEdit.flag = 2
      this.addOrEditDataRuls = Object.assign({
        protectMethodName: '',
        confirmProtectMethod: [],
      }, JSON.parse(JSON.stringify(row)))
      this.addOrEditDataRuls.upgradeRule = row.upgradeRule == '1' ? true : false
      this.addOrEditDataRuls.demotionRule = row.demotionRule == '1' ? true : false
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.addOrEditDataRuls.attributeType = row.attributeType
      this.tags = row.coreTags ? row.coreTags.split(',') : []
      this.addOrEditDataRuls.confirmProtectMethod = Array.isArray(row.confirmProtectMethod)
        ? row.confirmProtectMethod
        : (row.confirmProtectMethod ? row.confirmProtectMethod.split(',') : []);
      this.addNodeName = this.getBaseParentDisplayName(row)
      this.addOrEdit.show = true
      this.addOrEdit.title = this.$t('edit')
      this.tagsShow = false
      this.$set(this.addOrEditDataRuls, 'additional', row.attachDescribe)
      // 加载核心关键词并解析
      this.coreKeyWords = row.coreKeyWords || '{"coreTopic":"","entryTerm":"","relatedTerms":"","reverseRef":""}';
      this.parseCoreKeyWords();
      try {
        let query = {
          parentId: row.id
        }
        let res = await getCategoryAttachDataRuleByParentId(query)
        if (res.code == 200) {
          this.addOrEditDataRuls.upgradeList = res.data.upgradeList
          this.addOrEditDataRuls.demotionList = res.data.demotionList
        }
      } catch (error) {
        this.$message({ message: this.$t('jobMonitoring.fetchChildTableFailed'), type: 'warning' })
      }
    },
    async lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = Object.assign({
        protectMethodName: '',
        confirmProtectMethod: [],
      }, JSON.parse(JSON.stringify(row)))
      this.addOrEditDataRuls.upgradeRule = row.upgradeRule == '1' ? true : false
      this.addOrEditDataRuls.demotionRule = row.demotionRule == '1' ? true : false
      this.addOrEditDataRuls.additional = row.attachDescribe
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.addOrEditDataRuls.attributeType = row.attributeType
      this.tags = row.coreTags ? row.coreTags.split(',') : []
      this.addOrEditDataRuls.confirmProtectMethod = Array.isArray(row.confirmProtectMethod)
        ? row.confirmProtectMethod
        : (row.confirmProtectMethod ? row.confirmProtectMethod.split(',') : []);
      this.addNodeName = this.getBaseParentDisplayName(row)
      this.addOrEdit.show = true
      this.addOrEdit.title = this.$t('view')
      this.tagsShow = false
      // 加载核心关键词并解析
      this.coreKeyWords = row.coreKeyWords || '{"coreTopic":"","entryTerm":"","relatedTerms":"","reverseRef":""}';
      this.parseCoreKeyWords();
      try {
        let query = {
          parentId: row.id
        }
        let res = await getCategoryAttachDataRuleByParentId(query)
        if (res.code == 200) {
          this.addOrEditDataRuls.upgradeList = res.data.upgradeList
          this.addOrEditDataRuls.demotionList = res.data.demotionList
        }
      } catch (error) {
        this.$message({ message: this.$t('jobMonitoring.fetchChildTableFailed'), type: 'warning' })
      }
    },
    messsucc(res, flag) {
      this.$message.success(this.$t('jobMonitoring.batchActionSuccess', {
        action: this.getActionText(flag),
        count: res.data
      }))
    },
    enabledFn(flag) {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(this.$t('jobMonitoring.batchConfirm', { action: this.getActionText(flag) }), this.$t('tip'), {
          confirmButtonText: this.$t('confirm'),
          cancelButtonText: this.$t('cancel'),
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids.join(',')
          }
          if (flag == 'enable') {
            data.enable = true
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else if (flag == 'disable') {
            data.enable = false
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else if (flag == 'delete') {
            for (let item of dataS) {
              if (this.isBuiltInSource(item.dataSource)) {
                this.$message({
                  type: 'warning',
                  message: this.$t('jobMonitoring.builtInDataSourceDeleteForbidden'),
                });
                return
              }
            }
            deleteAttachData(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else {
            this.$message({ message: this.$t('jobMonitoring.unknownException'), type: 'warning' })
          }
        }).catch(() => {

        });
      } else {
        this.$message({ message: this.$t('jobMonitoring.pleaseSelectAtLeastOne'), type: 'warning' })
      }
    },
    // 左侧树下拉选change事件
    treeOptionsSelectChange(val) {
      this.getProtectCategory(val)
    },
    gettreeOptionsList(id) {
      this.Loading = true
      getFrameworks().then((response) => {
        this.treeOptions = response.data
        if (response.data.length > 0) {
          if (!id) {
            this.queryParams.categoryId = response.data[0].id;
          }
          this.getProtectCategory(this.queryParams.categoryId);
        } else {
          this.Loading = false

        }
      });
    },
    sonNameTestingFn(val) {
      this.addOrEditDataRuls.attachData = val.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")
    },
    // 修改过滤方法以支持最下级节点匹配
    filterNode(value, data) {
      if (!value) return true; // 无搜索值时全部显示
      const lowerValue = value.toLowerCase();

      // 1. 检查当前节点自身是否匹配（无论是否为叶子节点）
      if (data.categoryName && data.categoryName.toLowerCase().includes(lowerValue)) {
        return true;
      }

      // 2. 检查当前节点的祖先节点是否有匹配（若有，则当前节点强制显示）
      if (this.hasMatchingAncestor(data, this.categoryList, lowerValue)) {
        return true;
      }

      // 3. 检查当前节点的子节点是否有匹配（若有，则当前节点显示）
      if (data.children && data.children.length > 0) {
        return this.checkChildrenMatch(data.children, lowerValue);
      }

      return false;
    },
    hasMatchingAncestor(node, tree, searchValue) {
      let parent = this.findParentNode(tree, node.parentId); // 找到父节点
      while (parent) {
        // 若父节点自身匹配，则当前节点有匹配的祖先
        if (parent.categoryName && parent.categoryName.toLowerCase().includes(searchValue)) {
          return true;
        }
        // 继续向上查找祖先
        parent = this.findParentNode(tree, parent.parentId);
      }
      return false;
    },
    findParentNode(tree, parentId) {
      for (const node of tree) {
        if (node.id === parentId) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = this.findParentNode(node.children, parentId);
          if (found) return found;
        }
      }
      return null;
    },

    // 递归检查子节点是否匹配
    checkChildrenMatch(children, searchValue) {
      for (let child of children) {
        // 子节点自身匹配
        if (child.categoryName && child.categoryName.toLowerCase().includes(searchValue)) {
          return true;
        }
        // 递归检查子节点的后代
        if (child.children && child.children.length > 0) {
          if (this.checkChildrenMatch(child.children, searchValue)) {
            return true;
          }
        }
      }
      return false;
    },
    handleNodeClick(data) {
      if (data.addEdit) {
        return
      } else {
        this.treeID = data.id;
        this.handleQuery();
      }
    },

    // 定时器，防抖使用
    inputSearch(data) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleQuery()
      }, 500);
    },
    selectProjectIdChange(val) {
      this.handleQuery()
    },
    dataSourceIdIdChange(val) {
      this.sourceList.forEach((item) => {
        if (val == item.value)
          this.queryParams.dataSource = item.label
      })
      this.handleQuery()
    },
    getProtectCategory(key) {
      this.treeLoading = true
      let data = {
        parentId: key,
        ifAddParent: 1,
      };
      treeListI(data).then((resp) => {
        this.categoryList = resp.data
        this.yuanCategoryList = resp.data
        if (resp.data.length == 0) {
          this.Loading = false
        } else {
          this.treeID = this.categoryList[0].id;
          this.$nextTick(function () {
            if (this.$refs.tree) {
              this.$refs.tree.setCurrentKey(this.treeID);
              this.$refs.tree.setCurrentKey(this.treeID);
            }
          });
          let tempList = JSON.parse(JSON.stringify(this.categoryList))
          for (let item of tempList) {
            item.label = item.categoryName
          }
          this.categoryList = this.handleTree(tempList, "id", "parentId")
          this.categoryListEdit = this.handleTree(tempList, "id", "parentId")
        }
        this.Loading = false
        this.treeLoading = false
        this.getList()
      });
    },
    getList() {
      this.loading = true;
      let params = {
        ...this.queryParams,
        nodeId: this.treeID,
        levelId: this.queryParams.levelId.length ? this.queryParams.levelId.join() : '-1',
        confirmProtectMethod: this.queryParams.confirmProtectMethod.length ? this.queryParams.confirmProtectMethod.join() : '',
        dataSourceId: this.queryParams.dataSourceId ? this.queryParams.dataSourceId : 0,
      }
      getAttachData(params).then((response) => {
        this.protectTableFieldList = response.data.rows;
        this.protectTableFieldList.forEach((item) => {
          if (item.protectMethodName) {
            item.protectMethodNameList = item.protectMethodName.split(',');
          }
          if (item.confirmProtectMethod) {
            item.confirmProtectMethodList = item.confirmProtectMethod.split(',');
          }
        })
        this.total = response.data.total;
        this.loading = false;
      });
    },
    // 表单重置
    reset() {
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();

    },
    /** 重置按钮操作 */
    resetQuery() {
      this.treeID = this.categoryList[0].id
      this.$refs.tree.setCurrentKey(this.treeID);
      this.resetForm("queryParams");
      this.queryParams.dataSource = ''
      this.handleQuery();
    },
    async rulsNameIsRight(nodeId, name, id) {
      let params = {
        nodeId,
        name,
        id
      }
      let res = await nameTesting(params).then(res => {
        this.isName = res.data
      })
        .catch(err => {
          this.importDataLoading = true

        })
    },
    // 数据摸底表单方法
    // Helper function to get the path from the root to a given node
    getNodePath(tree, nodeId, path = []) {
      if (!Array.isArray(tree)) {
        return [];
      }
      for (const node of tree) {
        const currentPath = [...path, node]; // Add current node to path
        if (node.id === nodeId) {
          return currentPath.map(n => n.categoryName); // Return the path of category names
        }
        if (node.children && node.children.length > 0) {
          const foundPath = this.getNodePath(node.children, nodeId, currentPath);
          if (foundPath.length > 0) {
            return foundPath;
          }
        }
      }
      return []; // Node not found
    },
    getBreadcrumbPath(node) {
      if (!node || !node.categoryName) return '';

      // 获取从根到当前节点的完整路径
      const pathArray = this.getNodePath(this.categoryList, node.id);
      if (pathArray.length > 1) {
        return pathArray.slice(1).join(' > ');
      }
      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
.el-popup-parent--hidden ::v-deep .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
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

.serachSelect {
  width: 100%;
  margin-right: 10px;
}

.serachInput {
  margin-bottom: 20px;

  .el-input__inner {
    background-color: #f8fafc;
  }
}

.importForm ::v-deep .el-form-item--medium {
  width: 70%;

}

.importForm ::v-deep .el-form-item__content {
  width: calc(100% - 145px);
}

.uploadClass {
  width: 20% !important;
}

.addSelectClass ::v-deep .el-select {
  width: calc(100%);
}

.tableBox {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  flex: 1;
  min-height: 0;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 10px;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tableBox ::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  border-radius: 10px;
}

.AiStudesCont ::v-deep .el-form-item__content {
  display: flex;
  justify-content: space-between;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.tagsClass {
  transition: all .5s ease-in-out;
}

.tagsClass::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tagsClass::-webkit-scrollbar-thumb {
  background-color: #0003;
  border-radius: 10px;
  transition: all .2s ease-in-out;
}

.tagsClass::-webkit-scrollbar-track {
  border-radius: 10px;
}

.searchBtn {
  margin-left: auto;
  height: 100%;
}

.searchBtn ::v-deep .el-form-item__content {
  margin-left: 225px
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

.tagsBox {
  margin-right: 5px;
}

.addNode {
  input {
    height: 23px;
    line-height: 23px;
  }
}

/* Add tree node height and padding adjustments */
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

.custom-tree-node .node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  max-width: 100%;
  line-height: 24px;
  display: inline-block;
}

.node-label-wrapper {
  overflow: hidden;
  max-width: 100%;
}

::v-deep .node-label-wrapper .node-label {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
}

.node-label-wrapper .node-level {
  flex-shrink: 0;
}

.node-breadcrumb {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  line-height: 1.4;
}

.tree-node-main {
  margin-left: 0px;
  /* Default margin for L1 */
}

.table-with-actions {
  width: 100%;

  .vertical-actions {
    margin-left: 10px;
  }
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

.addMsg ::v-deep .el-dialog__body {
  padding: 30px;
}

.job-monitoring-page {
  height: calc(100vh - 84px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-layout {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

::v-deep .page-layout.el-row {
  display: flex;
  align-items: stretch;
  min-height: 0;
  overflow: hidden;
}

::v-deep .page-layout > .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.addMsg ::v-deep.el-form {
  margin-bottom: 0;
}

::v-deep .left-card {
  border-radius: 10px;
  height: 100%;
  max-height: 100%;
  overflow: hidden;

  .el-card__body {
    height: 100%;
    max-height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }
}

.table-card {
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

.table-card ::v-deep .el-card__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #ebeef5;
}

.searchCard {
  border-radius: 10px;
  margin-bottom: 16px;

  ::v-deep .el-card__body {
    padding: 24px;
  }
}

.search-wrapper {
  flex-shrink: 0;
}

.head-container+.head-container {
  margin-top: 16px;
}

.tree-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-scroll-container {
  flex: 1;
  min-height: 320px;
  height: calc(100vh - 250px);
  overflow-y: auto;
  overflow-x: hidden;
}

.treeBox {
  min-height: 100%;
  overflow: visible;
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

.table-card-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-header-main {
  min-width: 0;
}

.content-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.content-count {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.content-desc {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.table-card-content {
  padding: 0 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-card-footer {
  display: flex;
  justify-content: flex-end;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-group-right {
  margin-left: auto;
}

.subclass-name-cell {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  color: #409eff;
  cursor: pointer;
}

.subclass-name-cell.readonly {
  color: #67c23a;
}

.dialog-footer {
  display: flex;
  justify-content: end;
}

@media screen and (max-width: 768px) {
  .toolbar-group-right {
    margin-left: 0;
  }
}
</style>
