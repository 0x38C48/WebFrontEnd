import { OptionItem } from "~/infrastructure/models/base";
import {StudentItem, TeacherItem} from "~/domain/models/person";
import { ScoreItem } from "~/domain/models/teaching";
export interface PasswordData {
    oldPassword: string;
    newPassword: string;
    checkPassword: string;
}
export interface StudentIntroduceData {
    authHeader: any;
    info: StudentItem;
    feeList: OptionItem[];
    markList: OptionItem[];
    scoreList: ScoreItem[];
    personId: number | null;
    imgStr: string;
}
export interface TeacherIntroduceData {
    authHeader: any;
    info: TeacherItem;
    personId: number | null;
    imgStr: string;
    courseList: CourseItem[];     // 教师授课列表
    courseStat: OptionItem[];   // 课程统计（如各等级数量）
    semesterTrend: { semester: string; avgScore: number }[]; // 学期平均分趋势
}
export interface SystemIntroduceData {
}