import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Form } from "antd";
import AxiosClient from "@/libs/api/axios-client";
import { useAuth } from "@/hook/auth";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Input, Password } from "@/components/form";
import "antd/dist/reset.css";
import { FaCheck } from "react-icons/fa";
import { Image } from "@nextui-org/react";
import { domainCMS } from "@/services/helper";
import { directus } from "@/libs/directus";
import AxiosController from "@/libs/api/axios-controller";
import { log } from "console";

const Login = ({ getLayout }: any) => {
  const [form]: any = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [google, setGoogle] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigage = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  let [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  const backUrl = searchParams.get("backUrl");

  const { getProfile } = useAuth();
  const checkLogin = async () => { };
  const [error, setError] = useState("");
  localStorage.setItem("backUrl", backUrl)
  useEffect(() => {
    if (reason === "INVALID_PROVIDER") {
      onOpen();
      navigage("/login");
    }
  }, [reason]);

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

    const { email, password } = form.getFieldsValue();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailRegex.test(email)) errors.email = "Email không hợp lệ";
    if (password.length < 4) errors.password = "Mật khẩu không hợp lệ";

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
    const result: any = await directus.login(email, password).catch(async () => {
      const res: any = await AxiosController.get("/items/provider/" + email).catch((error) => { });
      const provider: string = res?.provider;

      setError(
        provider === "default" || !provider
          ? "Email hoặc mật khẩu không chính xác"
          : "Email của bạn được đăng ký thông qua <span class='font-bold'>" +
          provider?.toUpperCase() +
          "</span><br/> Vui lòng đăng nhập bằng <span class='font-bold'> " +
          provider?.toUpperCase() +
          "</span>",
      );
    });
    setLoading(false);
    if (!result) return;
    const { access_token, expires } = result;
    localStorage.setItem("auth_token", access_token);
    localStorage.setItem("expires", expires);
    const profile = await getProfile();
    // if (profile.data?.data?.role?.name === "End User") window.location.href = "/home";
    // else navigage("/teacher");
  };
  const handleCheck = () => {
    setIsChecked(!isChecked);
  };

  const loginByGoogle = async () => {
    try {
      const res: any = await directus.refresh();
      const { access_token, refresh_token } = res;
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      if (!access_token) return;
      const profile = await getProfile();
      // if (profile.data?.data?.role?.name === "End User") window.location.href = "/home";
      // else navigage("/teacher");
    } catch (error) { }
    setLoading(true);
  };
  useEffect(() => {
    const callback = searchParams.get("callback");
    if (callback) loginByGoogle();
    else setLoaded(true);
    const handleKeyUp = (e: any) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const clickLoginByGoogle = () => {
    setGoogle(true);
    const { origin, pathname } = window.location;
    const currentUrl = origin + pathname + "?callback=google";
    window.location.href = domainCMS + `/auth/login/google?redirect=${currentUrl}`;
  };

  const onChange = (e: any) => {
    // console.log(e);
  };
  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const bannerImg = brand ? "/images/thumb-1984.png" : "/images/patato.png";
  const logoImg = brand ? "/images/logo-1984.png" : "/images/logo.png";
  if (!loaded) return null;

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
                    <div className="xl:m-0 m-auto xl:block flex justify-center">
                      <Image className="m-auto w-full h-full xl:h-auto object-contain" width={208} height={80} src={logoImg} alt="Logo" />
                    </div>
                    {!brand && (
                      <p className="text-[#000] text-[14px] text-center xl:text-left font-normal ml-2 leading-[17px] tracking-[2.7px]"> Quyết tâm đạt band IELTS tại nhà </p>
                    )}
                  </div>
                  <div className={`${!brand ? "mt-4 xl:mt-[137px] 2xl:mt-[200px]" : "mt-20"}`}>
                    <div className={`${!brand ? "aspect-[300/320] w-20 xl:w-[300px]" : "w-[300px] xl:w-[700px]"} mx-auto`}>
                      <img src={bannerImg} width={700} height={500} className="w-full h-full xl:h-auto object-contain" />
                    </div>
                  </div>
                </div>
                <div className="w-full xl:w-1/2 flex items-center">
                  <div
                    className={`w-full mx-auto max-w-[494px] bg-white xl:rounded-[40px] ${!brand ? "xl:shadow-[0px_0px_20px_0px_rgba(251,148,0,0.20)]" : "xl:shadow-[0px_0px_15px_0px_rgba(5,55,130,0.2)]"
                      }`}
                  >
                    <div className="w-full flex flex-col gap-[24px] p-[40px]">
                      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Đăng nhập </p>
                      <div className="flex flex-col">
                        <Form onChange={onChange} autoComplete="off" className="form" name="login" form={form} initialValues={{}}>
                          <Form.Item className="mb-8" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
                            <Input placeholder="Email" />
                          </Form.Item>
                          <Form.Item className="mb-4" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                            <Password placeholder="Mật khẩu đăng nhập" />
                          </Form.Item>
                        </Form>
                        <motion.p
                          animate={{ height: error ? "auto" : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-red overflow-hidden text-center font-roboto text-[14px] font-normal leading-[24px]"
                          dangerouslySetInnerHTML={{ __html: error }}
                        ></motion.p>
                      </div>
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center gap-[6px]" onClick={() => handleCheck()}>
                            {!isChecked && (
                              <>
                                <div className="w-[24px] h-[24px] border border-primary1 rounded-lg">
                                  <button className="w-full h-full bg-white rounded-lg" />{" "}
                                </div>
                              </>
                            )}
                            {isChecked && (
                              <>
                                <div className="relative w-[24px] h-[24px] bg-primary1 rounded-lg">
                                  <button className="w-full h-full rounded-lg" />
                                  <FaCheck className="text-white absolute top-[15%] left-[50%] -translate-x-1/2" />
                                </div>
                              </>
                            )}
                            <span className="text-[#22313F] text-[14px] font-normal font-roboto leading-[20px]"> Ghi nhớ </span>
                          </div>
                        </div>

                        <div className="ml-auto">
                          <p
                            onClick={() => navigage("/auth/forgot-password")}
                            className="text-[#9E988F] hover:text-primary1 duration-200 cursor-pointer font-roboto text-[14px] leading-[20px] font-normal"
                          >
                            Quên mật khẩu?
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-[12px]">
                        <div
                          onClick={handleSubmit}
                          className={`bg-primary1 cursor-pointer rounded-[10px] text-white w-full max-w-[414px] py-[8px] text-center ${!brand ? "shadow-2" : "shadow-3"}`}
                        >
                          <button className="flex items-center justify-center w-full">
                            {loading && <Spinner className="mr-4" size="sm" color="default" />}
                            <p className="text-white font-roboto font-semibold text-[16px] leading-[20px]"> Đăng nhập </p>
                          </button>
                        </div>
                        <button onClick={clickLoginByGoogle} className="flex items-center py-2 justify-center rounded-xl bg-white shadow-2  duration-200 w-full">
                          {google && <Spinner className="mr-4" size="sm" color="default" />}
                          <img src="/images/google.webp" alt="" className="w-6 h-6 mr-4" />
                          <p className="text-primary2 text-[16px] leading-[20px]"> Sign in with Google </p>
                        </button>
                      </div>
                      <div className="flex justify-center items-center gap-[12px]">
                        <p className="text-[#030303] font-normal font-roboto leading-[24px] text-[14px] font-roboto"> Chưa có tài khoản?</p>
                        <Link to={backUrl !== null ? `/register?backUrl=${backUrl}` : "/register"}>
                          <button>
                            <p className="text-primary1 text-center font-roboto text-[14px] font-normal leading-[24px] underline underline-offset-2" onClick={() => checkLogin()}>
                              Đăng ký ngay
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
        <Modal isOpen={isOpen} onClose={() => onOpenChange()}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Thông báo</ModalHeader>
                <ModalBody>
                  <div>Email của bạn đã được đăng ký và sử dụng trước đó, vui lòng sử dụng tài khoản google khác</div>
                </ModalBody>
                <ModalFooter>
                  <Button color="secondary" variant="solid" onPress={onClose}>
                    Đóng
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};
export default Login;
