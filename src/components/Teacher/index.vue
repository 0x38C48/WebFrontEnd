<template>
  <el-dialog title="家庭成员信息对话框" v-model="memberVisible" :close-on-click-modal="false" width="70%">
    <FamilyMember :personId="memberPersonId" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="info" plain @click="memberVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog title="个人简介" v-model="introduceVisible" :close-on-click-modal="false" width="90%">
    <TeacherIntroduce :personId="introducePersonId" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="info" plain @click="introduceVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog title="教师信息编辑修改对话框" v-model="editVisible" :close-on-click-modal="false" width="60%">
    <el-form ref="form" :model="itemData" label-width="120px">
      <el-row>
        <el-col :span="21">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="工号">
                <el-input v-model="itemData.num" placeholder="请输入工号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input v-model="itemData.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="学院">
                <el-input v-model="itemData.dept" placeholder="请输入学院" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职称">
                <el-input v-model="itemData.title" placeholder="请输入职称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学位">
                <el-input v-model="itemData.degree" placeholder="请输入学位" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="性别">
                <el-select v-model="itemData.gender" style="width: 100%">
                  <el-option v-for="item in data.genderList" :key="item.value" :value="item.value"
                    :label="item.title" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生日期">
                <el-date-picker v-model="data.birthday" type="date" style="width: 100%;" placeholder="选择出生日期"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="证件号">
                <el-input v-model="itemData.card" placeholder="请输入证件号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="学位">
                <el-input v-model="itemData.degree" placeholder="请输入学位" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="itemData.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话">
                <el-input v-model="itemData.phone" placeholder="请输入电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="地址">
                <el-input v-model="itemData.address" placeholder="请输入地址" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="个人介绍">
                <el-input v-model="itemData.introduce" type="textarea" :rows="3" placeholder="请输入个人介绍" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="3">
          <div
            style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; height: 100%; padding: 20px 10px 10px 10px;">
            <div style="text-align: center; margin-bottom: 8px; font-size: 12px; color: #666;">个人照片</div>
            <img :src="data.imgStr" alt="个人照片"
              style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 6px; border: 1px solid #dcdfe6;" />
          </div>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="success" @click="itemSubmit()">
          <el-icon>
            <Check />
          </el-icon>
          提交
        </el-button>
        <el-upload :headers="data.authHeader" :action="'/api/base/uploadPhotoBlobWeb'" :data="{
          remoteFile: itemData.personId,
        }" accept=".jpg" :show-file-list="false" :limit="10" :multiple="false" :on-success="onSuccessPhoto"
          style="display: inline-block; margin-left: 10px;">
          <el-button type="primary" plain>照片上传</el-button>
        </el-upload>
        <el-button type="info" plain @click="editVisible = false" style="margin-left: 10px;">
          <el-icon>
            <Close />
          </el-icon>
          取消
        </el-button>
      </span>
    </template>
  </el-dialog>
  <div>
    <el-row :gutter="20" style="margin-bottom: 10px;">
      <el-col :span="12" style="text-align: left;">
        <el-button type="success" @click="addItem()">
          <el-icon>
            <Plus />
          </el-icon>
          添加教师
        </el-button>
      </el-col>
      <el-col :span="12" style="text-align: right;">
        <el-input v-model="data.numName" placeholder="请输入工号或姓名" style="width: 200px;">
          <template #prepend>工号或姓名</template>
        </el-input>
        <el-button type="primary" @click="doQuery()">
          <el-icon>
            <Search />
          </el-icon>
          查询
        </el-button>
        <el-button type="warning" @click="doExport()">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="data.dataList" :border="true" stripe style="width: 100%" v-loading="loading">
      <el-table-column label="序号" width="70" fixed>
        <template v-slot="scope">
          <el-tag type="info" effect="plain" size="small">
            {{ scope.$index + 1 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="380" fixed="right">
        <template v-slot="scope">
          <el-button type="primary" size="small" @click="editItem(scope.$index)">
            <el-icon>
              <Edit />
            </el-icon>
            基本信息
          </el-button>
          <el-button type="warning" size="small" @click="familyMember(scope.row.personId)">
            <el-icon>
              <User />
            </el-icon>
            家庭成员
          </el-button>
          <el-button type="warning" size="small" @click="introduce(scope.row.personId)">
            <el-icon>
              <User />
            </el-icon>
            个人简介
          </el-button>
          <el-button type="danger" size="small" @click="deleteItem(scope.$index)">
            <el-icon>
              <Delete />
            </el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="工号" width="140">
        <template v-slot="scope">
          {{ scope.row.num }}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="80">
        <template v-slot="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="院系" width="140" show-overflow-tooltip>
        <template v-slot="scope">
          {{ scope.row.dept }}
        </template>
      </el-table-column>
      <el-table-column label="职称" width="100" show-overflow-tooltip>
        <template v-slot="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80">
        <template v-slot="scope">
          {{ scope.row.genderName }}
        </template>
      </el-table-column>
      <el-table-column label="出生日期" width="140">
        <template v-slot="scope">
          {{ scope.row.birthday }}
        </template>
      </el-table-column>
      <el-table-column label="邮箱" width="240" show-overflow-tooltip>
        <template v-slot="scope">
          {{ scope.row.email }}
        </template>
      </el-table-column>
      <el-table-column label="电话" width="140">
        <template v-slot="scope">
          {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column label="地址" show-overflow-tooltip>
        <template v-slot="scope">
          {{ scope.row.address }}
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: center; margin-top: 20px;">
      <el-pagination size="small" background :total="data.pagination.total" :current-page="data.pagination.currentPage"
        :page-size="data.pagination.pageSize" @current-change="handleChangePage"
        layout="total, prev, pager, next, jumper" />
    </div>
  </div>

</template>
<script lang="ts" setup name="Teacher">
import type { TeacherData, TeacherItem } from "~/domain/models/person";
import { container } from '~/inverfiy.config';
import { ID_TEACHER_PRESENTER } from '~/types';
import { TeacherPresenter } from "~/domain/presenters/teacher-presenter";
import { ref } from "vue";
const presenter = container.get<TeacherPresenter>(ID_TEACHER_PRESENTER);
let data = ref<TeacherData>({ pagination: {} } as TeacherData);
let itemData = ref<TeacherItem>({} as TeacherItem);
let editVisible = ref(false);
let memberVisible = ref(false);
let memberPersonId = ref(0);
let introduceVisible = ref(false);
let introducePersonId = ref(0);
let loading = ref(false);
presenter.teacherInit().then((res) => {
  data.value = res;
});
const handleChangePage = async (val: number) => {
  data.value.pagination.currentPage = val;
  loading.value=true;
  await presenter.getTeacherDataPage(data.value);
  loading.value=false;
};
const doQuery = async () => {
  data.value.pagination.currentPage = 1;
  loading.value=true;
  await presenter.getTeacherDataPage(data.value);
  loading.value=false;
};
const doExport = async () => {
  await presenter.doExport(data.value);
};
const addItem = async () => {
  itemData.value = presenter.addItem(data.value);
  editVisible.value = true;
};
const editItem = async (index: number) => {
  itemData.value = await presenter.editItem(data.value, index);
  editVisible.value = true;
};
const itemSubmit = async () => {
  await presenter.itemSubmit(itemData.value, data.value);
  editVisible.value = false;
};
const familyMember = async (personId: number) => {
  memberPersonId.value = personId;
  memberVisible.value = true;
};
const introduce = async (personId: number) => {
  introducePersonId.value = personId;
  introduceVisible.value = true;
  console.log("个人简介", introducePersonId.value);
};
const deleteItem = async (index: number) => {
  await presenter.deleteItem(data.value, index);
};
const onSuccessPhoto = async (res: any) => {
  await presenter.onSuccessPhoto(data.value, res);
};
</script>