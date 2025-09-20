<template>
    <el-row class="row" style="margin-top: 0px; margin-bottom: 20px;">
        <el-col :span="24">
            <div class="intro-header">
                <h1 style="text-align: center; color: #409EFF; margin-bottom: 10px; font-size: 32px;">
                    <el-icon style="margin-right: 10px;">
                        <Platform />
                    </el-icon>
                    系统简介
                </h1>
            </div>

            <el-card shadow="hover" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #67C23A;">
                            <Star />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">欢迎使用基于 Vue3 + TypeScript + Element Plus
                            的示例框架</span>
                    </div>
                </template>
                <div style="line-height: 1.8; color: #606266;">
                    <p style="margin-bottom: 15px;">
                        <el-tag type="info" size="small" style="margin-right: 8px;">Vue 3</el-tag>
                        <el-tag type="success" size="small" style="margin-right: 8px;">TypeScript</el-tag>
                        <el-tag type="warning" size="small" style="margin-right: 8px;">Element Plus</el-tag>
                        本框架基于现代前端技术栈构建，为开发者提供高效、灵活的开发环境。
                    </p>
                    <el-divider />
                    <h4 style="color: #409EFF; margin: 15px 0 10px 0;">
                        <el-icon style="margin-right: 5px;">
                            <Setting />
                        </el-icon>核心特性
                    </h4>
                    <ul style="padding-left: 20px;">
                        <li style="margin-bottom: 8px;">🎨 提供 Element Plus 布局、表单、基础组件的完整示例</li>
                        <li style="margin-bottom: 8px;">📊 包含数据表格、消息提示、对话框等常用组件应用</li>
                        <li style="margin-bottom: 8px;">👥 完整的学生管理、课程管理和成绩管理功能模块</li>
                        <li style="margin-bottom: 8px;">🏗️ 基于组件化设计，采用清洁架构实现前端数据分离</li>
                        <li style="margin-bottom: 8px;">⚡ 后台服务基于 Spring Boot 3，兼容《高级程序开发》课程</li>
                    </ul>
                </div>
            </el-card>

            <el-card shadow="hover" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #E6A23C;">
                            <Document />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">Web 技术项目实验和提交要求</span>
                    </div>
                </template>
                <div style="line-height: 1.8; color: #606266;">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <h4 style="color: #409EFF; margin: 15px 0 10px 0;">
                                <el-icon style="margin-right: 5px;">
                                    <Monitor />
                                </el-icon>技术要求
                            </h4>
                            <ul style="padding-left: 20px;">
                                <li style="margin-bottom: 8px;">💻 前端：HTML、CSS、JavaScript</li>
                                <li style="margin-bottom: 8px;">🚀 框架：Vue.js、React 等现代技术栈</li>
                                <li style="margin-bottom: 8px;">🛠️ 开发工具：Visual Studio Code</li>
                                <li style="margin-bottom: 8px;">🗄️ 数据库：课程提供的 MySQL 数据库</li>
                            </ul>
                        </el-col>
                        <el-col :span="12">
                            <h4 style="color: #409EFF; margin: 15px 0 10px 0;">
                                <el-icon style="margin-right: 5px;">
                                    <Upload />
                                </el-icon>提交要求
                            </h4>
                            <ul style="padding-left: 20px;">
                                <li style="margin-bottom: 8px;">📦 前后端代码打包成完整项目</li>
                                <li style="margin-bottom: 8px;">🔐 登录界面支持默认用户密码</li>
                                <li style="margin-bottom: 8px;">👤 主界面包含角色切换功能</li>
                                <li style="margin-bottom: 8px;">📱 系统介绍页面包含截图轮播</li>
                            </ul>
                        </el-col>
                    </el-row>
                </div>
            </el-card>
        </el-col>
    </el-row>
    <el-row class="row" style="margin-top: 20px; margin-bottom: 20px;">
        <el-col :span="1">
        </el-col>
        <el-col :span="11">
            <el-carousel height="400px">
                <el-carousel-item v-for="item in imageUrl" :key="item.url">
                    <img :src="item.url" alt=""
                        style="width: 100%; height: 100%; object-fit: contain; object-position: center;" />
                </el-carousel-item>
            </el-carousel>
        </el-col>
        <el-col :span="1">
        </el-col>
        <el-col :span="11">
            <video src="/app/video.mp4" height="400" controls autoplay type="video/mp4" preload="auto"></video>
        </el-col>
        <el-col :span="1">
        </el-col>
    </el-row>
</template>
<script setup lang="ts" name="SystemIntroduce">
import { Platform, Star, Setting, Document, Monitor, Upload } from '@element-plus/icons-vue';

const imageUrl = [
    { url: "/app/img1.jpg" },
    { url: "/app/img2.jpg" },
    { url: "/app/img3.jpg" },
    { url: "/app/img4.jpg" }
];
</script>