<template>
  <el-dialog class="custom-dialog" title="选择目录文件" :visible.sync="visible" width="950px" append-to-body
    @close="handleClose" :close-on-click-modal="false">
    <div class="file-transfer-container">
      <!-- 顶部面包屑和显示模式 -->
      <div class="header-bar">
        <div class="path-nav">
          <div style="background-color: #e9f1ff; padding: 3px; border-radius: 4px; margin-right: 5px;">
            <svg-icon iconClass="home" style="color: #409EFF; font-size: 16px;"></svg-icon>
          </div>
          <span class="path-text">{{ currentPathDisplay }}</span>
        </div>
        <div class="display-mode">
          <span class="mode-label">显示模式</span>
          <el-select v-model="displayMode" size="small" @change="handleModeChange" style="width: 140px;">
            <el-option label="仅显示目录" value="dir"></el-option>
            <el-option label="显示目录和文件" value="all"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 穿梭框主体 -->
      <div class="transfer-body">
        <!-- 左侧面板 -->
        <div class="panel left-panel" v-loading="leftLoading">
          <div class="panel-header">
            <el-input v-model="leftSearch" placeholder="请输入搜索内容" size="small" clearable></el-input>
            <el-button size="small" :disabled="pathStack.length === 0" @click="goUp">上级</el-button>
          </div>
          <div class="panel-list">
            <el-checkbox-group v-model="leftChecked">
              <div v-for="item in filteredLeftList" :key="item.path" class="list-item">
                <div class="item-left">
                  <el-checkbox :label="item.path"><span style="display:none"></span></el-checkbox>
                  <span class="item-name" :class="{ 'is-dir': item.type === 'Directory' }"
                    @click="item.type === 'Directory' ? handleDirClick(item) : null">
                    {{ item.fileName }}
                  </span>
                </div>
                <div class="item-right">{{ item.type === 'Directory' ? '目录' : '文件' }}</div>
              </div>
              <el-empty v-if="filteredLeftList.length === 0" description="暂无数据" :image-size="60"></el-empty>
            </el-checkbox-group>
          </div>
        </div>

        <!-- 中间操作按钮 -->
        <div class="center-btn">
          <el-button type="primary" icon="el-icon-arrow-right" @click="moveToRight"
            :disabled="leftChecked.length === 0"></el-button>
        </div>

        <!-- 右侧面板 -->
        <div class="panel right-panel">
          <div class="panel-header">
            <el-input v-model="rightSearch" placeholder="请输入搜索内容" size="small" clearable></el-input>
            <el-button size="small" type="danger" plain @click="deleteFromRight"
              :disabled="rightChecked.length === 0">删除</el-button>
          </div>
          <div class="panel-list">
            <el-checkbox-group v-model="rightChecked">
              <div v-for="item in filteredRightList" :key="item.filePath" class="list-item">
                <div class="item-left">
                  <el-checkbox :label="item.filePath"><span style="display:none"></span></el-checkbox>
                  <span class="item-name" :class="{ 'is-dir': (item.fileType || item.type) === 'Directory' }">{{
                    item.fileName }}</span>
                </div>
                <div class="item-right">{{ (item.fileType || item.type) === 'Directory' ? '目录' : '文件' }}</div>
              </div>
              <el-empty v-if="filteredRightList.length === 0" description="暂无数据" :image-size="60"></el-empty>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getScannedContentByFileServer } from "@/api/system/protectCategory";

export default {
  name: 'FileDirectoryTransfer',
  data() {
    return {
      visible: false,
      displayMode: 'all', // 'dir' 或 'all'

      leftSearch: '',
      rightSearch: '',

      leftLoading: false,
      leftList: [], // 当前层级的列表
      rightList: [], // 已选择的列表

      leftChecked: [],
      rightChecked: [],

      // 保存从父组件传来的表单参数
      formParams: {},

      // 路径栈，存储每一层的 name
      pathStack: [],
    };
  },
  computed: {
    // 顶部面包屑路径展示：起始路径 + 后续下钻的路径
    currentPathDisplay() {
      let base = this.formParams.startingPath || '';
      if (this.pathStack.length === 0) return base;

      let suffix = this.pathStack.join('/');
      if (base.endsWith('/')) {
        return base + suffix;
      } else {
        return base + (base ? '/' : '') + suffix;
      }
    },
    // 左侧前端搜索过滤
    filteredLeftList() {
      let list = this.leftList;

      // 显示模式改为前端过滤：dir 仅显示目录，all 显示目录和文件
      if (this.displayMode === 'dir') {
        list = list.filter(item => (item.fileType || item.type) === 'Directory');
      }

      if (!this.leftSearch) return list;
      const lowerSearch = this.leftSearch.toLowerCase();
      return list.filter(item => item.fileName.toLowerCase().includes(lowerSearch));
    },
    // 右侧前端搜索过滤
    filteredRightList() {
      if (!this.rightSearch) return this.rightList;
      const lowerSearch = this.rightSearch.toLowerCase();
      return this.rightList.filter(item => item.fileName.toLowerCase().includes(lowerSearch));
    }
  },
  methods: {
    // 暴露给父组件调用的打开方法
    open(initialSelected = [], requestParams = {}) {
      this.visible = true;
      // 保存表单传过来的参数
      this.formParams = requestParams;

      // 重置状态
      this.pathStack = [];
      this.leftSearch = '';
      this.rightSearch = '';
      this.leftChecked = [];
      this.rightChecked = [];
      // 渲染右侧已选数据
      this.rightList = JSON.parse(JSON.stringify(initialSelected));

      this.fetchData();
    },

    handleClose() {
      this.visible = false;
    },

    handleConfirm() {
      this.$emit('confirm', this.rightList);
      this.visible = false;
    },

    handleModeChange() {
      // 切换显示模式时只做前端过滤，不再请求后端
      this.leftChecked = [];
    },

    // 点击目录名字下钻
    handleDirClick(item) {
      this.pathStack.push(item.fileName);
      this.leftChecked = []; // 清空选中
      this.fetchData();
    },

    // 返回上一级
    goUp() {
      if (this.pathStack.length === 0) return;
      this.pathStack.pop();
      this.leftChecked = [];
      this.fetchData();
    },

    // 移到右侧
    moveToRight() {
      const selectedItems = this.leftList.filter(item => this.leftChecked.includes(item.path));
      selectedItems.forEach(item => {
        // 避免重复添加 (基于 path 判断)
        const exists = this.rightList.find(r => r.filePath === item.path);
        if (!exists) {
          // 存入 { fileName, fileType, filePath } 格式给后端使用
          this.rightList.push({
            fileName: item.fileName,
            fileType: item.fileType || item.type,
            filePath: item.path
          });
        }
      });
      this.leftChecked = [];
    },

    // 从右侧删除
    deleteFromRight() {
      this.rightList = this.rightList.filter(item => !this.rightChecked.includes(item.filePath));
      this.rightChecked = [];
    },

    // 获取列表数据
    async fetchData() {
      this.leftLoading = true;
      try {
        // 请求参数：表单填写的四个参数 + 动态计算出来的当前路径
        const requestPayload = {
          targetIp: this.formParams.targetIp,
          targetPort: this.formParams.targetPort,
          targetUserName: this.formParams.targetUserName,
          targetUserPassword: this.formParams.targetUserPassword,
          targetDatabase: this.currentPathDisplay,  // 将起始路径和下钻拼接后的完整路径传给后端
          databaseType: this.formParams.databaseType,
          share: this.formParams.share,
        };

        const res = await getScannedContentByFileServer(requestPayload);
        let listData = res.data || [];

        // 为了能在左侧多选时唯一标识每一项，我们给每一个 数据拼上当前完整 path
        let currentPrefixPath = this.currentPathDisplay;
        // 保证拼接时的格式，如果最后不是/就加一个
        if (!currentPrefixPath.endsWith('/')) {
          currentPrefixPath += '/';
        }

        this.leftList = listData.map(item => {
          return {
            ...item,
            path: currentPrefixPath + item.fileName
          }
        });

      } catch (error) {
        console.error(error);
        this.$message.error('获取目录失败');
      } finally {
        this.leftLoading = false;
      }
    },

    // 生成假数据方法（后续接入真实接口后可删除）
    generateMockData(depth) {
      let mockData = [];
      if (depth === 0) {
        mockData = [
          { fileName: 'CNSEC-安全服务', type: 'Directory' },
          { fileName: 'ZTNA-零信任网络接入', type: 'Directory' },
          { fileName: 'Filestore', type: 'Directory' },
          { fileName: 'jianghaixin', type: 'Directory' },
          { fileName: 'test', type: 'Directory' },
          { fileName: 'readme.txt', type: 'File' },
          { fileName: 'CASB.pdf', type: 'File' },
          { fileName: 'app', type: 'Directory' }
        ];
      } else {
        const currentPrefix = this.pathStack[this.pathStack.length - 1] || 'dir';
        mockData = [
          { fileName: currentPrefix + '的子目录_A', type: 'Directory' },
          { fileName: currentPrefix + '的子目录_B', type: 'Directory' },
          { fileName: '数据报表.xlsx', type: 'File' },
          { fileName: '配置文件.json', type: 'File' }
        ];
      }

      // 根据显示模式过滤
      if (this.displayMode === 'dir') {
        return mockData.filter(item => item.type === 'Directory');
      }
      return mockData;
    }
  }
};
</script>

<style scoped lang="scss">
::v-deep.custom-dialog {
  .el-dialog {
    border-radius: 10px;
  }

  .el-dialog__header {
    border-bottom: 1px solid #e6e6e6;
  }

  .el-dialog__body {
    padding: 15px;
  }
}

.file-transfer-container {
  display: flex;
  flex-direction: column;
  height: 680px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
  margin-bottom: 15px;

  .path-nav {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606266;

    .path-separator {
      margin: 0 8px;
      color: #C0C4CC;
    }

    .path-text {
      color: #303133;
    }
  }

  .display-mode {
    display: flex;
    align-items: center;
    font-size: 14px;

    .mode-label {
      margin-right: 10px;
      color: #606266;
    }
  }
}

.transfer-body {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;

  .panel {
    flex: 1;
    border: 1px solid #EBEEF5;
    border-radius: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .panel-header {
      padding: 10px 15px;
      border-bottom: 1px solid #EBEEF5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .panel-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px 0;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #C0C4CC;
        border-radius: 3px;
      }

      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 15px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #F5F7FA;
        }

        .item-left {
          display: flex;
          align-items: center;
          flex: 1;
          overflow: hidden;

          ::v-deep .el-checkbox {
            margin-right: 10px;
          }

          .item-name {
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #303133;

            &.is-dir {
              color: #409EFF;
              cursor: pointer;
              font-weight: 500;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }

        .item-right {
          font-size: 13px;
          color: #909399;
          margin-left: 15px;
        }
      }
    }
  }

  .center-btn {
    padding: 0 20px;

    .el-button {
      padding: 12px;
      font-size: 16px;
      border-radius: 8px;
    }
  }
}
</style>
