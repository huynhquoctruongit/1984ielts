import "antd/dist/reset.css";
import { Image } from "@nextui-org/react";
import { useLocalStorage } from "usehooks-ts";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hook/auth";
import AxiosController from "@/libs/api/axios-controller";
import { center } from "@/services/config";

const VerifyEmail = () => {
  const { profile, isLogin } = useAuth();
  const navigate = useNavigate();
  const domain = location.host.includes("ielts1984.vn") ? "ielts1984" : "youpass";
  useEffect(() => {
    if (isLogin === false) return;
    if (profile.is_active) {
      navigate("/home");
      return;
    }
    // const time = localStorage.getItem("send-email" + profile.email) || 0;
    // const current = dayjs().unix();
    // if (current - Number(time) < 60 * 1) return;
    // if (profile?.is_active) return;
    // const payload: any = { email: profile.email, type: "register", domain: domain };
    // AxiosController.post("/webhook/send-template-email", payload).then((res) => {});
    // localStorage.setItem("send-email" + profile.email, dayjs().unix().toString());
  }, [profile]);

  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const bannerImg = center === "ielts1984" ? "/images/thumbnail-84.png" : "/images/patato.png";
  const logoImg = center === "ielts1984" ? "/images/logo-1984.png" : "/images/logo.png";

  return (
    <>
      <div className="bg-white min-h-[calc(100vh-64px)] box-border">
        <div className="flex h-full w-screen">
          <div className="fixed top-0 hidden xl:block left-0 w-[45px] h-screen bg-primary1"></div>
          <div className="container mx-auto w-full">
            <div className="flex flex-col">
              <div className="flex flex-col xl:flex-row md:min-h-[calc(100vh-64px)] md:mx-10 ">
                <div className="w-full xl:w-1/2 ">
                  <div className="mt-[63px] xl:ml-[90px] m-auto">
                    <div className="xl:m-auto xl:block flex justify-center">
                      <Image className="m-auto w-full h-full xl:h-auto object-contain" width={208} height={80} src={logoImg} alt="Logo" />
                    </div>
                    <p className="text-[#000] text-[14px] text-center xl:text-left font-normal ml-2 leading-[17px] tracking-[2.7px]">Quyết tâm đạt band IELTS tại nhà</p>
                  </div>
                  <div className="mt-4 xl:mt-[137px] 2xl:mt-[200px] hidden md:block">
                    <div className="aspect-[300/320] w-22 xl:w-[300px] mx-auto">
                      <Image src={bannerImg} width={300} height={320} className="w-full h-full xl:h-auto object-contain" />
                    </div>
                  </div>
                </div>
                <div className="p-2 md:px-0 xl:w-1/2 w-full md:min-h-[calc(100vh-64px)] flex items-center justify-center mt-10 md:mt-0">
                  <div className="w-fit h-fit bg-bluepastel rounded-2xl shadow-md p-8">
                    <PleaseCheckMail />
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

export default VerifyEmail;

const PleaseCheckMail = () => {
  const { profile } = useAuth();
  const [secs, setSeconds] = useState(120);
  const [value, setValue] = useLocalStorage("sended-e-" + profile.email, false);

  const domain = location.host.includes("ielts1984.vn") ? "ielts1984" : "youpass";
  var timer;
  useEffect(() => {
    timer = setInterval(() => {
      setSeconds(secs - 1);
    }, 1000);
    return () => clearInterval(timer);
  });

  useEffect(() => {
    if (value) return;
    const payload: any = { email: profile.email, type: "register", domain: domain };
    AxiosController.post("/webhook/send-template-email", payload).then((res) => {});
    setValue(true);
  }, []);

  const verifyAgain = () => {
    const payload: any = { email: profile.email, type: "register", domain: domain };
    AxiosController.post("/webhook/send-template-email", payload).then((res) => {});
    setSeconds(120);
  };
  return (
    <div className="h-full w-fit flex flex-col gap-6 items-center justify-center p-6 ">
      <img className="max-h-[300px]" src="/images/email-otp-verification-5152135-4309035.png" alt="" />
      <p className="text-gray-500 text-lg text-center">
        Chúng tớ đã gửi đến email <span className="text-primary2 font-semibold">{profile.email}</span> thông tin để xác nhận tài khoản. Bạn vui lòng kiểm tra email và làm theo
        hướng dẫn nhé!
      </p>
      <div className="relaive text-md ">
        {secs >= 0 && (
          <p className="h-[40px] text-center">
            Chưa nhận được email? Vui lòng đợi <span className="font-semibold text-primary">{secs}</span> giây để chúng tớ gửi lại email nhé!
          </p>
        )}
        {secs < 0 && (
          <Button className="text-primary2 bg-white h-[40px]" onClick={verifyAgain}>
            Gửi lại mã
          </Button>
        )}
      </div>
    </div>
  );
};
