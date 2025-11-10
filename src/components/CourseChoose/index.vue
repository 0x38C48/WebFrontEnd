<template>
    <div>
        <!-- 用户信息显示 -->
        <el-alert 
            v-if="!isLoggedIn" 
            title="未登录" 
            type="warning" 
            description="请先登录后再进行选课操作" 
            show-icon 
            :closable="false"
            style="margin-bottom: 10px;" />
        
        <div v-if="isLoggedIn">
            <el-row :gutter="20" style="margin-bottom: 10px;">
                <el-col :span="12" style="text-align: left;">
                    <el-text type="primary" style="font-size: 18px; font-weight: bold;">选课管理</el-text>
                </el-col>
            </el-row>
            
            <el-tabs v-model="activeTab">
                <!-- 可选课程标签页 -->
                <el-tab-pane label="可选课程" name="courseList">
                    <!-- 课程查询组件 -->
                    <el-row :gutter="20" style="margin-bottom: 10px; text-align: right;">
                        <el-text style="margin-right: 12px;">课程号或课程名</el-text>
                        <el-input v-model="data.numName" style="width:220px;margin-right: 12px;" placeholder="请输入课程号或课程名" />
                        <el-button type="danger" plain @click="doQueryCourseList()">查询</el-button>
                    </el-row>
                    
                    <el-table :data="data.dataList" :border="true" :header-cell-style="{ textAlign: 'center' }"
                        :cell-style="{ textAlign: 'center' }">
                        <el-table-column label="序号" width="70">
                            <template v-slot="scope">
                                {{ scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100">
                            <template v-slot="scope">
                                <el-button type="primary" plain @click="editItem(scope.$index)">选择</el-button>
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
                        <el-table-column label="前序课" width="200" show-overflow-tooltip>
                            <template v-slot="scope">
                                {{ scope.row.preCourse || '无' }}
                            </template>
                        </el-table-column>
                    </el-table>
                    <div v-if="!data.dataList || data.dataList.length === 0" style="margin-top: 20px;">
                        <el-empty description="暂无可选课程" />
                    </div>
                </el-tab-pane>
                
                <!-- 选课结果标签页 -->
                <el-tab-pane label="我的选课结果" name="courseResult">
                    <!-- 统计信息卡片 -->
                    <el-row :gutter="20" style="margin-bottom: 20px;">
                        <el-col :span="6">
                            <el-card shadow="hover">
                                <template #header>
                                    <div class="card-header">
                                        <span>已选课程</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    {{ resultData.totalCourses }} 门
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :span="6">
                            <el-card shadow="hover">
                                <template #header>
                                    <div class="card-header">
                                        <span>总学分</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    {{ resultData.totalCredits }} 分
                                </div>
                            </el-card>
                        </el-col>

                        <el-col :span="6">
                            <el-card shadow="hover">
                                <template #header>
                                    <div class="card-header">
                                        <span>已通过课程</span>
                                    </div>
                                </template>
                                <div class="card-content">
                                    {{ resultData.passedCourses }} 门
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>

                    <!-- 操作栏 -->
                    <el-row :gutter="20" style="margin-bottom: 10px;">
                        <el-col :span="24" style="text-align: right;">
                            <el-button type="primary" plain @click="doQueryCourseResult()">刷新</el-button>
                        </el-col>
                    </el-row>
                    
                    <!-- 选课结果表格 -->
                    <el-table 
                        :data="filteredDataList" 
                        :border="true" 
                        :header-cell-style="{ textAlign: 'center' }"
                        :cell-style="{ textAlign: 'center' }"
                        v-loading="loading"
                        element-loading-text="加载中...">
                        
                        <el-table-column label="序号" width="70">
                            <template v-slot="scope">
                                {{ scope.$index + 1 }}
                            </template>
                        </el-table-column>
                        
                        <el-table-column label="操作" width="100">
                            <template v-slot="scope">
                                <el-button 
                                    type="danger" 
                                    plain 
                                    @click="dropCourseFromResult(scope.row.courseChooseId || scope.row.courseId)">
                                    退选
                                </el-button>
                            </template>
                        </el-table-column>
                        
                        <el-table-column label="课程号" width="140">
                            <template v-slot="scope">
                                {{ scope.row.num || scope.row.courseNum }}
                            </template>
                        </el-table-column>
                        
                        <el-table-column label="课程名" width="200" show-overflow-tooltip>
                            <template v-slot="scope">
                                {{ scope.row.name || scope.row.courseName }}
                            </template>
                        </el-table-column>
                        
                        <!-- 仅管理员显示学生姓名 -->
                        <el-table-column label="学生姓名" width="120" v-if="isAdmin">
                            <template v-slot="scope">
                                {{ scope.row.studentName || '未知学生' }}
                            </template>
                        </el-table-column>
                        
                        <el-table-column label="学分" width="100">
                            <template v-slot="scope">
                                {{ scope.row.credit }}
                            </template>
                        </el-table-column>
                        

                        
                        <el-table-column label="成绩" width="100">
                            <template v-slot="scope">
                                <!-- 修复成绩显示，确保正确处理各种情况 -->
                                {{ scope.row.mark !== undefined && scope.row.mark !== null && scope.row.mark !== '' ? scope.row.mark : '未出成绩' }}
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 空状态 -->
                    <div v-if="!loading && filteredDataList.length === 0" style="margin-top: 20px;">
                        <el-empty description="暂无选课记录" />
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script lang="ts" setup name="CourseChoose">
import type { CourseData, CourseItem } from "~/domain/models/teaching";
import type { CourseChooseResultData } from "~/domain/models/teaching";
import { container } from '~/inverfiy.config';
import { ID_COURSE_PRESENTER } from '~/types';
import { CoursePresenter } from "~/domain/presenters/course-presenter";
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCurrentUser } from '~/composables';

const presenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
const { currentUserId, currentUserName, isLoggedIn, isAdmin } = useCurrentUser();

// 可选课程相关数据
let data = ref<CourseData>({} as CourseData);

// 选课结果相关数据
let resultData = ref<CourseChooseResultData>({
    personId: 0,
    dataList: [],
    totalCredits: 0,
    totalCourses: 0,
    passedCourses: 0
});

let loading = ref(false);
let activeTab = ref('courseList');

// 过滤后的选课结果数据列表
const filteredDataList = computed(() => {
    return resultData.value.dataList;
});

// 计算总学分
const calculateCredits = (courses: Array<{credit?: any, mark?: number | null}>) => {
    // 计算总学分（所有课程）- 确保正确转换为数字类型，避免字符串拼接
    const totalCredits = courses
        .reduce((sum, course) => sum + Number(course.credit || 0), 0);
    
    // 计算已通过课程数
    const passedCourses = courses
        .filter(course => course.mark !== undefined && course.mark !== null && course.mark >= 60)
        .length;
    
    return {
        totalCredits,
        totalCourses: courses.length,
        passedCourses
    };
};

// 移除了getStatusType函数，不再需要状态类型转换

// 初始化数据
onMounted(async () => {
    if (isLoggedIn.value) {
        await initData();
    }
});

// 初始化数据
const initData = async () => {
        try {
            // 初始化可选课程数据
            data.value = await presenter.courseInit();
            // 初始化选课结果数据
            await doQueryCourseResult();
        } catch (error) {
            ElMessage.error('初始化数据失败');
            console.error('初始化失败:', error);
        }
    };

// 查询可选课程列表
const doQueryCourseList = async () => {
        try {
            await presenter.getCourseList(data.value);
        } catch (error) {
            ElMessage.error('查询失败');
            console.error('查询失败:', error);
        }
    };

// 查询选课结果
const doQueryCourseResult = async () => {
    loading.value = true;
    try {
        // 加载选课结果（模拟数据）
        await loadCourseResults();
    } catch (error) {
        ElMessage.error('查询失败');
        console.error('查询失败:', error);
    } finally {
        loading.value = false;
    }
};

// 加载选课结果
const loadCourseResults = async () => {
    loading.value = true;
    
    try {
        // 打印详细的用户信息，确认currentUserId的值
        console.log('当前用户信息:', {
            isLoggedIn: isLoggedIn.value,
            currentUserId: currentUserId.value,
            currentUserName: currentUserName.value
        });
        
        // 确保用户已登录且有有效的ID
        if (!isLoggedIn.value || !currentUserId.value || currentUserId.value <= 0) {
            console.warn('用户未登录或ID无效');
            ElMessage.warning(`用户未登录或ID无效: ${currentUserId.value}`);
            return;
        }
        
        // 查询中...
        
        // 注意：使用正确的方法名getCourseChooseResults（复数）
        console.log(`开始获取用户ID ${currentUserId.value} 的选课结果`);
        
        // presenter现在确保始终返回包含dataList的完整对象
        const courseResultData = await presenter.getCourseChooseResults(currentUserId.value);
        
        // 打印调试信息
        console.log(`成功获取到 ${courseResultData.dataList.length} 条选课记录`);
        
        // 重新计算统计信息，因为后端返回的格式中可能不包含这些计算字段
        const creditStats = calculateCredits(courseResultData.dataList);
        resultData.value = {
            personId: currentUserId.value,
            dataList: courseResultData.dataList,
            ...creditStats
        };
        
        // 打印最终设置给resultData的值
        console.log('最终设置的resultData:', JSON.stringify(resultData.value, null, 2));
        
        // 提示用户数据加载结果
        if (resultData.value.dataList.length > 0) {
            ElMessage.success(`成功加载 ${resultData.value.dataList.length} 条选课记录`);
        } else {
            ElMessage.info('暂无选课记录');
        }
    } catch (error) {
        console.error('获取选课结果失败:', error);
        ElMessage.error(`获取选课结果失败: ${error instanceof Error ? error.message : String(error)}`);
        // 设置空数据对象，避免显示错误
        resultData.value = {
            personId: currentUserId.value || 0,
            dataList: [],
            totalCredits: 0,
            totalCourses: 0,
            passedCourses: 0
        };
    } finally {
        loading.value = false;
    }
};

// 选择课程
const editItem = async (index: number) => {
    try {
        // 获取要选择的课程
        const course = data.value.dataList[index];
        if (!course) {
            ElMessage.error('课程信息不存在');
            return;
        }
        
        // 调用presenter的选课方法
        const success = await presenter.chooseCourse(data.value, index, currentUserId.value);
        if (success) {
            // 重新加载选课结果
            await doQueryCourseResult();
        }
    } catch (error) {
        ElMessage.error('选课失败：' + (error instanceof Error ? error.message : String(error)));
        console.error('选课失败:', error);
    }
};

// 从选课结果退选课程
const dropCourseFromResult = async (courseChooseId: number) => {
    if (!courseChooseId) {
        console.warn('缺少课程选择ID，无法执行退选操作');
        return;
    }
    
    // 查找对应的课程信息
    const course = resultData.value.dataList.find(c => c.courseChooseId === courseChooseId || c.courseId === courseChooseId);
    
    try {
        await ElMessageBox.confirm(
            `确定要退选课程「${course?.courseName || '未命名课程'}」吗？`,
            '退选确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        
        // 调用presenter的退选方法
        const res = await presenter.dropCourseFromResult(courseChooseId);
        
        // 移除对应课程并重新计算学分统计
        resultData.value.dataList = resultData.value.dataList.filter(c => c.courseChooseId !== courseChooseId && c.courseId !== courseChooseId);
        
        // 重新计算学分统计
        const creditStats = calculateCredits(resultData.value.dataList);
        resultData.value = {
            ...resultData.value,
            ...creditStats
        };
        
        // 刷新可选课程列表
        await doQueryCourseList();
        
    } catch (error) {
        // 忽略取消操作的错误
        if (error !== 'cancel') {
            console.error('退选操作失败:', error);
        }
    }
};

</script>

<style scoped>
/* 仅为本组件设置样式，避免影响全局 */
.card-header {
    font-weight: bold;
}

.card-content {
    font-size: 24px;
    color: #1890ff;
    text-align: center;
    padding: 20px 0;
    font-weight: bold;
}
</style>