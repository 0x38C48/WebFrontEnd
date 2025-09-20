<template>
    <el-row :gutter="20" style="margin-bottom: 10px;">
        <el-col :span="1" style="text-align: left;">
            <el-button type="danger" plain @click="addRow()">添加一行</el-button>
        </el-col>
    </el-row>
    <el-table :data="data.dataList" :border="true" :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }">
        <el-table-column label="序号" fixed="left" width="70">
            <template v-slot="scope">
                {{ scope.$index + 1 }}
            </template>
        </el-table-column>
        <el-table-column label="关系" width="150">
            <template v-slot="scope">
                <el-input v-model="scope.row.relation" style="width: 90%" />
            </template>
        </el-table-column>
        <el-table-column label="姓名" width="150">
            <template v-slot="scope">
                <el-input v-model="scope.row.name" style="width: 90%" />
            </template>
        </el-table-column>
        <el-table-column label="性别" width="150">
            <template v-slot="scope">
                <el-select v-model="scope.row.gender" style="width: 90%">
                    <el-option v-for="items in data.genderList" :key="items.value" :label="items.title"
                        :value="items.value">
                    </el-option>
                </el-select>
            </template>
        </el-table-column>
        <el-table-column label="年龄" width="100">
            <template v-slot="scope">
                <el-input v-model="scope.row.age" style="width: 90%" />
            </template>
        </el-table-column>
        <el-table-column label="单位" width="150">
            <template v-slot="scope">
                <el-input v-model="scope.row.unit" style="width: 90%" />
            </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
            <template v-slot="scope">
                <el-button type="primary" plain @click="saveItem(scope.$index)">保存</el-button>
                <el-button type="danger" plain @click="deleteItem(scope.$index)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>
<script lang="ts" setup name="FamilyMember">
import { ref, watch, defineProps } from "vue";
import { FamilyMemberData, FamilyMemberItem } from "~/domain/models/person";
import { ID_FAMILY_MEMBER_PRESENTER } from '~/types';
import { container } from '~/inverfiy.config';
import { FamilyMemberPresenter } from "~/domain/presenters/family-member-presenter";
const presenter = container.get<FamilyMemberPresenter>(ID_FAMILY_MEMBER_PRESENTER);
let data = ref<FamilyMemberData>({ personId: 0 } as FamilyMemberData);
const props = defineProps({
    personId: {
        type: Number,
        required: true
    },
});
const getData = async () => {
    if (data.value.personId > 0) {
        await presenter.familyMemberInit(data.value);
    } else {
        data.value.dataList = [] as FamilyMemberItem[];
    }
};
watch(
    () => props.personId,
    val => {
        data.value.personId = val;
        getData();
    },
    { immediate: true }
)
const addRow = () => {
    data.value.dataList.push({ personId: data.value.personId } as FamilyMemberItem);
};
const deleteItem = async (index: number) => {
    await presenter.deleteItem(data.value, index);
};
const saveItem = async (index: number) => {
    await presenter.saveItem(data.value, index);
};
</script>
