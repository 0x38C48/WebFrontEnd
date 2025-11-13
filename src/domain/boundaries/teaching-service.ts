import { DataResponse } from "~/infrastructure/models/request";
import { OptionItem } from "~/infrastructure/models/base";
import { CourseItem } from "~/domain/models/teaching";
export interface ITeachingService {
    getCourseList(numName: string | null): Promise<CourseItem[]>;
    getCourseListByTeacherId(personId: number): Promise<CourseItem[]>;
    courseDelete(courseId: number): Promise<DataResponse>;
    courseSave(data: CourseItem): Promise<DataResponse>;
    getStudentItemOptionList(): Promise<OptionItem[]>;
    getCourseItemOptionList(): Promise<OptionItem[]>;
    getScoreList(personId: number | null, courseId: number | null): Promise<[]>;
    scoreSave(scoreId: number | null, personId: number, courseId: number, mark: number): Promise<DataResponse>;
    scoreDelete(scoreId: number): Promise<DataResponse>;
    
    // 选课相关方法（基于后端实际接口）
    courseChooseSave(personId: number, courseId: number, courseChooseId: number | null): Promise<DataResponse>;
    courseChooseDelete(courseChooseId: number): Promise<DataResponse>;
    getCourseChooseList(personId: number | null, courseId: number | null): Promise<DataResponse>;
}