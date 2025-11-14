<template>
  <div class="login-container">
    <!-- 背景轮播 -->
    <div class="background-slider">
      <div 
        v-for="(bg, index) in backgroundImages" 
        :key="index"
        :class="['background-slide', { active: currentBgIndex === index }]"
        :style="{ backgroundImage: `url(${bg.url})` }"
      >
        <div class="slide-overlay"></div>
      </div>
      
      <!-- 轮播指示器 -->
      <div class="slider-indicators">
        <div 
          v-for="(bg, index) in backgroundImages" 
          :key="index"
          :class="['indicator', { active: currentBgIndex === index }]"
          @click="switchBackground(index)"
        ></div>
      </div>
    </div>
    
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
        <el-form-item label="邮箱" prop="email" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="registerReq.email" placeholder="请输入邮箱" class="register-input" />
        </el-form-item>
        <el-form-item label="验证码" prop="code" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="registerReq.code" placeholder="请输入验证码" class="register-input" style="width: 150px; margin-right: 10px;" />
          <el-image :src="captchaImageUrl" @click="updateCaptchaRegister" style="width: 100px; height: 40px; cursor: pointer;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-button" @click="registerSubmit()">注册</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>

  <!-- 忘记密码对话框 -->
  <div class="forget-password-dialog" rule="">
    <el-dialog class="forget-password-dialog" title="忘记密码" v-model="forgetPasswordDialogVisible" v-show="forgetPasswordDialogVisible">
      <el-form :model="forgetPasswordReq" :rules="forgetPasswordRules" ref="forgetPasswordFormRef" class="forget-password-form" label-width="120px" style="margin-top: 20px">
        <el-form-item label="用户名" prop="username" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="forgetPasswordReq.username" placeholder="请输入用户名" class="forget-password-input" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="forgetPasswordReq.email" placeholder="请输入邮箱（演示版本不做验证）" class="forget-password-input" />
        </el-form-item>
        <el-form-item label="图片验证码" prop="imageCode" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="forgetPasswordReq.imageCode" placeholder="请输入图片验证码" class="forget-password-input" style="width: 150px; margin-right: 10px;" />
          <el-image :src="forgetPasswordCaptchaImageUrl" @click="updateCaptchaForgetPassword" style="width: 100px; height: 40px; cursor: pointer;" />
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="emailCode" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input v-model="forgetPasswordReq.emailCode" placeholder="请输入邮箱验证码（演示码：123456）" class="forget-password-input" />
          <div style="font-size: 12px; color: #666; margin-top: 5px;">演示验证码：123456</div>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input type="password" v-model="forgetPasswordReq.newPassword" placeholder="请输入新密码" class="forget-password-input" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" style="font-family:Microsoft YaHei, serif; font-weight: bold">
          <el-input type="password" v-model="forgetPasswordReq.confirmPassword" placeholder="请再次输入新密码" class="forget-password-input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="forget-password-button" @click="resetPassword()" :loading="isResetting">
            {{ isResetting ? '重置中...' : '重置密码' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ElMessage, ElForm, FormRules} from 'element-plus'
import { container } from '~/inverfiy.config';
import { ID_APP_PRESENTER, ID_LOGIN_SERVICE } from '~/types';
import { AppPresenter } from "~/infrastructure/presenters/app-presenter";
import {RegisterServiceImpl} from "~/infrastructure/services/register-service-impl";
import {ForgetPasswordServiceImpl} from "~/infrastructure/services/forget-password-service-impl";
import {reactive, ref, nextTick, watch, onMounted, onUnmounted}from 'vue'
import { LoginRequest } from './infrastructure/models/login';
import { RegisterRequest } from './infrastructure/models/register';
import { ForgetPasswordRequest } from './infrastructure/models/forget-password';
import {ValidateServiceImpl} from "~/infrastructure/services/validate-service-impl";
import { ValidCodeRequest } from "~/infrastructure/models/valid-code-req";

// 背景轮播相关变量
const currentBgIndex = ref(0);
const backgroundImages = ref([
  { url: 'public/bgPhoto/1.jpg', title: '校园风光' },
  { url: 'public/bgPhoto/2.jpg', title: '教学楼' },
  { url: 'public/bgPhoto/3.jpg', title: '图书馆' },
  { url: 'public/bgPhoto/4.jpg', title: '运动场' }
]);
let slideInterval: number | null = null;

// 切换背景
const switchBackground = (index: number) => {
  currentBgIndex.value = index;
  resetSlideInterval();
};

// 自动轮播
const startSlideInterval = () => {
  slideInterval = window.setInterval(() => {
    currentBgIndex.value = (currentBgIndex.value + 1) % backgroundImages.value.length;
  }, 5000); // 5秒切换一次
};

// 重置轮播定时器
const resetSlideInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
  startSlideInterval();
};

// 组件挂载时启动轮播
onMounted(() => {
  startSlideInterval();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
});

//const loginReq: LoginRequest = reactive({ username: '2022030001', password: '123456', code: '' });
const loginReq: LoginRequest = reactive({ username: 'admin', password: '123456', code: '' });
//const registerReq: RegisterRequest = reactive({ username: '', password: '', perName: '', role: '', code: '' });
//开发中预置registerReq的值来调试：
const valReq: ValidCodeRequest = reactive({username: '', password: '', perName: '', role: '', email: ''});
const registerReq: RegisterRequest = reactive({ username: '202400002222', password: '123456', perName: '测试', role: '学生', email: 'test@example.com', code: '' });
const dialogVisible = ref(false);
const forgetPasswordDialogVisible = ref(false);
const captchaImageUrl = ref(''); // 用于存储验证码图片的URL
const registerFormRef = ref<InstanceType<typeof ElForm>>()

// 忘记密码相关变量
const forgetPasswordReq: ForgetPasswordRequest = reactive({
  username: '',
  email: '',
  emailCode: '', // 邮箱验证码
  imageCode: '', // 图片验证码
  newPassword: '',
  confirmPassword: ''
})
const forgetPasswordFormRef = ref<InstanceType<typeof ElForm>>()
const isResetting = ref(false)
const forgetPasswordCaptchaImageUrl = ref(''); // 用于存储忘记密码验证码图片的URL

const registerRules: FormRules<RegisterRequest> = reactive({
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
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  // code: [
  //   { required: true, message: '请输入验证码', trigger: 'blur' },
  //   { len: 6, message: '验证码长度为 6 个字符', trigger: 'blur' },
  // ],
})

// 忘记密码验证规则
const forgetPasswordRules: FormRules<ForgetPasswordRequest> = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { len: 12, message: '用户名须为12位学号', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' }
    // 移除邮箱格式验证，演示版本不做验证
  ],
  imageCode: [
    //{ required: true, message: '请输入图片验证码', trigger: 'blur' },暂时不强制要求
    { len: 6, message: '图片验证码长度为6个字符', trigger: 'blur' },
  ],
  emailCode: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { len: 6, message: '邮箱验证码长度为6个字符', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 18, message: '密码长度在6到18个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== forgetPasswordReq.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const appPresenter = container.get<AppPresenter>(ID_APP_PRESENTER);
const isLoading = ref(false);

//获取验证码
const updateCaptchaRegister = () => {
  //captchaImageUrl.value = `/auth/getValidateCode`;
  const vReq = {...valReq};
  vReq.username = registerReq.username;
  vReq.password = registerReq.password;
  vReq.perName = registerReq.perName;
  vReq.role = registerReq.role;
  vReq.email = registerReq.email;
  const validateServiceImpl = new ValidateServiceImpl();
  validateServiceImpl.getValidateCode(vReq).then(res => {
    captchaImageUrl.value = res.data.img;
  });
  //ElMessage.success("成功更新验证码。");
};

// 获取忘记密码验证码
const updateCaptchaForgetPassword = () => {
  const vReq = {...valReq};
  vReq.username = forgetPasswordReq.username;
  vReq.email = forgetPasswordReq.email;
  const validateServiceImpl = new ValidateServiceImpl();
  validateServiceImpl.getValidateCode(vReq).then(res => {
    forgetPasswordCaptchaImageUrl.value = res.data.img;
  });
};

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
  //现实实践应该置空
  registerReq.username = '202400002222';
  registerReq.password = '123456';
  registerReq.perName = '测试';
  registerReq.role = '学生';
  registerReq.email = 'test@example.com';
  registerReq.code = '';

  dialogVisible.value = true;
  updateCaptchaRegister(); // 在显示注册对话框时获取验证码

  // 清除校验信息，确保在对话框渲染完成后执行
  nextTick(() => {
    registerFormRef.value?.resetFields();
  });

}

const toForgetPassword = () => {
  // 设置忘记密码表单的默认值
  forgetPasswordReq.username = '202400002222';
  forgetPasswordReq.email = 'test@example.com';
  forgetPasswordReq.emailCode = '123456';
  forgetPasswordReq.imageCode = '';
  forgetPasswordReq.newPassword = '222222';
  forgetPasswordReq.confirmPassword = '222222';
  
  // 清除校验信息
  nextTick(() => {
    forgetPasswordFormRef.value?.resetFields()
  })
  
  // 获取验证码
  updateCaptchaForgetPassword()
  
  forgetPasswordDialogVisible.value = true;
}



// 重置密码
const resetPassword = async () => {
  if (!forgetPasswordFormRef.value) return
  
  const valid = await forgetPasswordFormRef.value.validate()
  if (valid) {
    // 邮箱验证码验证（演示版本固定为123456）
    if (forgetPasswordReq.emailCode !== '123456') {
      ElMessage.error('邮箱验证码错误，请输入123456')
      return
    }
    
    isResetting.value = true
    try {
      const forgetPasswordService = new ForgetPasswordServiceImpl()
      // 构建重置密码请求
      const resetRequest = {
        username: forgetPasswordReq.username,
        newPassword: forgetPasswordReq.newPassword
      }
      await forgetPasswordService.resetPassword(resetRequest)
      ElMessage.success('密码重置成功，请使用新密码登录')
      forgetPasswordDialogVisible.value = false
    } catch (error: any) {
      ElMessage.error(error.message || '密码重置失败')
    } finally {
      isResetting.value = false
    }
  }
}

//点击注册键后的注册表单提交
const registerSubmit = async () => {
  if (!registerFormRef.value) return
  const valid = await registerFormRef.value.validate();
  if (valid) {
    const registerReq1 = {...registerReq};
    if(registerReq.role === '学生')
      registerReq1.role = 'STUDENT';
    if(registerReq.role === '教师')
      registerReq1.role = 'TEACHER';
    //ElMessage.info('正在开发注册')
    // 待填充注册逻辑
    const registerService = new RegisterServiceImpl();
    await registerService.register(registerReq1);
    dialogVisible.value = false; // 注册成功后关闭对话框
  } else {
    ElMessage.error('请检查输入信息')
  }
}


</script>

<style scoped>
/* 背景轮播样式 */
.background-slider {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.background-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
  transform: scale(1.1);
  animation: zoomInOut 20s infinite alternate;
}

.background-slide.active {
  opacity: 1;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, rgba(44, 62, 80, 0.4) 100%);
}

.slider-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: var(--color-primary);
  transform: scale(1.2);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

@keyframes zoomInOut {
  0% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.15);
  }
}

.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.login-wrapper {
  margin-right: 10px;
  margin-left: 950px;
  background: rgba(255, 255, 255, 0.85);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  min-width: 400px;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  color: var(--color-primary-dark);
  margin-bottom: 30px;
  margin-top: 10px;
}

.register-dialog :deep(.el-dialog){
  margin-top: 160px;
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

.forget-password-dialog :deep(.el-dialog){
  margin-top: 150px;
  max-width: 90%;
  border-radius: 12px;
  width: 480px;
  min-height: 435px;
  font-family: 微软雅黑,serif;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.forget-password-button{
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

.forget-password-input{
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
