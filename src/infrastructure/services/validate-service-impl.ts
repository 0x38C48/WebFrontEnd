import axios from "axios"
import {ValidCodeRequest} from "~/infrastructure/models/valid-code-req"

export class ValidateServiceImpl{
    async getValidateCode(validCodeRequest: ValidCodeRequest) {
        try {
            const res = await axios.post("/auth/getValidateCode", validCodeRequest, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            //等待从服务器返还
            if (res.status == 200) {
                return res.data;
            } else {
                throw new Error("获取验证码失败");
            }
        } catch (error: any) {
            throw error;
        }
    }
}