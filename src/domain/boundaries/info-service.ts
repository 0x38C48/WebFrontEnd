import { DataResponse } from "~/infrastructure/models/request";
export interface IInfoService {
    updatePassword(data: Object): Promise<DataResponse>;
    getStudentIntroduceData(personId: number | null): Promise<DataResponse>;
    getPhotoImageStr(fileName: String): Promise<Response>;
    uploadPhoto(remoteFile: string, file: any): Promise<any>;
}