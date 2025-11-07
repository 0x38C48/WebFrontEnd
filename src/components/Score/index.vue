<template>
    <el-dialog title="课程添加修改对话框" v-model="editVisible" :close-on-click-modal="false">
        <el-form ref="form" :model="itemData" class="edit-form" label-width="120px">
            <el-form-item label="学生">
                <el-select v-model="itemData.personId">
                    <el-option v-for="item in data.studentList" :key="item.id" :value="item.id" :label="item.title" />
                </el-select>
            </el-form-item>
            <el-form-item label="课程">
                <el-select v-model="itemData.courseId">
                    <el-option v-for="item in data.courseList" :key="item.id" :value="item.id" :label="item.title" />
                </el-select>
            </el-form-item>
            <el-form-item label="成绩">
                <el-input v-model="itemData.mark" placeholder="请输入成绩" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" plain @click="itemSubmit()">提交</el-button>
                <el-button type="primary" plain @click="editVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <div>
        <el-row :gutter="20" style="margin-bottom: 10px;">
            <el-col :span="12" style="text-align: left;">
                <el-button type="danger" plain @click="addItem()" v-if="!isStudent">添加</el-button>
            </el-col>
            <el-col :span="12" style="text-align: right;">
                <!-- 学生端隐藏选择框，自动使用当前学生ID -->
                <template v-if="!isStudent">
                    <el-text style="margin-right: 12px;">学生</el-text>
                    <el-select v-model="data.personId">
                        <el-option v-for="item in data.studentList" :key="item.id" :value="item.id" :label="item.title" />
                    </el-select>
                    <el-text style="margin-right: 12px;">课程</el-text>
                    <el-select v-model="data.courseId">
                        <el-option v-for="item in data.courseList" :key="item.id" :value="item.id" :label="item.title" />
                    </el-select>
                </template>
                <!-- 学生端显示提示信息 -->
                <template v-else>
                    <el-text type="primary" style="margin-right: 12px;">正在查询您的成绩...</el-text>
                </template>
                <el-button type="danger" plain @click="doQuery()">查询</el-button>
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
                    <el-button type="primary" plain @click="editItem(scope.$index)" v-if="!isStudent">编辑</el-button>
                    <el-button type="danger" plain @click="deleteItem(scope.$index)" v-if="!isStudent">删除</el-button>
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
</template>
<script lang="ts" setup name="Score">
import type { ScoreData, ScoreItem } from "~/domain/models/teaching";
import { container } from '~/inverfiy.config';
import { ID_SCORE_PRESENTER } from '~/types';
import { ScorePresenter } from "~/domain/presenters/score-presenter";
import { ref, computed, onMounted } from "vue";
  import { useCurrentUser } from '~/composables/useCurrentUser';
  const presenter = container.get<ScorePresenter>(ID_SCORE_PRESENTER);
  let data = ref<ScoreData>({} as ScoreData);
  const { isStudent, currentUserId } = useCurrentUser();
  let itemData = ref<ScoreItem>({} as ScoreItem);
  let editVisible = ref(false);
  
  // 初始化数据
  const initData = async () => {
    try {
      const res = await presenter.scoreInit();
      data.value = res;
      
      // 学生端自动设置personId并查询成绩
      if (isStudent.value && currentUserId.value) {
        data.value.personId = currentUserId.value;
        await doQuery();
      }
    } catch (error) {
      console.error('初始化成绩数据失败:', error);
    }
  };
  
  onMounted(async () => {
    await initData();
  });
  
  const doQuery = async () => {
    await presenter.getScoreList(data.value);
};
const addItem = async () => {
    itemData.value = presenter.addItem(data.value);
    editVisible.value = true;
};
const editItem = async (index: number) => {
    itemData.value = presenter.editItem(data.value, index);
    editVisible.value = true;
};
const itemSubmit = async () => {
    await presenter.itemSubmit(itemData.value, data.value);
    editVisible.value = false;
};
const deleteItem = async (index: number) => {
    await presenter.deleteItem(data.value, index);
};
</script>