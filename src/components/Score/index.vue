<template>
    <el-dialog :title="itemData.scoreId ? '编辑成绩' : '添加成绩'" v-model="editVisible" :close-on-click-modal="false">
        <el-form ref="formRef" :model="itemData" class="edit-form" label-width="120px" :rules="rules">
            <el-form-item label="学生" prop="personId">
                <el-select v-model="itemData.personId" placeholder="请选择学生" style="width: 100%;" @change="handleStudentChange">
                    <el-option v-for="item in data.studentList" :key="item.id" :value="item.id" :label="item.title" />
                </el-select>
            </el-form-item>
            <el-form-item label="课程" prop="courseId">
                <el-select v-model="itemData.courseId" placeholder="请选择课程" style="width: 100%;">
                    <el-option v-for="item in availableCourses" :key="item.id" :value="item.id" :label="item.title" />
                    <el-option v-if="availableCourses.length === 0" value="" label="请先选择学生" disabled />
                </el-select>
            </el-form-item>
            <el-form-item label="成绩" prop="mark">
                <el-input v-model.number="itemData.mark" placeholder="请输入0-100之间的成绩" type="number" min="0" max="100" />
                <div class="form-tip">请输入0-100之间的整数成绩</div>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="itemSubmit()">{{ itemData.scoreId ? '更新' : '添加' }}</el-button>
                <el-button @click="editVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <div>
        <el-row :gutter="20" style="margin-bottom: 10px;">
            <el-col :span="12" style="text-align: left;">
                <el-button type="primary" @click="addItem()" v-if="!isStudent">添加成绩</el-button>
            </el-col>
            <el-col :span="12" style="text-align: right;">
                <!-- 学生端隐藏选择框，自动使用当前学生ID -->
                <template v-if="!isStudent">
                    <div style="display: inline-flex; align-items: center; margin-right: 16px;">
                        <el-text style="margin-right: 8px; text-align: left;">学生</el-text>
                        <el-select v-model="data.personId" placeholder="全部学生" style="width: 180px;">
                            <el-option v-for="item in data.studentList" :key="item.id" :value="item.id" :label="item.title" />
                        </el-select>
                    </div>
                    <div style="display: inline-flex; align-items: center; margin-right: 16px;">
                        <el-text style="margin-right: 8px; text-align: left;">课程</el-text>
                        <el-select v-model="data.courseId" placeholder="全部课程" style="width: 180px;">
                            <el-option v-for="item in data.courseList" :key="item.id" :value="item.id" :label="item.title" />
                        </el-select>
                    </div>
                </template>
                <!-- 学生端显示提示信息 -->
                <template v-else>
                    <div style="display: inline-flex; align-items: center; margin-right: 16px;">
                        <el-text type="primary">正在查询您的成绩...</el-text>
                    </div>
                </template>
                <div style="display: inline-flex; align-items: center;">
                    <el-button type="primary" :loading="loading" @click="doQuery()">查询</el-button>
                </div>
            </el-col>
        </el-row>
        <el-table :data="data.dataList" :border="true" :header-cell-style="{ textAlign: 'center' }"
            :cell-style="{ textAlign: 'center' }" v-loading="loading">
            <el-table-column label="序号" width="70">
                <template v-slot="scope">
                    {{ scope.$index + 1 }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template v-slot="scope">
                    <el-button type="primary" size="small" @click="editItem(scope.$index)" v-if="!isStudent">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteItem(scope.$index)" v-if="!isStudent">删除</el-button>
                </template>
            </el-table-column>
            <el-table-column label="学号" width="140">
                <template v-slot="scope">
                    {{ scope.row.studentNum }}
                </template>
            </el-table-column>
            <el-table-column label="姓名" width="100">
                <template v-slot="scope">
                    {{ scope.row.studentName }}
                </template>
            </el-table-column>
            <el-table-column label="班级" width="200">
                <template v-slot="scope">
                    {{ scope.row.className }}
                </template>
            </el-table-column>
            <el-table-column label="课程号" width="140">
                <template v-slot="scope">
                    {{ scope.row.courseNum }}
                </template>
            </el-table-column>
            <el-table-column label="课程名" width="200" show-overflow-tooltip>
                <template v-slot="scope">
                    {{ scope.row.courseName }}
                </template>
            </el-table-column>
            <el-table-column label="学分" width="100">
                <template v-slot="scope">
                    {{ scope.row.credit }}
                </template>
            </el-table-column>
            <el-table-column label="成绩" width="100">
                <template v-slot="scope">
                    <span :class="getScoreClass(scope.row.mark)">{{ scope.row.mark }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script lang="ts" setup name="Score">
import type { ScoreData, ScoreItem } from "~/domain/models/teaching";
import { container } from '~/inverfiy.config';
import { ID_SCORE_PRESENTER, ID_REQUEST_SERVICE, ID_COURSE_PRESENTER } from '~/types';
import type { IRequestService } from '~/infrastructure/boundaries/request-service';
import { ScorePresenter } from "~/domain/presenters/score-presenter";
import { ref, reactive, computed, onMounted } from "vue";
import { useCurrentUser } from '~/composables/useCurrentUser';
import { ElMessage } from "element-plus";
import type { CoursePresenter } from '~/domain/presenters/course-presenter';

const presenter = container.get<ScorePresenter>(ID_SCORE_PRESENTER);
const coursePresenter = container.get<CoursePresenter>(ID_COURSE_PRESENTER);
let data = ref<ScoreData>({} as ScoreData);
const { isStudent, isTeacher, isLoggedIn, currentUserId, currentUserName, isAdmin } = useCurrentUser();
let itemData = reactive<ScoreItem>({} as ScoreItem);
let editVisible = ref(false);
let loading = ref(false);
// 为availableCourses添加明确的类型定义
interface CourseOption {
  id: number;
  title: string;
}
let availableCourses = ref<CourseOption[]>([]);
// 移除显式声明的form变量，让Vue自动处理表单引用

// 表单验证规则
const rules: Record<string, any[]> = {
  personId: [
    { required: true, message: '请选择学生', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'blur' }
  ],
  mark: [
    { required: true, message: '请输入成绩', trigger: 'blur' },
    { type: Number, min: 0, max: 100, message: '成绩必须在0-100之间', trigger: 'blur' }
  ]
};

// 根据成绩获取样式类
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent';
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-pass';
  return 'score-fail';
};

// 初始化数据
const initData = async () => {
  try {
    loading.value = true;
    
    // 打印详细的用户信息，确认currentUserId的值
    console.log('当前用户信息:', {
      isLoggedIn: isLoggedIn.value,
      currentUserId: currentUserId.value,
      currentUserName: currentUserName.value,
      isStudent: isStudent.value,
      isTeacher: isTeacher.value
    });
    
    // 确保用户已登录且有有效的ID
    if (!isLoggedIn.value) {
      console.warn('用户未登录');
      ElMessage.warning('请先登录再访问成绩管理');
      return;
    }
    
    // 对于学生，默认查询自己的成绩，但管理员可以查询所有成绩
    let initialPersonId = null;
    if (isStudent.value && currentUserId.value > 0 && !isAdmin.value) {
      initialPersonId = currentUserId.value;
    }
    
    console.log(`开始初始化成绩数据，初始personId: ${initialPersonId}`);
    const res = await presenter.scoreInit(initialPersonId);
    data.value = res;
    
    // 学生端自动设置personId，但管理员不受此限制
    if (isStudent.value && currentUserId.value > 0 && !isAdmin.value) {
      data.value.personId = currentUserId.value;
    }
  } catch (error) {
    console.error('初始化成绩数据失败:', error);
    ElMessage.error('初始化数据失败，请刷新页面重试');
    // 设置空数据对象，避免显示错误
    data.value = {
      personId: null,
      courseId: 0,
      dataList: [],
      studentList: [],
      courseList: []
    };
  } finally {
    loading.value = false;
  }
};

// 查询成绩列表
const doQuery = async () => {
  try {
    loading.value = true;
    
    // 验证查询条件
    if (!isTeacher.value && !isStudent.value && !isAdmin.value) {
      ElMessage.warning('您没有权限查看成绩信息');
      return;
    }
    
    // 学生只能查询自己的成绩，但管理员可以查询所有成绩
    if (isStudent.value && !isAdmin.value) {
      data.value.personId = currentUserId.value;
    }
    
    console.log(`查询成绩条件: personId=${data.value.personId}, courseId=${data.value.courseId}`);
    await presenter.getScoreList(data.value);
    
    // 如果没有数据，显示提示信息
    if (data.value.dataList && data.value.dataList.length === 0) {
      ElMessage.info('暂无符合条件的成绩数据');
    } else if (data.value.dataList) {
      console.log(`成功获取到 ${data.value.dataList.length} 条成绩记录`);
    }
  } catch (error) {
    console.error('查询成绩失败:', error);
    ElMessage.error('查询失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 声明表单引用
const formRef = ref();

// 添加成绩
const addItem = () => {
  // 重置表单数据
  Object.assign(itemData, {
    scoreId: null,
    personId: null,
    courseId: 0,
    mark: undefined
  });
  // 重置可用课程列表
  availableCourses.value = [];
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields();
  }
  editVisible.value = true;
};

// 处理学生选择变化
const handleStudentChange = async () => {
  // 重置课程选择
  itemData.courseId = 0;
  
  // 如果选择了学生，加载该学生的选课列表
  if (itemData.personId) {
    // 先清空可用课程列表，避免显示旧数据
    availableCourses.value = [];
    
    try {
      console.log('开始获取学生选课列表，personId:', itemData.personId);
      
      // 创建一个临时的请求服务来获取数据，避免访问私有属性
      // 直接使用coursePresenter的getCourseChooseResults方法，这更符合我们的分层架构设计
      const courseResultData = await coursePresenter.getCourseChooseResults(itemData.personId);
      
      console.log('获取选课列表结果:', courseResultData);
      
      // 处理响应数据，考虑不同的响应格式
      let courseChooseList = [];
      
      // 检查响应是否有效
      if (courseResultData && courseResultData.dataList) {
        // 获取选课列表数据
        courseChooseList = courseResultData.dataList;
        
        console.log('解析后的选课列表:', courseChooseList);
        
        // 转换为下拉框需要的格式
        availableCourses.value = courseChooseList
          .filter((course: any) => course && course.courseId && (course.courseNum || course.courseName))
          .map((course: any) => ({
            id: Number(course.courseId),
            title: `${course.courseNum || '未知编号'} - ${course.courseName || '未知课程'}`
          }));
        
        console.log('转换后的可用课程列表:', availableCourses.value);
        
        // 如果没有选课记录，显示提示信息
        if (availableCourses.value.length === 0) {
          ElMessage.warning('该学生尚未选修任何课程');
        }
      } else {
        // 响应无效时的处理
        console.error('选课列表响应无效:', courseResultData);
        ElMessage.warning('获取选课列表失败: 无效的响应数据');
        // 不显示所有课程，而是保持空列表
      }
    } catch (error) {
      console.error('获取学生选课列表失败:', error);
      ElMessage.error('获取学生选课列表失败');
      // 错误时保持空列表，不显示所有课程
      availableCourses.value = [];
    }
  } else {
    // 未选择学生时清空课程列表
    availableCourses.value = [];
  }
};

// 编辑成绩
const editItem = async (index: number) => {
  try {
      itemData = reactive({ ...data.value.dataList[index] });
      // 编辑模式下显示所有课程，因为成绩已存在
      // 转换courseList为正确的CourseOption类型
      availableCourses.value = data.value.courseList
        .filter((course: any) => course.id && course.title)
        .map((course: any) => ({
          id: Number(course.id),
          title: course.title
        }));
      editVisible.value = true;
  } catch (error) {
    console.error('编辑成绩失败:', error);
    ElMessage.error('加载编辑数据失败');
  }
};

// 提交成绩
const itemSubmit = async () => {
  try {
    // 验证表单
    if (!formRef.value) return;
    await formRef.value.validate();
    
    // 验证是否有权限操作
    if (!isTeacher.value && !isAdmin.value) {
      ElMessage.warning('您没有权限添加或编辑成绩');
      return;
    }
    
    // 提交数据
    loading.value = true;
    console.log('提交成绩数据:', itemData);
    await presenter.itemSubmit(itemData, data.value);
    editVisible.value = false;
  } catch (error) {
    // 表单验证失败时不显示错误提示
    if (error !== false) {
      console.error('提交成绩失败:', error);
      ElMessage.error('提交失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

// 删除成绩
const deleteItem = async (index: number) => {
  try {
    await presenter.deleteItem(data.value, index);
  } catch (error) {
    console.error('删除成绩失败:', error);
    ElMessage.error('删除失败，请稍后重试');
  }
};

// 页面加载时初始化数据
onMounted(async () => {
  await initData();
});
</script>
<style scoped>
.edit-form {
  padding: 20px 0;
}
.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
/* 成绩样式 */
:deep(.score-excellent) {
  color: #67c23a;
  font-weight: bold;
}
:deep(.score-good) {
  color: #409eff;
  font-weight: bold;
}
:deep(.score-pass) {
  color: #e6a23c;
}
:deep(.score-fail) {
  color: #f56c6c;
  font-weight: bold;
}
</style>