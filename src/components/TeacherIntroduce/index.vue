<template>
  <div class="teacherInfoContainer">
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
              <el-form-item label="学历">
                <el-input v-model="data.info.degree" readonly />
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
              <el-form-item label="个人介绍">
                <el-input v-model="data.info.introduce" type="textarea" :rows="3" readonly />
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
  </div>
</template>

<script lang="ts" setup name="TeacherIntroduce">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { container } from '~/inverfiy.config';
import { ID_TEACHER_INTRODUCE_PRESENTER} from '~/types';
import { TeacherIntroducePresenter } from "~/domain/presenters/teacher-introduce-presenter";
import type {StudentIntroduceData, TeacherIntroduceData} from "~/domain/models/info";
import {TeacherItem} from "~/domain/models/person";
import {StudentIntroducePresenter} from "~/domain/presenters/student-introduce-presenter";
import {TeacherPresenter} from "~/domain/presenters/teacher-presenter";
const presenter = container.get<TeacherIntroducePresenter>(ID_TEACHER_INTRODUCE_PRESENTER);

let data = ref<TeacherIntroduceData>({ info: { personId: 0 } as TeacherItem } as TeacherIntroduceData);
const props = defineProps({
  personId: {
    type: Number,
    required: true
  },
});

const initData = async () => {
    await presenter.teacherIntroduceInit(data.value);
};

watch(
    () => props.personId,
    val => {
      console.log("value", val);
      data.value.personId = val;
      initData();
      //initChart();
    },
    { immediate: true }
)
// onMounted(async () => {
//   //await initChart();
//   window.addEventListener('resize', resizeChart);
// });
//
// onBeforeUnmount(() => {
//   window.removeEventListener('resize', resizeChart);
//   clearTimeout(timer);
//   timer = 0;
// });


</script>