import { Avatar, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { useState } from "react";
import useSWR from "swr";
import dayjs from "dayjs";
import AvatarIELTS from "@/components/system/avatar";
import { useAuth } from "@/hook/auth";
import List from "./list";
import Info from "./info";
import Progress from "./progress";
import Loading from "@/components/system/result";
import { fetcherController } from "@/libs/api/axios-controller";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { renderImageById } from "@/services/helper";

const Teacher = () => {
  const { profile } = useAuth();
  const ROLE = profile?.role?.name;
  const params = {
    fields: ["id", "title", "date_start", "date_end", "date_created", "duration", "teachers.*,course.sections.*"],
    filter: { teachers: { directus_users_id: { _eq: "$CURRENT_USER" } } },
    deep: { teachers: { _filter: { directus_users_id: { _eq: "$CURRENT_USER" } } } },
  };
  if (ROLE === "Operator") delete params.filter;
  let url = "/items/class";
  const { data: classData, isLoading } = useSWR([url, params]);
  useSWR(classData?.id ? "/teacher/statistic/" + classData?.id : null, fetcherController);

  const classes = classData?.data?.data || [];
  const [tab, setTab] = useState(0);
  const toggleTab = (index: number) => {
    setTab(index);
  };
  const classActive = classes[tab];
  let tabs = [
    {
      id: "list",
      label: "Danh sách bài",
      content: <List key={"list" + classActive?.id} data={classActive} />,
    },
    {
      id: "progress",
      label: "Tiến độ lớp",
      content: <Progress data={classActive} />,
    },
    {
      id: "info",
      label: "Thông tin chi tiết lớp học",
      content: <Info data={classActive} />,
    },
  ];

  if (isLoading) return <Loading className="h-[calc(100vh-64px)]"></Loading>;
  return (
    <div className="md:flex flex-row mt-10 min-h-[calc(100vh-76px-56px)] md:border-[1px] md:border-solid md:m-4 md:rounded-3xl shadow-lg overflow-hidden bg-graydefault md:p-6 p-2">
      <div className="md:w-3/12 flex flex-col">
        <div className="pr-6">
          <div className="bg-white rounded-xl md:p-4 md:flex flex-col items-center justify-center hidden ">
            <div className="flex items-center justify-center pt-6">
              {profile.avatar && <AvatarIELTS src={profile.avatar} size="lg" className="w-20 h-20" />}
              {!profile.avatar && <Avatar src={"https://www.nea.org/sites/default/files/legacy/2020/04/new_teacher.jpeg"} size="lg" className="w-20 h-20" />}
            </div>
            <p className="flex items-center text-primary2 justify-center pt-8 font-bold text-lg">{profile.fullname || "Teacher"}</p>
            <p className="flex items-center justify-center text-neutral-400 text-sm mb-6">{profile.email}</p>
          </div>
          <div className="h-[1px] w-full bg-neutral-300 my-8 md:flex hidden"></div>
          <div className="w-full font-bold text-xl leading-snug text-left p-4 rounded-xl text-black/70 ">
            <p className="text-center">DANH SÁCH BÀI</p>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="h-full md:overflow-y-scroll no-scroll md:absolute top-0 left-0 w-full md:pr-6 pb-8">
            <div className="md:mt-6 mt-2">
              {classes.map((item: any, index: number) => {
                const course = item?.course || {};
                const isActive = tab === index;
                const bg = !isActive ? "bg-white hover:bg-orangepastel" : "bg-primary1 text-white";
                const bgText = !isActive ? " text-black/90  " : "  text-white";
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTab(index)}
                    className={"py-5 px-5 my-3 rounded-2xl flex items-center  duration-100 transition-colors ease-in-out  cursor-pointer " + bg}
                  >
                    <div className="flex-[0_0_40px] w-10 h-10 rounded-2xl shadow-sm bg-white flex items-center justify-center font-black text-xl text-primary1">
                      <img src={renderImageById(course.thumbnail)} className="rounded-xl" alt="" />
                    </div>
                    <div className="ml-2 max-w-[200px]">
                      <div className={"font-medium line-clamp-2 block text-[14px]  " + bgText}>{item.title || "Question " + (index + 1)}</div>
                      <div className={"text-xs font-medium text-[10px] uppercase mt-10.5 " + (isActive ? "text-white" : "text-gray-400 ")}>
                        {dayjs(item.date_end).format("DD/MM/YYYY")}
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 ml-auto stroke-[2px] trnasition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="md:w-9/12 bg-white rounded-2xl p-2 md:p-6 6">
        <div className="flex w-full flex-col relative ">
          <Tabs aria-label="Dynamic tabs" items={tabs}>
            {(item) => (
              <Tab key={item.id} title={item.label}>
                {item.content}
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
