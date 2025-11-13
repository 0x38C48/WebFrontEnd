

import type { OptionItem } from "~/infrastructure/models/base";

// 请假单数据结构
export interface LeaveItem {
  studentLeaveId: number; // 请假记录ID
  studentId: number; // 学生ID
  studentNum: string; // 学号
  studentName: string; // 学生姓名
  teacherId: number; // 教师ID
  teacherName: string; // 教师姓名
  leaveDate: string; // 请假日期
  reason: string; // 请假原因
  state: number; // 状态（0-待审批 1-批准 2-拒绝 3-管理员批准 4-管理员拒绝）
  stateName: string; // 状态名称
  teacherComment: string; // 教师评语
  adminComment: string; // 管理员评语
}

// 页面数据结构
export interface LeaveData {
  dataList: LeaveItem[]; // 请假列表
 // pagination: {
  //  currentPage: number;
   // pageSize: number;
   // total: number;
  //};
  searchKey: string; // 搜索关键词
  state: number; // 状态筛选
  teacherOptions: OptionItem[]; // 教师下拉选项

  currentLeaveId: number | null; // 当前操作的请假ID
}