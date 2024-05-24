import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Form } from "antd";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react";
import { motion } from "framer-motion";
import { Input } from "@/components/form";
import "antd/dist/reset.css";
import { Image } from "@nextui-org/react";
import ModalView from "@/components/layouts/modal/template";
import AxiosController from "@/libs/api/axios-controller";
import { useToast } from "@/context/toast";
import { center } from "@/services/config";

const Forgot = () => {
  const [form]: any = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const checkLogin = async () => {};
  const [error, setError] = useState("");
  const { fail }: any = useToast();
  const [modalProvider, setModalProvider]: any = useState(false);

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

    const { email } = form.getFieldsValue();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailRegex.test(email)) errors.email = "Email không hợp lệ";
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

    const infoUserByEmail: any = await AxiosController.get("/items/provider/" + email).catch((error) => {});
    if (infoUserByEmail.provider !== "default") {
      setModalProvider(infoUserByEmail.provider);
      setLoading(false);
      return;
    }

    try {
      await AxiosController.post("/webhook/send-template-email", {
        domain: center,
        email: email,
        type: "forgot",
      });
      setOpen(!open);
    } catch (error: any) {
      const err = error?.response?.data;
      fail(err.message || "Có gì đó không đúng");
    }
    setLoading(false);
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

  const brand = center === "ielts1984" ? true : false;
  const bannerImg = brand ? "/images/thumbnail-84.png" : "/images/patato.png";
  const logoImg = brand ? "/images/logo-1984.png" : "/images/logo.png";
  const centerName = location.host == "e-learning.ielts1984.vn" ? "IELTS 1984" : "Youpass";
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
                      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Quên mật khẩu </p>
                      <div className="body2 text-[#030303]">Vui lòng nhập Email đăng ký tại {centerName}</div>
                      <div className="flex flex-col">
                        <Form autoComplete="off" className="form" name="forgot" form={form} initialValues={{}}>
                          <Form.Item className="mb-0" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
                            <Input placeholder="Email" />
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
            <div className="mx-auto flex flex-col items-center justify-center gap-6 p-10 xl:w-[42%] w-[90%] z-10  fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-[20px]">
              <p className="text-primary1 text-center headline1">Thông báo</p>
              <p className="text-neu1 text-center body5 h-12">
                Hướng dẫn cập nhật mật khẩu đã được gửi về email của bạn, vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật khẩu.
              </p>
              <div className="flex sm:gap-5 gap-4 sm:pt-0 pt-5 ">
                <button className=" sm:w-60 w-[140px] px-3 py-2 shadow-2 rounded-[10px] text-neu1 body5" onClick={() => setOpen(!open)}>
                  Tôi đã hiểu
                </button>
                <Link to="/login">
                  <button className=" bg-primary1 rounded-[10px] px-3 py-2 sm:w-60 w-[140px] shadow-2 text-neu6 body3">Quay lại trang đăng nhập</button>
                </Link>
              </div>
            </div>
          </ModalView>
          <Modal isOpen={modalProvider} onClose={() => setModalProvider(false)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Thông báo</ModalHeader>
                  <ModalBody>
                    <div>
                      Email của bạn đã được đăng ký bằng tài khoản của <span className="text-primary font-semibold">{modalProvider?.toUpperCase()}</span>. Chúng tôi không thể thay
                      đổi mật khẩu.
                      <br /> Vui lòng thay đổi phương thức đăng nhập bạn nhé!
                    </div>
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
      </div>
    </>
  );
};

export default Forgot;
