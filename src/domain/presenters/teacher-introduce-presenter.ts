import { TeacherIntroduceData } from "~/domain/models/info";
import { TeacherItem } from "~/domain/models/person";
import { ID_INFO_SERVICE, ID_MESSAGE_SERVICE } from "~/types";
import { IMessageService } from "~/infrastructure/boundaries/message-service";
import { IInfoService } from "~/domain/boundaries/info-service";
import { inject, injectable } from "inversify";
@injectable()
export class TeacherIntroducePresenter {
    constructor(
        @inject(ID_MESSAGE_SERVICE) private readonly messageService: IMessageService,
        @inject(ID_INFO_SERVICE) private readonly service: IInfoService
    ) { }
    public async teacherIntroduceInit(data: TeacherIntroduceData): Promise<void> {
        let res = await this.service.getTeacherIntroduceData(data.personId);
        if (res.code == 0) {
            data.info = res.data.info;
            data.personId = data.info.personId;
            // data.feeList = res.data.feeList;
            // data.markList = res.data.markList;
            // data.scoreList = res.data.scoreList;
            //res = await this.service.getPhotoImageStr("photo/" + data.info.personId + ".jpg");
            let re = await this.service.getPhotoImageStr("photo/" + data.info.personId + ".jpg");
            console.log("res:" + re.statusText);
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

        }
    }
}