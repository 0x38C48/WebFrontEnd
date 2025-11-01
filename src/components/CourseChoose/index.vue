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
        
        <el-tabs v-model="activeTab" type="card" v-if="isLoggedIn">
            <!-- 可选课程标签页 -->
            <el-tab-pane label="可选课程" name="courseList">
                <el-row :gutter="20" style="margin-bottom: 10px;">
                    <el-col :span="12" style="text-align: left;">
                        <el-text style="color: #409EFF;">
                            当前用户: {{ currentUserName }} (ID: {{ currentUserId }})
                        </el-text>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <el-text style="margin-right: 12px;">课程号或课程名</el-text>
                        <el-input v-model="data.numName" style="width:220px;margin-right: 12px;" placeholder="请输入课程号或课程名" />
                        <el-button type="danger" plain @click="doQueryCourseList()">查询</el-button>
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
                            <el-button type="primary" plain @click="editItem(scope.$index)">选择</el-button>
                            <el-button type="danger" plain @click="deleteItem(scope.$index)">退选</el-button>
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
                            {{ scope.row.preCourse }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            
            <!-- 选课结果标签页 -->
            <el-tab-pane label="我的选课结果" name="courseResult">
                <!-- 统计信息卡片 -->
                <el-row :gutter="20" style="margin-bottom: 20px;">
                    <el-col :span="6">
                        <el-card class="stat-card">
                            <el-statistic title="已选课程" :value="resultData.totalCourses" suffix="门" />
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card class="stat-card">
                            <el-statistic title="总学分" :value="resultData.totalCredits" suffix="分" />
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card class="stat-card">
                            <el-statistic title="本学期学分" :value="resultData.currentSemesterCredits" suffix="分" />
                        </el-card>
                    </el-col>
                    <el-col :span="6">
                        <el-card class="stat-card">
                            <el-statistic title="已通过课程" :value="resultData.passedCourses" suffix="门" />
                        </el-card>
                    </el-col>
                </el-row>

                <!-- 操作栏 -->
                <el-row :gutter="20" style="margin-bottom: 10px;">
                    <el-col :span="8" style="text-align: left;">
                        <el-text style="color: #409EFF; font-size: 16px;">
                            当前用户: {{ currentUserName }} (ID: {{ currentUserId }})
                        </el-text>
                    </el-col>
                    <el-col :span="16" style="text-align: right;">
                        <el-select v-model="filterStatus" placeholder="选择状态筛选" style="width: 150px; margin-right: 12px;" clearable>
                            <el-option label="全部" value="" />
                            <el-option label="已选" value="已选" />
                            <el-option label="待确认" value="待确认" />
                            <el-option label="已退选" value="已退选" />
                        </el-select>
                        <el-select v-model="filterSemester" placeholder="选择学期" style="width: 150px; margin-right: 12px;" clearable>
                            <el-option label="全部学期" value="" />
                            <el-option label="2024春季" value="2024春季" />
                            <el-option label="2024秋季" value="2024秋季" />
                            <el-option label="2023春季" value="2023春季" />
                            <el-option label="2023秋季" value="2023秋季" />
                        </el-select>
                        <el-button type="primary" @click="doQueryCourseResult()">刷新</el-button>
                    </el-col>
                </el-row>
                
                <!-- 选课结果表格 -->
                <el-table 
                    :data="filteredDataList" 
                    :border="true" 
                    :header-cell-style="{ textAlign: 'center', backgroundColor: '#f5f7fa' }"
                    :cell-style="{ textAlign: 'center' }"
                    v-loading="loading"
                    element-loading-text="加载中...">
                    
                    <el-table-column label="序号" width="70">
                        <template v-slot="scope">
                            {{ scope.$index + 1 }}
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="操作" width="120">
                        <template v-slot="scope">
                            <el-button 
                                v-if="scope.row.status === '已选'" 
                                type="danger" 
                                size="small" 
                                plain 
                                @click="dropCourseFromResult(scope.$index)">
                                退选
                            </el-button>
                            <el-tag v-else-if="scope.row.status === '已退选'" type="info" size="small">
                                已退选
                            </el-tag>
                            <el-tag v-else-if="scope.row.status === '待确认'" type="warning" size="small">
                                待确认
                            </el-tag>
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="课程号" width="120" prop="courseNum" />
                    
                    <el-table-column label="课程名" width="200" prop="courseName" show-overflow-tooltip />
                    
                    <el-table-column label="学分" width="80" prop="credit" />
                    
                    <el-table-column label="授课教师" width="120" prop="teacherName" show-overflow-tooltip />
                    
                    <el-table-column label="学期" width="100" prop="semester" />
                    
                    <el-table-column label="选课时间" width="150" prop="chooseTime" />
                    
                    <el-table-column label="状态" width="100">
                        <template v-slot="scope">
                            <el-tag 
                                :type="getStatusType(scope.row.status)" 
                                size="small">
                                {{ scope.row.status }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    
                    <el-table-column label="成绩" width="80">
                        <template v-slot="scope">
                            <span v-if="scope.row.score !== undefined && scope.row.score !== null">
                                {{ scope.row.score }}
                            </span>
                            <el-tag v-else type="info" size="small">未出</el-tag>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 空状态 -->
                <el-empty v-if="!loading && filteredDataList.length === 0" description="暂无选课记录" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script lang="ts" setup name="CourseChoose">
import type { CourseData, CourseItem } from "~/domain/models/teaching";
import type { CourseChooseResultData } from "~/domain/models/teaching";
import { container } from '~/inverfiy.config';
import { ID_COURSE_PRESENTER } from '~/types';
import { CoursePresenter } from "~/domain/presenters/course-presenter";
import { ref, onMounted, computed } from "vue";
import { ElMessage } from 'element-plus';
import { useCurrentUser } from '~/composables';

const presenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
const { currentUserId, currentUserName, isLoggedIn } = useCurrentUser();

// 可选课程相关数据
let data = ref<CourseData>({} as CourseData);

// 选课结果相关数据
let resultData = ref<CourseChooseResultData>({
    personId: 0,
    dataList: [],
    totalCredits: 0,
    currentSemesterCredits: 0,
    totalCourses: 0,
    passedCourses: 0
});

let loading = ref(false);
let filterStatus = ref('');
let filterSemester = ref('');
let activeTab = ref('courseList');

// 过滤后的选课结果数据列表
const filteredDataList = computed(() => {
    let filtered = resultData.value.dataList;
    
    if (filterStatus.value) {
        filtered = filtered.filter(item => item.status === filterStatus.value);
    }
    
    if (filterSemester.value) {
        filtered = filtered.filter(item => item.semester === filterSemester.value);
    }
    
    return filtered;
});

// 计算总学分
const calculateCredits = (courses: any[]) => {
    // 获取当前学期（假设格式为"2024春季"）
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const currentSemester = month <= 6 ? `${year}春季` : `${year}秋季`;
    
    // 计算总学分（只计算已选状态的课程）
    const totalCredits = courses
        .filter(course => course.status === '已选')
        .reduce((sum, course) => sum + (course.credit || 0), 0);
    
    // 计算本学期学分
    const currentSemesterCredits = courses
        .filter(course => course.status === '已选' && course.semester === currentSemester)
        .reduce((sum, course) => sum + (course.credit || 0), 0);
    
    // 计算已通过课程数
    const passedCourses = courses
        .filter(course => course.score !== undefined && course.score !== null && course.score >= 60)
        .length;
    
    return {
        totalCredits,
        currentSemesterCredits,
        totalCourses: courses.length,
        passedCourses
    };
};

// 获取状态标签类型
const getStatusType = (status: string) => {
    switch (status) {
        case '已选': return 'success';
        case '待确认': return 'warning';
        case '已退选': return 'info';
        default: return '';
    }
};

// 初始化数据
onMounted(async () => {
    if (isLoggedIn.value) {
        await initData();
    }
});

// 初始化所有数据
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

// 加载选课结果（模拟数据）
const loadCourseResults = async () => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟数据
    const courses = [
        {
            courseChooseId: 1,
            personId: currentUserId.value,
            courseId: 101,
            courseNum: 'CS101',
            courseName: '数据结构与算法',
            credit: 4,
            chooseTime: '2024-02-15 10:30',
            status: '已选',
            teacherName: '张教授',
            semester: '2024春季'
        },
        {
            courseChooseId: 2,
            personId: currentUserId.value,
            courseId: 102,
            courseNum: 'CS102',
            courseName: '数据库系统原理',
            credit: 3,
            chooseTime: '2024-02-16 14:20',
            status: '已选',
            teacherName: '李教授',
            semester: '2024春季'
        },
        {
            courseChooseId: 3,
            personId: currentUserId.value,
            courseId: 103,
            courseNum: 'CS103',
            courseName: '计算机网络',
            credit: 3,
            chooseTime: '2024-02-17 09:15',
            status: '待确认',
            teacherName: '王教授',
            semester: '2024春季'
        },
        {
            courseChooseId: 4,
            personId: currentUserId.value,
            courseId: 104,
            courseNum: 'CS104',
            courseName: '软件工程',
            credit: 4,
            chooseTime: '2023-09-10 16:45',
            status: '已退选',
            teacherName: '赵教授',
            semester: '2023秋季'
        },
        {
            courseChooseId: 5,
            personId: currentUserId.value,
            courseId: 105,
            courseNum: 'CS105',
            courseName: '操作系统',
            credit: 4,
            chooseTime: '2023-09-12 11:30',
            status: '已选',
            score: 85,
            teacherName: '刘教授',
            semester: '2023秋季'
        }
    ];
    
    // 计算学分统计信息
    const creditStats = calculateCredits(courses);
    
    resultData.value = {
        personId: currentUserId.value,
        dataList: courses,
        ...creditStats
    };
};

// 选择课程
const editItem = async (index: number) => {
    try {
        const success = await presenter.chooseCourse(data.value, index, currentUserId.value);
        if (success) {
            // 选课成功后刷新数据
            await doQueryCourseList();
            // 如果当前在选课结果标签页，也刷新选课结果
            if (activeTab.value === 'courseResult') {
                await doQueryCourseResult();
            }
        }
    } catch (error) {
        ElMessage.error('选课失败');
        console.error('选课失败:', error);
    }
};

// 从可选课程列表退选课程
const deleteItem = async (index: number) => {
    try {
        await presenter.dropCourse(data.value, index, currentUserId.value);
        // 退选成功后刷新数据
        await doQueryCourseList();
        // 如果当前在选课结果标签页，也刷新选课结果
        if (activeTab.value === 'courseResult') {
            await doQueryCourseResult();
        }
    } catch (error) {
        ElMessage.error('退选失败');
        console.error('退选失败:', error);
    }
};

// 从选课结果退选课程
const dropCourseFromResult = async (index: number) => {
    const course = filteredDataList.value[index];
    try {
        // 这里应该调用presenter的退选方法
        ElMessage.success(`成功退选课程: ${course.courseName}`);
        // 刷新数据
        await doQueryCourseResult();
        // 同时刷新可选课程列表
        await doQueryCourseList();
    } catch (error) {
        ElMessage.error('退选失败');
        console.error('退选失败:', error);
    }
};

</script>

<style scoped>
.stat-card {
    text-align: center;
}

.stat-card :deep(.el-statistic__content) {
    font-size: 24px;
    font-weight: bold;
}

.stat-card :deep(.el-statistic__title) {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
}
</style>