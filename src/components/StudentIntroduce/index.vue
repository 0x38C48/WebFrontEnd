<template>
  <div class="studentInfoContainer">
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
                            <el-input v-model="data.info.name" readonly />
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
                    <el-col :span="7">
                        <el-form-item label="邮箱">
                            <el-input v-model="data.info.dept" readonly />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="3">
                <div class="student-photo-container">
                    <img :src="data.imgStr" alt="个人照片" class="student-photo" />
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
    await presenter.studentIntroduceInit(data.value);
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
        title: { text: "日常消费" },
        tooltip: {},
        xAxis: {
            data: data.value.feeList.map((item) => item.title),
        },
        yAxis: {},
        series: [
            {
                name: "消费",
                type: "bar",
                data: data.value.feeList.map((item) => item.value),
            },
        ],
    });
    myChartLine = init(
        document.getElementById("myChartLine") as any
    );
    myChartLine.setOption({
        title: { text: "日常消费" },
        tooltip: {},
        xAxis: {
            data: data.value.feeList.map((item) => item.title),
        },
        yAxis: {},
        series: [
            {
                name: "消费",
                type: "line",
                data: data.value.feeList.map((item) => item.value),
            },
        ],
    });
    myChartPie = init(
        document.getElementById("myChartPie") as any
    );
    myChartPie.setOption({
        title: { text: "成绩分布" },
        tooltip: {},
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
  margin-top: 35px;
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