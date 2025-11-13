import type { LeaveData, LeaveItem } from "../models/leave";
import type { ILeaveService } from "../boundaries/leave-service";
import type { IMessageService } from "~/infrastructure/boundaries/message-service";
import type { IRequestService } from "~/infrastructure/boundaries/request-service";
import { ID_LEAVE_SERVICE, ID_MESSAGE_SERVICE, ID_REQUEST_SERVICE } from "~/types";
import { inject, injectable } from "inversify";

@injectable()
export class LeavePresenter {
  constructor(
    @inject(ID_LEAVE_SERVICE) private readonly leaveService: ILeaveService,
    @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
    @inject(ID_REQUEST_SERVICE) private readonly requestService: IRequestService
  ) {}

  // 初始化页面数据
  public async leaveInit(): Promise<LeaveData> {
    const data: LeaveData = {
      dataList: [],
      //pagination: {
        //currentPage: 1,
       //pageSize: 10,
        //total: 0,
      //},
      searchKey: "",
      state: -1,
      teacherOptions: [],

      currentLeaveId: null,
    };

    // 获取教师选项
    data.teacherOptions = await this.leaveService.getTeacherOptions();
    data.teacherOptions.unshift({ id: 0, value: "", title: "请选择教师" });

    // 加载初始列表
    await this.getLeaveList(data);
    return data;
  }

  // 获取请假列表
  public async getLeaveList(data: LeaveData): Promise<void> {
    const res = await this.leaveService.getLeaveList(
      data.state,
      data.searchKey,
      //data.pagination.currentPage
    );
    if (res.code === 0) {
      data.dataList = res.data;
      //data.pagination.total = res.data.dataTotal;
      //data.pagination.pageSize = res.data.pageSize;
    } else {
      this.messageService.error(res.msg || "获取列表失败");
    }
  }

  // 保存请假单
  public async saveLeave(leaveItem: LeaveItem, data: LeaveData): Promise<boolean> {
    const res = await this.leaveService.saveLeave(leaveItem);
    if (res.code === 0) {
      this.messageService.success(leaveItem.studentLeaveId ? "修改成功" : "提交成功");
      await this.getLeaveList(data);
      return true;
    } else {
      this.messageService.error(res.msg || "操作失败");
      return false;
    }
  }

  // 审批请假单
  public async checkLeave(
    studentLeaveId: number,
    state: number,
    teacherComment: string,
    adminComment: string,
    data: LeaveData
  ): Promise<boolean> {
    const res = await this.leaveService.checkLeave(studentLeaveId, state, teacherComment,adminComment);
    if (res.code === 0) {
      this.messageService.success("审批成功");
      await this.getLeaveList(data);
      return true;
    } else {
      this.messageService.error(res.msg || "审批失败");
      return false;
    }
  }


  // 重置表单
  public resetForm(): LeaveItem {
    return {
      studentLeaveId: 0,
      studentId: 0,
      studentNum: "",
      studentName: "",
      teacherId: 0,
      teacherName: "",
      leaveDate: "",
      reason: "",
      state: 0,
      stateName: "",
      teacherComment: "",
      adminComment: "",
    };
  }
}
