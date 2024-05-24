import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Form } from "antd";
import AxiosClient from "@/libs/api/axios-client";
import { useAuth } from "@/hook/auth";
import { Spinner } from "@nextui-org/react";
import { motion } from "framer-motion";
import { DatePickerIELTS, Input, Password } from "@/components/form";
import AxiosController from "@/libs/api/axios-controller";
import "antd/dist/reset.css";

const Register = ({ getLayout }: any) => {
  let [searchParams] = useSearchParams();
  const [form]: any = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigage = useNavigate();
  const { getProfile } = useAuth();
  const checkLogin = async () => { };
  const [error, setError] = useState("");
  const backUrl = searchParams.get("backUrl");

  const handleSubmit = async () => {
    if (loading) return;
    setError("");
    let errors: any = {};
    try {
      await form.validateFields();
    } catch (err) {
      errors = err;
    }

    if (Object.keys(errors).length > 0) return;

    const { email, referrer_email, fullname, password, password_confirm, phone_number } = form.getFieldsValue();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;

    if (!emailRegex.test(email)) errors.email = "Email không hợp lệ";
    if (referrer_email && !emailRegex.test(referrer_email)) errors.referrer_email = "Email không hợp lệ";
    if (fullname.length < 4) errors.fullname = "Họ và tên không hợp lệ";

    if (!phone_number.match(regexPhoneNumber)) errors.phone_number = "Số điện thoại không hợp lệ";
    const phoneRes: any = await AxiosController.get("/items/checkphone/" + phone_number).catch((err) => { });
    if (phoneRes.exist !== false) errors.phone_number = "Số điện thoại đã tồn tại";
    if (password !== password_confirm) errors.password_confirm = "Mật khẩu không khớp";
    const fields = form.getFieldsValue();
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
    try {
      await AxiosClient.post("/users", {
        ...fields,
        role: "49b19b3a-3ccf-49c9-a10b-c767fb0df381",
      });
    } catch (error) {
      setError("Email đã tồn tại");
      setLoading(false);
      return;
    }

    try {
      const result = await AxiosClient.post("/auth/login", {
        email: fields.email,
        password: fields.password,
      });
      const { access_token, refresh_token, expires } = result?.data?.data;
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("expires", expires);
      await getProfile();
      navigage("/");
      result;
    } catch (error) { }
  };

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

  const bannerImg = brand ? "/images/thumb-1984.png" : "/images/patato.png";
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
                  <div className="mt-[63px] xl:ml-[90px]">
                    <img src={logoImg} className="mx-auto xl:mx-0" width={208} height={74} />
                    {!brand && (
                      <p className="text-[#000] text-[14px] text-center xl:text-left font-normal ml-2 leading-[17px] tracking-[2.7px]"> Quyết tâm đạt band IELTS tại nhà </p>
                    )}
                  </div>
                  <div className={`${!brand ? "mt-4 xl:mt-[137px] 2xl:mt-[200px]" : "mt-20"}`}>
                    <div className={`${!brand ? "aspect-[300/320] w-20 xl:w-[300px]" : "w-[700px] xl:w-[700px]"} mx-auto`}>
                      <img src={bannerImg} width={700} height={500} className="w-full h-full xl:h-auto object-contain" />
                    </div>
                  </div>
                </div>
                <div className="w-full xl:w-1/2 flex items-center">
                  <div className="w-full mx-auto max-w-[494px] bg-white xl:rounded-[40px] xl:shadow-[0px_0px_20px_0px_rgba(251,148,0,0.20)]">
                    <div className="w-full flex flex-col gap-[24px] p-[40px]">
                      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Đăng ký </p>
                      <div className="flex flex-col">
                        <Form autoComplete="off" className="form" name="register" form={form} initialValues={{}}>
                          <Form.Item className="mb-4" name={"fullname"} rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
                            <Input placeholder="Họ và tên" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
                            <Input placeholder="Email" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="phone_number" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                            <Input type="number" placeholder="Số điện thoại" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="birthday" rules={[{ required: true, message: "Vui lòng nhập ngày tháng năm sinh" }]}>
                            <DatePickerIELTS placeholder="Ngày tháng năm sinh (dd/mm/yyyy)" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                            <Password placeholder="Mật khẩu đăng nhập" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="password_confirm" rules={[{ required: true, message: "Vui lòng nhập xác nhận mật khẩu" }]}>
                            <Password placeholder="Xác nhận mật khẩu" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="referrer_email">
                            <Input placeholder="Email người giới thiệu (nếu có)" />
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
                            <p className="text-white font-roboto font-semibold text-[16px] leading-[20px]"> Đăng ký </p>
                          </button>
                        </div>

                        {/* <div className="bg-white rounded-[10px] flex justify-center items-center gap-[12px] shadow-2  text-white w-full max-w-[414px] py-[8px] text-center">
                          <img src="/images/Facebook.png" className="text-[#1877F2]" width={24} height={24} />
                          <button className="">
                            <p className="text-[#22313F] font-roboto font-normal text-[14px] leading-[20px]"> Đăng ký bằng Facebook </p>{" "}
                          </button>
                        </div> */}
                      </div>

                      <div className="flex justify-center items-center gap-[12px]">
                        <p className="text-[#030303] font-normal font-roboto leading-[24px] text-[14px] font-roboto">Bạn đã có tài khoản?</p>
                        <Link to={backUrl !== null ? `/login?backUrl=${backUrl}` : "/login"}>
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
      </div>
    </>
  );
};
export default Register;
