import { computed } from 'vue';
import { useAppStore } from '~/stores/app';

/**
 * 获取当前用户信息的组合式函数
 * @returns 当前用户的相关信息和方法
 */
export function useCurrentUser() {
    const appStore = useAppStore();

    // 当前用户ID
    const currentUserId = computed(() => {
        // 不使用硬编码的默认值，而是返回实际存储的值
        return appStore.userInfo.id || 0;
    });

    // 当前用户名
    const currentUserName = computed(() => {
        return appStore.userInfo.perName || appStore.userInfo.username || '未知用户';
    });

    // 当前用户角色
    const currentUserRole = computed(() => {
        return appStore.userInfo.role || '';
    });

    // 是否已登录
    const isLoggedIn = computed(() => {
        return appStore.userInfo.loggedIn && appStore.userInfo.id > 0;
    });

    // 用户token
    const userToken = computed(() => {
        return appStore.userInfo.token || '';
    });

    // 检查用户是否有特定角色
    const hasRole = (role: string) => {
        return currentUserRole.value === role;
    };

    // 检查用户是否有任一角色
    const hasAnyRole = (roles: string[]) => {
        return roles.includes(currentUserRole.value);
    };

    // 检查用户是否为管理员
    const isAdmin = computed(() => {
        return hasRole('admin') || hasRole('administrator') || hasRole('ROLE_ADMIN');
    });

    // 检查用户是否为学生
    const isStudent = computed(() => {
        return hasRole('ROLE_STUDENT') || hasRole('student') || hasRole('learner');
    });

    // 检查用户是否为教师
    const isTeacher = computed(() => {
        return hasRole('ROLE_TEACHER') || hasRole('teacher') || hasRole('instructor');
    });

    return {
        // 基本信息
        currentUserId,
        currentUserName,
        currentUserRole,
        isLoggedIn,
        userToken,
        
        // 角色检查
        hasRole,
        hasAnyRole,
        isAdmin,
        isStudent,
        isTeacher,
        
        // Store实例（用于直接访问store方法）
        appStore
    };
}

