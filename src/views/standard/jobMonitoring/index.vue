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
              <!-- 只在根节点显示齿轮按钮 -->
              <!-- <el-button v-if="isRootNode(data)" type="text" size="large" icon="el-icon-setting"
                @click.stop="goToMenuEdit(data)" style="color: #26244ce0;">
              </el-button> -->
              <svg-icon icon-class="setting" v-if="isRootNode(data)"
                @click.stop="dataSource != '内置' && goToMenuEdit(data)" />
            </span>
          </el-tree>
        </div>
      </el-col>
      <!-- 用户数据部分保持不变 -->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryParams" class="yuanDataClass" size="small" :inline="true"
          v-show="showSearch" label-width="auto">
          <el-form-item label="子类名称" prop="name">
            <el-input v-model="queryParams.name" @input="inputSearch" placeholder="请输入子类名称" clearable
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
          <el-table-column label="子类名称" align="center" prop="attachData" />
          <el-table-column label="安全分级" align="center" prop="securityLevelName" />
          <el-table-column label="建议防护措施" prop="protectMethodName" width="200">
            <!-- 自定义标题样式 -->
            <template slot="header">
              <div style="text-align: center;">建议防护措施</div>
            </template>
            <!-- 内容保持默认靠左 -->
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
          <el-table-column label="数据持有者" align="center" prop="dataOwner" />
          <el-table-column label="确认防护措施" align="center" prop="confirmProtectMethod" width="200">
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
          <el-table-column label="来源" align="center" prop="dataSource">
          </el-table-column>
          <el-table-column label="更新时间" align="center" prop="updateTime" />
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
        <el-form-item class="addSelectClass" prop="minSecurityLevel" label="安全分级">
          <el-select v-model="addOrEditDataRuls.minSecurityLevel" placeholder="全部" :disabled="addOrEdit.flag == 3">
            <el-option v-for="item in dict.type.sys_risk_level" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
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
        <el-form-item v-if="true" class="addSelectClass AiStudesCont" label="特征标签" prop="tags">
          <div class="tagsClass" :style="tagsShow ? heightSmall : heightBig" style="width: 100%;">
            <el-tag v-for="(tag, index) in tags" type="info" size="small" :key="tag + index" class="mx-1"
              :closable="addOrEdit.flag !== 3" @close="handleClose(tag, index)" style="margin: 0 10px;">
              {{ tag }}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputVisible && countIs40" maxlength="10" v-model="inputValue"
              ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm">
            </el-input>
            <el-button v-if="!inputVisible && countIs40 && addOrEdit.flag != 3" class="button-new-tag" size="small"
              @click="showInput">+ 新增</el-button>
          </div>
          <el-button class="button-new-tag" size="small" v-show="tags.length > 10" @click="tagsShow = !tagsShow">{{
            tagsShow ? '展开' : '收起' }}</el-button>
        </el-form-item>
        <Title title="动态安全分级"></Title>
        <el-form-item label="" prop="">
          <!-- 开关：绑定状态 + 变化事件 -->
          <el-switch v-model="addOrEditDataRuls.upgradeRule" @change="handleRuleSwitchChange('upgrade')"
            active-text="升级规则" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <!-- 升级规则表格：绑定假数据 + 开关控制禁用 + 加ref -->
              <el-table ref="upgradeList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.upgradeList" :disabled="!addOrEditDataRuls.upgradeRule"
                @selection-change="handleUpgradeSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" label="规则类型" width="180" />
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
              <!-- 加号按钮：绑定打开弹窗事件，传升级规则类型 -->
              <svg-icon icon-class="plus-circle"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleOpenRuleDialog('upgrade')"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.upgradeRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.upgradeRule ? 1 : 0.5 }" />
              <!-- 删除按钮：绑定删除事件 + 开关控制样式 -->
              <svg-icon icon-class="删除"
                @click="addOrEditDataRuls.upgradeRule && addOrEdit.flag != 3 && handleDeleteRule('upgrade')"
                :disabled="!addOrEditDataRuls.upgradeRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.upgradeRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.upgradeRule ? 1 : 0.5 }" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="" prop="">
          <!-- 开关：绑定状态 + 变化事件 -->
          <el-switch v-model="addOrEditDataRuls.demotionRule" @change="handleRuleSwitchChange('downgrade')"
            active-text="降级规则" :disabled="addOrEdit.flag == 3" />
          <div class="table-with-actions">
            <div class="table-container">
              <!-- 降级规则表格：绑定假数据 + 开关控制禁用 + 加ref -->
              <el-table ref="demotionList" style="margin-top: 10px; width: 100%" size="small"
                :data="addOrEditDataRuls.demotionList" :disabled="!addOrEditDataRuls.demotionRule"
                @selection-change="handleDemotionSelectionChange">
                <el-table-column type="selection" width="45"
                  :selectable="(row, index) => addOrEditDataRuls.demotionRule && addOrEdit.flag != 3" />
                <el-table-column prop="ruleType" label="规则类型" width="180" />
                <el-table-column prop="matchingCondition" label="匹配条件" min-width="180" />
                <el-table-column prop="ruleContent" label="内容" min-width="180" />
                <el-table-column prop="securityLevel" label="安全分级" min-width="180" />
              </el-table>

              <!-- 还原样式的提示条 -->
              <div class="import-format-tip"
                style="margin: 15px 0; padding: 10px; line-height: 1.5; font-size: 12px; color: #666; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px;">
                <i class="el-icon-warning-outline" type="info" />
                降级规则，当同时匹配多条规则时，等级最低规则生效
              </div>
            </div>
            <div class="vertical-actions">
              <!-- 加号按钮：绑定打开弹窗事件，传降级规则类型 -->
              <svg-icon icon-class="plus-circle"
                @click="addOrEditDataRuls.demotionRule && addOrEdit.flag != 3 && handleOpenRuleDialog('downgrade')"
                :disabled="!addOrEditDataRuls.demotionRule || addOrEdit.flag == 3"
                :style="{ cursor: addOrEditDataRuls.demotionRule ? 'pointer' : 'not-allowed', opacity: addOrEditDataRuls.demotionRule ? 1 : 0.5 }" />
              <!-- 删除按钮：绑定删除事件 + 开关控制样式 -->
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
        <!-- 规则类型 -->
        <el-form-item label="规则类型" prop="ruleType">
          <el-select v-model="ruleForm.ruleType" name="ruleType" id="">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 匹配条件 - 根据规则类型动态展示 -->
        <el-form-item label="匹配条件" prop="matchType">
          <el-radio-group v-model="ruleForm.matchType"
            style="width: 220px; display: flex; justify-content: space-between">
            <!-- 升级规则只显示大于 -->
            <el-radio label="greater" v-if="currentRuleType === 'upgrade'">大于等于</el-radio>
            <!-- 降级规则只显示小于 -->
            <el-radio label="less" v-if="currentRuleType === 'downgrade'">小于等于</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 内容 -->
        <el-form-item label="内容" prop="ruleContent">
          <el-input v-model="ruleForm.ruleContent" style="width: 220px" placeholder="请输入数值"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')" />
        </el-form-item>

        <!-- 安全分级 -->
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

      <!-- 弹窗底部按钮：返回 + 保存 -->
      <div slot="footer" class="dialog-footer" style="justify-content: end; gap: 20px">
        <el-button type="primary" plain @click="handleSaveRule">保存</el-button>
        <el-button @click="ruleDialogVisible = false">返回</el-button>
      </div>
    </el-dialog>
    <!-- 数据摸底弹窗 -->
    <Drawer title="数据摸底" v-loading="dataBaselineLoading" :visible.sync="dataBaselineShow" append-to-body>
      <el-form slot="body" ref="dataBaselineForm" :model="dataBaselineForm" label-width="120px" label-position="top">
        <!-- 数据来源 -->
         <Title title="数据来源"></Title>
        <el-form-item label="">
          <span class="label-text">请选择数据的产生方式/获取方式（可多选）</span>
          <el-checkbox-group v-model="dataBaselineForm.dataSources" class="checkbox-two-per-line">
            <el-checkbox label="系统采集" class="checkbox-item">系统采集</el-checkbox>
            <el-checkbox label="系统生产" class="checkbox-item">系统生产</el-checkbox>
            <el-checkbox label="人工填报" class="checkbox-item">人工填报</el-checkbox>
            <el-checkbox label="交换购买" class="checkbox-item">交换购买</el-checkbox>
            <el-checkbox label="共享交换" class="checkbox-item">共享交换</el-checkbox>
            <el-checkbox label="其他" class="checkbox-item">其他</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- 单位间数据流转情况 -->
         <Title title="单位间数据流转情况"></Title>
         <!-- 数据来源单位 -->
        <el-form-item label="数据来源单位">
          <div v-for="(item, index) in dataBaselineForm.dataFlowUnits" :key="index" class="flow-unit-item">
            <el-input v-model="item.unit" placeholder="请输入来源单位" style="width: 300px; margin-right: 10px;"></el-input>
            <el-button @click="handleRemoveFlowUnit(index)" v-if="index > 0" type="text" icon="el-icon-remove-outline"
              style="color: #dcdfe6; font-size: 18px;"></el-button>
          </div>
          <el-button @click="handleAddFlowUnit" type="text" icon="el-icon-plus">添加来源单位</el-button>
        </el-form-item>
        
        <!-- 数据流出单位 -->
        <el-form-item label="数据流出单位">
          <div v-for="(item, index) in dataBaselineForm.dataFlowOutUnits" :key="index" class="flow-unit-item">
            <el-input v-model="item.unit" placeholder="请输入流出单位" style="width: 300px; margin-right: 10px;"></el-input>
            <el-button @click="handleRemoveFlowOutUnit(index)" v-if="index > 0" type="text" icon="el-icon-delete"
              style="color: #dcdfe6; font-size: 18px;"></el-button>
          </div>
          <el-button @click="handleAddFlowOutUnit" type="text" icon="el-icon-plus">添加流出单位</el-button>
        </el-form-item>

        <!-- 与其他数据处理者的交互 -->
         <Title title="与其他数据处理者的交互"></Title>
        <el-form-item label="">
          <el-checkbox v-model="dataBaselineForm.interaction.noInteraction"
            @change="handleNoInteractionChange">无交互</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.interaction.provide"
            :disabled="dataBaselineForm.interaction.noInteraction">对外提供</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.interaction.entrust"
            :disabled="dataBaselineForm.interaction.noInteraction">委托</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.interaction.processTogether"
            :disabled="dataBaselineForm.interaction.noInteraction">与...共同处理</el-checkbox>

          <el-input v-model="dataBaselineForm.interaction.provideInput" placeholder="对外提供内容"
            v-if="dataBaselineForm.interaction.provide"></el-input>
          <el-input v-model="dataBaselineForm.interaction.entrustInput" placeholder="委托内容"
            v-if="dataBaselineForm.interaction.entrust"></el-input>
          <el-input v-model="dataBaselineForm.interaction.processTogetherInput" placeholder="共同处理内容"
            v-if="dataBaselineForm.interaction.processTogether"></el-input>
        </el-form-item>

        <!-- 数据存储位置-云类型 -->
        <el-form-item label="云类型">
          <el-checkbox v-model="dataBaselineForm.storage.cloud.noCloud" @change="handleNoCloudChange">无</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.privateCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">私有云</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.publicCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">公有云</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.hybridCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">混合云</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.otherCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">其他云</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.cloud.edgeCloud"
            :disabled="dataBaselineForm.storage.cloud.noCloud">边缘计算平台</el-checkbox>

          <el-input v-model="dataBaselineForm.storage.cloud.privateCloudInput" placeholder="私有云内容"
            v-if="dataBaselineForm.storage.cloud.privateCloud"></el-input>
          <el-input v-model="dataBaselineForm.storage.cloud.publicCloudInput" placeholder="公有云内容"
            v-if="dataBaselineForm.storage.cloud.publicCloud"></el-input>
          <el-input v-model="dataBaselineForm.storage.cloud.hybridCloudInput" placeholder="混合云内容"
            v-if="dataBaselineForm.storage.cloud.hybridCloud"></el-input>
          <el-input v-model="dataBaselineForm.storage.cloud.otherCloudInput" placeholder="其他云内容"
            v-if="dataBaselineForm.storage.cloud.otherCloud"></el-input>
          <el-input v-model="dataBaselineForm.storage.cloud.edgeCloudInput" placeholder="边缘计算平台内容"
            v-if="dataBaselineForm.storage.cloud.edgeCloud"></el-input>
        </el-form-item>

        <!-- 数据存储位置-机房类型 -->
        <el-form-item label="机房类型">
          <el-checkbox v-model="dataBaselineForm.storage.room.noRoom" @change="handleNoRoomChange">无</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.room.ownRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">本单位机房</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.room.foreignRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">外单位机房</el-checkbox>
          <el-checkbox v-model="dataBaselineForm.storage.room.thirdPartyRoom"
            :disabled="dataBaselineForm.storage.room.noRoom">第三方托管机房</el-checkbox>

          <el-input v-model="dataBaselineForm.storage.room.ownRoomInput" placeholder="本单位机房内容"
            v-if="dataBaselineForm.storage.room.ownRoom"></el-input>
          <el-input v-model="dataBaselineForm.storage.room.foreignRoomInput" placeholder="外单位机房内容"
            v-if="dataBaselineForm.storage.room.foreignRoom"></el-input>
          <el-input v-model="dataBaselineForm.storage.room.thirdPartyRoomInput" placeholder="第三方托管机房内容"
            v-if="dataBaselineForm.storage.room.thirdPartyRoom"></el-input>
        </el-form-item>

        <!-- 数据存储位置-存储地域 -->
        <el-form-item label="存储地域">
          <el-checkbox-group v-model="dataBaselineForm.storage.region">
            <el-checkbox label="境内">境内</el-checkbox>
            <el-checkbox label="境外">境外</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <div slot="footer" style="text-align: right;">
        <el-button @click="handleReset">返回</el-button>
        <el-button type="primary" plain @click="handleSubmit">确认</el-button>
      </div>
    </Drawer>
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
  dicts: ['sys_risk_level'],
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
      inputVisible: false,
      countIs40: true,// 数量是否小于40
      tagsShow: false,
      inputValue: '',
      categoryName: '',
      debounceTimeout: null,//防抖动
      treeOptions: [],
      protectMethodIdList: [],
      confirmProtectMethodList: [],
      addOrEdit: {
        title: '新增',
        show: false,
        flag: 1,// 1新增 2编辑 3查看
      },
      treeLoading: false,
      tags: [],
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
        dataOwner: [
          { required: true, message: "请选择数据持有者", trigger: "blur" },
        ],
        attachData: [
          { required: true, message: "请输入子类名称", trigger: "blur" }
        ],
        tags: [
          { validator: this.tagsRlues, trigger: 'blur', required: true, }
        ]
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
        dataSource: '',
      },
      dataSource: '',
      addOrEditDataRuls: {
        additional: '',
        attachData: '',
        categoryId: '',
        minSecurityLevel: null,
        dataOwner: '',
        upgradeRule: '',
        downgradeRule: '',
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
      ruleDialogVisible: false, // 弹窗显示状态
      currentRuleType: '', // 标记当前是「升级」还是「降级」规则：'upgrade'/'downgrade'
      ruleForm: { // 弹窗表单数据
        matchType: 'greater', // 匹配类型：'greater'大于/'less'小于
        ruleType: '1',
        ruleContent: '', // 内容数值
        securityLevel: '' // 安全分级
      },
      options: [
        {
          value: '1',
          label: '数据量级'
        },
      ],
      currentRuleType: '', // 记录当前是升级还是降级规则
      currentBaseSecurityLevel: null, // 当前行的安全分级基准值
      dataBaselineShow: false, // 数据摸底弹窗显示状态
      dataBaselineLoading: false, // 数据摸底弹窗loading状态
      dataBaselineForm: {
        dataSources: [], // 数据来源
        dataFlowUnits: [{ unit: '' }], // 单位间数据流转-来源单位
        dataFlowOutUnits: [{ unit: '' }], // 单位间数据流转-流出单位
        interaction: {
          noInteraction: false,
          provide: false,
          entrust: false,
          processTogether: false,
          provideInput: '',
          entrustInput: '',
          processTogetherInput: ''
        },
        storage: {
          cloud: {
            noCloud: false,
            privateCloud: false,
            publicCloud: false,
            hybridCloud: false,
            otherCloud: false,
            edgeCloud: false,
            privateCloudInput: '',
            publicCloudInput: '',
            hybridCloudInput: '',
            otherCloudInput: '',
            edgeCloudInput: ''
          },
          room: {
            noRoom: false,
            ownRoom: false,
            foreignRoom: false,
            thirdPartyRoom: false,
            ownRoomInput: '',
            foreignRoomInput: '',
            thirdPartyRoomInput: ''
          },
          region: [] // 存储地域
        }
      },
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
        if (val.length >= 40) {
          this.countIs40 = false
          this.$modal.msgWarning("学习内容最多定义40个标签");
        } else {
          this.countIs40 = true
        }
        if (val.length >= 10) {
          this.tagsShow = false
        } else {
          this.tagsShow = true
        }
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
    /**
   * 打开新增规则弹窗
   * @param {String} type 规则类型：'upgrade'升级/'downgrade'降级
   */
    handleOpenRuleDialog(type) {
      this.currentRuleType = type;
      // 记录当前的安全分级作为基准值
      this.currentBaseSecurityLevel = this.addOrEditDataRuls.minSecurityLevel;

      // 初始化表单
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

        // 1. 先执行所有校验逻辑
        if (!this.ruleForm.ruleContent.trim()) {
          this.$message.warning('请输入数值');
          return;
        }
        const content = Number(this.ruleForm.ruleContent);
        if (isNaN(content)) {
          this.$message.warning('请输入有效的数字');
          return;
        }

        // 获取升级和降级规则的数值列表
        const upgradeValues = this.addOrEditDataRuls.upgradeList.map(item => Number(item.ruleContent));
        const demotionValues = this.addOrEditDataRuls.demotionList.map(item => Number(item.ruleContent));

        // 升级规则校验：不能小于降级表格中的最大值
        if (this.currentRuleType === 'upgrade') {
          if (demotionValues.length > 0) {
            const maxDemotion = Math.max(...demotionValues);
            if (content <= maxDemotion) {
              this.$message.warning(`升级数值不能小于等于降级表格中的最大值(${maxDemotion})`);
              return;
            }
          }
        }

        // 降级规则校验：不能大于升级表格中的最小值
        if (this.currentRuleType === 'downgrade') {
          if (upgradeValues.length > 0) {
            const minUpgrade = Math.min(...upgradeValues);
            if (content >= minUpgrade) {
              this.$message.warning(`降级数值不能大于等于升级表格中的最小值(${minUpgrade})`);
              return;
            }
          }
        }

        // 2. 所有校验通过后，再执行保存逻辑
        // 处理匹配条件文本
        const matchText = this.ruleForm.matchType === 'greater' ? '大于等于' : '小于等于';

        // 构造表格所需数据格式
        const newRule = {
          ruleType: this.ruleForm.ruleType,
          matchingCondition: matchText,
          ruleContent: this.ruleForm.ruleContent,
          securityLevel: this.ruleForm.securityLevel
        };

        // 根据规则类型插入对应表格
        if (this.currentRuleType === 'upgrade') {
          this.addOrEditDataRuls.upgradeList.push(newRule);
        } else if (this.currentRuleType === 'downgrade') {
          this.addOrEditDataRuls.demotionList.push(newRule);
        }

        // 关闭弹窗并提示
        this.ruleDialogVisible = false;
        this.$message.success('规则新增成功');
      });
    },

    /**
     * 删除升降级规则
     * @param {String} type 规则类型：'upgrade'/'downgrade'
     */
    handleDeleteRule(type) {
      // 开关关闭时禁止删除
      const isSwitchOpen = type === 'upgrade' ? this.addOrEditDataRuls.upgradeRule : this.addOrEditDataRuls.demotionRule;
      if (!isSwitchOpen) {
        this.$message.warning('请先打开对应规则的开关');
        return;
      }

      // 获取选中的行
      const selection = type === 'upgrade' ? this.selectedUpgradeRows : this.selectedDemotionRows;

      if (selection.length === 0) {
        this.$message.warning('请先选择要删除的规则');
        return;
      }

      // 确认删除
      this.$confirm(`确定删除选中的 ${selection.length} 条规则吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 获取要删除的规则内容（用于在原数组中查找）
        const contentsToDelete = selection.map(item => item.ruleContent);

        // 过滤掉要删除的规则
        if (type === 'upgrade') {
          this.addOrEditDataRuls.upgradeList = this.addOrEditDataRuls.upgradeList.filter(
            item => !contentsToDelete.includes(item.ruleContent)
          );
          // 清除选中状态
          this.selectedUpgradeRows = [];
        } else {
          this.addOrEditDataRuls.demotionList = this.addOrEditDataRuls.demotionList.filter(
            item => !contentsToDelete.includes(item.ruleContent)
          );
          // 清除选中状态
          this.selectedDemotionRows = [];
        }

        // 清除表格选中状态
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
      const tableRef = type === 'upgrade' ? 'upgradeList' : 'demotionRule';
      const isSwitchOpen = type === 'upgrade' ? this.upgradeRule : this.demotionRule;

      // 开关关闭时清空表格选择
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
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        if (this.tags.includes(inputValue)) {
          this.$message({ message: '该标签已存在', type: 'warning' })
        } else {
          this.tags.push(inputValue);
        }
      }
      this.inputVisible = false;
      this.inputValue = '';
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
        downgradeRule: false, // 重置为默认值false
        upgradeList: [], // 清空升级规则列表
        demotionList: [], // 清空降级规则列表
      }
      this.addOrEditDataRuls.dataOwner = this.$store.state.user.name
      this.tagsShow = true
      this.tags = []
      this.addNodeName = ''
    },
    /** 新增确定方法 */
    async addSubmitForm() {
      this.$refs["addOrEdit"].validate(async (valid) => {
        let params = {
          attachData: this.addOrEditDataRuls.attachData,
          categoryId: this.addOrEditDataRuls.categoryId,
          minSecurityLevel: this.addOrEditDataRuls.minSecurityLevel,
          attachDescribe: this.addOrEditDataRuls.additional,
          featureLabel: this.tags.join(),
          confirmProtectMethod: this.addOrEditDataRuls.confirmProtectMethod.join(),
          dataOwner: this.addOrEditDataRuls.dataOwner,
          protectMethod: this.addOrEditDataRuls.minSecurityLevel,
          upgradeRule: this.addOrEditDataRuls.upgradeRule ? '1' : '0',
          demotionRule: this.addOrEditDataRuls.demotionRule ? '1' : '0',
          upgradeList: this.addOrEditDataRuls.upgradeList,
          demotionList: this.addOrEditDataRuls.demotionList
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
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addOrEditDataRuls.confirmProtectMethod = Array.isArray(row.confirmProtectMethod)
        ? row.confirmProtectMethod
        : (row.confirmProtectMethod ? row.confirmProtectMethod.split(',') : []);
      this.addOrEdit.show = true
      this.addOrEdit.title = '编辑'
      this.addNodeName = row.owner
      this.tagsShow = false
      this.$set(this.addOrEditDataRuls, 'additional', row.attachDescribe)
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
      this.tags = row.featureLabel ? row.featureLabel.split(',') : []
      this.addNodeName = row.owner
      this.addOrEdit.show = true
      this.addOrEdit.title = '查看'
      this.tagsShow = false
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
      this.resetQuery()
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
    // tags 关闭方法
    handleClose(tag, index) {
      this.tags.splice(index, 1);
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
      this.dataBaselineShow = true
      // this.dataBaselineForm = row
    },
    // 处理无交互复选框变化
    handleNoInteractionChange(val) {
      if (val) {
        this.dataBaselineForm.interaction.provide = false;
        this.dataBaselineForm.interaction.entrust = false;
        this.dataBaselineForm.interaction.processTogether = false;
      }
    },
    // 处理无云复选框变化
    handleNoCloudChange(val) {
      if (val) {
        this.dataBaselineForm.storage.cloud.privateCloud = false;
        this.dataBaselineForm.storage.cloud.publicCloud = false;
        this.dataBaselineForm.storage.cloud.hybridCloud = false;
        this.dataBaselineForm.storage.cloud.otherCloud = false;
        this.dataBaselineForm.storage.cloud.edgeCloud = false;
      }
    },
    // 处理无机房复选框变化
    handleNoRoomChange(val) {
      if (val) {
        this.dataBaselineForm.storage.room.ownRoom = false;
        this.dataBaselineForm.storage.room.foreignRoom = false;
        this.dataBaselineForm.storage.room.thirdPartyRoom = false;
      }
    },
    // 添加来源单位
    handleAddFlowUnit() {
      this.dataBaselineForm.dataFlowUnits.push({ unit: '' });
    },
    // 删除来源单位llll
    handleRemoveFlowUnit(index) {
      if (index > 0) {
        this.dataBaselineForm.dataFlowUnits.splice(index, 1);
      }
    },
    // 添加流出单位
    handleAddFlowOutUnit() {
      this.dataBaselineForm.dataFlowOutUnits.push({ unit: '' });
    },
    // 删除流出单位
    handleRemoveFlowOutUnit(index) {
      if (index > 0) {
        this.dataBaselineForm.dataFlowOutUnits.splice(index, 1);
      }
    },
    // 提交表单
    handleSubmit() {
      this.$refs.dataBaselineForm.validate((valid) => {
        if (valid) {
          console.log('表单提交', this.dataBaselineForm);
          // 这里可以添加提交到后端的逻辑
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },
    // 重置表单
    handleReset() {
      this.dataBaselineShow = false
      this.$refs.dataBaselineForm.resetFields();
      // 重置自定义的数组等数据
      this.dataBaselineForm.dataFlowUnits = [{ unit: '' }];
      this.dataBaselineForm.dataFlowOutUnits = [{ unit: '' }];
    }
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

.label-text {
  color: #8f97a1;
  font-size: 12px;
}
</style>