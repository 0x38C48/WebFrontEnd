import { DataResponse } from "~/infrastructure/models/request";
import { OptionItem } from "~/infrastructure/models/base";
import { CourseItem } from "~/domain/models/teaching";
import { IRequestService } from "~/infrastructure/boundaries/request-service";
import { ITeachingService } from "~/domain/boundaries/teaching-service";
import { ID_REQUEST_SERVICE, } from "~/types";
import { inject, injectable } from "inversify";
@injectable()
export class TeachingServiceImpl implements ITeachingService {
    constructor(
        @inject(ID_REQUEST_SERVICE) private readonly requestService: IRequestService
    ) { }

    public async getCourseList(
        numName: string | null
    ): Promise<CourseItem[]> {
        try {
            console.log("开始请求课程列表，搜索条件:", numName);
            
            // 确保参数安全，避免空值导致的问题
            const safeNumName = numName || '';
            
            const res = await this.requestService.generalRequest("/api/course/getCourseList", {
                numName: safeNumName,
            });
            
            // 验证响应数据
            if (!res || !Array.isArray(res.data)) {
                console.error("课程列表响应数据无效:", res);
                throw new Error("课程列表数据格式错误");
            }
            
            console.log(`成功获取课程列表，共${res.data.length}条记录`);
            return res.data as CourseItem[];
        } catch (error) {
            console.error("获取课程列表失败:", error);
            
            // 针对数据库查询错误提供更具体的错误信息
            if (error instanceof Error) {
                if (error.message.includes("Unknown column") && error.message.includes("person_id")) {
                    throw new Error("后端数据库查询错误: 课程表中不存在person_id字段。请联系管理员检查后端SQL查询语句。");
                }
            }
            
            throw error;
        }
    }

    public async getCourseListByTeacherId(
        personId: number
    ): Promise<CourseItem[]> {
        try {
            console.log("开始请求教师授课列表，教师ID:", personId);
            
            const res = await this.requestService.generalRequest("/api/course/getCourseListByTeacherId", {
                personId: personId,
            });
            
            // 验证响应数据
            if (!res || !Array.isArray(res.data)) {
                console.error("教师授课列表响应数据无效:", res);
                throw new Error("教师授课列表数据格式错误");
            }
            
            console.log(`成功获取教师授课列表，共${res.data.length}条记录`);
            return res.data as CourseItem[];
        } catch (error) {
            console.error("获取教师授课列表失败:", error);
            
            // 针对数据库查询错误提供更具体的错误信息
            if (error instanceof Error) {
                if (error.message.includes("Unknown column") && error.message.includes("teacher_id")) {
                    throw new Error("后端数据库查询错误: 课程表中不存在teacher_id字段。请联系管理员检查后端SQL查询语句。");
                }
            }
            
            throw error;
        }
    }
    //删除课程后台数据请求方法
    public async courseDelete(courseId: number): Promise<DataResponse> {
        const res = await this.requestService.generalRequest("/api/course/courseDelete", {
            courseId: courseId,
        });
        return res as DataResponse;
    }
    //课程保存后台数据请求方法
    public async courseSave(data: CourseItem): Promise<DataResponse> {
        try {
            // 确保personId字段存在且为数字类型
            if (data.personId === undefined || data.personId === null) {
                console.warn('课程保存时personId未定义，设置为默认值0');
                data.personId = 0;
            }
            
            console.log('发送到后端的课程数据:', data);
            
            // 构建包含所有必要字段的请求数据
            const requestData = {
                courseId: data.courseId,
                personId: data.personId,
                num: data.num,
                name: data.name,
                coursePath: data.coursePath,
                credit: data.credit,
                preCourseId: data.preCourseId
            };
            
            console.log('构建的请求数据:', requestData);
            const res = await this.requestService.generalRequest("/api/course/courseSave", requestData);
            return res as DataResponse;
        } catch (error) {
            console.error('课程保存请求失败:', error);
            throw error;
        }
    }
    //获取学生选择项列表后台数据请求方法
    public async getStudentItemOptionList(): Promise<OptionItem[]> {
        try {
            const res = await this.requestService.generalRequest("/api/score/getStudentItemOptionList", null);
            // 检查响应数据是否有效
            if (!res || !Array.isArray(res.itemList)) {
                throw new Error("学生列表数据格式错误");
            }
            return res.itemList as OptionItem[];
        } catch (error) {
            console.error("获取学生列表失败:", error);
            throw error;
        }
    }
    //获取课程选择项列表后台数据请求方法
    public async getCourseItemOptionList(): Promise<OptionItem[]> {
        try {
            console.log("开始请求课程选择项列表");
            const res = await this.requestService.generalRequest("/api/score/getCourseItemOptionList", null);
            
            // 检查响应数据是否有效
            if (!res || !Array.isArray(res.itemList)) {
                console.error("课程列表响应数据无效:", res);
                throw new Error("课程列表数据格式错误");
            }
            
            console.log(`成功获取课程选择项列表，共${res.itemList.length}条记录`);
            return res.itemList as OptionItem[];
        } catch (error) {
            console.error("获取课程列表失败:", error);
            // 提供更详细的错误信息，包括可能的SQL异常
            if (error instanceof Error && error.message.includes("Unknown column")) {
                throw new Error(`后端数据库查询错误: ${error.message}。请联系管理员检查数据库查询语句是否正确`);
            }
            throw error;
        }
    }
    //获取成绩列表后台数据请求方法
    public async getScoreList(
        personId: number | null,
        courseId: number | null
    ): Promise<[]> {
        const res = await this.requestService.generalRequest("/api/score/getScoreList", {
            personId: personId,
            courseId: courseId,
        });
        return res.data as [];
    }
    //成绩保存后台数据请求方法
    public async scoreSave(
        scoreId: number | null,
        personId: number,
        courseId: number,
        mark: number
    ): Promise<DataResponse> {
        try {
            // 准备请求数据，与后端API保持一致
            const requestData = {
                scoreId: scoreId,
                personId: personId,
                courseId: courseId,
                mark: mark
            };
            
            const res = await this.requestService.generalRequest("/api/score/scoreSave", requestData);
            return res as DataResponse;
        } catch (error) {
            console.error('保存成绩失败:', error);
            // 返回标准错误响应格式
            return {
                code: -1,
                msg: '网络请求失败，请检查网络连接或稍后重试',
                data: null
            };
        }
    }
    
    //成绩删除后台数据请求方法
    public async scoreDelete(scoreId: number): Promise<DataResponse> {
        try {
            // 准备请求数据，与后端API保持一致
            const requestData = {
                scoreId: scoreId
            };
            
            const res = await this.requestService.generalRequest("/api/score/scoreDelete", requestData);
            return res as DataResponse;
        } catch (error) {
            console.error('删除成绩失败:', error);
            // 返回标准错误响应格式
            return {
                code: -1,
                msg: '网络请求失败，请检查网络连接或稍后重试',
                data: null
            };
        }
    }
    //获取学生已选课程列表后台数据请求方法
    public async getCourseChooseList(
        personId: number | null,
        courseId: number | null
    ): Promise<DataResponse> {
        const res = await this.requestService.generalRequest("/api/courseChoose/getCourseChooseList", {
            personId: personId,
            courseId: courseId,
        });
        return res as DataResponse;
    }
    //学生选课后台数据请求方法
    public async courseChooseSave(
        personId: number,
        courseId: number,
        courseChooseId: number | null
    ): Promise<DataResponse> {
        const res = await this.requestService.generalRequest("/api/courseChoose/courseChooseSave", {
            personId: personId,
            courseId: courseId,
            courseChooseId: courseChooseId,
        });
        return res as DataResponse;
    }
    //学生退课后台数据请求方法
    public async courseChooseDelete(
        courseChooseId: number
    ): Promise<DataResponse> {
        const res = await this.requestService.generalRequest("/api/courseChoose/courseChooseDelete", {
            courseChooseId: courseChooseId,
        });
        return res as DataResponse;
    }
}