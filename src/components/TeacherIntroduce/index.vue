<template>
  <div v-loading="loading">
    <div class="teacherInfoContainer">
      <h2>个人简介</h2>
      <el-form ref="form" :model="data.info" label-width="120px" >
        <el-row>
          <el-col :span="21">
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="工号">
                  <el-input v-model="data.info.num" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="姓名">
                  <el-input v-model="data.info.name" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="学院">
                  <el-input v-model="data.info.dept" readonly />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="职称">
                  <el-input v-model="data.info.title" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="学位">
                  <el-input v-model="data.info.degree" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="性别">
                  <el-input v-model="data.info.genderName" readonly />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="出生日期">
                  <el-input v-model="data.info.birthday" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="邮箱">
                  <el-input v-model="data.info.email" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="电话">
                  <el-input v-model="data.info.phone" readonly />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="7">
                <el-form-item label="证件号">
                  <el-input v-model="data.info.card" readonly />
                </el-form-item>
              </el-col>
              <el-col :span="14">
                <el-form-item label="地址">
                  <el-input v-model="data.info.address" readonly />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="21">
                <el-form-item label="个人介绍">
                  <el-input v-model="data.info.introduce" type="textarea" :rows="3" placeholder="暂无个人介绍" readonly />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="3">
            <div class="teacher-photo-container">
              <template v-if="data.imgStr">
                <img :src="data.imgStr" alt="个人照片" class="teacher-photo" />
              </template>
              <template v-else>
                <el-empty description="暂无照片" />
              </template>
            </div>
          </el-col>
        </el-row>
      </el-form>

      <!-- 授课课程表格 -->
      <div class="course-section">
        <h3>授课课程</h3>
        <el-table :data="courses" border style="width: 100%" v-loading="courseLoading" size="small">
          <el-table-column prop="num" label="课程号" width="100" />
          <el-table-column prop="name" label="课程名" show-overflow-tooltip />
          <el-table-column prop="credit" label="学分" width="60" align="center" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="viewCourseDetails(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 教学统计图表区域 -->
      <div class="charts-section" v-if="data.courseStat.length">
        <h3>教学统计</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="chart-container">
              <div id="teacherChartBar" style="width: 100%; height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="chart-container">
              <div id="teacherChartPie" style="width: 100%; height: 300px;"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="chart-container">
              <div id="teacherChartLine" style="width: 100%; height: 300px;"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>

  <!-- 课程详情对话框 -->
  <el-dialog
    v-model="detailDialogVisible"
    title="课程详情"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="selectedCourse" class="course-detail">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="课程名称">{{ selectedCourse.name }}</el-descriptions-item>
        <el-descriptions-item label="课程编号">{{ selectedCourse.num }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ selectedCourse.credit }}</el-descriptions-item>
        <el-descriptions-item label="先修课程">{{ selectedCourse.preCourse || '无' }}</el-descriptions-item>
        <el-descriptions-item label="课程路径">{{ selectedCourse.coursePath }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup name="TeacherIntroduce">
import type { TeacherIntroduceData } from "~/domain/models/info";
import { container } from '~/inverfiy.config';
import { ECharts, init } from 'echarts';
import { ID_TEACHER_INTRODUCE_PRESENTER } from '~/types';
import { TeacherIntroducePresenter } from "~/domain/presenters/teacher-introduce-presenter";
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { TeacherItem } from "~/domain/models/person";
import { ElMessage } from 'element-plus';
import { ITeachingService } from '~/domain/boundaries/teaching-service';
import { ID_TEACHING_SERVICE } from '~/types';
import type { CourseItem } from '~/domain/models/teaching';

const presenter = container.get<TeacherIntroducePresenter>(ID_TEACHER_INTRODUCE_PRESENTER);
const teachingService = container.get<ITeachingService>(ID_TEACHING_SERVICE);
const data = ref<TeacherIntroduceData>({ info: { personId: 0 } as TeacherItem } as TeacherIntroduceData);
const loading = ref(false);
const courseLoading = ref(false);
const courses = ref<CourseItem[]>([]);
const detailDialogVisible = ref(false);
const selectedCourse = ref<CourseItem | null>(null);
let timer: string | number | NodeJS.Timeout | undefined;
let myChartBar: ECharts | null = null;
let myChartLine: ECharts | null = null;
let myChartPie: ECharts | null = null;

const props = defineProps({
  personId: {
    type: Number,
    required: true
  },
});

// 加载教师授课列表
const loadTeachingCourses = async () => {
  if (!data.value.personId) {
    return;
  }

  courseLoading.value = true;
  try {
    // 调用后端API获取教师授课列表
    const response = await teachingService.getCourseListByTeacherId(data.value.personId);
    if (response && Array.isArray(response)) {
      courses.value = response;
    } else {
      courses.value = [];
    }
  } catch (error) {
    console.error('获取授课列表失败:', error);
    ElMessage.error('获取授课列表失败，请稍后重试');
    courses.value = [];
  } finally {
    courseLoading.value = false;
  }
};

// 查看课程详情
const viewCourseDetails = (course: CourseItem) => {
  selectedCourse.value = course;
  detailDialogVisible.value = true;
};

const drawEcharts = () => {
  if (!data.value.courseStat.length || !data.value.semesterTrend.length) return;
  
  // 柱状图 - 课程成绩等级分布
  const barChart = init(document.getElementById('teacherChartBar') as HTMLDivElement);
  myChartBar = barChart;
  
  const barOption = {
    title: {
      text: '课程成绩等级分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.value.courseStat.map(item => item.label),
      axisLabel: {
        interval: 0,
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '课程数量'
    },
    series: [{
      data: data.value.courseStat.map(item => item.value),
      type: 'bar',
      itemStyle: {
        color: function(params: any) {
          const colors = ['#52c41a', '#a0d911', '#faad14', '#fa8c16', '#f5222d'];
          return colors[params.dataIndex % colors.length];
        }
      },
      label: {
        show: true,
        position: 'top'
      }
    }]
  };
  barChart.setOption(barOption);

  // 饼图 - 课程类型分布
  const pieChart = init(document.getElementById('teacherChartPie') as HTMLDivElement);
  myChartPie = pieChart;
  
  const pieOption = {
    title: {
      text: '课程类型分布',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [{
      name: '课程类型',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}: {c}'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '16',
          fontWeight: 'bold'
        }
      },
      data: data.value.courseStat.map(item => ({
        name: item.label,
        value: item.value
      }))
    }],
    color: ['#52c41a', '#a0d911', '#faad14', '#fa8c16', '#f5222d']
  };
  pieChart.setOption(pieOption);

  // 折线图 - 学期平均分趋势
  const lineChart = init(document.getElementById('teacherChartLine') as HTMLDivElement);
  myChartLine = lineChart;
  
  const lineOption = {
    title: {
      text: '学期平均分趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        return `${params[0].name}<br/>平均分: ${params[0].value}分`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.value.semesterTrend.map(item => item.semester),
      axisLabel: {
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '平均分',
      min: 60,
      max: 100
    },
    series: [{
      name: '平均分',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: data.value.semesterTrend.map(item => item.avgScore),
      lineStyle: {
        width: 3,
        color: '#1890ff'
      },
      itemStyle: {
        color: '#1890ff'
      },
      markLine: {
        data: [{
          type: 'average',
          name: '平均值',
          label: {
            formatter: '平均: {c}'
          }
        }]
      }
    }]
  };
  lineChart.setOption(lineOption);
};

const resizeChart = () => {
  if (myChartBar) myChartBar.resize();
  if (myChartPie) myChartPie.resize();
  if (myChartLine) myChartLine.resize();
};

const initChart = async () => {
  loading.value = true;
  await presenter.teacherIntroduceInit(data.value);
  loading.value = false;
  
  // 加载教师授课列表
  if (data.value.personId) {
    await loadTeachingCourses();
  }
  
  drawEcharts();
};

watch(
  () => props.personId,
  val => {
    console.log("teacher personId", val);
    data.value.personId = val;
    initChart();
  },
  { immediate: true }
);

onMounted(async () => {
  await initChart();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  clearTimeout(timer);
  timer = 0;
});



</script>

<style scoped>
.teacherInfoContainer {
  padding: 20px;
}

.teacher-photo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.teacher-photo {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.charts-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.charts-section h3 {
  margin: 0 0 20px 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 500;
}

.chart-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chart-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
  color: var(--el-text-color-primary);
  cursor: default;
}

/* 课程区域样式 */
.course-section {
  margin-top: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.course-section h3 {
  margin: 0 0 15px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
}

.course-detail {
  .el-descriptions {
    margin-top: 0;
  }
}
</style>