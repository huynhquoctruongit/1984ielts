import "antd/dist/reset.css";
import { Image } from "@nextui-org/react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import { useState } from "react";

const Verify = () => {
  return (
    <>
      <div className="bg-white min-h-screen">
        <div className="flex h-full w-screen">
          <div className="fixed top-0 hidden xl:block left-0 w-[45px] h-screen bg-primary1"></div>
          <div className="container mx-auto w-full">
            <div className="flex flex-col">
              <div className="flex flex-col xl:flex-row min-h-screen">
                <div className="w-full xl:w-2/5 ">
                  <div className="mt-[63px] xl:ml-[90px] m-auto">
                    <div className="xl:m-auto xl:block flex justify-center">
                      <Image className="m-auto w-full h-full xl:h-auto object-contain" width={208} height={80} src="/images/logo.png" alt="Logo" />
                    </div>
                    <p className="text-[#000] text-[14px] text-center xl:text-left font-normal ml-2 leading-[17px] tracking-[2.7px]">Quyết tâm đạt band IELTS tại nhà</p>
                  </div>
                  <div className="mt-4 xl:mt-[137px] 2xl:mt-[200px] ">
                    <div className="aspect-[300/320] w-20 xl:w-[300px] mx-auto">
                      <Image src={"/images/patato.png"} width={300} height={320} className="w-full h-full xl:h-auto object-contain" />
                    </div>
                  </div>
                </div>
                <div className="w-full xl:w-3/5 flex items-center justify-center ">
                  <Invalid />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Verify;

const CompleteRegistration = () => {
  return (
    <div className="flex flex-col gap-6 items-center justify-center ">
      <p className="text-primary2 text-2xl">Chúc mừng bạn đã hoàn tất đăng ký!</p>
      <div className="">
        <img src="https://emaillistvalidation.com/blog/content/images/2023/10/Untitled-design--6--1-5.png" alt="" className="" />
      </div>
      <Link to="/home">
        <Button className="bg-orangepastel text-primary2">Đi đến trang chủ</Button>
      </Link>
    </div>
  );
};

const PleaseCheckMail = () => {
  return (
    <div className=" h-[400px] w-[600px] flex flex-col gap-6 items-center justify-center p-10">
      <img src="/images/image1.png" alt="" />
      <p className="text-primary2 text-lg">Vui lòng kiểm tra email của bạn để xác thực tài khoản!</p>
    </div>
  );
};

const Invalid = () => {
  const [check, setCheck] = useState(false);
  return (
    <div className="">
      <img src="/images/email-otp-verification-5152135-4309035.png" alt="" className="  " />
      <div className="h-[150px] ">
        <div className="px-4 w-full flex flex-col items-center justify-center">
          <p className="text-center">
            Mã xác thực không đúng. Vui lòng click{" "}
            <Link to={""} className="text-primary1 hover:text-primary2" onClick={() => setCheck(true)}>
              tại đây
            </Link>{" "}
            để gửi lại mã xác thực!
          </p>
        </div>
        {check && (
            <span className="w-full flex flex-col items-center justify-center">Vui lòng check lại mail!</span>
        )}
      </div>
    </div>
  );
};
