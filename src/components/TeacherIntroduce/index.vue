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

<!--      &lt;!&ndash; 教学统计图表区域 &ndash;&gt;-->
<!--      <div class="charts-section" v-if="data.statistics">-->
<!--        <h3>教学统计</h3>-->
<!--        <el-row :gutter="20">-->
<!--          <el-col :span="8">-->
<!--            <div class="chart-container">-->
<!--              <div id="teacherChartBar" style="width: 100%; height: 300px;"></div>-->
<!--            </div>-->
<!--          </el-col>-->
<!--          <el-col :span="8">-->
<!--            <div class="chart-container">-->
<!--              <div id="teacherChartPie" style="width: 100%; height: 300px;"></div>-->
<!--            </div>-->
<!--          </el-col>-->
<!--          <el-col :span="8">-->
<!--            <div class="chart-container">-->
<!--              <div id="teacherChartLine" style="width: 100%; height: 300px;"></div>-->
<!--            </div>-->
<!--          </el-col>-->
<!--        </el-row>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script lang="ts" setup name="TeacherIntroduce">
import type { TeacherIntroduceData } from "~/domain/models/info";
import { container } from '~/inverfiy.config';
import { ECharts, init } from 'echarts';
import { ID_TEACHER_INTRODUCE_PRESENTER } from '~/types';
import { TeacherIntroducePresenter } from "~/domain/presenters/teacher-introduce-presenter";
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { TeacherItem } from "~/domain/models/person";

const presenter = container.get<TeacherIntroducePresenter>(ID_TEACHER_INTRODUCE_PRESENTER);
const data = ref<TeacherIntroduceData>({ info: { personId: 0 } as TeacherItem } as TeacherIntroduceData);
const loading = ref(false);
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

const initChart = async () => {
  loading.value = true;
  await presenter.teacherIntroduceInit(data.value);
  loading.value = false;
  //drawEcharts();
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
  //window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  //window.removeEventListener('resize', resizeChart);
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
</style>