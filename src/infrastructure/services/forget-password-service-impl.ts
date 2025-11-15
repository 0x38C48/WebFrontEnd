import axios from "axios";
import { IForgetPasswordService } from "../boundaries/forget-password-service";
import { ResetPasswordRequest } from "../models/forget-password";

export class ForgetPasswordServiceImpl implements IForgetPasswordService {

    /**
     * 重置密码
     */
    async resetPassword(request: ResetPasswordRequest): Promise<void> {
        try {
            // 根据openapi.json格式构建请求参数
            const requestData = {
                data: {
                    key: {
                        username: request.username,
                        newPassword: request.newPassword
                    }
                }
            };
            
            const res = await axios.post("/api/base/updatePassword", requestData);
            
            if (res.status === 200 && res.data.code === 0) {
                // 重置成功
                return;
            } else {
                throw new Error(res.data.msg || "密码重置失败");
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.msg || "密码重置失败");
            }
            throw error;
        }
    }

}