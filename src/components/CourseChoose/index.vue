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
                        <div style="display: inline-flex; align-items: center;">
                            <el-text style="margin-right: 12px; white-space: nowrap;">课程号或课程名</el-text>
                            <el-input v-model="data.numName" style="width:220px;margin-right: 12px;" placeholder="请输入课程号或课程名" />
                            <el-button type="danger" plain @click="doQueryCourseList()">查询</el-button>
                        </div>
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
                        <el-table-column label="课程号" width="180">
                            <template v-slot="scope">
                                <div style="text-align: left; padding-left: 10px;">{{ scope.row.num }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="课程名" width="250" show-overflow-tooltip>
                            <template v-slot="scope">
                                <div style="text-align: left; padding-left: 10px;">{{ scope.row.name }}</div>
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
                <el-tab-pane :label="isAdmin ? '选课结果' : '我的选课结果'" name="courseResult">
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
                        <!-- 只在非管理员模式下显示总学分 -->
                        <el-col :span="6" v-if="!isAdmin">
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
                                <!-- 尝试不同可能的成绩字段名称 -->
                                <span :class="getScoreClass(scope.row)">
                                    {{ getScoreValue(scope.row) || '未出成绩' }}
                                </span>
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

        <!-- 学生选择对话框组件 -->
        <el-dialog
            v-model="showStudentDialog"
            :title="dialogTitle"
            width="500px"
            :close-on-click-modal="false"
            @close="handleStudentCancel"
        >
            <el-radio-group v-model="selectedStudentId" style="max-height: 300px; overflow-y: auto; display: block;">
                <div 
                    v-for="student in studentOptions" 
                    :key="student.id"
                    style="margin: 10px 0; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;"
                >
                    <el-radio :label="student.id">{{ student.title || '未知学生' }} (学号: {{ student.value || '无' }})</el-radio>
                </div>
            </el-radio-group>
            <template #footer>
                <el-button @click="handleStudentCancel">取消</el-button>
                <el-button type="primary" @click="handleStudentConfirm">确认</el-button>
            </template>
        </el-dialog>
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
import { ID_SCORE_PRESENTER } from '~/types';
import { ScorePresenter } from "~/domain/presenters/score-presenter";

const presenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
const scorePresenter = container.get<ScorePresenter>(ID_SCORE_PRESENTER);
const { currentUserId, currentUserName, isLoggedIn, isAdmin } = useCurrentUser();

// 可选课程相关数据
const data = ref<CourseData>({} as CourseData);

// 选课结果相关数据
const resultData = ref<CourseChooseResultData>({
    personId: 0,
    dataList: [],
    totalCredits: 0,
    totalCourses: 0,
    passedCourses: 0
});

const loading = ref(false);
const activeTab = ref('courseList');

// 过滤后的选课结果数据列表
const filteredDataList = computed(() => {
    return resultData.value.dataList;
});

// 获取成绩显示值
const getScoreValue = (row: any) => {
    // 直接使用mark字段，因为我们已经从成绩接口获取并设置了这个字段
    return row.mark !== undefined && row.mark !== null && row.mark !== '' ? row.mark : null;
};

// 获取成绩显示样式类
const getScoreClass = (row: any) => {
    const score = getScoreValue(row);
    
    // 检查成绩是否有效且通过（>=60）
    if (score !== null && score >= 60) {
        return 'text-success';
    }
    
    return score !== null ? 'text-danger' : '';
};

// 计算总学分
const calculateCredits = (courses: any[]) => {
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
    try {
        // 加载选课结果
        await loadCourseResults();
    } catch (error) {
        ElMessage.error('查询失败');
        console.error('查询失败:', error);
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
        // 确保courseResultData和dataList存在
        if (courseResultData && courseResultData.dataList) {
            console.log(`成功获取到 ${courseResultData.dataList.length} 条选课记录`);
            
            // 调用getScoreList获取成绩数据
            try {
                    // 根据用户类型决定如何获取成绩
                    let coursesWithScores = [];
                    
                    if (isAdmin.value) {
                        console.log('管理员模式：为每个学生分别获取成绩');
                        // 管理员模式：为每个选课记录获取对应的学生成绩
                        coursesWithScores = await Promise.all(courseResultData.dataList.map(async (course: any) => {
                            // 使用选课记录中的学生ID获取成绩
                            const studentPersonId = course.personId || course.studentId;
                            if (studentPersonId) {
                                const scoreData: any = { 
                                    personId: studentPersonId, 
                                    courseId: course.courseId, 
                                    dataList: [], 
                                    studentList: [], 
                                    courseList: [] 
                                };
                                
                                try {
                                    await scorePresenter.getScoreList(scoreData);
                                    // 查找对应课程的成绩
                                    const scoreRecord = scoreData.dataList?.find((s: any) => s.courseId === course.courseId);
                                    return {
                                        ...course,
                                        mark: scoreRecord?.mark || null
                                    };
                                } catch (err) {
                                    console.error(`获取学生 ${studentPersonId} 课程 ${course.courseId} 成绩失败:`, err);
                                    return {
                                        ...course,
                                        mark: null
                                    };
                                }
                            }
                            return {
                                ...course,
                                mark: null
                            };
                        }));
                    } else {
                        // 学生模式：使用当前用户ID获取成绩
                        console.log(`学生模式：获取用户ID ${currentUserId.value} 的所有成绩`);
                        const scoreData: any = { personId: currentUserId.value, courseId: null, dataList: [], studentList: [], courseList: [] };
                        await scorePresenter.getScoreList(scoreData);
                        console.log(`成功获取到 ${scoreData.dataList?.length || 0} 条成绩记录`);
                        
                        // 创建成绩映射表，便于快速查找
                        const scoreMap = new Map();
                        if (scoreData.dataList && Array.isArray(scoreData.dataList)) {
                            scoreData.dataList.forEach((score: any) => {
                                // 确保score对象有效且包含必要字段
                                if (score && score.courseId !== undefined && score.mark !== undefined) {
                                    scoreMap.set(score.courseId, score.mark);
                                }
                            });
                        }
                        
                        // 将成绩合并到选课结果中
                        coursesWithScores = courseResultData.dataList.map((course: any) => ({
                            ...course,
                            mark: scoreMap.get(course.courseId) || null
                        }));
                    }
                    
                    // 重新计算统计信息
                    const creditStats = calculateCredits(coursesWithScores);
                    resultData.value = {
                        personId: currentUserId.value,
                        dataList: coursesWithScores,
                        ...creditStats
                    };
                    
                    
            } catch (scoreError) {
                console.error('获取成绩数据失败:', scoreError);
                // 如果获取成绩失败，仍然显示选课结果但不添加成绩
                const creditStats = calculateCredits(courseResultData.dataList);
                resultData.value = {
                    personId: currentUserId.value,
                    dataList: courseResultData.dataList,
                    ...creditStats
                };
                ElMessage.warning('成功加载选课记录，但获取成绩数据失败');
            }
        } else {
            console.error('获取到的选课结果数据格式不正确');
            ElMessage.error('获取选课结果失败');
            resultData.value = {
                personId: currentUserId.value || 0,
                dataList: [],
                totalCredits: 0,
                totalCourses: 0,
                passedCourses: 0
            };
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

// 存储待选课程和选中的学生ID
const pendingCourse = ref<any | null>(null);
const selectedStudentId = ref<number | undefined>(undefined);
// 学生选项列表和对话框显示状态
const studentOptions = ref<any[]>([]);
const showStudentDialog = ref(false);
const dialogTitle = ref('');

// 选择课程
const editItem = async (index: number) => {
    try {
        // 获取要选择的课程
        const course = data.value.dataList[index];
        if (!course) {
            ElMessage.error('课程信息不存在');
            return;
        }
        
        // 管理员模式下的特殊逻辑
        if (isAdmin.value) {
            // 点击课程，选择学生
            pendingCourse.value = course;
            try {
                // 获取学生选项列表并显示对话框
                studentOptions.value = await presenter.getStudentItemOptionList();
                if (!studentOptions.value || studentOptions.value.length === 0) {
                    ElMessage.warning('暂无学生数据');
                    pendingCourse.value = null;
                    return;
                }
                
                // 设置对话框标题并显示对话框
                dialogTitle.value = `请选择要为其选课的学生 (课程: ${course.name})`;
                showStudentDialog.value = true;
            } catch (err) {
                console.error('获取学生列表失败:', err);
                ElMessage.error('获取学生列表失败');
                pendingCourse.value = null;
            }
        } else {
            // 普通用户模式，直接选课
            const success = await presenter.chooseCourse(data.value, index, currentUserId.value);
            if (success) {
                // 重新加载选课结果
                await doQueryCourseResult();
            }
        }
    } catch (error) {
        // 忽略取消操作的错误
        if (error !== 'cancel' && !(error instanceof Error && error.message === 'cancel')) {
            ElMessage.error('选课失败：' + (error instanceof Error ? error.message : String(error)));
            console.error('选课失败:', error);
            // 重置状态
            pendingCourse.value = null;
            selectedStudentId.value = undefined;
        }
    }
};

    // 处理学生选择对话框确认
    const handleStudentConfirm = async () => {
        if (!selectedStudentId.value || !pendingCourse.value) {
            ElMessage.warning('请先选择学生');
            return;
        }
        
        try {
            // 找到课程在数据列表中的索引
            const courseIndex = data.value.dataList.findIndex(c => c.courseId === pendingCourse.value.courseId);
            if (courseIndex === -1) {
                ElMessage.error('课程不存在于可选列表中');
                return;
            }
            
            // 调用presenter的选课方法，使用选中的学生ID
            const success = await presenter.chooseCourse(data.value, courseIndex, selectedStudentId.value);
            if (success) {
                // 重新加载选课结果
                await doQueryCourseResult();
                ElMessage.success(`已为学生选课成功`);
            }
        } catch (error) {
            console.error('选课失败:', error);
            ElMessage.error('选课失败：' + (error instanceof Error ? error.message : String(error)));
        } finally {
            // 重置状态并关闭对话框
            pendingCourse.value = null;
            selectedStudentId.value = undefined;
            showStudentDialog.value = false;
        }
    };

    // 处理学生选择对话框取消
    const handleStudentCancel = () => {
        pendingCourse.value = null;
        selectedStudentId.value = undefined;
        showStudentDialog.value = false;
    }

    // 从选课结果退选课程
    const dropCourseFromResult = async (courseChooseId: number) => {
        if (!courseChooseId || courseChooseId <= 0) {
            console.warn('缺少有效的课程选择ID，无法执行退选操作');
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