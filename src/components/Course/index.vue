<template>
    <el-dialog title="课程添加修改对话框" v-model="editVisible" :close-on-click-modal="false">
        <el-form ref="form" :model="itemData" class="edit-form" label-width="120px">
            <el-form-item label="课程号">
                <el-input v-model="itemData.num" placeholder="请输入学号" />
            </el-form-item>
            <el-form-item label="课程名">
                <el-input v-model="itemData.name" placeholder="请输入课程名" />
            </el-form-item>
            <el-form-item label="学分">
                <el-input v-model="itemData.credit" placeholder="请输入学分" />
            </el-form-item>
            <el-form-item label="资料路径">
                <el-input v-model="itemData.coursePath" placeholder="请输入资料路径" />
            </el-form-item>
            <el-form-item label="前序课">
                <el-select v-model="itemData.preCourseId">
                    <el-option v-for="item in data.courseSelectList" :key="item.id" :value="item.id"
                        :label="item.title" />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" plain @click="itemSubmit()">提交</el-button>
                <el-button type="primary" plain @click="editVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <div>
        <el-row :gutter="20" style="margin-bottom: 10px;">
            <el-col :span="12" style="text-align: left;">
                <el-button type="danger" plain @click="addItem()">添加</el-button>
            </el-col>
            <el-col :span="12" style="text-align: right;">
                <el-text style="margin-right: 12px;">课程号或课程名</el-text>
                <el-input v-model="data.numName" style="width:220px;margin-right: 12px;" placeholder="请输入课程号或课程名" />
                <el-button type="danger" plain @click="doQuery()">查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="data.dataList" :border="true" :header-cell-style="{ textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }">
            <el-table-column label="序号" width="70">
                <template v-slot="scope">
                    {{ scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template v-slot="scope">
                    <el-button type="primary" plain @click="editItem(scope.$index)">编辑</el-button>
                    <el-button type="danger" plain @click="deleteItem(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
            <el-table-column label="课程号" width="140">
                <template v-slot="scope">
                    {{ scope.row.num }}
                </template>
            </el-table-column>
            <el-table-column label="课程名" width="200" show-overflow-tooltip>
                <template v-slot="scope">
                    {{ scope.row.name }}
                </template>
            </el-table-column>
            <el-table-column label="学分" width="100">
                <template v-slot="scope">
                    {{ scope.row.credit }}
                </template>
            </el-table-column>
            <el-table-column label="材料路径" width="280" show-overflow-tooltip>
                <template v-slot="scope">
                    {{ scope.row.coursePath }}
                </template>
            </el-table-column>
            <el-table-column label="前序课" width="200" show-overflow-tooltip>
                <template v-slot="scope">
                    {{ scope.row.preCourse }}
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script lang="ts" setup name="Course">
import type { CourseData, CourseItem } from "~/domain/models/teaching";
import { container } from '~/inverfiy.config';
import { ID_COURSE_PRESENTER } from '~/types';
import { CoursePresenter } from "~/domain/presenters/course-presenter";
import { ref } from "vue";
const presenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
let data = ref<CourseData>({} as CourseData);
let itemData = ref<CourseItem>({} as CourseItem);
let editVisible = ref(false);
presenter.courseInit().then((res) => {
    data.value = res;
});
const doQuery = async () => {
    await presenter.getCourseList(data.value);
};
const addItem = async () => {
    itemData.value = presenter.addItem(data.value);
    editVisible.value = true;
};
const editItem = async (index: number) => {
    itemData.value = presenter.editItem(data.value, index);
    editVisible.value = true;
};
const itemSubmit = async () => {
    await presenter.itemSubmit(itemData.value, data.value);
    editVisible.value = false;
};
const deleteItem = async (index: number) => {
    await presenter.deleteItem(data.value, index);
};
</script>