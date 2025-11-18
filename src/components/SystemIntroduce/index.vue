<template>
    <el-row class="row" style="margin-top: 0px; margin-bottom: 20px;">
        <el-col :span="24">
            <div style="text-align: center; margin-bottom: 16px;">
                <h1 style="color: #409EFF; font-size: 34px; letter-spacing: 1px;">
                    <el-icon style="margin-right: 10px;">
                        <Platform />
                    </el-icon>
                    项目介绍
                </h1>
                <p style="color: #909399; font-size: 14px;">基于 Vue 3 + TypeScript + Element Plus 的现代化前端项目</p>
            </div>
        </el-col>
    </el-row>

    <el-row :gutter="20" class="row" style="margin-top: 0px; margin-bottom: 20px;">
        <el-col :span="12">
            <el-card shadow="hover" style="height: 420px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #67C23A;">
                            <Star />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">系统截图轮播</span>
                    </div>
                </template>
                <el-carousel height="350px">
                    <el-carousel-item v-for="item in imageUrl" :key="item.url">
                        <img :src="item.url" alt="" style="width: 100%; height: 100%; object-fit: contain; object-position: center;" />
                    </el-carousel-item>
                </el-carousel>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card shadow="hover" style="height: 420px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #409EFF;">
                            <Document />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">演示视频</span>
                    </div>
                </template>
                <div style="height: 350px; display: flex; align-items: center; justify-content: center;">
                    <video src="/app/video.mp4" controls autoplay preload="auto" muted style="width: 100%; height: 100%; border-radius: 6px;"></video>
                </div>
            </el-card>
        </el-col>
    </el-row>

    <el-row class="row" style="margin-top: 0px; margin-bottom: 20px;">
        <el-col :span="24">
            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #409EFF;">
                            <Document />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">项目总览</span>
                    </div>
                </template>
                <div style="line-height: 1.9; color: #606266; font-size: 14px;">
                    <p>本项目以教学与实战为目标，围绕学生、教师、课程、成绩等核心业务模块构建，采用分层架构与依赖注入，实现高内聚、低耦合的前端工程。</p>
                    <el-divider />
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="前端框架">Vue 3 + TypeScript</el-descriptions-item>
                        <el-descriptions-item label="UI 组件">Element Plus</el-descriptions-item>
                        <el-descriptions-item label="状态管理">Pinia</el-descriptions-item>
                        <el-descriptions-item label="路由">Vue Router</el-descriptions-item>
                        <el-descriptions-item label="网络请求">Axios</el-descriptions-item>
                        <el-descriptions-item label="构建工具">Vite</el-descriptions-item>
                    </el-descriptions>
                    <el-divider />
                    <p>后端通过 REST 接口提供数据服务，前端以 Presenter 组织交互逻辑，以 Service 封装请求与数据处理，确保代码可维护、易扩展。</p>
                </div>
            </el-card>
        </el-col>
    </el-row>

    <el-row class="row" style="margin-top: 0px; margin-bottom: 20px;">
        <el-col :span="24">
            <el-card shadow="hover" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #409EFF;">
                            <Setting />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">技术栈与工具</span>
                    </div>
                </template>
                <div style="line-height: 2;">
                    <el-tag type="info" style="margin-right: 8px; margin-bottom: 8px;">Vue 3</el-tag>
                    <el-tag type="success" style="margin-right: 8px; margin-bottom: 8px;">TypeScript</el-tag>
                    <el-tag type="warning" style="margin-right: 8px; margin-bottom: 8px;">Element Plus</el-tag>
                    <el-tag type="danger" style="margin-right: 8px; margin-bottom: 8px;">Pinia</el-tag>
                    <el-tag type="primary" style="margin-right: 8px; margin-bottom: 8px;">Vue Router</el-tag>
                    <el-tag type="success" style="margin-right: 8px; margin-bottom: 8px;">Axios</el-tag>
                    <el-tag type="info" style="margin-right: 8px; margin-bottom: 8px;">Vite</el-tag>
                    <el-tag type="warning" style="margin-right: 8px; margin-bottom: 8px;">UnoCSS</el-tag>
                    <el-tag type="primary" style="margin-right: 8px; margin-bottom: 8px;">ECharts</el-tag>
                    <el-tag type="danger" style="margin-right: 8px; margin-bottom: 8px;">Inversify</el-tag>
                </div>
            </el-card>

            <el-card shadow="hover" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #67C23A;">
                            <Star />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">核心功能模块</span>
                    </div>
                </template>
                <el-row :gutter="16">
                    <el-col :span="12">
                        <div style="padding: 8px 4px;">
                            <h4 style="color: #409EFF; margin-bottom: 8px;">学生管理</h4>
                            <ul style="padding-left: 20px; color: #606266; line-height: 1.8;">
                                <li>学生信息维护与分页查询</li>
                                <li>家庭成员管理与简介展示</li>
                                <li>选课与成绩数据联动</li>
                            </ul>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div style="padding: 8px 4px;">
                            <h4 style="color: #409EFF; margin-bottom: 8px;">教师管理</h4>
                            <ul style="padding-left: 20px; color: #606266; line-height: 1.8;">
                                <li>教师信息维护与查询</li>
                                <li>授课与课程安排</li>
                                <li>教学数据统计展示</li>
                            </ul>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div style="padding: 8px 4px;">
                            <h4 style="color: #409EFF; margin-bottom: 8px;">课程与成绩</h4>
                            <ul style="padding-left: 20px; color: #606266; line-height: 1.8;">
                                <li>课程选择与开课管理</li>
                                <li>成绩录入与统计分析</li>
                                <li>数据导出与报表下载</li>
                            </ul>
                        </div>
                    </el-col>
                    <el-col :span="12">
                        <div style="padding: 8px 4px;">
                            <h4 style="color: #409EFF; margin-bottom: 8px;">系统设置</h4>
                            <ul style="padding-left: 20px; color: #606266; line-height: 1.8;">
                                <li>菜单与字典管理</li>
                                <li>账号登录与口令修改</li>
                                <li>角色切换与权限控制</li>
                            </ul>
                        </div>
                    </el-col>
                </el-row>
            </el-card>

            <el-card shadow="hover" style="margin-bottom: 20px;">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #E6A23C;">
                            <Document />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">架构设计</span>
                    </div>
                </template>
                <div style="color: #606266; line-height: 1.9;">
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="分层架构">Presenter 组织交互，Service 封装数据访问，Domain 与 Infrastructure 分离职责</el-descriptions-item>
                        <el-descriptions-item label="依赖注入">使用 Inversify 管理依赖，提升可测试性与模块化</el-descriptions-item>
                        <el-descriptions-item label="网络通信">Axios 统一封装认证与错误处理，支持文件上传与导出</el-descriptions-item>
                        <el-descriptions-item label="样式系统">UnoCSS 与 SCSS 组合，支持主题定制与响应式布局</el-descriptions-item>
                    </el-descriptions>
                </div>
            </el-card>

            <el-card shadow="hover">
                <template #header>
                    <div style="display: flex; align-items: center;">
                        <el-icon style="margin-right: 8px; color: #67C23A;">
                            <Setting />
                        </el-icon>
                        <span style="font-size: 18px; font-weight: bold;">运行与构建</span>
                    </div>
                </template>
                <div style="color: #606266; line-height: 1.9;">
                    <ul style="padding-left: 20px;">
                        <li>安装依赖：<code>npm install</code></li>
                        <li>开发调试：<code>npm run dev</code></li>
                        <li>类型检查：<code>npm run typecheck</code></li>
                        <li>生产构建：<code>npm run build</code></li>
                        <li>本地预览：<code>npm run preview</code></li>
                    </ul>
                </div>
            </el-card>
        </el-col>
    </el-row>
</template>
<script setup lang="ts" name="SystemIntroduce">
const imageUrl = [
    { url: "/app/img1.jpg" },
    { url: "/app/img2.jpg" },
    { url: "/app/img3.jpg" },
    { url: "/app/img4.jpg" }
];
</script>