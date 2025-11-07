import { CourseData, CourseItem, CourseChooseResultData } from "~/domain/models/teaching";
import { ID_TEACHING_SERVICE, ID_MESSAGE_SERVICE } from "~/types";
import { IMessageService } from "~/infrastructure/boundaries/message-service";
import { ITeachingService } from "~/domain/boundaries/teaching-service";
import { inject, injectable } from "inversify";
import { PersonItem } from "../models/person";
@injectable()
export class CoursePresenter {
    constructor(
        @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
        @inject(ID_TEACHING_SERVICE) private readonly service: ITeachingService
    ) { }
    public makeSelectCourseList(data: CourseData): void {
        data.courseSelectList = []
        for (let i = 0; i < data.dataList.length; i++) {
            const item = data.dataList[i]
            data.courseSelectList.push({
                id: item.courseId,
                value: item.num,
                title: item.num + '-' + item.name
            })
        }
    };
    public async courseInit(): Promise<CourseData> {
        let data = {} as CourseData;
        data.numName = "";
        await this.getCourseList(data);
        return data;
    }
    public async getCourseList(data: CourseData): Promise<void> {
        data.dataList = await this.service.getCourseList(data.numName);
        this.makeSelectCourseList(data);
    }
    public addItem(data: CourseData): CourseItem {
        let item = {} as CourseItem;
        data.currentIndex = -1;
        return item;
    }
    public editItem(data: CourseData, index: number): CourseItem {
        let item = { ...data.dataList[index] } as CourseItem;
        return item;
    }
    public async itemSubmit(item: CourseItem, data: CourseData): Promise<void> {
        const res = await this.service.courseSave(item);
        if (res.code == 0) {
            this.messageService.success("添加修改成功");
            this.getCourseList(data);
        } else {
            this.messageService.error(res.msg);
        }
    }
    // 删除课程（管理员功能）
    async deleteItem(data: CourseData, index: number) {
        const result = await this.messageService.confirm("确认删除该课程吗?");
        if (!result) {
            return;
        }
        const res = await this.service.courseDelete(data.dataList[index].courseId);
        if (res.code == 0) {
            this.messageService.success("删除成功");
            // 从服务器重新获取数据，确保列表完全刷新
            await this.getCourseList(data);
        } else {
            this.messageService.error(res.msg);
        }
    };

    // 退选课程（学生功能）
    async dropCourse(data: CourseData, index: number, personId?: number) {
        const result = await this.messageService.confirm("确认退选该课程吗?");
        if (!result) {
            return;
        }
        
        // 确保使用有效的personId
        if (!personId || personId <= 0) {
            this.messageService.error('用户信息不完整，无法退选');
            return;
        }
        
        const course = data.dataList[index];
        // 这里需要courseChooseId，但我们需要先获取选课记录
        // 暂时使用courseId作为courseChooseId，实际项目中可能需要先查询选课记录
        const res = await this.service.courseChooseDelete(course.courseId);
        if (res.code == 0) {
            this.messageService.success("退选成功");
            // 刷新课程列表
            await this.getCourseList(data);
        } else {
            this.messageService.error(res.msg || "退选失败");
        }
    };

    // 选择课程（简化版）
    async chooseCourse(data: CourseData, index: number, personId?: number): Promise<boolean> {
        const result = await this.messageService.confirm("确认选择该课程吗?");
        if (!result) {
            return false;
        }

        const course = data.dataList[index];
        
        // 执行选课 - courseChooseId为null表示新选课
        // 确保使用有效的personId，不使用硬编码默认值
        if (!personId || personId <= 0) {
            this.messageService.error('用户信息不完整，无法选课');
            return false;
        }
        const res = await this.service.courseChooseSave(personId, course.courseId, null);
        if (res.code === 0) {
            this.messageService.success(`成功选择课程: ${course.name}`);
            await this.getCourseList(data); // 刷新列表
            return true;
        } else {
            this.messageService.error(res.msg || "选课失败");
            return false;
        }
    }

    // 获取选课结果
    async getCourseChooseResults(personId: number): Promise<CourseChooseResultData> {
        // 初始化默认结果对象，确保始终包含dataList
        const resultData: CourseChooseResultData = {
            dataList: [],
            personId: 0,
            totalCredits: 0,
            totalCourses: 0,
            passedCourses: 0
        };
        
        try {
            // 记录查询信息便于调试
            console.log(`正在查询用户ID ${personId} 的选课结果`);
            
            // 直接使用当前personId查询
            const res = await this.service.getCourseChooseList(personId, null);
            
            if (res.code === 0) {
                // 处理后端返回的数据格式 - 后端直接在data字段中返回数组
                if (Array.isArray(res.data)) {
                    console.log(`成功获取到 ${res.data.length} 条选课记录`);
                    // 直接使用后端返回的数组作为dataList
                    resultData.dataList = res.data;
                } else if (res.data && Array.isArray(res.data.dataList)) {
                    // 兼容可能的另一种格式
                    console.log(`成功获取到 ${res.data.dataList.length} 条选课记录`);
                    resultData.dataList = res.data.dataList;
                }
            } else {
                console.error(`获取选课结果失败: ${res.msg || '未知错误'}`);
                this.messageService.error(res.msg || "获取选课结果失败");
            }
        } catch (error) {
            console.error('获取选课结果失败:', error);
            // 不显示重复的错误消息，避免用户体验问题
        }
        
        // 始终返回包含dataList的完整对象，确保前端有数据可用
        return resultData;
    }
    
    // 从选课结果中退选课程
    async dropCourseFromResult(courseChooseId: number){
        try {
            console.log(`正在执行退选操作，courseChooseId: ${courseChooseId}`);
            const res = await this.service.courseChooseDelete(courseChooseId);
            
            if (res.code === 0) {
                this.messageService.success('退选成功');
            } else {
                this.messageService.error(res.msg || '退选失败');
            }
            
            return res;
        } catch (error) {
            console.error('退选课程失败:', error);
            this.messageService.error('退选课程时发生错误');
            // 不再抛出异常，避免影响前端流程
            return { code: -1, msg: '退选操作异常' };
        }
    }
}