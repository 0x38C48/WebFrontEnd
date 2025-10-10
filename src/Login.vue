<template>
  <div class="login-container">
    <div class="login-wrapper">
      <el-image style="height: 60px; margin-left:107px;" src="/山大logo.png"/>
      <div class="login-hd">学生信息管理系统</div>
      <el-form :model="loginReq" class="login-form" label-width="120px">
        <!--<div class="login-title">用户登录</div>-->
        <el-form-item label="用户名">
          <el-input v-model="loginReq.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="loginReq.password" placeholder="请输入密码 " style="margin-bottom: 0;"/>
        </el-form-item>
        <el-form-item>
          <el-link type="primary" class="register-link" @click="">还没有账号？点此注册</el-link>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="loginSubmit()">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { container } from '~/inverfiy.config';
import { ID_APP_PRESENTER, ID_LOGIN_SERVICE } from '~/types';
import { AppPresenter } from "~/infrastructure/presenters/app-presenter";
import { reactive } from 'vue'
import { LoginRequest } from './infrastructure/models/login';
//const loginReq: LoginRequest = reactive({ username: '2022030001', password: '123456', code: '' });
const loginReq: LoginRequest = reactive({ username: 'admin', password: '123456', code: '' });

const appPresenter = container.get<AppPresenter>(ID_APP_PRESENTER);
const loginSubmit = async () => {
  await appPresenter.enterApp(loginReq);
};

</script>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e6f0fa 0%, #f0f5f7 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  margin: auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  min-width: 400px;
  max-width: 450px;
}

.login-form {
  width: 95%;
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-form :deep(.el-form-item__label) {
  color: #2c3e50;
  font-weight: 600;
}

.login-form :deep(.el-input) {
  border: none;
  box-shadow: none;
  background: transparent;
}

.login-form :deep(.el-input__inner) {
  border-radius: 8px;
  border: 2px solid #e1e8ed;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.login-form :deep(.el-form-item) {
  border: none;
  margin-bottom: 20px;
}

.login-button {
  margin-right: 40px;
  margin-top: 0px;
  width: 60%;
  height: 45px;
  border-radius: 8px;
  background: #771010;
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.register-link {
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 120px;
  font-size: smaller;
}

/* 添加一些动画效果 */
.login-wrapper {
  animation: slideIn 0.6s ease-out;
}
.login-hd{
  text-align: center;
  font-family: "微软雅黑";
  font-weight: bold;
  font-size: 28px;
  color: #771010;
  margin-bottom: 30px;
  margin-top: 10px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
