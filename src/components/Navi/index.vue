<template>
    <el-container class="main-container">
        <el-container v-if="userInfo.username.length > 0">
            <el-header height="120" class="header-container">
                <div class="flex justify-between items-center h-full px-4">
                    <div class="flex items-center h-full py-2">
                        <el-image style="height: 55px; margin-left: 20px;" src="/SDU logo(White).png" />
                        <el-image style="height: 45px; margin-left: 20px;" src="/SDUlogo(White).png" />
                      <el-text style="color: white; font-size: 30px; font-family: 'Source Han Sans CN', 'Microsoft YaHei', sans-serif; font-weight: 600; margin-left: 20px;">
                        学生信息管理平台
                      </el-text>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="username-text">{{ userInfo.username }}</span>
                        <el-dropdown class="role-dropdown">
                            <span class="el-dropdown-link">
                                角色切换
                                <el-icon class="el-icon--right">
                                    <arrow-down />
                                </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="changeUser('ROLE_ADMIN')">管理员</el-dropdown-item>
                                    <el-dropdown-item @click="changeUser('ROLE_TEACHER')">教师</el-dropdown-item>
                                    <el-dropdown-item @click="changeUser('ROLE_STUDENT')">学生</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <span class="database-text">数据库用户名：{{ systemConfig.dataBaseUserName }}</span>
                        <el-button type="danger" size="small" @click="logout">退出</el-button>
                    </div>
                </div>
            </el-header>
            <el-container class="body-container">
                <el-aside width="230px" class="sidebar-container">
                    <el-scrollbar class="scrollbar">
                        <el-menu background-color="#FFFFFF" text-color="#000000" active-text-color="var(--color-primary)" router
                            :default-openeds="['0']" class="sidebar-menu">
                            <!-- 计算角色特定的菜单列表 -->
                            <template v-for="(v, i) in getRoleSpecificMenuList" :key="i">
                                <template v-if="v.sList.length > 0">
                                    <el-sub-menu :index="i.toString()">
                                        <template v-slot:title>
                                            <i class="el-icon-location"></i>
                                            <span>{{ v.title }}</span>
                                        </template>
                                        <el-menu-item-group v-for="(item, j) in v.sList" :key="j">
                                            <el-menu-item :index="'/' + item.path" @click="routerPath(item.path)">{{
                                                item.title
                                            }}</el-menu-item>
                                        </el-menu-item-group>
                                    </el-sub-menu>
                                </template>
                                <template v-else>
                                    <el-menu-item :index="'/' + v.path" @click="routerPath(v.path)">
                                        <i class="el-icon-menu"></i>
                                        <span>{{ v.title }}</span>
                                    </el-menu-item>
                                </template>
                            </template>
                        </el-menu>
                    </el-scrollbar>
                </el-aside>
                <el-main class="main-content">
                    <router-view />
                </el-main>
            </el-container>
        </el-container>
        <el-main v-else>
            <router-view />
        </el-main>
    </el-container>
</template>

<script lang="ts" setup name="Navi">
import { container } from '~/inverfiy.config';
import { ID_APP_PRESENTER } from '~/types';
import { AppPresenter } from "~/infrastructure/presenters/app-presenter";
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAppStore } from "~/stores/app";
const appPresenter = container.get<AppPresenter>(ID_APP_PRESENTER);

// 组件状态
const isCollapse = ref(false);
const timer = ref(null);

// 获取store和router
const appStore = useAppStore();
const router = useRouter();

// 使用storeToRefs从pinia store获取响应式状态
const { systemConfig, userInfo } = storeToRefs(appStore);

// 生命周期钩子
onMounted(async () => {
    logout();
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});

// 方法
const logout = () => {
    appStore.logout();
    router.push({ path: "/Login" });
};



const routerPath = (path: string) => {
        console.log("routerPath", path);
        if (path == null || path == undefined || path == "") {
            return;
        }
        router.push({ path: "/" + path });
    };

    // 根据角色获取特定的菜单列表
    const getRoleSpecificMenuList = computed(() => {
        const role = appStore.userInfo.role;
        const originalMenus = systemConfig.value.menuList;
        
        // 创建菜单副本以避免修改原始数据
        const menuCopy = JSON.parse(JSON.stringify(originalMenus));
        
        // 将请假管理从个人信息移动到教务管理
        moveLeaveMenuToTeaching(menuCopy);
        
        // 对于管理员和教师，返回修改后的菜单
        if (role === 'ROLE_ADMIN' || role === 'ROLE_TEACHER') {
            return menuCopy;
        }
        
        // 对于学生，添加或修改菜单项
        if (role === 'ROLE_STUDENT') {
            // 检查是否已有教务管理菜单
            let teachingMenuIndex = menuCopy.findIndex((menu: any) => menu.title === '教务管理');
            
            if (teachingMenuIndex === -1) {
                // 如果没有，添加教务管理菜单，只包含选课和成绩查看功能
                menuCopy.push({
                    title: '教务管理',
                    sList: [
                        { title: '选课管理', path: 'courseChoose' },
                        { title: '成绩查询', path: 'score' },
                        { title: '请假管理', path: 'leave' } // 为学生也添加请假管理
                    ]
                });
            } else {
                // 如果有，修改为包含选课、成绩查看和请假管理功能
                menuCopy[teachingMenuIndex].sList = [
                    { title: '选课管理', path: 'courseChoose' },
                    { title: '成绩查询', path: 'score' },
                    { title: '请假管理', path: 'leave' } // 为学生也添加请假管理
                ];
            }
            
            return menuCopy;
        }
        
        // 默认返回修改后的菜单
        return menuCopy;
    });
    
    // 将请假管理从个人信息移动到教务管理的方法
    function moveLeaveMenuToTeaching(menus: any[]) {
        let personalInfoMenuIndex = -1;
        let teachingMenuIndex = -1;
        let leaveMenuIndex = -1;
        let leaveMenu = null;
        
        // 查找个人信息和教务管理菜单
        menus.forEach((menu, index) => {
            if (menu.title === '个人信息') {
                personalInfoMenuIndex = index;
                // 在个人信息子菜单中查找请假管理
                if (menu.sList && Array.isArray(menu.sList)) {
                    leaveMenuIndex = menu.sList.findIndex((subMenu: any) => subMenu.title === '请假管理');
                    if (leaveMenuIndex !== -1) {
                        leaveMenu = menu.sList[leaveMenuIndex];
                    }
                }
            } else if (menu.title === '教务管理') {
                teachingMenuIndex = index;
            }
        });
        
        // 如果找到了请假管理且找到了教务管理，则移动
        if (leaveMenu && personalInfoMenuIndex !== -1 && teachingMenuIndex !== -1) {
            // 从个人信息子菜单中移除请假管理
            if (menus[personalInfoMenuIndex].sList && leaveMenuIndex !== -1) {
                menus[personalInfoMenuIndex].sList.splice(leaveMenuIndex, 1);
            }
            
            // 确保教务管理有子菜单数组
            if (!menus[teachingMenuIndex].sList) {
                menus[teachingMenuIndex].sList = [];
            }
            
            // 将请假管理添加到教务管理子菜单中
            if (!menus[teachingMenuIndex].sList.find((subMenu: any) => subMenu.title === '请假管理')) {
                menus[teachingMenuIndex].sList.push(leaveMenu);
            }
        }
    }

const changeUser = async (type: string) => {
        console.log("type", type);
        if (type == appStore.userInfo.role) {
            return;
        }
        let loginReq = {
            username: '',
            password: '',
            code: ''
        };
        if (type === 'ROLE_ADMIN') {
            loginReq.username = 'admin';
            loginReq.password = '123456';
        } else if (type === 'ROLE_TEACHER') {
            loginReq.username = '202500009999';
            loginReq.password = '123456';
        } else if (type === 'ROLE_STUDENT') {
            loginReq.username = '2022030001';
            loginReq.password = '123456';
        }
        console.log("login", loginReq);
        await appPresenter.enterApp(loginReq);
    };
</script>

<style scoped>
.main-container {
    height: 100vh;
    overflow: hidden;
}

/* Header 样式 */
.header-container {
    background: var(--color-primary);
    border-bottom: 4px solid var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.username-text {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
}

.database-text {
    color: #ffffff;
    font-size: 12px;
    opacity: 0.9;
}

.role-dropdown {
    color: #ffffff;
}

.role-dropdown .el-dropdown-link {
    color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.3s ease;
}

.role-dropdown .el-dropdown-link:hover {
    color: #f0f0f0;
}

/* 主体容器 */
.body-container {
    height: calc(100vh - 80px);
    overflow: hidden;
}

/* 侧边栏样式 */
.sidebar-container {
    background-color: #FFFFFF;
    border-right: 3px solid #e0e6ed;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    height: 100%;
    overflow: hidden;
}

.scrollbar {
    height: 100%;
    background-color: #FFFFFF;
}

.sidebar-menu {
    border: none;
    height: 100%;
    font-weight:bold;
    font-family: 'Microsoft YaHei', 'Arial', 'sans-serif';
}

.sidebar-menu :deep(.el-sub-menu__title) {
    padding-left: 20px !important;
    margin:0 0 0 0;
    height: 50px;
    line-height: 50px;
    transition: all 0.1s ease;
}
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--color-primary) !important;
  color: #FFFFFF !important;
}

.sidebar-menu :deep(.el-menu-item) {
    padding-left: 40px !important;
    margin:0 0 0 0;
    height: 45px;
    line-height: 45px;
    transition: all 0.1s ease;
}

.sidebar-menu :deep(.el-menu-item:hover) {
    background-color: #771010 !important;
    color: #FFFFFF !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
    background-color: #771010 !important;
    color: #FFFFFF !important;
    border-right: 3px solid var(--color-primary);
}

/* 主内容区域 */
.main-content {
    /*margin-left: 140px;
    margin-right: 140px;*/
    /*background-color: #f5f7fa;*/
    padding: 40px 150px;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
}

.tags-container {
    background-color: #ffffff;
    padding: 10px 15px;
    border-bottom: 2px solid #e0e6ed;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    min-height: 50px;
}

.tags-container :deep(.el-tag) {
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 20px;
    font-weight: 500;
}

.tags-container :deep(.el-tag:hover) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.15);
}

.content-area {
    flex: 1;
    padding: 20px;
    overflow: auto;
    background-color: #ffffff;
    margin: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .sidebar-container {
        width: 200px !important;
    }

    .header-container .flex {
        padding: 0 10px;
    }

    .username-text,
    .database-text {
        display: none;
    }
}
</style>
