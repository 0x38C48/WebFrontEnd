
import type { DataResponse } from "~/infrastructure/models/request";
import type { OptionItem } from "~/infrastructure/models/base";
import type { LeaveItem } from "../models/leave";
import { IRequestService } from "~/infrastructure/boundaries/request-service";
import { ILeaveService } from "../boundaries/leave-service";
import { ID_REQUEST_SERVICE } from "~/types";
import { inject, injectable } from "inversify";

@injectable()
export class LeaveServiceImpl implements ILeaveService {
  constructor(
    @inject(ID_REQUEST_SERVICE) private readonly requestService: IRequestService
  ) {}

  // 获取请假列表
  public async getLeaveList(
    state: number,
    searchKey: string,
    //currentPage: number
  ): Promise<DataResponse> {
    const res = await this.requestService.generalRequest(
      "/api/studentLeave/getStudentLeaveList",
      {
        state,
        search: searchKey,
       // currentPage,
      }
    );
    return res as DataResponse;
  }

  // 获取教师下拉选项
  public async getTeacherOptions(): Promise<OptionItem[]> {
    const res = await this.requestService.generalRequest(
      "/api/studentLeave/getTeacherItemOptionList",
      {}
    );
    return res.itemList as OptionItem[];
  }

  // 保存请假单
  public async saveLeave(leaveItem: LeaveItem): Promise<DataResponse> {
    const res = await this.requestService.generalRequest(
      "/api/studentLeave/studentLeaveSave",
      {
        state: leaveItem.state,
        studentLeaveId: leaveItem.studentLeaveId,
        teacherId: leaveItem.teacherId,
        leaveDate: leaveItem.leaveDate,
        reason: leaveItem.reason,
      }
    );
    return res as DataResponse;
  }

  // 审批请假单
  public async checkLeave(
    studentLeaveId: number,
    state: number,
    teacherComment: string,
    adminComment: string,
  ): Promise<DataResponse> {
    const res = await this.requestService.generalRequest(
      "/api/studentLeave/studentLeaveCheck",
      {
        studentLeaveId,
        state,
        teacherComment,
        adminComment,
      }
    );
    return res as DataResponse;
  }


}