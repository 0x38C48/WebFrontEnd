
import type { DataResponse } from "~/infrastructure/models/request";
import type { OptionItem } from "~/infrastructure/models/base";
import type { LeaveItem } from "../models/leave";

export interface ILeaveService {
  // 获取请假列表
  getLeaveList(
    state: number,
    searchKey: string,
   // currentPage: number
  ): Promise<DataResponse>;

  // 获取教师下拉选项
  getTeacherOptions(): Promise<OptionItem[]>;

  // 保存请假单
  saveLeave(leaveItem: LeaveItem): Promise<DataResponse>;

  // 审批请假单
  checkLeave(
    studentLeaveId: number,
    state: number,
    teacherComment: string,
    adminComment: string,
  ): Promise<DataResponse>;


}