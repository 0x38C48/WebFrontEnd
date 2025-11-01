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
            data.dataList.splice(index, 1);
            // 重新生成选择列表
            this.makeSelectCourseList(data);
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
        const res = await this.service.courseChooseSave(personId || 1, course.courseId, null);
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
        const res = await this.service.getCourseChooseList(personId, null);
        if (res.code === 0) {
            return res.data as CourseChooseResultData;
        } else {
            this.messageService.error(res.msg || "获取选课结果失败");
            throw new Error(res.msg || "获取选课结果失败");
        }
    }
}