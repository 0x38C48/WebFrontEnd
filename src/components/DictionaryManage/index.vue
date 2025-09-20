<template>
    <el-dialog :title="dialogTitle" v-model="editVisible" :close-on-click-modal="false">
        <el-form ref="form" :model="editedNode" class="edit-form" label-width="120px">
            <el-form-item label="字典名">
                <el-input v-model="editedNode.parentTitle" readonly />
            </el-form-item>
            <el-form-item label="数据值">
                <el-input v-model="editedNode.value" placeholder="请输入数据值" />
            </el-form-item>
            <el-form-item label="数据标题">
                <el-input v-model="editedNode.title" placeholder="请输入数据标题" />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" plain @click="confirm()">提交</el-button>
                <el-button type="primary" plain @click="editVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <div>
        <div>
            <el-row :gutter="20" style="margin-bottom: 10px;">
                <el-col :span="12" style="text-align: left;">
                    <el-button type="danger" plain @click="addItemFirst()">添加数据项名</el-button>
                    <el-button type="danger" plain @click="addItem()">添加数据项</el-button>
                    <el-button type="danger" plain @click="editItem()">修改</el-button>
                    <el-button type="danger" plain @click="deleteItem()">删除</el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin-top: 5px" v-if="data.nodes !== null">
            <el-tree :data="data.nodes" :props="data.defaultProps" accordion @node-click="onNodeClick"></el-tree>
        </div>
    </div>
</template>
<script lang="ts" setup name="DictionaryManage">
import type { DictionaryManageData, TreeNode } from "~/domain/models/system";
import { container } from '~/inverfiy.config';
import { ID_DICTIONARY_MANAGE_PRESENTER } from '~/types';
import { DictionaryManagePresenter } from "~/domain/presenters/dictionary-manage-presenter";
import { ref } from "vue";
const presenter = container.get<DictionaryManagePresenter>(ID_DICTIONARY_MANAGE_PRESENTER);
let data = ref<DictionaryManageData>({} as DictionaryManageData);
let editedNode = ref<TreeNode>({} as TreeNode);
let editVisible = ref(false);
let dialogTitle = ref("添加字典名对话框");
presenter.dictionaryManageInit().then((res) => {
    data.value = res;
});
const onNodeClick = async (node: TreeNode) => {
    data.value.currentNode = node;
};
const addItemFirst = async () => {
    editedNode.value = {} as TreeNode;
    editedNode.value.pid = null;
    editedNode.value.parentTitle = "";
    dialogTitle.value = "添加字典名对话框";
    editVisible.value = true;
};
const addItem = async () => {
    editedNode.value = {} as TreeNode;
    editedNode.value.pid = data.value.currentNode.id;
    editedNode.value.parentTitle = data.value.currentNode.title;
    dialogTitle.value = "添加字典项对话框";
    editVisible.value = true;
};
const editItem = async () => {
    editedNode.value = data.value.currentNode;
    dialogTitle.value = "修改菜单对话框";
    editVisible.value = true;
};
const confirm = async () => {
    await presenter.confirm(data.value, editedNode.value,);
    editVisible.value = false;
};
const deleteItem = async () => {
    await presenter.deleteItem(data.value);
};
</script>