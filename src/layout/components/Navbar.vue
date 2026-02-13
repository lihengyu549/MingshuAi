<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container"
      @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />

    <div class="right-menu" :style="right">
      <!-- 添加近期导出记录按钮和下拉菜单 -->
      <template v-if="device !== 'mobile'">
        <!-- 导出记录下拉菜单 -->
        <el-dropdown class="right-menu-item hover-effect export-records-btn" trigger="click"
          @command="handleExportCommand">
          <div @click="showExportDropdown">
            <svg-icon icon-class="download" class="export-icon" />
          </div>
          <el-dropdown-menu slot="dropdown" class="export-dropdown-menu">
            <div class="export-list">
              <div v-if="loading" class="loading-container">
                <i class="el-icon-loading"></i> 加载中...
              </div>
              <div v-else-if="exportRecords.length === 0" class="empty-container">
                暂无导出记录
              </div>
              <div v-else>
                <div v-for="record in exportRecords" :key="record.id" class="export-item"
                  :class="{ 'export-item-completed': record.status === '3' }">
                  <div class="file-icon">
                    <svg-icon icon-class="file" class="icon" />
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ record.fileName }}</div>
                    <div class="file-status">
                      <!-- 正在导出 -->
                      <div v-if="record.status === '2'" class="status-processing">
                        <span>正在导出...</span>
                      </div>
                      <!-- 导出超时 -->
                      <div v-else-if="record.status === '5'" class="status-timeout">
                        导出超时
                      </div>
                      <!-- 导出失败 -->
                      <div v-else-if="record.status === '4'" class="status-failed">
                        导出失败
                      </div>
                      <!-- 导出完成 -->
                      <div v-else-if="record.status === '3'" class="status-completed">
                        <span>{{ record.fileSizeName }} • {{ record.createTime }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="file-action" v-if="record.status === '3'">
                    <el-button type="text" icon="el-icon-download" class="download-btn"
                      @click.stop="downloadFile(record)"></el-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="dropdown-footer">
              <el-button type="text" class="view-all-btn" @click.stop="viewAllRecords" command="viewAll">
                查看完整导出记录 <i class="el-icon-right"></i>
              </el-button>
            </div>
          </el-dropdown-menu>
        </el-dropdown>

      </template>
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="$store.state.user.avatar" class="user-avatar" />
          <div class="user">用户名</div>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu class="el-dropdown-menus" slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import { listAll, downloadById } from "@/api/system/protectTableField"; // 临时注释掉不存在的API

export default {
  data() {
    return {
      right: 'right: 11%;',
      loading: false,
      exportRecords: []
    }
  },
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      },
    }
  },
  mounted() {
  },
  watch() {

  },
  methods: {
    toggleSideBar() {
      if (this.$store.state.app.sidebar.opened) {
        this.right = 'right: 4%;'
      } else {
        this.right = 'right: 11%;'
      }
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      }).catch(() => { });
    },
    showExportDropdown() {
      this.fetchExportRecords()
    },
    async fetchExportRecords() {
      this.loading = true
      try {
        const response = await listAll()
        this.exportRecords = response.data || []
      } catch (error) {
        console.error('获取导出记录失败:', error)
        this.$message.error('获取导出记录失败')
      } finally {
        this.loading = false
      }
    },
    downloadFile(record) {
      // 下载文件逻辑
      try {
        downloadById({
          id: record.id
        }).then(response => {
          // 创建一个Blob对象
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          // 创建一个URL对象
          const url = window.URL.createObjectURL(blob);
          // 创建一个a标签并设置href属性
          const link = document.createElement('a');
          link.href = url;
          link.download = record.fileName; // 设置下载后的文件名
          // 将a标签添加到DOM中
          document.body.appendChild(link);
          // 触发点击事件
          link.click();
          // 移除a标签
          document.body.removeChild(link);
          // 释放URL对象
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.$message.success('导出成功');
        }).catch(error => {
          // 处理下载失败逻辑
          this.$message.error('文件下载失败')
        })
      } catch (error) {
        console.error('下载文件失败:', error)
        this.$message.error('下载文件失败')
      }
    },
    viewAllRecords() {
      this.$router.push({ path: '/exportRecords' })
    },
    handleExportCommand(command) {
      if (command === 'viewAll') {
        this.viewAllRecords()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dropdown-menus {
  z-index: 9999 !important;
}

.pattern .svg-icon {
  width: 20px;
  height: 20px;
  margin: 0 40px 13px 40px;
}

.navbar {
  position: fixed !important;
  z-index: 1000;
  width: 100%;
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #ffffff;
  padding-right: 3%;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    position: absolute;
    right: 11%;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    /* 添加导出记录按钮样式 */
    .export-records-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      .export-icon {
        width: 20px;
        height: 20px;
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        display: flex;
        margin-top: 5px;
        position: relative;

        .user {
          font-size: 14px;
          padding: 0 5px 0 5px;
        }

        .user-avatar {
          margin-top: 8px;
          margin-right: 5px;
          cursor: pointer;
          width: 26px;
          height: 26px;
          border-radius: 50%;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 15px;
          font-size: 12px;
        }
      }
    }
  }
}

/* 导出记录下拉菜单样式 */
.export-dropdown-menu {
  width: 500px;
  padding: 0;
  border-radius: 10px;

  .el-dropdown-menu__item {
    padding: 0;
    border-bottom: none;
  }
}

.export-list {
  max-height: 500px;
  overflow-y: auto;

  .loading-container,
  .empty-container {
    padding: 60px 0;
    text-align: center;
    color: #999999;
    font-size: 14px;
  }

  .export-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 24px;
    transition: background-color 0.2s;
    border-bottom: 1px solid #f5f5f5;

    &:hover {
      background-color: #fafafa;
    }

    &.export-item-completed {
      &:hover {
        background-color: #e6f4ff;
      }
    }

    .file-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background-color: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;

      .icon {
        width: 24px;
        height: 24px;
        color: #1890ff;
      }
    }

    .file-info {
      flex: 1;
      min-width: 0;

      .file-name {
        font-size: 14px;
        color: #000000;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-status {
        font-size: 13px;

        .status-processing {
          color: #666666;

        }

        .status-timeout {
          color: #fa8c16;
        }

        .status-failed {
          color: #f5222d;
        }

        .status-completed {
          color: #999999;
        }
      }
    }

    .file-action {
      margin-left: 12px;
      display: flex;
      align-items: center;

      .download-btn {
        padding: 8px;
        font-size: 18px;
        color: #999999;

        &:hover {
          color: #1890ff;
        }
      }
    }
  }
}

.dropdown-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;

  .view-all-btn {
    color: #1890ff;
    font-size: 14px;
    padding: 0;

    &:hover {
      color: #40a9ff;
    }

    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }
}
</style>