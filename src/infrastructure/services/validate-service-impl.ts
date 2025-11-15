import axios from "axios"
import {ValidCodeRequest} from "~/infrastructure/models/valid-code-req"
import {ValidCodeResponse} from "~/infrastructure/models/valid-code-response"

export class ValidateServiceImpl{
    async getValidateCode(validCodeRequest: ValidCodeRequest): Promise<ValidCodeResponse> {
        try {
            const res = await axios.post("/auth/getValidateCode", validCodeRequest, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            //等待从服务器返还
            if (res.status == 200) {
                return res.data as ValidCodeResponse;
            } else {
                throw new Error("获取验证码失败");
            }
        } catch (error: any) {
            throw error;
        }
    }

    async validateCode(code: string, username?: string, validateCodeId?: number) {
        try {
            const requestData = {
                data: {
                    validateCode: code,
                    validateCodeId: validateCodeId || 0
                }
            };
            const res = await axios.post("/auth/testValidateInfo", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (res.status == 200 && res.data.code == 0) {
                return true; // 验证码正确
            } else {
                return false; // 验证码错误
            }
        } catch (error: any) {
            console.error('验证码校验失败:', error);
            return false;
        }
    }
}