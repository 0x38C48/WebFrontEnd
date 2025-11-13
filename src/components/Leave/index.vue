<template>
  <!-- 请假表单对话框 -->
  <el-dialog
    title="请假申请"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    width="60%"
  >
    <el-form ref="leaveForm" :model="formData" label-width="120px">
      <el-form-item label="请假日期" required>
        <!-- <el-date-picker
          v-model="formData.leaveDate"
          type="date"
          style="width: 100%"
          placeholder="选择请假日期"

  /> -->
          <input
            type="date"
            v-model="formData.leaveDate"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
            placeholder="选择请假日期"
          />

      </el-form-item>
      <el-form-item label="请假原因" required>
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入请假原因"
        />
      </el-form-item>
      <el-form-item label="审批教师" required>
        <el-select
          v-model="formData.teacherId"
          style="width: 100%"
          placeholder="请选择审批教师"
        >
          <el-option
            v-for="item in data.teacherOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>

  <!-- 审批对话框 -->
  <el-dialog
    title="请假审批"
    v-model="checkVisible"
    :close-on-click-modal="false"
    width="50%"
  >
    <el-form :model="checkForm" label-width="100px">
      <el-form-item label="请假人">
        <el-input v-model="checkForm.studentName" readonly />
      </el-form-item>
      <el-form-item label="请假日期">
        <el-input v-model="checkForm.leaveDate" readonly />
      </el-form-item>
      <el-form-item label="请假原因">
        <el-input v-model="checkForm.reason" type="textarea" :rows="3" readonly />
      </el-form-item>
      <el-form-item label="审批结果" required>
        <el-radio-group v-model="checkForm.state" v-if="userInfo.role === 'ROLE_TEACHER'">
          <el-radio :label="1">批准</el-radio>
          <el-radio :label="0">拒绝</el-radio>
        </el-radio-group>
        <el-radio-group v-model="checkForm.state" v-if="userInfo.role === 'ROLE_ADMIN'">
          <el-radio :label="3">批准</el-radio>
          <el-radio :label="1">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审批意见">
        <el-input
          v-if="userInfo.role === 'ROLE_TEACHER'"
          v-model="checkForm.teacherComment"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见"
        />
        <el-input
          v-if="userInfo.role === 'ROLE_ADMIN'"
          v-model="checkForm.adminComment"
          type="textarea"
          :rows="3"
          placeholder="请输入审批意见"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="checkVisible = false">取消</el-button>
      <el-button type="primary" @click="handleCheckSubmit">确认审批</el-button>
    </template>
  </el-dialog>

   <!-- 主内容区 -->
  <div class="leave-container">
    <el-row :gutter="20" style="margin-bottom: 15px">
      <el-col :span="12" style="text-align: left">
        <el-button type="primary" @click="handleAdd" v-if="userInfo.role === 'ROLE_STUDENT'">
          <el-icon><Plus /></el-icon> 新增请假
        </el-button>
      </el-col>
      <el-col :span="12" style="text-align: right">
        <el-select
          v-model="data.state"
          placeholder="状态筛选"
          style="width: 150px; margin-right: 10px"
        >
          <el-option label="全部" :value="-1" />
          <el-option label="待审批" :value="0" />
          <el-option label="教师同意" :value="1" />
          <el-option label="管理员也同意" :value="3" />
        </el-select>
        <el-input
          v-model="data.searchKey"
          placeholder="搜索姓名/原因"
          style="width: 200px; margin-right: 10px"
        />
        <el-button @click="handleSearch">搜索</el-button>
      </el-col>
    </el-row>

    <!-- 请假列表 -->
    <el-table
      :data="data.dataList"
      :border="true"
      stripe
      style="width: 100%"
    >
      <el-table-column label="序号" width="80" type="index" />
      <el-table-column label="学号" prop="studentNum" width="120" />
      <el-table-column label="学生姓名" prop="studentName" width="120" />
      <el-table-column label="请假日期" prop="leaveDate" width="150" />
      <el-table-column label="请假原因" prop="reason" show-overflow-tooltip />
      <el-table-column label="审批教师" prop="teacherName" width="180" />
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.te === 0
                ? 'danger'
                : scope.row.state === 1
                ? 'warning'
                : 'success'
            "
          >
            {{ scope.row.stateName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <!-- 仅保留编辑和审批按钮-->
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
            v-if="userInfo.role === 'ROLE_STUDENT' && scope.row.state === 0"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="success"
            @click="handleCheck(scope.row)"
            v-if="userInfo.role === 'ROLE_TEACHER' &&  (scope.row.state === 0 || scope.row.state === 1)"
          >
            审批
          </el-button>
          <el-button
            size="small"
            type="success"
            @click="handleCheck(scope.row)"
            v-if="userInfo.role === 'ROLE_ADMIN' &&  (scope.row.state === 1 || scope.row.state === 3)"
          >
            审批
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <!-- <div style="display: flex; justify-content: center; margin-top: 20px">
     <el-pagination
        size="small"
        background
        :total="data.pagination.total"
        :current-page="data.pagination.currentPage"
        :page-size="data.pagination.pageSize"
        @current-change="handlePageChange"
        layout="total, prev, pager, next, jumper"
      />
    </div> -->
  </div>
</template>

<script lang="ts" setup name="Leave">
import { ref } from "vue";
import type { LeaveData, LeaveItem } from "~/domain/models/leave";
import { container } from "~/inverfiy.config";
import { ID_LEAVE_PRESENTER } from "~/types";
import { LeavePresenter } from "~/domain/presenters/leave-presenter";
import { Plus } from "@element-plus/icons-vue";
import { storeToRefs } from 'pinia';
import { useAppStore } from "~/stores/app";


// 获取presenter实例
const presenter = container.get<LeavePresenter>(ID_LEAVE_PRESENTER);
// 获取appStore
const appStore = useAppStore();
// 页面数据
const data = ref<LeaveData>({} as LeaveData);
// 初始化
presenter.leaveInit().then((res) => {
  data.value = res;
});

// 用户信息
const  {userInfo}  = storeToRefs(appStore);

// 对话框状态
const dialogVisible = ref(false);
const checkVisible = ref(false);

// 表单数据
const formData = ref<LeaveItem>({} as LeaveItem);
const checkForm = ref({
  studentLeaveId: 0,
  studentName: "",
  leaveDate: "",
  reason: "",
  state: 1,
  teacherComment: "",
  adminComment: "",
});



// 分页变更
//const handlePageChange = async (val: number) => {
  //data.value.pagination.currentPage = val;
  //await presenter.getLeaveList(data.value);
//};

// 搜索
const handleSearch = async () => {
  //data.value.pagination.currentPage = 1;
  await presenter.getLeaveList(data.value);
};

// 新增请假
const handleAdd = () => {
  formData.value = presenter.resetForm();
  dialogVisible.value = true;
};

// 编辑请假
const handleEdit = (row: LeaveItem) => {
  formData.value = { ...row };
  dialogVisible.value = true;
};

// 提交请假


const handleSubmit = async () => {
  const date = new Date(formData.value.leaveDate);
  const backendDateStr = date.toDateString(); // 结果："Wed Nov 13 2024"

  // 3. 构建提交数据
  const submitData = {
    ...formData.value,
    leaveDate: backendDateStr // 传给后端可解析的字符串
  };
  const success = await presenter.saveLeave(submitData, data.value);
  if (success) {
    dialogVisible.value = false;
  }
};

// 审批请假
const handleCheck = (row: LeaveItem) => {
  checkForm.value = {
    studentLeaveId: row.studentLeaveId,
    studentName: row.studentName,
    leaveDate: row.leaveDate,
    reason: row.reason,
    state: userInfo.value.role === "teacher" ? 1 : 3,
    teacherComment: "",
    adminComment: "",
  };
  checkVisible.value = true;
};

// 提交审批
const handleCheckSubmit = async () => {
  const success = await presenter.checkLeave(
    checkForm.value.studentLeaveId,
    checkForm.value.state,
    checkForm.value.teacherComment,
    checkForm.value.adminComment,
    data.value
  );
  if (success) {
    checkVisible.value = false;
  }
};




</script>

<style scoped>
.leave-container {
  padding: 20px;
}
</style>