<template>
  <div v-loading="loading">
  <div class="studentInfoContainer">
    <h2>个人简介</h2>
    <el-form ref="form" :model="data.info" label-width="120px" >
        <el-row>
            <el-col :span="21">
                <el-row :gutter="20">
                    <el-col :span="7">
                        <el-form-item label="学号">
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
                        <el-form-item label="专业">
                            <el-input v-model="data.info.major" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :span="7">
                        <el-form-item label="班级">
                            <el-input v-model="data.info.className" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :span="7">
                        <el-form-item label="证件号码">
                            <el-input v-model="data.info.card" readonly />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="7">
                        <el-form-item label="性别">
                            <el-input v-model="data.info.genderName" readonly />
                        </el-form-item>
                    </el-col>
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
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="7">
                        <el-form-item label="电话">
                            <el-input v-model="data.info.phone" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :span="7">
                        <el-form-item label="地址">
                            <el-input v-model="data.info.address" readonly />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="3">
                <div class="student-photo-container">
                    <template v-if="data.imgStr">
                        <img :src="data.imgStr" alt="个人照片" class="student-photo" />
                    </template>
                    <template v-else>
                        <el-empty description="暂无照片" />
                    </template>
                </div>
            </el-col>
        </el-row>
    </el-form>
    <el-table :data="data.scoreList" :border="true" :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }">
        <el-table-column label="序号" width="70">
            <template v-slot="scope">
                {{ scope.$index + 1 }}
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
                {{ scope.row.mark }}
            </template>
        </el-table-column>
    </el-table>
  </div>
    <div style="width: 100%; margin-top: 20px;">
        <el-row :gutter="20">
            <el-col :span="8">
                <div id="myChartBar"
                    style="width: 100%; height: 300px; border: 1px solid #e4e7ed; border-radius: 8px; padding: 10px;">
                </div>
            </el-col>
            <el-col :span="8">
                <div id="myChartPie"
                    style="width: 100%; height: 300px; border: 1px solid #e4e7ed; border-radius: 8px; padding: 10px;">
                </div>
            </el-col>
            <el-col :span="8">
                <div id="myChartLine"
                    style="width: 100%; height: 300px; border: 1px solid #e4e7ed; border-radius: 8px; padding: 10px;">
                </div>
            </el-col>
        </el-row>
    </div>
  </div>
</template>
<script lang="ts" setup name="StudentIntroduce">
import type { StudentIntroduceData } from "~/domain/models/info";
import { container } from '~/inverfiy.config';
import { ECharts, init } from 'echarts';
import { ID_STUDENT_INTRODUCE_PRESENTER } from '~/types';
import { StudentIntroducePresenter } from "~/domain/presenters/student-introduce-presenter";
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { StudentItem } from "~/domain/models/person";
const presenter = container.get<StudentIntroducePresenter>(ID_STUDENT_INTRODUCE_PRESENTER);
let data = ref<StudentIntroduceData>({ info: { personId: 0 } as StudentItem } as StudentIntroduceData);
let loading = ref(false);
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
    await presenter.studentIntroduceInit(data.value);
    loading.value = false;
    drawEcharts();
};

watch(
    () => props.personId,
    val => {
        console.log("value", val);
        data.value.personId = val;
        initChart();
    },
    { immediate: true }
)

onMounted(async () => {
    await initChart();
    window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    clearTimeout(timer);
    timer = 0;
});

const drawEcharts = () => {
    //绘制用户活跃图表
    if (
        myChartBar != null &&
        myChartBar != undefined
    ) {
        myChartBar.dispose(); //解决echarts dom已经加载的报错
    }
    if (
        myChartLine != null &&
        myChartLine != undefined
    ) {
        myChartLine.dispose(); //解决echarts dom已经加载的报错
    }
    if (
        myChartPie != null &&
        myChartPie != undefined
    ) {
        myChartPie.dispose(); //解决echarts dom已经加载的报错
    }
    myChartBar = init(
        document.getElementById("myChartBar") as any
    );
    myChartBar.setOption({
        title: { text: "课程成绩" },
        tooltip: { trigger: "axis" },
        xAxis: {
            type: "category",
            data: data.value.scoreList.map((item) => item.courseName),
            axisLabel: { interval: 0, rotate: 30 }
        },
        yAxis: { type: "value", min: 0, max: 100 },
        visualMap: {
            show: false,
            pieces: [
                { min: 90, color: "#2E7D32" },
                { min: 80, max: 89, color: "#67C23A" },
                { min: 70, max: 79, color: "#F7BA2A" },
                { min: 60, max: 69, color: "#E67E22" },
                { max: 59, color: "#F56C6C" }
            ]
        },
        series: [
            {
                name: "成绩",
                type: "bar",
                data: data.value.scoreList.map((item) => Number(item.mark)),
                label: { show: true, position: "top" }
            },
        ],
    });
    myChartLine = init(
        document.getElementById("myChartLine") as any
    );
    
    // 按课程号排序并计算累计平均分
    const sorted = [...data.value.scoreList].sort((a, b) => String(a.courseNum).localeCompare(String(b.courseNum)));
    const cumulativeAverages = [];
    let sum = 0;
    
    sorted.forEach((item, index) => {
      sum += Number(item.mark);
      cumulativeAverages.push(Math.round(sum / (index + 1) * 10) / 10);
    });
    
    myChartLine.setOption({
        title: { 
          text: "成绩趋势",
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: { 
          trigger: "axis",
          formatter: function(params: any) {
            const index = params[0].dataIndex;
            const currentScore = sorted[index].mark;
            const avgScore = params[0].value;
            return `${params[0].name}<br/>当前成绩: ${currentScore}分<br/>累计平均: ${avgScore}分`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: { 
          type: "category", 
          data: sorted.map(item => item.courseNum),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: { 
          type: "value", 
          min: 60, 
          max: 100,
          name: '平均分'
        },
        series: [
            {
                name: "累计平均分",
                type: "line",
                data: cumulativeAverages,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
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
                    name: '总平均',
                    label: {
                      formatter: '总平均: {c}'
                    }
                  }]
                }
            },
        ],
    });
    myChartPie = init(
        document.getElementById("myChartPie") as any
    );
    myChartPie.setOption({
        title: { text: "成绩分布" },
        tooltip: {},
        color: ["#2E7D32", "#67C23A", "#F7BA2A", "#E67E22", "#F56C6C"],
        legend: {
            orient: "horizontal",
            x: "center",
            y: "bottom",
            data: data.value.markList.map((item) => item.title),
        },
        series: [
            {
                type: "pie",
                data: data.value.markList,
            },
        ],
    });
};
const resizeChart = (): void => {
    timer = setTimeout(() => {
        if (myChartBar) {
            myChartBar.resize();
        }
        if (myChartLine) {
            myChartLine.resize();
        }
        if (myChartPie) {
            myChartPie.resize();
        }
    }, 500);
};

</script>
<style scoped>
/* 图表容器样式 */
#myChartBar,
#myChartPie,
#myChartLine {
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

#myChartBar:hover,
#myChartPie:hover,
#myChartLine:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}
.studentInfoContainer{

}
.student-photo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.student-photo {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
}

</style>
