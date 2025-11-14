<template>
    <el-dialog :title="dialogTitle" v-model="editVisible" :close-on-click-modal="false" width="560px">
        <el-form ref="form" :model="editedNode" class="edit-form" label-width="120px" size="small">
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
                <el-button type="primary" @click="confirm()">提交</el-button>
                <el-button @click="editVisible = false">取消</el-button>
            </span>
        </template>
    </el-dialog>
    <el-card shadow="hover">
        <template #header>
            <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px; color: #409EFF;">
                    <Setting />
                </el-icon>
                <span style="font-size: 16px; font-weight: bold;">字典管理</span>
            </div>
        </template>
        <el-row :gutter="12" style="margin-bottom: 10px;">
            <el-col :span="24" style="text-align: left;">
                <el-button type="primary" @click="addItemFirst()" style="margin-right: 8px;">添加数据项名</el-button>
                <el-button type="success" @click="addItem()" style="margin-right: 8px;">添加数据项</el-button>
                <el-button type="warning" @click="editItem()" style="margin-right: 8px;">修改</el-button>
                <el-button type="danger" @click="deleteItem()">删除</el-button>
            </el-col>
        </el-row>
        <div v-if="data.nodes !== null">
            <el-tree :data="data.nodes" :props="data.defaultProps" accordion highlight-current default-expand-all @node-click="onNodeClick"></el-tree>
        </div>
        <div v-else>
            <el-empty description="暂无字典数据" />
        </div>
    </el-card>
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