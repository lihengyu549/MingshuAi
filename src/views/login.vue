<template>
  <div class="login">
    <!-- 登录容器 -->
    <div class="login-container">
      <!-- 登录标题 -->
      <h2 class="login-title">登录</h2>
      <p class="login-desc">请使用您的账号信息登录</p>

      <!-- 替换为Element UI的el-tabs组件 -->
      <el-tabs v-model="loginType" class="login-tabs" tab-position="top" stretch="true">
        <el-tab-pane label="账户密码登录" name="account"></el-tab-pane>
        <el-tab-pane label="手机号登录" name="phone"></el-tab-pane>
      </el-tabs>

      <!-- 登录表单 -->
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" label-width="80px"
        label-position="top">
        <!-- 用户名输入（保留icon和label） -->
        <el-form-item prop="username" label="用户名" v-if="loginType === 'account'">
          <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="请输入用户名"
            class="login-input">
            <svg-icon slot="prefix" icon-class="account" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>

        <!-- 手机号输入（保留label和icon） -->
        <el-form-item prop="phone" label="手机号" v-if="loginType === 'phone'">
          <el-input v-model="loginForm.phone" type="text" auto-complete="off" placeholder="请输入手机号" class="login-input">
            <svg-icon slot="prefix" icon-class="phone" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>

        <!-- 密码输入（保留icon和label） -->
        <el-form-item prop="password" label="密码" v-if="loginType === 'account'">
          <el-input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" auto-complete="off"
            placeholder="请输入密码" class="login-input" @keyup.enter.native="handleLogin">
            <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
            <!-- 新增：小眼睛图标（后置） -->
            <svg-icon slot="suffix" :icon-class="showPassword ? 'eye-open' : 'eye'"
              class="el-input__icon input-icon" @click="showPassword = !showPassword" style="cursor: pointer" />
          </el-input>
        </el-form-item>

        <!-- 验证码输入（修复布局：用el-row/el-col替代flex，适配label-position="top"） -->
        <el-form-item prop="smsCode" label="验证码" v-if="loginType === 'phone'">
          <el-row :gutter="8">
            <el-col :span="16">
              <el-input v-model="loginForm.smsCode" type="text" auto-complete="off" placeholder="请输入验证码"
                class="login-input" @keyup.enter.native="handleLogin">
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
            </el-col>
            <el-col :span="8">
              <el-button type="text" class="get-sms-btn" :disabled="smsDisabled" @click="getSmsCode">
                {{ smsText }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="login-btn-item" :label-width="0">
          <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
// 如需对接真实短信接口，可在此导入短信发送API
// import { sendSmsCode } from "@/api/login";

export default {
  name: "Login",
  data() {
    return {
      // 登录类型：account-账户密码登录，phone-手机号登录（与el-tabs的name对应）
      loginType: "account",
      // 登录表单数据
      loginForm: {
        username: "",
        password: "",
        phone: "",
        smsCode: "",
        rememberMe: false
      },
      // 登录表单验证规则
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入用户名" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入密码" }
        ],
        phone: [
          { required: true, trigger: "blur", message: "请输入手机号" },
          { pattern: /^1[3-9]\d{9}$/, trigger: "blur", message: "请输入正确的手机号" }
        ],
        smsCode: [
          { required: true, trigger: "blur", message: "请输入验证码" },
          { pattern: /^\d{6}$/, trigger: "blur", message: "请输入6位验证码" }
        ]
      },
      // 加载状态
      loading: false,
      // 短信验证码相关
      smsDisabled: false,
      smsText: "获取验证码",
      smsCountdown: 60,
      showPassword: false  // 新增：控制密码显示/隐藏的状态变量
    };
  },
  created() {
    // 从Cookie中读取记住的登录信息
    this.getCookie();
  },
  methods: {
    // 从Cookie获取记住的登录信息
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      if (username && password && rememberMe) {
        this.loginForm = {
          ...this.loginForm,
          username,
          password: decrypt(password),
          rememberMe: Boolean(rememberMe)
        };
      }
    },
    // 获取短信验证码（如需对接真实接口，可在此完善逻辑）
    getSmsCode() {
      // 先验证手机号
      this.$refs.loginForm.validateField("phone", (error) => {
        if (!error) {
          // 模拟短信发送成功，开始倒计时
          this.smsDisabled = true;
          this.smsText = `${this.smsCountdown}s后重新获取`;
          const countdownTimer = setInterval(() => {
            this.smsCountdown--;
            this.smsText = `${this.smsCountdown}s后重新获取`;
            if (this.smsCountdown <= 0) {
              clearInterval(countdownTimer);
              this.smsDisabled = false;
              this.smsText = "获取验证码";
              this.smsCountdown = 60;
            }
          }, 1000);
          // 真实场景下调用短信接口
          // sendSmsCode(this.loginForm.phone).then(res => {
          //   this.$message.success("验证码已发送至您的手机");
          // }).catch(err => {
          //   clearInterval(countdownTimer);
          //   this.smsDisabled = false;
          //   this.smsText = "获取验证码";
          //   this.smsCountdown = 60;
          //   this.$message.error(err.message || "验证码发送失败");
          // });
        }
      });
    },
    // 处理登录逻辑
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          // 处理记住密码逻辑
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set("rememberMe", this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          // 调用登录接口（根据登录类型传参）
          const loginParams = this.loginType === "account"
            ? { username: this.loginForm.username, password: this.loginForm.password }
            : { phone: this.loginForm.phone, smsCode: this.loginForm.smsCode };
          this.$store
            .dispatch("Login", loginParams)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" }).catch(() => { });
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
/* 登录页整体样式 */
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 登录容器样式 */
.login-container {
  width: 400px;
  padding: 40px 30px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

/* 登录标题样式 */
.login-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  text-align: center;
}

/* 登录描述样式 */
.login-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: #86909c;
  text-align: center;
}

/* el-tabs样式调整（匹配原设计） */
.login-tabs {
  margin-bottom: 24px;
}

/* 激活标签样式 */
::v-deep .el-tabs__item.is-active {
  color: #1890ff !important;
}

/* 激活标签下划线 */
::v-deep .el-tabs__active-bar {
  background-color: #1890ff !important;
}

/* 未激活标签样式 */
::v-deep .el-tabs__item {
  font-size: 16px;
  font-weight: 500;
  color: #86909c;
}

/* 登录表单样式（清理冗余后保留核心） */
::v-deep .login-form .el-form-item__label {
  padding: 0;
  /* label与输入框间距 */
  font-size: 14px;
  color: #1d2129;
}

/* 输入框前缀icon样式 */
.input-icon {
  height: 39px;
  width: 14px;
  color: #1890ff;
  margin-left: 2px;
}

/* 输入框样式 */
.login-input {
  width: 100%;
  height: 38px;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.login-input:focus {
  border-color: #1890ff;
  outline: none;
}

/* 获取验证码按钮样式（适配el-col布局） */
.get-sms-btn {
  width: 100%;
  height: 38px;
  padding: 0;
  font-size: 14px;
  color: #1890ff;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  text-align: center;
}

.get-sms-btn:disabled {
  color: #c9cdcf;
  cursor: not-allowed;
}

/* 登录按钮样式 */
.login-btn-item {
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  height: 38px;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  background-color: #1890ff;
  border-color: #1890ff;
}

.login-btn:hover,
.login-btn:focus {
  background-color: #096dd9;
  border-color: #096dd9;
}

/* 加载中按钮样式调整 */
::v-deep .login-btn.is-loading .el-loading-spinner {
  margin-right: 8px;
}
</style>