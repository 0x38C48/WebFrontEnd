<template>
    <el-dialog title="课程添加修改对话框" v-model="editVisible" :close-on-click-modal="false">
        <el-form ref="form" :model="itemData" class="edit-form" label-width="120px">
            <el-form-item label="课程号">
                <el-input v-model="itemData.num" placeholder="请输入课程号" />
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
            <el-form-item label="授课教师" v-if="!isStudent">
                <el-select v-model.number="itemData.personId" placeholder="请选择授课教师">
                    <el-option v-for="teacher in teacherOptions" :key="teacher.value" :value="Number(teacher.value)"
                        :label="teacher.title" />
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
                <el-button v-if="!isStudent" type="danger" plain @click="addItem()">添加</el-button>
                <el-button type="primary" style="margin-left: 10px;" @click="goToCourseChoose()">选课管理</el-button>
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
                    <el-button v-if="!isStudent" type="primary" plain @click="editItem(scope.$index)">编辑</el-button>
                    <el-button v-if="!isStudent" type="danger" plain @click="deleteItem(scope.$index)">删除</el-button>
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
            <el-table-column label="授课教师" width="150" show-overflow-tooltip>
                <template v-slot="scope">
                    {{ scope.row.teacher && scope.row.teacher.personId ? getTeacherNameByPersonId(scope.row.teacher.personId) : '-' }}
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
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useCurrentUser } from "~/composables/useCurrentUser";
const presenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
const router = useRouter();
const { currentUserRole, isStudent } = useCurrentUser();
let data = ref<CourseData>({} as CourseData);
let itemData = ref<CourseItem>({} as CourseItem);
let editVisible = ref(false);
let teacherOptions = ref<any[]>([]);
presenter.courseInit().then((res) => {
    data.value = res;
});

// 获取教师选项列表
const loadTeacherOptions = async () => {
    try {
        // 由于getTeacherItemOptionList返回类型是OptionItem[]，直接使用
        const teacherList = await presenter.getTeacherItemOptionList();
        
        // 检查是否为数组
        if (Array.isArray(teacherList)) {
            teacherOptions.value = teacherList;
            console.log('教师选项列表已加载:', teacherOptions.value.length, '选项详情:', teacherOptions.value);
        } else {
            // 额外检查是否有itemList属性（处理可能的不同返回格式）
            const response = teacherList as any;
            if (response && response.itemList && Array.isArray(response.itemList)) {
                teacherOptions.value = response.itemList;
                console.log('从itemList中提取教师选项列表:', teacherOptions.value.length);
            } else {
                teacherOptions.value = [];
                console.log('返回数据格式错误，已初始化为空列表');
            }
        }
    } catch (error) {
        console.error('加载教师选项失败:', error);
        teacherOptions.value = [];
    }
};

// 组件挂载时获取教师列表
onMounted(() => {
    // 所有用户都需要加载教师列表以显示授课教师名称
    loadTeacherOptions();
});
const doQuery = () => {
    // 直接调用presenter.getCourseList获取课程列表
    presenter.getCourseList(data.value);
    // 查询后再次加载教师列表以确保数据最新
    loadTeacherOptions();
};
const addItem = async () => {
    itemData.value = presenter.addItem(data.value);
    // 确保新添加的课程有personId字段
    if (!itemData.value.personId) {
        itemData.value.personId = 0;
    }
    editVisible.value = true;
};
const editItem = async (index: number) => {
    itemData.value = presenter.editItem(data.value, index);
    editVisible.value = true;
};
const itemSubmit = async () => {
    try {
        // 确保personId是数字类型
        if (itemData.value.personId !== undefined && itemData.value.personId !== null) {
            itemData.value.personId = Number(itemData.value.personId);
        }
        console.log('提交课程数据:', itemData.value);
        await presenter.itemSubmit(itemData.value, data.value);
        editVisible.value = false;
    } catch (error) {
        console.error('提交课程失败:', error);
    }
};
const deleteItem = async (index: number) => {
    await presenter.deleteItem(data.value, index);
};

const goToCourseChoose = () => {
    router.push('/courseChoose');
};

// 根据personId获取教师姓名
const getTeacherNameByPersonId = (personId: any): string => {
    // 简化实现，去除过多调试日志
    
    // 处理无效的personId情况
    if (!personId && personId !== 0) {
        return '-';
    }
    
    // 安全检查teacherOptions
    if (!Array.isArray(teacherOptions.value) || teacherOptions.value.length === 0) {
        return '-';
    }
    
    // 确保类型一致后查找
    const targetPersonId = String(personId);
    
    // 在教师选项中查找匹配的项
    const foundTeacher = teacherOptions.value.find(item => String(item.value) === targetPersonId);
    
    // 如果找到，返回title中提取的教师姓名（格式："编号-姓名"）
    if (foundTeacher && foundTeacher.title) {
        const nameParts = foundTeacher.title.split('-');
        return nameParts.length > 1 ? nameParts[1] : foundTeacher.title;
    }
    
    return '-';
};
</script>