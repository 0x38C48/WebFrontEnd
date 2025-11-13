<template>
    <div class="bg-gray-50 flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">修改密码</h2>
                <p class="text-sm text-gray-600">
                    密码强度要求：至少8位字符，包含大小写字母、数字和特殊字符
                </p>
            </div>
            
            <el-form 
                ref="passwordFormRef"
                :model="data" 
                :rules="formRules"
                label-width="100px"
                class="bg-white rounded-lg shadow-md p-6 space-y-4"
            >
                <el-form-item label="旧密码" prop="oldPassword">
                    <el-input 
                        v-model="data.oldPassword" 
                        type="password" 
                        placeholder="请输入旧密码"
                        show-password
                        class="w-full"
                    >
                        <template #prefix>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                        v-model="data.newPassword" 
                        type="password" 
                        placeholder="请输入新密码"
                        show-password
                        class="w-full"
                        @input="checkPasswordStrength"
                    >
                        <template #prefix>
                            <el-icon><Key /></el-icon>
                        </template>
                    </el-input>
                    <div class="password-strength mt-2" v-if="data.newPassword">
                        <div class="strength-bar">
                            <div 
                                class="strength-fill" 
                                :class="strengthClass"
                                :style="{ width: strengthWidth + '%' }"
                            ></div>
                        </div>
                        <span class="strength-text" :class="strengthTextClass">
                            {{ strengthText }}
                        </span>
                    </div>
                </el-form-item>
                
                <el-form-item label="确认密码" prop="checkPassword">
                    <el-input 
                        v-model="data.checkPassword" 
                        type="password" 
                        placeholder="请确认新密码"
                        show-password
                        class="w-full"
                    >
                        <template #prefix>
                            <el-icon><CircleCheck /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                
                <el-form-item class="flex justify-center space-x-4">
                    <el-button 
                        type="primary" 
                        @click="submitForm" 
                        :loading="loading"
                        class="px-6"
                    >
                        修改密码
                    </el-button>
                    <el-button 
                        @click="resetForm"
                        class="px-6"
                    >
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script lang="ts" setup name="Password">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { Lock, Key, CircleCheck } from '@element-plus/icons-vue'
import type { PasswordData } from "~/domain/models/info";
import { container } from '~/inverfiy.config';
import { ID_PASSWORD_PRESENTER } from '~/types';
import { PasswordPresenter } from "~/domain/presenters/password-presenter";

const presenter = container.get<PasswordPresenter>(ID_PASSWORD_PRESENTER);
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)

const data = reactive<PasswordData>({
    oldPassword: '',
    newPassword: '',
    checkPassword: ''
})

const passwordStrength = reactive({
    score: 0,
    text: '',
    class: ''
})

const formRules = reactive<FormRules<PasswordData>>({
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'blur' },
        { min: 1, max: 20, message: '密码长度不能超过20位', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 8, max: 20, message: '密码长度必须为8-20位', trigger: 'blur' },
        { 
            validator: (rule, value, callback) => {
                if (!value) return callback()
                
                const hasUpperCase = /[A-Z]/.test(value)
                const hasLowerCase = /[a-z]/.test(value)
                const hasNumbers = /\d/.test(value)
                const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
                
                const typesCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
                
                if (typesCount < 3) {
                    callback(new Error('密码必须包含至少3种字符类型（大写字母、小写字母、数字、特殊字符）'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ],
    checkPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== data.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
})

const strengthClass = computed(() => {
    switch (passwordStrength.score) {
        case 1: return 'strength-weak'
        case 2: return 'strength-fair'
        case 3: return 'strength-good'
        case 4: return 'strength-strong'
        default: return 'strength-none'
    }
})

const strengthText = computed(() => {
    switch (passwordStrength.score) {
        case 1: return '弱'
        case 2: return '一般'
        case 3: return '良好'
        case 4: return '强'
        default: return ''
    }
})

const strengthTextClass = computed(() => {
    switch (passwordStrength.score) {
        case 1: return 'text-red-500'
        case 2: return 'text-orange-500'
        case 3: return 'text-yellow-500'
        case 4: return 'text-green-500'
        default: return 'text-gray-400'
    }
})

const strengthWidth = computed(() => {
    return passwordStrength.score * 25
})

const checkPasswordStrength = () => {
    const password = data.newPassword
    if (!password) {
        passwordStrength.score = 0
        return
    }

    let score = 0
    
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
    
    passwordStrength.score = Math.min(score, 4)
}

const submitForm = async () => {
    if (!passwordFormRef.value) return
    
    await passwordFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                await presenter.submit(data)
            } finally {
                loading.value = false
            }
        }
    })
}

const resetForm = () => {
    passwordFormRef.value?.resetFields()
    passwordStrength.score = 0
}
</script>

<style scoped>
.password-strength {
    display: flex;
    align-items: center;
    gap: 8px;
}

.strength-bar {
    flex: 1;
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 2px;
}

.strength-none {
    background-color: #e5e7eb;
}

.strength-weak {
    background-color: #ef4444;
}

.strength-fair {
    background-color: #f97316;
}

.strength-good {
    background-color: #eab308;
}

.strength-strong {
    background-color: #22c55e;
}

.strength-text {
    font-size: 12px;
    font-weight: 500;
    min-width: 20px;
}

:deep(.el-input__wrapper) {
    padding: 8px 12px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #374151;
}
</style>