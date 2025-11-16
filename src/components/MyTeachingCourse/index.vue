<template>
  <div class="my-teaching-course">
    <div class="header">
      <h2>我教的课</h2>
      <el-button type="primary" @click="loadTeachingCourses" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div class="course-list" v-loading="loading">
      <el-empty v-if="!loading && courses.length === 0" description="暂无授课信息" />
      
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="course in courses" :key="course.courseId">
          <el-card class="course-card" shadow="hover">
            <template #header>
              <div class="course-header">
                <span class="course-name">{{ course.name }}</span>
                <el-tag type="info" size="small">{{ course.credit }}学分</el-tag>
              </div>
            </template>
            
            <div class="course-info">
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>课程编号：{{ course.num }}</span>
              </div>
              <div class="info-item" >
                <el-icon><Connection /></el-icon>
                <span v-if="course.preCourse">先修课程：{{ course.preCourse }}</span>
                <span v-else>先修课程：无</span>
              </div>
              <div class="info-item">
                <el-icon><Link /></el-icon>
                <span>课程路径：{{ course.coursePath }}</span>
              </div>
            </div>

            <template #footer>
              <div class="card-footer">
                <el-button type="primary" size="small" @click="viewCourseDetails(course)">
                  查看详情
                </el-button>
<!--                <el-button size="small" @click="editCourse(course)">-->
<!--                  编辑-->
<!--                </el-button>-->
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="课程详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程名称">{{ selectedCourse.name }}</el-descriptions-item>
          <el-descriptions-item label="课程编号">{{ selectedCourse.num }}</el-descriptions-item>
          <el-descriptions-item label="学分">{{ selectedCourse.credit }}</el-descriptions-item>
          <el-descriptions-item label="先修课程">{{ selectedCourse.preCourse || '无' }}</el-descriptions-item>
          <el-descriptions-item label="课程路径" :span="2">{{ selectedCourse.coursePath }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 16px;">
          <el-text type="primary">选课学生</el-text>
        </div>
        <el-table :data="chooseRows" :border="true" :header-cell-style="{ textAlign: 'center' }"
                  :cell-style="{ textAlign: 'center' }" v-loading="chooseLoading" style="margin-top: 8px; width: 100%;">
          <el-table-column label="序号" width="60">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="学生学号" width="110">
            <template #default="scope">
              {{ scope.row.studentNum || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="班级" width="100">
            <template #default="scope">
              {{ scope.row.className || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="120">
            <template #default="scope">
              {{ scope.row.studentName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="成绩" width="100">
            <template #default="scope">
              <div v-if="editingScoreId === scope.row.personId">
                <el-input-number 
                  v-model="editingScoreValue" 
                  :min="0" 
                  :max="100" 
                  :precision="1"
                  size="small"
                  style="width: 80px"
                />
              </div>
              <div v-else>
                <span>{{ scope.row.mark ?? '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="scope">
              <div class="operation-buttons" v-if="editingScoreId === scope.row.personId">
                <el-button type="primary" size="small" @click="saveScore(scope.row)" :loading="savingScore">
                  <el-icon><Check /></el-icon>
                  保存
                </el-button>
                <el-button size="small" @click="cancelEditScore">
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </div>
              <div class="operation-buttons" v-else>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="editScore(scope.row)"
                  :disabled="!scope.row.studentNum"
                  circle
                  title="编辑成绩"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteScore(scope.row)"
                  :disabled="!scope.row.scoreId || scope.row.mark === null || scope.row.mark === undefined"
                  circle
                  title="删除成绩"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Connection, Link, Refresh, Edit, Delete, Check, Close } from '@element-plus/icons-vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { container } from '~/inverfiy.config'
import { ITeachingService } from '~/domain/boundaries/teaching-service'
import { ID_TEACHING_SERVICE } from '~/types'
import type { CourseItem } from '~/domain/models/teaching'

const { currentUserId } = useCurrentUser()
const teachingService = container.get<ITeachingService>(ID_TEACHING_SERVICE)

const loading = ref(false)
const courses = ref<CourseItem[]>([])
const detailDialogVisible = ref(false)
const selectedCourse = ref<CourseItem | null>(null)
const chooseLoading = ref(false)
interface ChooseRow {
  courseChooseId?: number
  personId: number
  studentNum?: string
  className?: string
  studentName?: string
  mark?: number
  scoreId?: number  // 添加scoreId字段，用于成绩删除
}
const chooseRows = ref<ChooseRow[]>([])

// 成绩编辑相关状态
const editingScoreId = ref<number | null>(null)
const editingScoreValue = ref<number>(0)
const savingScore = ref(false)

// 加载教师授课列表
const loadTeachingCourses = async () => {
  if (!currentUserId.value) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  try {
    // 调用后端API获取教师授课列表
    const response = await teachingService.getCourseListByTeacherId(currentUserId.value)
    if (response && Array.isArray(response)) {
      courses.value = response
    } else {
      courses.value = []
      ElMessage.info('暂无授课信息')
    }
  } catch (error) {
    console.error('获取授课列表失败:', error)
    ElMessage.error('获取授课列表失败，请稍后重试')
    courses.value = []
  } finally {
    loading.value = false
  }
}

// 查看课程详情
const viewCourseDetails = (course: CourseItem) => {
  selectedCourse.value = course
  detailDialogVisible.value = true
  // 重置编辑状态
  cancelEditScore()
  loadCourseChooseRows(course.courseId)
}

// 编辑课程
const editCourse = (course: CourseItem) => {
  ElMessage.info(`编辑课程功能开发中: ${course.name}`)
}

onMounted(() => {
  loadTeachingCourses()
})

const loadCourseChooseRows = async (courseId: number) => {
  chooseLoading.value = true
  try {
    const res = await teachingService.getCourseChooseList(0, courseId)
    let list: any[] = []
    if (res && Array.isArray(res.data)) {
      list = res.data
    } else if (res && res.data && Array.isArray(res.data.dataList)) {
      list = res.data.dataList
    }

    let scoreMap: Record<number, { mark?: number; studentNum?: string; studentName?: string; scoreId?: number }> = {}
    try {
      const scoreRes = await teachingService.getScoreList(0, courseId)
      if (Array.isArray(scoreRes)) {
        for (const s of scoreRes as any[]) {
          const pid = Number(s.personId || 0)
          if (pid > 0) {
            scoreMap[pid] = { 
              mark: s.mark, 
              studentNum: s.studentNum, 
              studentName: s.studentName,
              scoreId: s.scoreId  // 保存scoreId用于删除操作
            }
          }
        }
      }
    } catch (e) {}

    chooseRows.value = list.map((it: any) => {
      const pid = Number(it.personId || 0)
      const score = pid > 0 ? scoreMap[pid] || {} : {}
      return {
        courseChooseId: it.courseChooseId,
        personId: pid,
        studentNum: score.studentNum,
        className: it.className,
        studentName: score.studentName,
        mark: score.mark,
        scoreId: score.scoreId,  // 添加scoreId字段
      } as ChooseRow
    })
    if (!chooseRows.value.length) {
      ElMessage.info('暂无该课程的选课学生')
    }
  } catch (error) {
    ElMessage.error('获取选课学生失败')
    chooseRows.value = []
  } finally {
    chooseLoading.value = false
  }
}

// 编辑成绩
const editScore = (row: ChooseRow) => {
  editingScoreId.value = row.personId
  editingScoreValue.value = row.mark ?? 0
}

// 保存成绩
const saveScore = async (row: ChooseRow) => {
  if (!selectedCourse.value) return
  
  savingScore.value = true
  try {
    // 判断是新增还是修改：如果有scoreId则为修改，否则为新增
    const isUpdate = row.scoreId !== undefined && row.scoreId !== null
    
    // 调用后端API保存成绩
    const response = await teachingService.scoreSave(
      isUpdate ? row.scoreId : null, // 有scoreId表示更新，null表示新增
      row.personId,
      selectedCourse.value.courseId,
      editingScoreValue.value
    )
    
    if (response && response.code === 0) {
      ElMessage.success(isUpdate ? '成绩更新成功' : '成绩添加成功')
      // 更新本地数据
      const index = chooseRows.value.findIndex(item => item.personId === row.personId)
      if (index !== -1) {
        chooseRows.value[index].mark = editingScoreValue.value
        // 如果是新增操作，需要更新scoreId（如果后端返回了新的scoreId）
        if (!isUpdate && response.data && response.data.scoreId) {
          chooseRows.value[index].scoreId = response.data.scoreId
        }
      }
      cancelEditScore()
    } else {
      ElMessage.error(response?.msg || '成绩保存失败')
    }
  } catch (error) {
    console.error('保存成绩失败:', error)
    ElMessage.error('保存成绩失败，请稍后重试')
  } finally {
    savingScore.value = false
  }
}

// 删除成绩
const deleteScore = async (row: ChooseRow) => {
  if (!selectedCourse.value || !row.scoreId) {
    ElMessage.warning('无法删除：未找到成绩ID')
    return
  }
  
  try {
    // 先确认是否删除
    await ElMessageBox.confirm(
      `确定要删除学生 ${row.studentName || row.studentNum} 的成绩吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 调用后端API删除成绩 - 使用scoreId而不是personId
    const response = await teachingService.scoreDelete(row.scoreId)
    
    if (response && response.code === 0) {
      ElMessage.success('成绩删除成功')
      // 更新本地数据
      const index = chooseRows.value.findIndex(item => item.personId === row.personId)
      if (index !== -1) {
        chooseRows.value[index].mark = undefined
        chooseRows.value[index].scoreId = undefined  // 同时清除scoreId
      }
    } else {
      ElMessage.error(response?.msg || '成绩删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除成绩失败:', error)
      ElMessage.error('删除成绩失败，请稍后重试')
    }
  }
}

// 取消编辑
const cancelEditScore = () => {
  editingScoreId.value = null
  editingScoreValue.value = 0
}
</script>

<style scoped lang="scss">
.my-teaching-course {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
    }
  }

  .course-list {
    min-height: 400px;
  }

  .course-card {
    margin-bottom: 20px;
    height: 100%;

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .course-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .course-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        color: var(--el-text-color-regular);

        .el-icon {
          margin-right: 8px;
          color: var(--el-text-color-secondary);
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
    }
  }

  .course-detail {
    .el-descriptions {
      margin-top: 10px;
    }
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    
    .el-button {
      margin: 0;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .my-teaching-course {
    padding: 15px;

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      h2 {
        font-size: 18px;
      }
    }
  }
}
</style>