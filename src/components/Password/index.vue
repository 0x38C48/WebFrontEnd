<template>
    <div style="display: flex; justify-content: center; align-items: center; min-height: 640px;">
        <div style="width: 640px;">
            <div style="margin-bottom: 20px; text-align: center; color: #666;">
                密码强度要求三种字符类型（大小写、数字、特殊字符）及以上且密码长度为8位及以上！
            </div>
            <el-form :model="data" label-width="120px"
                style="padding: 30px; border: 1px solid #dcdfe6; border-radius: 8px; background-color: #fff;">
                <el-form-item label="旧密码">
                    <el-input v-model="data.oldPassword" type="password" placeholder="请输入旧密码" style="width:240px" />
                </el-form-item>
                <el-form-item label="新密码">
                    <span>
                        <el-input v-model="data.newPassword" type="password" placeholder="请输入新密码"
                            style="width:240px" />*密码长度最大为20位
                    </span>
                </el-form-item>
                <el-form-item label="确认密码">
                    <el-input v-model="data.checkPassword" type="password" placeholder="请确认新密码" style="width:240px" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" plain @click="submit()">修改</el-button>
                    <el-button type="primary" plain @click="reset()">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script lang="ts" setup name="Password">
import type { PasswordData } from "~/domain/models/info";
import { container } from '~/inverfiy.config';
import { ID_PASSWORD_PRESENTER } from '~/types';
import { PasswordPresenter } from "~/domain/presenters/password-presenter";
import { ref } from "vue";
const presenter = container.get<PasswordPresenter>(ID_PASSWORD_PRESENTER);
let data = ref<PasswordData>({} as PasswordData);
const submit = async () => {
    await presenter.submit(data.value);
};
const reset = async () => {
    await presenter.reset(data.value);
};

</script>
