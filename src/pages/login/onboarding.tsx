import { useState } from "react";
import "antd/dist/reset.css";
import { Image } from "@nextui-org/react";
import { Button, Input, Select } from "antd";
import { log } from "console";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState(false);
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
                <div className="w-full xl:w-3/5 flex items-center">
                  <div className="w-full mx-auto max-w-[700px] bg-greypastel/10 rounded-2xl shadow-sm ">
                    {step === 1 && (
                      <div>
                        <Question1 setStep={setStep} step={step} setValue={setValue} value={value} />
                      </div>
                    )}
                    {step === 2 && (
                      <div>
                        <Question2 setStep={setStep} step={step} />
                        <div className="flex items-center">
                          <Button onClick={() => setStep(step - 1)} className="bg-primary1 text-white mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div>
                        <Question3 setStep={setStep} step={step} />
                        <div className="flex items-center">
                          <Button onClick={() => setStep(step - 1)} className="bg-primary1 text-white mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div>
                        <Question4 setStep={setStep} step={step} value={value} />
                        <div className="flex items-center">
                          <Button onClick={value === true ? () => setStep(step - 1) : () => setStep(step - 3)} className="bg-primary1 text-white mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                        </div>
                      </div>
                    )}
                    {step === 5 && (
                      <div>
                        <Question5 setStep={setStep} step={step} value={value} />
                        <div className="flex items-center">
                          <Button onClick={() => setStep(step - 1)} className="bg-primary1 text-white mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                        </div>
                      </div>
                    )}
                    {step === 6 && (
                      <div>
                        <Question6 setStep={setStep} step={step} value={value} />
                        <div className="flex items-center">
                          <Button onClick={() => setStep(step - 1)} className="bg-primary1 text-white mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                        </div>
                      </div>
                    )}
                    {step === 7 && (
                      <div>
                        <Question7 />
                        <div className="flex items-center">
                          <Button onClick={() => setStep(step - 1)} className="bg-primary1 text-white  mb-4 ml-4">
                            Câu hỏi trước
                          </Button>
                          <Button className="bg-primary1 text-white ml-auto mb-4 mr-4">Hoàn thành</Button>
                        </div>
                      </div>
                    )}
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

export default Onboarding;

const Question1 = ({ setStep, step, setValue, value }: any) => {
  const months = ["Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng", "Tháng"];
  return (
    <div className="w-full flex flex-col gap-6 p-10  pb-20">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className=" flex gap-10 items-center ">
        <p className="text-black/70 text-lg	 ">Bạn có dự định thi IELTS không?</p>
        <div className="flex items-center gap-10 ">
          <button className="border-[1.5px] border-solid border-primary1 rounded-3xl px-10 py-1.5 text-primary1" onClick={() => setValue(true)}>
            Yes
          </button>
          <button
            className="border-[1.5px] border-solid border-neutral-400 rounded-3xl px-10 py-1.5 text-neutral-400"
            onClick={() => {
              setStep(step + 3);
              setValue(false);
            }}
          >
            No
          </button>
        </div>
      </div>
      <div className={"flex items-center justify-center py-10 " + (value === true ? "hidden" : "")}>
        <img src="/images/dudinhIelts.jpg" alt="" className="w-[300px] h-[300px] rounded-[12px] " />
      </div>
      {value && (
        <div className="">
          <p className="text-black/70 text-lg	 mb-12 ">Thời gian cụ thể là tháng mấy?</p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {months.map((item: any, index: number) => {
              return (
                <div
                  className="border-[1.5px] border-solid border-neutral-400 rounded-3xl px-10 py-1.5 text-neutral-600 bg-white mx-auto cursor-pointer"
                  onClick={() => setStep(step + 1)}
                >
                  {item} {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Question2 = ({ step, setStep }: any) => {
  const score = ["2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];
  return (
    <div className="w-full flex flex-col gap-6 p-10">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className="flex flex-col">
        <div className="pt-4">
          <p className="text-black/70 text-lg	 ">Mục tiêu bạn cần là "mấy chấm" IELTS?</p>
          <div className="grid grid-cols-5 gap-4 mt-10">
            {score.map((item: any, index: number) => {
              return (
                <div
                  className="z-5 relative p-3 text-[16px] hover:shadow-md duration-250 font-bold rounded-full flex items-center justify-center text-neutral-600 hover:text-primary1  bg-gradient-to-t from-orangepastel/60 to-bluepastel/60 mx-auto cursor-pointer group hover:translate-y-[-5px]"
                  onClick={() => setStep(step + 1)}
                >
                  <div className=" flex items-center justify-center shadown-sm text-primary1 w-16 h-16 bg-white rounded-full group-hover:text-[24px] group-hover:text-primary2 duration-250 ">
                    {item}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Question3 = ({ step, setStep }: any) => {
  const target = ["Du học", "Di cư", "Nâng cao nghề nghiệp", "Sáng kiến cá nhân", "Học tiến sĩ", "Yêu cầu công việc"];
  const [active, setActive] = useState(false);
  return (
    <div className="w-full flex flex-col gap-6 p-10">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className="flex flex-col">
        <p className="text-black/70 text-lg	 ">Mục tiêu học IELTS của bạn là gì?</p>
        <div className="flex flex-wrap gap-4 mt-10 ">
          {target.map((item: any, index: number) => {
            return (
              <div
                className="w-fit border-[1.5px] border-solid border-neutral-400 hover:border-primary1 rounded-3xl px-10 py-1.5 text-neutral-600 hover:text-primary1 bg-white cursor-pointer"
                onClick={() => setStep(step + 1)}
              >
                {item}
              </div>
            );
          })}
          <div
            className="w-fit border-[1.5px] border-solid border-neutral-400 hover:border-primary1 rounded-3xl px-10 py-1.5 text-neutral-600 hover:text-primary1 bg-white cursor-pointer "
            onClick={() => setActive(true)}
          >
            <p>Khác</p>
          </div>
        </div>
        {active && (
          <div className="relative ">
            <Input placeholder="Mục tiêu" className="mt-4" />
            <button
              className="absolute top-4 px-5 right-0 border-[1px] border-solid border-neutrals-300 py-[3px] rounded-r-[6px] hover:text-primary1 hover:bg-primary1/20"
              onClick={() => setStep(step + 1)}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
const Question4 = ({ step, setStep, value }: any) => {
  const connection = [
    {
      img: "Facebook_Logo.png",
      name: "Facebook",
    },
    {
      img: "insta_logo.png",
      name: "Instagram",
    },
    {
      img: "YouTube_logo.png",
      name: "Youtube",
    },
    {
      img: "zalo_logo.png",
      name: "Zalo",
    },
    {
      img: "website_logo.png",
      name: "Website",
    },
    {
      img: "friend_logo.png",
      name: "Friend",
    },
  ];
  return (
    <div className="w-full p-20">
      <p className="text-black text-3xl text-center xl:text-left font-bold"> Câu hỏi khảo sát </p>
      <p className="text-black/70 text-lg	mt-3 mb-16">Bạn biết đến Tám Bốn qua đâu thế?</p>
      <div className="grid grid-cols-3 gap-10">
        {connection.map((item: any, index: number) => {
          return (
            <div
              key={item.name}
              className="border-[1px] border-transparent shadow-sm cursor-pointer duration-200 ease-in-out group bg-white hover:translate-y-[-7px] border-solid hover:border-primary2 rounded-xl flex flex-col justify-center items-center py-6 px-1"
              onClick={() => setStep(step + 1)}
            >
              <img src={"/images/" + item.img} alt="" className="w-10 h-10" />
              <p className="mt-6 font-medium text-black/70 tracking-tight		">{item.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const Question5 = ({ step, setStep }: any) => {
  const score = ["1/", "2/", "3/", "4/", "5/", "6/", "7/", "8/", "9/", "10/"];
  return (
    <div className="w-full flex flex-col gap-6 p-10">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className="flex flex-col">
        <div className="pt-4">
          <p className="text-black/70 text-lg	 ">Theo tháng điểm 10, thì độ cần thiết của Tiếng Anh/ bằng IELTS đối với bạn là mấy điểm?</p>
          <div className="grid grid-cols-5 gap-4 mt-10">
            {score.map((item: any, index: number) => {
              return (
                <div
                  className="z-5 relative p-3 text-[16px] hover:shadow-md duration-250 font-bold rounded-full flex items-center justify-center text-neutral-600 hover:text-primary1  bg-gradient-to-t from-orangepastel/60 to-bluepastel/60 mx-auto cursor-pointer group hover:translate-y-[-5px]"
                  onClick={() => setStep(step + 1)}
                >
                  <div className=" flex items-center justify-center shadown-sm text-primary1 w-20 h-20 bg-white rounded-full group-hover:text-[24px] group-hover:text-primary2 duration-250 ">
                    {item}
                    <span className="text-primary2/40">10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Question6 = ({ step, setStep }: any) => {
  const score = ["1 ", "2 ", "3 ", "4 ", "5 ", "6 ", "7 ", "8 ", "9 ", "10", "11", "12"];
  return (
    <div className="w-full flex flex-col gap-6 p-10">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className="flex flex-col">
        <div className="pt-4">
          <p className="text-black/70 text-lg	 ">Bạn có thể dành bao nhiêu tiếng một ngày để làm homework và tự học thêm ở nhà?</p>
          <div className="grid grid-cols-5 gap-4 mt-10">
            {score.map((item: any, index: number) => {
              return (
                <div
                  className="z-5 relative p-3 text-[16px] hover:shadow-md duration-250 font-bold rounded-full flex items-center justify-center text-neutral-600 hover:text-primary1  bg-gradient-to-t from-orangepastel/60 to-bluepastel/60 mx-auto cursor-pointer group hover:translate-y-[-5px]"
                  onClick={() => setStep(step + 1)}
                >
                  <div className=" flex items-center justify-center shadown-sm text-primary1 w-20 h-20 bg-white rounded-full group-hover:text-[24px] group-hover:text-primary2 duration-250 ">
                    {item}
                    <span className="text-primary2/40 text-[16px] pl-1"> Giờ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Question7 = ({ step, setStep }: any) => {
  const score = ["1/", "2/", "3/", "4/", "5/", "6/", "7/", "8/", "9/", "10/"];
  return (
    <div className="w-full flex flex-col gap-6 p-10">
      <p className="text-black text-[24px] text-center xl:text-left font-roboto font-bold leading-[28px]"> Câu hỏi khảo sát </p>
      <div className="flex flex-col">
        <div className="pt-4">
          <p className="text-black/70 text-lg	 ">Theo thang điểm 10, bạn chắc chắn đến mức độ nào về việc mình sẽ duy trì được số giờ tự học hằng ngày như ở câu trên?</p>
          <div className="grid grid-cols-5 gap-4 mt-10">
            {score.map((item: any, index: number) => {
              return (
                <div
                  className="z-5 relative p-3 text-[16px] hover:shadow-md duration-250 font-bold rounded-full flex items-center justify-center text-neutral-600 hover:text-primary1  bg-gradient-to-t from-orangepastel/60 to-bluepastel/60 mx-auto cursor-pointer group hover:translate-y-[-5px]"
                  onClick={() => setStep(step + 1)}
                >
                  <div className=" flex items-center justify-center shadown-sm text-primary1 w-20 h-20 bg-white rounded-full group-hover:text-[24px] group-hover:text-primary2 duration-250 ">
                    {item}
                    <span className="text-primary2/40">10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
