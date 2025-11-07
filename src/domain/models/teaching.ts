import { Option } from "element-plus/es/components/select-v2/src/select.types";
import { OptionItem } from "~/infrastructure/models/base";

//用于课程数据信息的定义
export interface CourseItem {
    courseId: number;
    num: string;
    name: string;
    credit: number;
    coursePath: string;
    preCourse: string;
    preCourseId: number;
}

export interface CourseData {
    numName: string;
    dataList: CourseItem[];
    courseSelectList: OptionItem[];
    currentIndex: number;
}
export interface ScoreItem {
    scoreId: number;
    personId: number;
    courseId: number;
    studentNum: string;
    studentName: string;
    courseNum: string;
    courseName: string;
    credit: number;
    mark: number;
    ranking: number;
}
export interface ScoreData {
    personId: number;
    courseId: number;
    dataList: ScoreItem[];
    studentList: OptionItem[];
    courseList: OptionItem[];
}
// 选课结果数据模型
export interface CourseChooseResult {
    courseChooseId: number;
    personId: number;
    courseId: number;
    courseNum: string;
    courseName: string;
    credit: number;
    chooseTime: string;
    status: string; // 选课状态：已选、待确认、已退选等
    score?: number; // 成绩（如果有）
    teacherName?: string; // 授课教师
    semester?: string; // 学期
}

// 选课结果查询数据
export interface CourseChooseResultData {
    personId: number;
    dataList: CourseChooseResult[];
    totalCredits: number;
    //currentSemesterCredits: number;
    totalCourses: number;
    passedCourses: number;
}