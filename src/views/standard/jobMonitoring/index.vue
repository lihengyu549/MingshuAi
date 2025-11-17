<template>
  <div class="app-container" v-loading="Loading">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-select v-model="queryParams.categoryId" class="serachInput" @change="treeOptionsSelectChange"
            placeholder="全部" style="margin-bottom: 20px" filterable>
            <el-option v-for="item in treeOptions" :key="item.id" :label="item.categoryName" :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="head-container" v-loading="treeLoading">
          <el-input v-model="filterName" placeholder="搜索树节点..." clearable size="mini" style="margin-bottom: 20px;" />
          <el-tree :indent="8" :data="categoryList" :props="defaultProps" :default-expanded-keys="[treeID]"
            :current-node-key="treeID" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree"
            node-key="id" highlight-current @node-click="handleNodeClick">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span class="node-label" :title="node.label">{{ node.label }}</span>
              <svg-icon icon-class="setting" v-if="isRootNode(data)"
                @click.stop="dataSource != '内置' && goToMenuEdit(data)" />
            </span>
          </el-tree>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="false"
          v-show="showSearch" label-width="auto">
          <el-form-item label="子类名称" prop="name">
            <el-input v-model="queryParams.name" @input="inputSearch" placeholder="请输入类名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="确认防护措施" prop="confirmProtectMethod">
            <el-select v-model="queryParams.confirmProtectMethod" @change="selectProjectIdChange" multiple
              placeholder="全部">
              <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
                :value="item.dictLabel">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="来源" prop="dataSourceId">
            <el-select v-model="queryParams.dataSourceId" clearable @change="dataSourceIdIdChange" placeholder="全部"
              :loading="loading">
              <el-option v-for="item in sourceList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="安全分级" prop="levelId">
            <el-select v-model="queryParams.levelId" @change="selectProjectIdChange" multiple placeholder="全部">
              <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="dataOwner" label="数据持有者">
            <el-select v-model="queryParams.dataOwner" @change="selectProjectIdChange" clearable placeholder="全部">
              <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="直属父类" prop="baseParent">
            <el-input v-model="queryParams.baseParent" @input="inputSearch" placeholder="请输入父类名称" clearable
              @keyup.enter.native="handleQuery" />
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" :disabled="dataSource === '内置'" size="medium"
              @click="addFn">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-close" :disabled="dataSource === '内置'" size="medium"
              @click="enabledFn('删除')">删除</el-button>
          </el-col>
        </el-row>
        <el-table v-loading="loading" :data="protectTableFieldList" height="650px" ref="tableRef" class="tableBox">
          <template slot="empty">
            <el-empty description="暂无数据"></el-empty>
          </template>
          <el-table-column type="selection" width="60" align="center">
          </el-table-column>
          <el-table-column label="子类名称" align="left" width="140" prop="attachData" show-overflow-tooltip />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" show-overflow-tooltip />
          <el-table-column label="建议防护措施" prop="protectMethodName" width="200">
            <template slot="header">
              <div style="text-align: center;">建议防护措施</div>
            </template>
            <template slot-scope="scope">
              <el-tag class="tagsBox custom-plain-tag" v-for="(item, index) in scope.row.protectMethodNameList"
                :key="item + index" :style="{
                  '--tag-color': colorFn(item),
                  '--tag-rgb': hexToRgb(colorFn(item))
                }" plain>
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数据持有者" align="center" prop="dataOwner" show-overflow-tooltip />
          <el-table-column label="确认防护措施" prop="confirmProtectMethod" width="200">
            <template slot="header">
              <div style="text-align: center;">确认防护措施</div>
            </template>
            <template slot-scope="scope">
              <el-tag class="tagsBox custom-plain-tag" v-for="item in scope.row.confirmProtectMethodList" :key="item"
                :style="{
                  '--tag-color': colorFn(item),
                  '--tag-rgb': hexToRgb(colorFn(item))
                }" plain>
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="来源" align="center" prop="dataSource" show-overflow-tooltip />
          <el-table-column label="直属父类" align="center" prop="baseParent" show-overflow-tooltip />
          <el-table-column label="操作" align="center" width="180">
            <template slot-scope="scope">
              <el-button type="text" size="medium"
                :disabled="(scope.row.dataSource === '内置' || scope.row.dataOwner !== $store.state.user.name) && !$store.state.user.roles.includes('ROLE_ADMIN')"
                @click="editFn(scope.row)">编辑</el-button>
              <el-button type="text" size="medium" @click="lookFn(scope.row)">查看</el-button>
              <el-button type="text" size="medium" @click="dataFn(scope.row)">数据摸底</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>
    <!-- 新增编辑框 -->
    <Drawer :title="addOrEdit.title" v-loading="importDataLoading" :visible.sync="addOrEdit.show" append-to-body
      :close-on-click-modal="addOrEdit.flag == 3">
      <el-form slot="body" :model="addOrEditDataRuls" size="medium" v-if="addOrEdit.show" :rules="addOrEditRules"
        ref="addOrEdit" label-width="120px" label-position="top">
        <Title title="基本信息"></Title>
        <el-row>
          <el-col :span="12">
            <el-form-item label="子类名称" prop="attachData">
              <el-input v-model="addOrEditDataRuls.attachData" :disabled="addOrEdit.flag == 3"
                @input="sonNameTestingFn(addOrEditDataRuls.attachData)" maxlength="50" placeholder="请输入子类名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item class="addSelectClass" prop="dataOwner" label="数据持有者">
              <el-select v-model="addOrEditDataRuls.dataOwner" placeholder="全部" :disabled="addOrEdit.flag == 3">
                <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.userName">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item class="addSelectClass" label="所属父类" prop="categoryId">
          <el-select ref="addSelectRef" v-model="addNodeName" :disabled="addOrEdit.flag == 3" filterable
            :filter-method="handleAddSelectInput">
            <el-option style="height: 100%; padding: 0" value="">
              <el-tree :data="categoryList" filterable :props="defaultProps" :expand-on-click-node="true"
                :filter-node-method="filterNode" ref="treeSelect" node-key="id" highlight-current
                @node-click="addHandleNodeClick" />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="子类描述" prop="additional">
          <el-input v-model="addOrEditDataRuls.additional" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }"
            :disabled="addOrEdit.flag == 3" maxlength="500"
            placeholder="个人财产按 “有形 / 无形”“动产 / 不动产” 可分为四大类，每类财产的信息描述需包含独特维度"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item class="addSelectClass" prop="minSecurityLevel" label="安全分级">
              <el-select v-model="addOrEditDataRuls.minSecurityLevel" placeholder="全部" :disabled="addOrEdit.flag == 3">
                <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="attributeType" label="属性类型">
              <el-select v-model="addOrEditDataRuls.attributeType" placeholder="全部" :disabled="addOrEdit.flag == 3">
                <el-option v-for="item in dict.type.sys_attribute_type" :key="item.value" :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <Title title="安全防护"></Title>
        <el-form-item class="addSelectClass" prop="minSecurityLevel" label="建议防护措施">
          <el-select v-model="addOrEditDataRuls.minSecurityLevel" :disabled="true" placeholder="全部">
            <el-option v-for="item in protectMethodIdList" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictValue">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="addSelectClass" prop="confirmProtectMethod" label="确认防护措施">
          <el-select v-model="addOrEditDataRuls.confirmProtectMethod" multiple placeholder="全部"
            :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in confirmProtectMethodList" :key="item.dictValue" :label="item.dictLabel"
              :value="item.dictLabel">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="true" class="addSelectClass AiStudesCont" label="主题词表" prop="tags">
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
              @click="showInput('tags')">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="tags.length > 10" @click="tagsShow = !tagsShow">{{
            tagsShow ? '展开' : '收起' }}</el-button>
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

        <Title title="动态安全分级"></Title>
        <el-form-item label="" prop="">
          <el-switch v-model="addOrEditDataRuls.upgradeRule" @change="handleRuleSwitchChange('upgrade')"
            active-text="升级规则" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <el-table ref="upgradeList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.upgradeList" :disabled="!addOrEditDataRuls.upgradeRule"
                @selection-change="handleUpgradeSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" label="规则类型" width="180">
                  <template slot-scope="scope">
                    {{ getRuleTypeLabel(scope.row.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="matchingCondition" label="匹配条件" min-width="180" />
                <el-table-column prop="ruleContent" label="内容" min-width="180" />
                <el-table-column prop="securityLevel" label="安全分级" min-width="180" />
              </el-table>
              <div class="import-format-tip"
                style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px;">
                <i class="el-icon-warning-outline" type="info" />
                升级规则，当同时匹配多条规则时，等级最高规则生效
              </div>
            </div>
            <div class="vertical-actions">
              <svg-icon icon-class="plus-circle"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleOpenRuleDialog('upgrade')"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.upgradeRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.upgradeRule ? 1 : 0.5 }" />
              <svg-icon icon-class="删除"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleDeleteRule('upgrade')"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.upgradeRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.upgradeRule ? 1 : 0.5 }" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="" prop="">
          <el-switch v-model="addOrEditDataRuls.demotionRule" @change="handleRuleSwitchChange('downgrade')"
            active-text="降级规则" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <el-table ref="demotionList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.demotionList" :disabled="!addOrEditDataRuls.demotionRule"
                @selection-change="handleDemotionSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.demotionRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" label="规则类型" width="180">
                  <template slot-scope="scope">
                    {{ getRuleTypeLabel(scope.row.ruleType) }}
                  </template>
                </el-table-column>
                <el-table-column prop="matchingCondition" label="匹配条件" min-width="180" />
                <el-table-column prop="ruleContent" label="内容" min-width="180" />
                <el-table-column prop="securityLevel" label="安全分级" min-width="180" />
              </el-table>
              <div class="import-format-tip"
                style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px;">
                <i class="el-icon-warning-outline" type="info" />
                降级规则，当同时匹配多条规则时，等级最低规则生效
              </div>
            </div>
            <div class="vertical-actions">
              <svg-icon icon-class="plus-circle"
                @click="addOrEditDataRuls.demotionRule && addOrEdit.flag != 3 && handleOpenRuleDialog('downgrade')"
                :disabled="!addOrEditDataRuls.demotionRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.demotionRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.demotionRule ? 1 : 0.5 }" />
              <svg-icon icon-class="删除"
                @click="addOrEditDataRuls.demotionRule && addOrEdit.flag != 3 && handleDeleteRule('downgrade')"
                :disabled="!addOrEditDataRuls.demotionRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.demotionRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.demotionRule ? 1 : 0.5 }" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" plain v-if="addOrEdit.flag == 1 || addOrEdit.flag == 2" @click="addSubmitForm">确
          定</el-button>
        <el-button @click="addCancel">取 消</el-button>
      </div>
    </Drawer>
    <!-- 新增规则弹窗-->
    <el-dialog class="addRuler" title="新增规则" :visible.sync="ruleDialogVisible" width="580px"
      :close-on-click-modal="false" :show-close="false">
      <el-form :model="ruleForm" ref="ruleForm" label-width="100px" class="rule-dialog-form" size="medium"
        label-position="top" :rules="dialogRules">
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="ruleForm.ruleType" name="ruleType" id="">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="匹配条件" prop="matchType">
          <el-radio-group v-model="ruleForm.matchType"
            style="width: 220px; display: flex; justify-content: space-between">
            <el-radio label="greater" v-if="currentRuleType === 'upgrade'">大于等于</el-radio>
            <el-radio label="less" v-if="currentRuleType === 'downgrade'">小于等于</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="内容" prop="ruleContent">
          <el-input v-model="ruleForm.ruleContent" style="width: 220px" placeholder="请输入数值"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
        </el-form-item>

        <el-form-item label="安全分级" prop="securityLevel">
          <el-select v-model="ruleForm.securityLevel" style="width: 220px" placeholder="请选择">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
              :value="item.value" :disabled="!filterSecurityLevels(item)">
              <template #default>
                <span>
                  {{ item.label }}
                  <span v-if="!filterSecurityLevels(item)" style="color: #999; margin-left: 8px; font-size: 12px;">
                    ({{ currentRuleType === 'upgrade' ? '需大于当前等级' : '需小于当前等级' }})
                  </span>
                </span>
              </template>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" style="justify-content: end; gap: 20px">
        <el-button type="primary" plain @click="handleSaveRule">保存</el-button>
        <el-button @click="ruleDialogVisible = false">返回</el-button>
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
  dicts: ['sys_risk_level', 'sys_attribute_type'],
  data() {
    return {
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
        title: '新增',
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      treeLoading: false,
      // 表单校验
      addOrEditRules: {
        categoryId: [
          {
            required: true, message: "请选择所属父级", trigger: "blur"
          }
        ],
        minSecurityLevel: [
          { required: true, message: "请选择安全分级", trigger: "blur" },
        ],
        attributeType: [
          { required: true, message: "请选择属性类型", trigger: "blur" },
        ],
        dataOwner: [
          { required: true, message: "请选择数据持有者", trigger: "blur" },
        ],
        attachData: [
          { required: true, message: "请输入子类名称", trigger: "blur" }
        ],
        tags: [
          { validator: this.tagsRlues, trigger: 'blur', required: true, }
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
          { required: true, message: '请选择规则类型', trigger: 'blur' }
        ],
        matchType: [
          { required: true, message: '请选择匹配条件', trigger: 'blur' }
        ],
        ruleContent: [
          { required: true, message: '请输入内容', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!/^\d+$/.test(value)) {
                callback(new Error('请输入有效的数字'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        securityLevel: [
          { required: true, message: '请选择安全分级', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!this.currentBaseSecurityLevel) {
                callback();
                return;
              }

              if (this.currentRuleType === 'upgrade' && value <= this.currentBaseSecurityLevel) {
                callback(new Error('升级规则的安全分级必须大于等于当前安全分级'));
              } else if (this.currentRuleType === 'downgrade' && value >= this.currentBaseSecurityLevel) {
                callback(new Error('降级规则的安全分级必须小于等于当前安全分级'));
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
        levelId: [],//安全级别，
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
      showSearch: true,
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
          label: '数据量级'
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
  },
  methods: {
    // 处理标签变化的通用方法
    handleTagChange(val, type) {
      if (val.length >= 40) {
        this[`${type}CountIs40`] = false;
        this.$modal.msgWarning(`${this.getTagName(type)}最多定义40个标签`);
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
        'tags': '特征标签',
        'coreTopic': '核心主题词',
        'entryTerm': '入口词',
        'relatedTerms': '关联词',
        'reverseRef': '反向参照'
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
        return item.value > this.currentBaseSecurityLevel;
      } else if (this.currentRuleType === 'downgrade') {
        return item.value < this.currentBaseSecurityLevel;
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
          this.$message.warning('请输入数值');
          return;
        }
        const content = Number(this.ruleForm.ruleContent);
        if (isNaN(content)) {
          this.$message.warning('请输入有效的数字');
          return;
        }

        const upgradeValues = this.addOrEditDataRuls.upgradeList.map(item => Number(item.ruleContent));
        const demotionValues = this.addOrEditDataRuls.demotionList.map(item => Number(item.ruleContent));

        if (this.currentRuleType === 'upgrade') {
          if (demotionValues.length > 0) {
            const maxDemotion = Math.max(...demotionValues);
            if (content <= maxDemotion) {
              this.$message.warning(`升级数值不能小于等于降级表格中的最大值(${maxDemotion})`);
              return;
            }
          }
        }

        if (this.currentRuleType === 'downgrade') {
          if (upgradeValues.length > 0) {
            const minUpgrade = Math.min(...upgradeValues);
            if (content >= minUpgrade) {
              this.$message.warning(`降级数值不能大于等于升级表格中的最小值(${minUpgrade})`);
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
        this.$message.success('规则新增成功');
      });
    },

    /**
     * 删除升降级规则
     * @param {String} type 规则类型：'upgrade'/'downgrade'
     */
    handleDeleteRule(type) {
      const isSwitchOpen = type === 'upgrade' ? this.addOrEditDataRuls.upgradeRule : this.addOrEditDataRuls.demotionRule;
      if (!isSwitchOpen) {
        this.$message.warning('请先打开对应规则的开关');
        return;
      }

      const selection = type === 'upgrade' ? this.selectedUpgradeRows : this.selectedDemotionRows;

      if (selection.length === 0) {
        this.$message.warning('请先选择要删除的规则');
        return;
      }

      this.$confirm(`确定删除选中的 ${selection.length} 条规则吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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

        this.$message.success('规则删除成功');
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


    // 判断是否为根节点
    isRootNode(data) {
      return data.parentId === 0 || !data.parentId;
    },

    // 跳转到菜单编辑页面
    goToMenuEdit(data) {
      this.$router.push({
        path: '/editMenu',
        query: { id: data.id }
      });
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
    colorFn(item) {
      switch (item) {
        case '加密':
          return '#70b503';
        case 'DLP':
          return '#0600ff';
        case '脱敏':
          return '#f59b22';
        case '无保护':
          return '#409eff';
        case '空':
          return '#909399';
        default:
          return '#909399';
      }
    },
    hexToRgb(hex) {
      if (!hex || typeof hex !== 'string' || hex.length !== 7 || hex[0] !== '#') {
        return '0, 0, 0';
      }
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
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
        callback(new Error("特征标签需要至少填写5个！"));
      } else {
        callback();
      }
    },
    addFn() {
      this.addOrEdit.flag = 1
      this.addOrEdit.title = '新增'
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
          featureLabel: this.tags.join(),
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
            this.$modal.msgError("子类名称重复,请更改");
            this.importDataLoading = false
            return
          }
          if (this.addOrEditDataRuls.id != null) {
            params.id = this.addOrEditDataRuls.id
            editAttachData(params).then((response) => {
              this.$modal.msgSuccess("修改成功");
              this.getList();
              this.addOrEdit.show = false
              this.importDataLoading = false
            })
              .catch((err) => {
                this.importDataLoading = false
              })
          } else {
            addAttachData(params).then((response) => {
              this.$modal.msgSuccess("新增成功");
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
      this.addOrEditDataRuls = {}
      this.addOrEdit.show = false
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
    async editFn(row) {
      this.addOrEdit.flag = 2
      this.addOrEditDataRuls = JSON.parse(JSON.stringify(row))
      this.addOrEditDataRuls.upgradeRule = row.upgradeRule == '1' ? true : false
      this.addOrEditDataRuls.demotionRule = row.demotionRule == '1' ? true : false
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.addOrEditDataRuls.attributeType = row.attributeType
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addOrEditDataRuls.confirmProtectMethod = Array.isArray(row.confirmProtectMethod)
        ? row.confirmProtectMethod
        : (row.confirmProtectMethod ? row.confirmProtectMethod.split(',') : []);
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
      this.addNodeName = row.owner
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
        this.$message({ message: '获取子类表格数据失败', type: 'warning' })
      }
    },
    async lookFn(row) {
      this.addOrEdit.flag = 3
      this.addOrEditDataRuls = row
      this.addOrEditDataRuls.upgradeRule = row.upgradeRule == '1' ? true : false
      this.addOrEditDataRuls.demotionRule = row.demotionRule == '1' ? true : false
      this.addOrEditDataRuls.additional = row.attachDescribe
      this.addOrEditDataRuls.minSecurityLevel = row.minSecurityLevel + ''
      this.addOrEditDataRuls.attributeType = row.attributeType
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addNodeName = row.owner
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
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
        this.$message({ message: '获取子类表格数据失败', type: 'warning' })
      }
    },
    messsucc(res, flag) {
      this.$message.success(`${res.msg},${flag}${res.data}个`)
    },
    enabledFn(flag) {
      let dataS = this.$refs.tableRef.selection
      if (dataS && dataS.length > 0) {
        this.$confirm(`确定批量${flag}吗`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = dataS.map(item => {
            return item.id
          })
          let data = {
            ids: ids.join(',')
          }
          if (flag == '启用') {
            data.enable = true
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else if (flag == '禁用') {
            data.enable = false
            attachStatus(data).then(res => {
              if (res.code == 200) {
                this.messsucc(res, flag)
                this.handleQuery();
              }
            })
          } else if (flag == '删除') {
            for (let item of dataS) {
              if (item.dataSource === '内置') {
                this.$message({
                  type: 'warning',
                  message: '内置数据源不允许删除',
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
            this.$message({ message: '未知异常', type: 'warning' })
          }
        }).catch(() => {

        });
      } else {
        this.$message({ message: '请选择至少一条数据', type: 'warning' })
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
          this.categoryList = this.handleTree(tempList, "id")
          this.categoryListEdit = this.handleTree(tempList, "id")
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
    dataFn(row) {
      console.log('row', row);
      this.$router.push({
        path: '/dataMapping',
        query: { row: row }
      });
    },
  },
};
</script>

<style scoped>
.el-popup-parent--hidden /deep/ .el-loading-mask {
  background: "rgba(0, 0, 0, 0.7)" !important;
}

.addMsg /deep/ .el-input--medium {
  width: 237px;
}

.success {
  color: #67c23a;
}

.error {
  color: #f56c6c;
}

.el-tree-node /deep/ .el-tree-node {
  display: none;
}

.serachInput {
  width: 100%;
  margin-right: 10px;

  input {
    height: 28px !important;
    line-height: 28px !important;
  }
}

.importForm /deep/ .el-form-item--medium {
  width: 70%;

}

.importForm /deep/ .el-form-item__content {
  width: calc(100% - 145px);
}

.uploadClass {
  width: 20% !important;
}

.addSelectClass /deep/ .el-select {
  width: calc(100%);
}

.tableBox {
  overflow-y: auto;
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

.AiStudesCont /deep/ .el-form-item__content {
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

.searchBtn /deep/ .el-form-item__content {
  margin-left: 225px
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

.tagsBox {
  /* border: none; */
  /* color: white; */
  /* border: none; */
  /* justify-content: space-between; */
}

/* 自定义plain标签样式 */
::v-deep .custom-plain-tag {
  /* 使用CSS变量设置颜色 */
  color: var(--tag-color) !important;
  border-color: var(--tag-color) !important;
  /* 背景色使用RGB值加透明度实现浅色效果 */
  background-color: rgba(var(--tag-rgb), 0.1) !important;
  margin-right: 5px;
}

/* 去除默认hover样式干扰 */
::v-deep .custom-plain-tag:hover {
  background-color: rgba(var(--tag-rgb), 0.15) !important;
}

.addNode {
  input {
    height: 23px;
    line-height: 23px;
  }
}

.node-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  line-height: 28px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* 表格与按钮组容器 */
.table-with-actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  justify-content: space-evenly;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 右侧竖排按钮组样式 */
.vertical-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
  font-size: 20px;
}

/* 按钮提示样式 */
.vertical-actions .el-button {
  position: relative;
}

.vertical-actions .el-button:hover::after {
  content: attr(tooltip);
  position: absolute;
  right: 30px;
  white-space: nowrap;
  background: #333;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.table-container {
  width: 100%;
}

.addRuler /deep/.el-dialog__header {
  padding: 20px;
  background-color: rgb(230, 242, 255);
  font-weight: 600;
}

.addRuler /deep/ .el-input--medium,
.el-select {
  width: 100% !important;
}

/* 新增规则弹窗表单样式 */
.rule-dialog-form {
  margin: 20px;
}

.rule-dialog-form /deep/ .el-form-item {
  margin-bottom: 25px;
}

/* 弹窗按钮样式调整 */
.rule-dialog-form /deep/ .el-radio {
  margin-right: 30px;
}

.dialog-footer {
  padding: 15px 0;
}

.checkbox-two-per-line {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkbox-item {
  margin-right: 0 !important;
}
</style>