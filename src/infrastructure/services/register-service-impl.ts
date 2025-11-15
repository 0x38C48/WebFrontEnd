import axios from "axios";
import {IRegisterResponse} from "~/infrastructure/boundaries/register-service";
import {RegisterRequest} from "~/infrastructure/models/register";
import {ElMessage} from "element-plus";
import { ValidateServiceImpl } from "./validate-service-impl";

export class RegisterServiceImpl {
  async register(registerRequest: RegisterRequest): Promise<IRegisterResponse> {
    try {
      // 先校验验证码
      const validateService = new ValidateServiceImpl();
      const isValidCode = await validateService.validateCode(registerRequest.code, registerRequest.username, registerRequest.validateCodeId);
      
      if (!isValidCode) {
        ElMessage.error("验证码错误，请重新输入");
        throw new Error("验证码错误");
      }

      const res = await axios.post("/auth/registerUser", { data: registerRequest }, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      //等待从服务器返还
      if (
        res.status == 200&&res.data.code==0
      ) {
          ElMessage.success("注册成功!")
        return res.data.msg;
      } else {
          ElMessage.error("注册失败。"+'\n'+res.data.msg);
        throw new Error("注册错误"+res.data.msg);
      }
    }
    catch (error: any) {
      throw error;
    }
  }
}