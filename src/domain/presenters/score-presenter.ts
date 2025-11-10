import { ScoreData, ScoreItem } from "~/domain/models/teaching";
import { ID_TEACHING_SERVICE, ID_MESSAGE_SERVICE } from "~/types";
import { IMessageService } from "~/infrastructure/boundaries/message-service";
import { ITeachingService } from "~/domain/boundaries/teaching-service";
import { inject, injectable } from "inversify";

@injectable()
export class ScorePresenter {
    constructor(
        @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
        @inject(ID_TEACHING_SERVICE) private readonly service: ITeachingService
    ) { }

    /**
     * 初始化成绩管理数据
     * @param initialPersonId 初始的人员ID（可选，如不提供则默认为null）
     * @returns ScoreData 成绩管理所需的初始数据
     */
    public async scoreInit(initialPersonId: number|null ): Promise<ScoreData> {
        try {
            let data = {} as ScoreData;
            // 使用传入的personId，而不是硬编码为0
            data.personId = initialPersonId;
            data.courseId = 0;
            
            // 并发获取学生和课程列表，提高性能
            const [studentList, courseList] = await Promise.all([
                this.service.getStudentItemOptionList(),
                this.service.getCourseItemOptionList()
            ]);
            
            data.studentList = studentList;
            data.courseList = courseList;
            
            // 添加默认选项
            data.studentList.unshift({ id: 0, value: "", title: "请选择" });
            data.courseList.unshift({ id: 0, value: "", title: "请选择" });
            
            // 初始化成绩列表
            await this.getScoreList(data);
            return data;
        } catch (error) {
            console.error('初始化成绩数据失败:', error);
            this.messageService.error('初始化数据失败');
            throw error;
        }
    }

    /**
     * 获取成绩列表
     * @param data 包含查询条件的ScoreData对象
     */
    public async getScoreList(data: ScoreData): Promise<void> {
        try {
            // 规范化参数，确保传递null而不是0或undefined
            const personIdParam = data.personId && data.personId > 0 ? data.personId : null;
            const courseIdParam = data.courseId && data.courseId > 0 ? data.courseId : null;
            
            data.dataList = await this.service.getScoreList(
                personIdParam, 
                courseIdParam
            );
        } catch (error) {
            console.error('获取成绩列表失败:', error);
            this.messageService.error('获取成绩列表失败');
            throw error;
        }
    }

    /**
     * 创建新的成绩项
     * @param data 当前ScoreData对象
     * @returns ScoreItem 新的成绩项
     */
    public addItem(data: ScoreData): ScoreItem {
        // 为ScoreItem接口中所有必需的属性提供初始值
        return {
            scoreId: 0, // 0表示新记录
            personId: 0, // 将在表单中设置
            courseId: 0, // 将在表单中设置
            studentNum: '', // 学生学号（将在保存时由后端关联填充）
            studentName: '', // 学生姓名（将在保存时由后端关联填充）
            courseNum: '', // 课程编号（将在保存时由后端关联填充）
            courseName: '', // 课程名称（将在保存时由后端关联填充）
            credit: 0, // 学分（将在保存时由后端关联填充）
            mark: 0, // 初始成绩设为0
            ranking: 0 // 排名（将在查询时由后端计算填充）
        } as ScoreItem;
    }

    /**
     * 获取要编辑的成绩项
     * @param data 当前ScoreData对象
     * @param index 要编辑的成绩项索引
     * @returns ScoreItem 要编辑的成绩项
     */
    public editItem(data: ScoreData, index: number): ScoreItem {
        if (!data.dataList || index < 0 || index >= data.dataList.length) {
            throw new Error('无效的成绩项索引');
        }
        return { ...data.dataList[index] } as ScoreItem;
    }

    /**
     * 提交成绩（添加或修改）
     * @param item 要提交的成绩项
     * @param data 当前ScoreData对象
     */
    public async itemSubmit(item: ScoreItem, data: ScoreData): Promise<void> {
        try {
            // 验证必要参数
            if (!item.personId || item.personId <= 0) {
                this.messageService.error('学生信息不完整，无法保存成绩');
                return;
            }
            if (!item.courseId || item.courseId <= 0) {
                this.messageService.error('课程信息不完整，无法保存成绩');
                return;
            }
            // 验证成绩范围（额外的前端验证，即使后端已有验证）
            if (item.mark === undefined || item.mark < 0 || item.mark > 100) {
                this.messageService.error('成绩必须在0-100之间');
                return;
            }

            // 调用服务保存成绩
            const res = await this.service.scoreSave(
                item.scoreId, 
                item.personId, 
                item.courseId, 
                item.mark
            );

            if (res.code === 0) {
                const action = item.scoreId ? '更新' : '添加';
                this.messageService.success(`${action}成绩成功`);
                // 重新加载成绩列表
                await this.getScoreList(data);
            } else {
                this.messageService.error(res.msg || '操作失败');
                throw new Error(res.msg || '操作失败');
            }
        } catch (error) {
            console.error('提交成绩失败:', error);
            // 错误已在上层捕获并显示，这里只需抛出以便前端知道操作失败
            throw error;
        }
    }

    /**
     * 删除成绩
     * @param data 当前ScoreData对象
     * @param index 要删除的成绩项索引
     */
    public async deleteItem(data: ScoreData, index: number): Promise<void> {
        try {
            if (!data.dataList || index < 0 || index >= data.dataList.length) {
                this.messageService.error('无效的成绩项');
                return;
            }

            // 显示确认对话框
            const result = await this.messageService.confirm(
                "确认删除该成绩记录吗？此操作不可撤销。"
            );
            
            if (!result) {
                return;
            }

            const scoreId = data.dataList[index].scoreId;
            const res = await this.service.scoreDelete(scoreId);

            if (res.code === 0) {
                this.messageService.success('删除成绩成功');
                // 从列表中移除删除的项
                data.dataList.splice(index, 1);
            } else {
                this.messageService.error(res.msg || '删除失败');
                throw new Error(res.msg || '删除失败');
            }
        } catch (error) {
            console.error('删除成绩失败:', error);
            // 错误已在上层捕获并显示，这里只需抛出以便前端知道操作失败
            throw error;
        }
    };
}