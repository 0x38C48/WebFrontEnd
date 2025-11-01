import { IStoreService } from "../boundaries/store-service";
import { JwtResponse } from "../models/login";
import { MenuInfo } from "../models/store";
import { DataResponse } from "../models/request";
import { useAppStore } from "~/stores/app";
import router from "~/router";
export class StoreServiceImpl implements IStoreService {
    public async login(res: JwtResponse): Promise<void> {
        const store = useAppStore();
        await store.login(res, true);
    }
    public async enterApp(menuList: MenuInfo[], dataBaseUserName: string): Promise<void> {
        const store = useAppStore();
        await store.setNavi(menuList, dataBaseUserName);

        // 根据用户类型重定向到不同页面
        const userRole = store.userInfo.role;
        let redirectPath = "/mainPage"; // 默认重定向到主页面
        
        switch (userRole) {
            case 'ROLE_ADMIN':
                redirectPath = "/mainPage"; // 管理员重定向到主页面
                break;
            case 'ROLE_STUDENT':
                redirectPath = "/studentIntroduce"; // 学生重定向到学生介绍页面
                break;
            case 'ROLE_TEACHER':
                redirectPath = "/teacherIntroduce"; // 教师重定向到教师介绍页面
                break;
            default:
                redirectPath = "/mainPage"; // 默认重定向到主页面
        }

        router.push({ path: redirectPath });
    }
    public async logout(): Promise<void> {
        const store = useAppStore();
        store.logout();
    }
    public getToken(): string {
        return useAppStore().userInfo.token;
    }
}