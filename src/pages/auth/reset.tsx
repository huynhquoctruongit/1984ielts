import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Form } from "antd";
import AxiosClient from "@/libs/api/axios-client";
import { useAuth } from "@/hook/auth";
import { Spinner } from "@nextui-org/react";
import { motion } from "framer-motion";
import { DatePickerIELTS, Input, Password } from "@/components/form";
import "antd/dist/reset.css";
import { Image } from "@nextui-org/react";
import ModalView from "@/components/layouts/modal/template";
import AxiosController from "@/libs/api/axios-controller";
import dayjs from "dayjs";
import { center } from "@/services/config";

const Reset = () => {
  const [form]: any = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const checkLogin = async () => {};
  const [error, setError] = useState("");
  const [popupExpired, setPopupExpired] = useState(false);
  const { token, expire, user_id } = useParams();

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    let errors: any = {};
    try {
      await form.validateFields();
    } catch (err) {
      console.log(err);
      errors = err;
    }

    if (Object.keys(errors).length > 0) return;
    const { password, passwordConfirm } = form.getFieldsValue();

    if (password.length < 4) errors.password = "Mật khẩu không hợp lệ";
    if (password !== passwordConfirm) errors.passwordConfirm = "Mật khẩu không trùng khớp";

    if (Object.keys(errors).length > 0) {
      const listE = Object.keys(errors).map((key) => {
        if (!errors[key]) return null;
        return {
          name: key,
          errors: [errors[key]],
        };
      });
      form.setFields(listE.filter((item) => item));
      return;
    }
    setLoading(true);
    const result = await AxiosController.post("/verify/forgot-password/", {
      password: password,
      domain: center,
      expire: expire,
      token: token,
      userId: user_id,
    });

    setLoading(false);
    setOpen(true);
  };

  useEffect(() => {
    const curernt_time = dayjs().unix();
    if (curernt_time > Number(expire)) {
      setPopupExpired(true);
    }
  }, []);

  const keydownhandler = (e: any) => {
    if (e.keyCode == 13) handleSubmit();
  };

  useEffect(() => {
    addEventListener("keydown", keydownhandler);
    return () => {
      removeEventListener("keydown", keydownhandler);
    };
  }, []);

  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const bannerImg = brand ? "/images/thumbnail-84.png" : "/images/patato.png";
  const logoImg = brand ? "/images/logo-1984.png" : "/images/logo.png";

  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="flex h-full w-screen">
          <div className="fixed top-0 hidden xl:block left-0 w-[45px] h-screen bg-primary1"></div>
          <div className="container mx-auto w-full">
            <div className="flex flex-col">
              <div className="flex flex-col xl:flex-row min-h-screen">
                <div className="w-full xl:w-1/2 ">
                  <div className="mt-[63px] xl:ml-[90px] m-auto">
                    <div className="xl:m-auto xl:block flex justify-center">
                      <Image className="m-auto w-full h-full xl:h-auto object-contain" width={208} height={80} src={logoImg} alt="Logo" />
                    </div>
                    <p className="text-[#000] text-[14px] text-center xl:text-left font-normal ml-2 leading-[17px] tracking-[2.7px]">Quyết tâm đạt band IELTS tại nhà</p>
                  </div>
                  <div className="mt-4 xl:mt-[137px] 2xl:mt-[200px] ">
                    <div className="aspect-[300/320] w-20 xl:w-[300px] mx-auto">
                      <Image src={bannerImg} width={300} height={320} className="w-full h-full xl:h-auto object-contain" />
                    </div>
                  </div>
                </div>
                <div className="w-full xl:w-1/2 flex items-center">
                  <div className="w-full mx-auto max-w-[494px] bg-white xl:rounded-[40px] xl:shadow-[0px_0px_20px_0px_rgba(251,148,0,0.20)]">
                    <div className="w-full flex flex-col gap-[24px] p-[40px]">
                      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Đặt lại mật khẩu</p>
                      <div className="flex flex-col">
                        <Form autoComplete="off" className="form" name="reset" form={form} initialValues={{}}>
                          <Form.Item className="mb-4" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                            <Password placeholder="Mật khẩu mới" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="passwordConfirm" rules={[{ required: true, message: "Vui lòng nhập xác nhận mật khẩu" }]}>
                            <Password placeholder="Xác nhận mật khẩu" />
                          </Form.Item>
                        </Form>

                        <motion.p
                          animate={{ height: error ? "auto" : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-red overflow-hidden text-center font-roboto text-[14px] font-normal leading-[24px]"
                        >
                          {error}
                        </motion.p>
                      </div>

                      <div className="flex flex-col gap-[12px]">
                        <div onClick={handleSubmit} className="bg-primary1 cursor-pointer rounded-[10px] shadow-2 text-white w-full max-w-[414px] py-[8px] text-center">
                          <button className="flex items-center justify-center w-full">
                            {loading && <Spinner className="mr-4" size="sm" color="default" />}
                            <p className="text-white font-roboto font-semibold text-[16px] leading-[20px]"> Đặt lại mật khẩu </p>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center items-center gap-[12px]">
                        <p className="text-[#030303] font-normal font-roboto leading-[24px] text-[14px] font-roboto"> Bạn đã có tài khoản?</p>
                        <Link to="/login">
                          <button>
                            <p className="text-primary1 text-center font-roboto text-[14px] font-normal leading-[24px] underline underline-offset-2" onClick={() => checkLogin()}>
                              Đăng nhập ngay
                            </p>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bg-black z-50"></div>

        <div className="bg-black z-10 ">
          <ModalView open={open}>
            <div className="mx-auto flex flex-col items-center justify-center gap-6 md:p-10 p-[20px] md:w-[40%] w-[90%] z-10  fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-[20px]">
              <p className="text-primary1 text-center headline1">Thông báo</p>
              <p className="text-neu1 text-center body5 h-12">Bạn đã cập nhật mật khẩu thành công! Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ của chúng tôi.</p>
              <div className="flex gap-5">
                <Link to="/login">
                  <button className="bg-primary1 rounded-[10px] px-3 py-2 w-60 shadow-2 text-neu6 body3">Đăng nhập</button>
                </Link>
              </div>
            </div>
          </ModalView>
          <ModalView open={popupExpired}>
            <div className="mx-auto flex flex-col items-center justify-center gap-6 p-10 lg:w-[40%] w-[90%] z-10  fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-[20px]">
              <p className="text-primary1 text-center headline1">Thông báo</p>
              <p className="text-center body2 h-12 text-red">Token đã hết hạn vui lòng quay lại trang trang quên mật khẩu để thực hiện lại</p>
              <div className="flex gap-5">
                <Link to="/auth/forgot-password">
                  <button className="bg-primary1 rounded-[10px] px-3 py-2 w-60 shadow-2 text-neu6 body3">Quên mật khẩu</button>
                </Link>
              </div>
            </div>
          </ModalView>
        </div>
      </div>
    </>
  );
};

export default Reset;
