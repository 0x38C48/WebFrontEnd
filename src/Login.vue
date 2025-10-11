<template>
  <div class="login-container">
    <div class="login-wrapper">
      <el-image style="height: 60px; margin-left:107px;" src="/山大logo.png"/>
      <div class="login-hd">学生信息管理系统</div>
      <el-form :model="loginReq" class="login-form" label-width="120px" >
        <!--<div class="login-title">用户登录</div>-->
        <el-form-item label="用户名">
          <el-input v-model="loginReq.username" placeholder="请输入用户名" class="login-input" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="loginReq.password" placeholder="请输入密码 " style="margin-bottom: 0;" class="login-input"/>
        </el-form-item>
        <el-form-item>
          <el-link type="primary" class="forget-link" @click="toForgetPassword()">忘记密码</el-link>
          <span color="#409EFF">|</span>
          <el-link type="primary" class="register-link" @click="toRegister()">点此注册</el-link>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="loginSubmit()" :loading="isLoading">{{ isLoading ? '登录中...' : '登录' }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div class="register-dialog" rule="">
    <el-dialog class="register-dialog" title="用户注册" v-model="dialogVisible" v-show="dialogVisible">
      <el-form :model="registerReq" :rules="registerRules" ref="registerFormRef" class="register-form" label-width="120px" style="margin-top: 20px">
        <el-form-item label="用户名" prop="username" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="registerReq.username" placeholder="请输入用户名" class="register-input"/>
        </el-form-item>
        <el-form-item label="密码" prop="password" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input type="password" v-model="registerReq.password" placeholder="请输入密码 " style="margin-bottom: 0;" class="register-input"/>
        </el-form-item>
        <el-form-item label="真实姓名" prop="perName" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="registerReq.perName" placeholder="请输入真实姓名" class="register-input" />
        </el-form-item>
        <el-form-item label="角色" prop="role" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-select v-model="registerReq.role" placeholder="请选择角色" style="width: 250px">
            <el-option label="学生" value="学生"></el-option>
            <el-option label="教师" value="教师"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="验证码" prop="code" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="registerReq.code" placeholder="请输入验证码（验证码功能尚等待完善）" class="register-input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-button" @click="registerSubmit()">注册</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, ElForm } from 'element-plus'
import { container } from '~/inverfiy.config';
import { ID_APP_PRESENTER, ID_LOGIN_SERVICE } from '~/types';
import { AppPresenter } from "~/infrastructure/presenters/app-presenter";
import {RegisterServiceImpl} from "~/infrastructure/services/register-service-impl";
import {reactive, ref, nextTick}from 'vue'
import { LoginRequest } from './infrastructure/models/login';
import { RegisterRequest } from './infrastructure/models/register';
//const loginReq: LoginRequest = reactive({ username: '2022030001', password: '123456', code: '' });
const loginReq: LoginRequest = reactive({ username: 'admin', password: '123456', code: '' });
//const registerReq: RegisterRequest = reactive({ username: '', password: '', perName: '', role: '', code: '' });
//开发中预置registerReq的值来调试：
const registerReq: RegisterRequest = reactive({ username: '202400002222', password: '123456', perName: '测试', role: '学生', code: '' });
const dialogVisible = ref(false);
const registerFormRef = ref<InstanceType<typeof ElForm>>()

const registerRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { len: 12, message: '用户名须为12位学号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度在 6 到 18 个字符', trigger: 'blur' },
  ],
  perName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '真实姓名长度在 2 到 10 个字符', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
  // code: [
  //   { required: true, message: '请输入验证码', trigger: 'blur' },
  //   { len: 6, message: '验证码长度为 6 个字符', trigger: 'blur' },
  // ],
})

const appPresenter = container.get<AppPresenter>(ID_APP_PRESENTER);
const isLoading = ref(false);
const loginSubmit = async () => {
  try {
    isLoading.value = true;
    await appPresenter.enterApp(loginReq);
  } catch (error) {
    console.error('登录失败:', error);
    ElMessage.error('登录失败，请重试');
  } finally {
    isLoading.value = false;
  }
};
const toRegister = () =>{
  // 重置表单数据
  registerReq.username = '202400002222';
  registerReq.password = '123456';
  registerReq.perName = '测试';
  registerReq.role = '学生';
  registerReq.code = '';

  dialogVisible.value = true;

  // 清除校验信息，确保在对话框渲染完成后执行
  nextTick(() => {
    registerFormRef.value?.resetFields();
  });

  ElMessage.info('正在开发注册')
}

const toForgetPassword = () => {
  ElMessage.info('正在开发忘记密码');
}

//以下：点击注册键后的注册表单提交
const registerSubmit = async () => {
  if (!registerFormRef.value) return
  const valid = await registerFormRef.value.validate();
  if (valid) {
    const registerReq1 = {...registerReq};
    if(registerReq.role === '学生')
      registerReq1.role = 'STUDENT';
    if(registerReq.role === '教师')
      registerReq1.role = 'TEACHER';
    ElMessage.info('正在开发注册')
    // 待填充注册逻辑
    const registerService = new RegisterServiceImpl();
    await registerService.register(registerReq1);
  } else {
    ElMessage.error('请检查输入信息')
  }
}


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

.login-input {
  width: 250px;
}

.el-form-item__content {
  display: flex;
  justify-content: center;
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
  margin-left: 10px;
  font-size: smaller;
}

.forget-link {
  margin: 0 10px 0 20px;
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

.register-dialog :deep(.el-dialog){
  margin-top: 200px;
  max-width: 90%;
  border-radius: 12px;
  width: 480px;
  min-height: 435px;
  font-family: 微软雅黑,serif;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.register-button{
  justify-self: center;
  margin-top: 20px;
  width: 60%;
  height: 40px;
  border-radius: 8px;
  background: #771010;
  border: none;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.register-input{
  width: 250px;
  border-radius: 50px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  font-family: "Microsoft YaHei",serif;
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
