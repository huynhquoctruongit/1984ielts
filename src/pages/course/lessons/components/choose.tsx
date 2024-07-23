import { cn } from "@/lib/utils";

const Choose = ({ choose, setChoose, typeCourse }: any) => {
  let chooses = ["Nội dung bài tập"];
  if (typeCourse?.indexOf("quiz") > -1) chooses = [...chooses, "Lịch sử bài tập"]

  return (
    <div className="">
      <div className="lg:block hidden">
        <ChooseBrowers choose={choose} chooses={chooses} setChoose={setChoose} />
      </div>
      <div className="block lg:hidden">
        <ChooseMobile choose={choose} chooses={chooses} setChoose={setChoose} />
      </div>
    </div>
  );
};

export default Choose;

const ChooseBrowers = ({ choose, chooses, setChoose }: any) => {
  return (
    <div className="pt-5 xl:mb-10 mb-5 sm:flex hidden gap-5 border-b-[1px] border-solid border-neutral-06">
      {chooses.map((item: any, index: number) => {
        return (
          <div key={index + "chóoe"} className={"duration-300 cursor-pointer h8 " + (choose === index ? "text-primary1" : "text-light-02/60")} onClick={() => setChoose(index)}>
            <p className="h-6">{item}</p>
            <div className={"duration-300 w-full h-[2px] " + (choose === index ? "bg-primary1" : "bg-transparent")}></div>
          </div>
        );
      })}
    </div>
  );
};

const ChooseMobile = ({ choose, chooses, setChoose }: any) => {
  return (
    <div className="flex items-center w-fit mx-auto justify-center border-[1px] border-transparent border-solid border-neutral-06 rounded-[4px] overflow-hidden md:mb-6">
      {chooses.map((item: any, index: number) => {
        return (
          <div
            key={item}
            className={cn("w-1/2 py-1 duration-300 px-6 max-w-[300px] h9 whitespace-nowrap cursor-pointer border-[1px] rounded-sm text-light-02/60", {
              "border-solid border-primary1 bg-[#164675]/20 text-primary1": choose === index,
            })}
            onClick={() => setChoose(index)}
          >
            <p className="py-0.5 text-center">{item}</p>
          </div>
        );
      })}
    </div>
  );
};
