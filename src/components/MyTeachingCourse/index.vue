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
      width="600px"
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
                  :cell-style="{ textAlign: 'center' }" v-loading="chooseLoading" style="margin-top: 8px;">
          <el-table-column label="序号" width="70">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="学生学号" width="120">
            <template #default="scope">
              {{ scope.row.studentNum || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="140">
            <template #default="scope">
              {{ scope.row.studentName || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="成绩" width="100">
            <template #default="scope">
              <span>{{ scope.row.mark ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="班级" width="120">
            <template #default="scope">
              {{ scope.row.className || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Connection, Link, Refresh } from '@element-plus/icons-vue'
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
}
const chooseRows = ref<ChooseRow[]>([])

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

    let scoreMap: Record<number, { mark?: number; studentNum?: string; studentName?: string }> = {}
    try {
      const scoreRes = await teachingService.getScoreList(0, courseId)
      if (Array.isArray(scoreRes)) {
        for (const s of scoreRes as any[]) {
          const pid = Number(s.personId || 0)
          if (pid > 0) {
            scoreMap[pid] = { mark: s.mark, studentNum: s.studentNum, studentName: s.studentName }
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