import axios from "axios";
import {IRegisterResponse} from "~/infrastructure/boundaries/register-service";
import {RegisterRequest} from "~/infrastructure/models/register";
import {ElMessage} from "element-plus";
export class RegisterServiceImpl {
  async register(registerRequest: RegisterRequest): Promise<IRegisterResponse> {
    try {
      const res = await axios.post("/auth/registerUser", { data: registerRequest }, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      //等待从服务器返还
      if (
        res.status == 200
      ) {
          ElMessage.success("注册成功!")
        return res.data;
      } else {
        throw new Error("注册错误");
      }
    }
    catch (error: any) {
      throw error;
    }
  }
}