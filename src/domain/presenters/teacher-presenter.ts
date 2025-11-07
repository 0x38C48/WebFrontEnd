import { TeacherData, TeacherItem } from "~/domain/models/person";
import { ID_PERSON_SERVICE, ID_REQUEST_SERVICE, ID_MESSAGE_SERVICE, ID_BASE_SERVICE, ID_COMM_SERVICE, ID_INFO_SERVICE } from "~/types";
import { IRequestService } from "~/infrastructure/boundaries/request-service";
import { ICommService } from "~/infrastructure/boundaries/comm-service";
import { IMessageService } from "~/infrastructure/boundaries/message-service";
import { IBaseService } from "~/infrastructure/boundaries/base-service";
import { IInfoService } from "~/domain/boundaries/info-service";
import { IPersonService } from "~/domain/boundaries/person-service";
import { inject, injectable } from "inversify";
@injectable()
export class TeacherPresenter {
    constructor(
        @inject(ID_REQUEST_SERVICE) private readonly requestService: IRequestService,
        @inject(ID_COMM_SERVICE) private readonly commService: ICommService,
        @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
        @inject(ID_BASE_SERVICE) private readonly baseService: IBaseService,
        @inject(ID_INFO_SERVICE) private readonly infoService: IInfoService,
        @inject(ID_PERSON_SERVICE) private readonly service: IPersonService
    ) { }

    public async teacherInit(): Promise<TeacherData> {
        let data = {} as TeacherData;
        data.pagination = {
            currentPage: 1,
            pageSize: 10,
            total: 0
        };
        data.authHeader = this.requestService.getAuthHeader();
        data.numName = "";
        data.genderList = await this.baseService.getDictionaryOptionItemList("XBM");
        data.genderList.unshift({ id: 0, value: "", title: "请选择..." });
        await this.getTeacherDataPage(data);
        return data;
    }
    
    public async getTeacherDataPage(data: TeacherData): Promise<void> {
        const res = await this.service.getTeacherPageData(data.numName, data.pagination.currentPage);
        data.pagination.total = res.data.dataTotal;
        data.pagination.pageSize = res.data.pageSize;
        data.dataList = res.data.dataList;
    }
    
    public async doExport(data: TeacherData): Promise<void> {
        const res = await this.requestService.downloadPost(
            "/api/teacher/getTeacherListExcl",
            "教师.xlsx",
            {
                numName: data.numName,
            }
        );
        if (res != 200) {
            this.messageService.error("导出失败！");
        }
    };
    
    public addItem(data: TeacherData): TeacherItem {
        let item = {} as TeacherItem;
        data.currentIndex = -1;
        return item;
    }
    
    public async editItem(data: TeacherData, index: number): Promise<TeacherItem> {
        let item = { ...data.dataList[index] } as TeacherItem;
        data.currentIndex = index;
        data.birthday = this.commService.getDateFromStr(item.birthday);
        const re = await this.infoService.getPhotoImageStr("photo/" + item.personId + ".jpg");
        if (re.ok) {
            const blobData = await re.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                data.imgStr = reader.result as string;
            };
            reader.readAsDataURL(blobData);
        } else {
            console.error("Failed to fetch image:", re.status, re.statusText);
            data.imgStr = ""; // Handle error case
        }
        return item;
    }
    
    public async itemSubmit(item: TeacherItem, data: TeacherData): Promise<void> {
        item.birthday = this.commService.formatDate(data.birthday);
        const res = await this.service.teacherEditSave(item.personId, item);
        if (res.code == 0) {
            let personId = res.data;
            item = await this.service.getTeacherInfo(personId);
            if (data.currentIndex == -1) {
                data.dataList.push(item);
                data.pagination.total++;
                this.messageService.success("添加成功");
            } else {
                data.dataList[data.currentIndex] = item;
                this.messageService.success("修改成功");
            }
        } else {
            this.messageService.error(res.msg);
        }
    }
    
    async deleteItem(data: TeacherData, index: number) {
        const result = await this.messageService.confirm("确认删除教师吗?");
        if (!result) {
            return;
        }
        const res = await this.service.teacherDelete(data.dataList[index].personId);
        if (res.code == 0) {
            this.messageService.success("删除成功");
            data.dataList.splice(index, 1);
            data.pagination.total--;
        } else {
            this.messageService.error(res.msg);
        }
    };
    
    public async onSuccessPhoto(data: TeacherData, res: any): Promise<void> {
        if (res.code == 0) {
            this.messageService.success("上传成功！");
            const re = await this.infoService.getPhotoImageStr("photo/" + data.dataList[data.currentIndex].personId + ".jpg");
            if (re.ok) {
                const blobData = await re.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    data.imgStr = reader.result as string;//onloadend：当读取完成时执行的内容
                };
                reader.readAsDataURL(blobData);
            } else {
                console.error("Failed to fetch image:", re.status, re.statusText);
                data.imgStr = ""; // Handle error case
            }
        } else {
            this.messageService.error(res.msg);
        }
    }
}