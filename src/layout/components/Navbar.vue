<template>
  <div class="navbar">
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />

    <div class="navbar-children" v-if="navbarChildren.length > 0">
      <router-link v-for="item in navbarChildren" :key="item.path" class="navbar-child-item"
        :to="{ path: item.path, query: item.query, fullPath: item.fullPath }">
        {{ item.meta ? item.meta.title : item.title }}
      </router-link>
    </div>

    <div class="right-menu">
      <!-- 添加近期导出记录按钮和下拉菜单 -->
      <template v-if="device !== 'mobile'">
        <!-- 导出记录下拉菜单 - 小铃铛 -->
        <el-dropdown class="right-menu-item hover-effect export-records-btn" trigger="click"
          @command="handleExportCommand">
          <div class="bell-wrapper" @click="showExportDropdown">
            <svg-icon icon-class="download" class="export-icon" />
            <span class="notification-dot"></span>
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

        <!-- 设置下拉菜单 -->
        <el-dropdown class="right-menu-item hover-effect settings-btn" trigger="click">
          <div class="settings-wrapper">
            <i class="el-icon-s-tools settings-icon"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="settings-dropdown-menu">
            <el-dropdown-item class="settings-item">
              <i class="el-icon-s-tools settings-item-icon"></i>
              <span>通用设置</span>
            </el-dropdown-item>
            <el-dropdown-item class="settings-item">
              <i class="el-icon-s-help settings-item-icon"></i>
              <span>语言 / Language</span>
            </el-dropdown-item>
            <el-dropdown-item class="settings-item settings-item-danger" divided>
              <i class="el-icon-refresh-left settings-item-icon danger"></i>
              <span>恢复初始配置</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <!-- 用户头像下拉菜单 -->
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <div class="user-avatar-circle">
            <i class="el-icon-user"></i>
          </div>
        </div>
        <el-dropdown-menu class="user-dropdown-menu" slot="dropdown">
          <!-- 用户信息区域 -->
          <div class="user-info-header">
            <!-- <div class="user-avatar-orange">AU</div> -->
            <img :src="$store.state.user.projectData.img" style="width: 40px; height: 40px; border-radius: 50%;" />
            <div class="user-details">
              <div class="user-name">{{ $store.state.user.name }}</div>
              <div class="user-email">{{ $store.state.user.projectData.email }}</div>
            </div>
          </div>
          <router-link to="user/profile">
            <el-dropdown-item class="user-menu-item" divided>
              <i class="el-icon-user user-menu-icon"></i>
              <span>个人中心</span>
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item class="user-menu-item user-menu-item-danger" divided @click.native="logout">
            <i class="el-icon-switch-button user-menu-icon danger"></i>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TopNav from '@/components/TopNav'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import { listAll, downloadById } from "@/api/system/protectTableField";

export default {
  data() {
    return {
      loading: false,
      exportRecords: []
    }
  },
  components: {
    TopNav,
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
      'device',
      'sidebarRouters'
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
    },
    navbarChildren() {
      return this.$store.state.tagsView.navbarChildren || []
    }
  },
  watch: {
    $route() {
      this.updateNavbarChildren()
    }
  },
  mounted() {
    this.updateNavbarChildren()
  },
  methods: {
    updateNavbarChildren() {
      const currentPath = this.$route.path
      const sidebarRouters = this.sidebarRouters

      for (const route of sidebarRouters) {
        const result = this.findNavbarChildren(route, currentPath)
        if (result) {
          this.$store.dispatch('tagsView/setNavbarChildren', result)
          return
        }
      }
      this.$store.dispatch('tagsView/clearNavbarChildren')
    },
    findNavbarChildren(route, currentPath, parentPath = '') {
      if (!route || !route.children) return null

      const fullParentPath = parentPath

      for (const child of route.children) {
        if (!child) continue

        const childPath = child.path.startsWith('/') ? child.path : '/' + child.path
        let fullChildPath
        if (fullParentPath) {
          if (fullParentPath.endsWith('/')) {
            fullChildPath = fullParentPath + child.path
          } else {
            fullChildPath = fullParentPath + '/' + child.path
          }
        } else {
          fullChildPath = childPath
        }

        if (child.children && child.children.length > 0) {
          if (child.meta && child.meta.hideChildrenInNavbar) {
            const childHasGrandchildren = child.children.some(grandChild => grandChild.children && grandChild.children.length > 0)
            if (childHasGrandchildren) {
              const grandChild = child.children.find(gc => gc.children && gc.children.length > 0)
              if (grandChild) {
                const grandChildPath = fullChildPath + '/' + grandChild.path
                if (currentPath === grandChildPath || currentPath.startsWith(grandChildPath + '/')) {
                  return grandChild.children
                }
              }
            }

            if (currentPath === fullChildPath || currentPath.startsWith(fullChildPath + '/')) {
              return child.children
            }
          }
          const nestedResult = this.findNavbarChildren(child, currentPath, fullChildPath)
          if (nestedResult) return nestedResult
        }

        if (currentPath === fullChildPath || currentPath.startsWith(fullChildPath + '/')) {
          if (route.meta && route.meta.hideChildrenInNavbar && child.children) {
            return child.children
          }
        }
      }
      return null
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
      try {
        downloadById({
          id: record.id
        }).then(response => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = record.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.loading = false;
          this.$message.success('导出成功');
        }).catch(error => {
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
  width: calc(100% - 260px);
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e6e8ee;
  border-left: 1px solid #e6e8ee;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  left: 260px;

  .navbar-children {
    display: flex;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
    padding: 10px 0px 10px 40px;

    .navbar-child-item {
      display: inline-flex;
      align-items: center;
      height: 100%;
      padding: 0 15px;
      color: #738192;
      font-size: 14px;
      text-decoration: none;
      transition: all 0.3s;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      box-sizing: border-box;

      &:hover {
        background-color: #f8fafc;
        color: #1e293b;
      }

      &.router-link-active {
        background-color: #eff6ff;
        color: #3b82f6;
      }
    }
  }

  .export-records-btn {
    overflow: visible !important;
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
    margin-left: auto;
    margin-right: 30px;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      height: 40px;
      width: 40px;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: middle;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;
        border-radius: 8px;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    /* 导出记录按钮样式 - 小铃铛 */
    .export-records-btn {
      .bell-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;

        .export-icon {
          width: 22px;
          height: 22px;
          color: #6b7280;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: #ef4444;
          border-radius: 50%;
        }
      }
    }

    /* 设置按钮样式 */
    .settings-btn {
      .settings-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;

        .settings-icon {
          font-size: 22px;
          color: #6b7280;
        }
      }
    }

    /* 用户头像样式 */
    .avatar-container {
      margin-right: 0;

      .avatar-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;

        .user-avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #eff6ff;
          border: 2px solid #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s;

          &:hover {
            border-color: #93c5fd;
          }

          .el-icon-user {
            font-size: 18px;
            color: #60a5fa;
          }
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

/* 设置下拉菜单样式 */
.settings-dropdown-menu {
  width: 200px;
  padding: 8px;
  border-radius: 12px;

  .settings-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;

    &:hover {
      background-color: #f9fafb;
    }

    &.el-dropdown-menu__item--divided {
      position: relative;
      margin-top: 0;
      border-top: 1px solid #f0f0f0;

      &::before {
        display: none;
      }
    }

    .settings-item-icon {
      font-size: 18px;
      color: #6b7280;

      &.danger {
        color: #f97316;
      }
    }

    .language-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #3b82f6;
      background-color: #eff6ff;
      border-radius: 4px;
    }

    &.settings-item-danger {
      color: #f97316;
    }
  }
}

/* 用户下拉菜单样式 */
.user-dropdown-menu {
  width: 220px;
  padding: 8px;
  border-radius: 12px;

  .user-info-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;


    .user-details {
      flex: 1;

      .user-name {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 2px;
      }

      .user-email {
        font-size: 12px;
        color: #3b82f6;
      }
    }
  }

  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;

    &:hover {
      background-color: #f9fafb;
    }

    &.el-dropdown-menu__item--divided {
      position: relative;
      margin-top: 0;
      border-top: 1px solid #f0f0f0;

      &::before {
        display: none;
      }
    }

    .user-menu-icon {
      font-size: 18px;
      color: #9ca3af;

      &.danger {
        color: #ef4444;
      }
    }

    &.user-menu-item-danger {
      color: #ef4444;

      &:hover {
        background-color: #fef2f2;
      }
    }
  }
}

/* 侧边栏收起时的响应式样式 */
.sidebarHide .navbar {
  width: 100% !important;
  max-width: 100% !important;
  left: 0 !important;
}

.mobile .navbar {
  width: 100% !important;
  max-width: 100% !important;
  left: 0 !important;
}
</style>