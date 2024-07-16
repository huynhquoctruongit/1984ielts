import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Tooltip } from "@nextui-org/react";
import { Input, Select, SelectItem, User, Chip } from "@nextui-org/react";
import { columns, statusFilter, topR } from "./data";
import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { AnimatePresence } from "framer-motion";
import { WrapAnimateOpacity } from "@/components/system/animate";
import { debounce } from "lodash";
import { fetcherController } from "@/libs/api/axios-controller";
import { removeVietnameseTones } from "@/services/helper";
import RefreshButton from "@/components/reports/widget/refresh-button";
import { useAuth } from "@/hook/auth";
import { Link } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const statusColorMap: any = {
  completed: "warning",
  reviewed: "success",
};

const skillOption = [
  { value: 1, label: "Reading" },
  { value: 2, label: "Listening" },
  { value: 3, label: "Writing" },
  { value: 4, label: "Speaking" },
];

const convertFilterToQuery = (filter: any, classId: string) => {
  const typeArray = filter.type.split(",").map((item) => parseInt(item));
  const payload = { _and: [] as any[] } as any;
  if (filter.section) payload._and.push({ section: { _eq: filter.section } });
  if (filter.quiz) payload._and.push({ quiz: { _eq: filter.quiz } });
  if (true) payload._and.push({ type: { _in: typeArray } });
  if (filter.status) payload._and.push({ status: { _eq: filter.status } });
  if (filter.search?.trim())
    payload._and.push({ user_created: { _or: [{ search: { _contains: removeVietnameseTones(filter.search) } }, { email: { _contains: filter.search } }] } });
  payload._and.push({ class: { _eq: classId } });
  return payload;
};

export const UserProfile = ({ user_created }) => {
  const redirectFB = (e) => {
    if (user_created?.facebook_url) {
      e.stopPropagation();
      window.open(user_created?.facebook_url, "_blank");
    }
  };
  return (
    <div className="flex gap-x-3 w-full">
      <div className="min-w-[48px] w-full rounded-xl">
        <Tooltip
          placement="top-start"
          color={!user_created?.facebook_url ? "primary" : "success"}
          content={!user_created?.facebook_url ? "Link is not found" : "Go to Student's page"}
        >
          <Link onClick={(e) => redirectFB(e)} to="#">
            <img className="w-12 h-12 rounded-xl min-w-12 object-cover" src={user_created.avatar ? domain + "/assets/" + user_created.avatar : "/images/bean.png"} alt="" />
          </Link>
        </Tooltip>
      </div>
      <div className="w-full">
        <div className="truncate block max-w-[160px]">{user_created.fullname || "Student"}</div>
        <div className="truncate block max-w-[160px]">{user_created.email}</div>
      </div>
    </div>
  );
};

const domain = import.meta.env.VITE_CMS;
const List = ({ data }: any) => {
  const { profile } = useAuth();
  const role = profile?.roleName || "";
  const skill = useMemo(() => {
    if (role === "Operator") return "1,2,3,4";
    const teacher = data?.teachers[0].skill;
    return (teacher || []).join(",");
  }, [data]);

  const [filter, setFilter]: any = useState({ type: skill || "" });
  const limit = 10;
  const [page, setPage] = useState(0);
  const refData: any = useRef();
  const filterString = JSON.stringify(convertFilterToQuery(filter, data?.id));
  const {
    data: dataAnswer,
    isLoading,
    mutate: mutateAnswer,
  } = useSWR(
    skill ? "/items/answer?sort=-date_created&fields=*,user_created.*,review.*,quiz.*.*,section.*&limit=10&page=" + page + "&meta=filter_count&filter=" + filterString : null,
    {
      revalidateIfStale: true,
    },
  );

  const { data: statistic, mutate: mutateReview }: any = useSWR("/teacher/review/" + data?.id, fetcherController, { revalidateIfStale: true });
  if (dataAnswer?.data?.data) refData.current = dataAnswer?.data;
  const { data: answers, meta } = refData.current || { data: [], meta: { filter_count: 0 } };
  const total = Math.ceil(meta?.filter_count / limit);

  const sections = data?.course?.sections || [];

  // const computed: any = () => {
  //   return (sections || [])
  //     .reduce((arr: any, item: any) => {
  //       const quiz = item.parts.filter((item: any) => {
  //         return item.collection == "quiz";
  //       });
  //       return [...arr, ...quiz];
  //     }, [])
  //     .map((item: any) => item.item);
  // };

  const renderCell = React.useCallback(
    (user: any, columnKey: any) => {
      const cellValue = user[columnKey];
      const { review, type } = user;
      const summary = user.summary || {};

      switch (columnKey) {
        case "user_created":
          return (
            <div className="w-[200px]">
              <UserProfile user_created={cellValue} />
            </div>
          );
        case "section":
          return (
            <div className="flex flex-col w-[150px]">
              <p className="text-bold text-sm capitalize">{cellValue.title}</p>
              <p className="text-bold text-sm capitalize text-default-400"></p>
            </div>
          );
        case "status":
          return (
            <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
              <span className={"whitespace-nowrap w-full block"}>{user.status || "no status"}</span>
            </Chip>
          );

        case "quiz":
          return (
            <div className="w-[150px]">
              <span className="w-full block line-clamp-2">{cellValue?.title}</span>
            </div>
          );
        case "time":
          return (
            <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
              <div className="block w-full truncate">{cellValue?.title || "Quiz"}</div>
            </Chip>
          );
        case "review":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{review?.date_created ? dayjs(review?.date_created).format("hh:mm:ss A") : ""}</p>
              <p className="text-bold text-sm capitalize text-default-400">{review?.date_created ? dayjs(review?.date_created).format("DD/MM/YYYY") : ""}</p>
            </div>
          );

        case "date_created":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{dayjs(cellValue).format("hh:mm:ss A")}</p>
              <p className="text-bold text-sm capitalize text-default-400">{dayjs(cellValue).format("DD/MM/YYYY")}</p>
            </div>
          );
        case "score":
          if (type == 1 || type == 2)
            return (
              <div className="text-bold text-sm capitalize">
                {summary.correct || 0}/{summary?.total || 0}
              </div>
            );
          else return 0;
        default:
          return "cellValue";
      }
    },
    [sections],
  );

  const onChange = (name: string) => {
    return (data: any) => {
      setFilter((filter: any) => {
        if (name === "section") return { ...filter, [name]: data.target.value, quiz: undefined };
        return { ...filter, [name]: data.target.value };
      });
      setPage(0);
    };
  };
  const onChangeName = debounce((data: any) => {
    setFilter((filter: any) => {
      return { ...filter, search: data.target.value.toLowerCase() };
    });
    setPage(0);
  }, 1000);

  const onClickRow = (item: any) => {
    const types = ["reading", "listening", "writing", "speaking", "Writing Self Practice"];
    const { type, section, quiz } = item;
    const { id: classId, course } = data;
    const { id: courseId } = course;
    const typeName = types[type - 1] == "Writing Self Practice" ? "writing-self-practice" : types[type - 1];
    if (type === 1) {
      const url = `/class/${classId}/course/${courseId}/section/${section.id}/${typeName}/${quiz.id}?type=review&answerId=${item.id}`;
      window.open(url, "_blank");
    } else if (type === 2) {
      const url = `/class/${classId}/course/${courseId}/section/${section.id}/${typeName}/${quiz.id}/review?answerId=${item.id}`;
      window.open(url, "_blank");
    } else if (type === 4) {
      const url = `/class/${classId}/course/${courseId}/section/${section.id}/${typeName}/${quiz.id}/result/${item.id}`;
      window.open(url, "_blank");
    } else if (type === 5) {
      const url = `/class/${classId}/course/${courseId}/section/${section.id}/${typeName}/${quiz.id}/result/${item.id}`;
      window.open(url, "_blank");
    } else {
      const url = `/review/${typeName}/${item.id}?class=${classId}`;
      window.open(url, "_blank");
    }
  };

  const refeshData = async () => {
    await mutateAnswer();
    await mutateReview();
  };

  const forceComplete = () => {
    const element: any = document.getElementById("scroll");
    element.scrollIntoView();
    setFilter((filter: any) => {
      return { ...filter, status: "completed" };
    });
  };
  const optionsType = [{ value: skill, label: "All" }, ...(skillOption.filter((item) => skill.includes(item.value)) || [])];

  return (
    <div className="">
      <div className="flex md:flex-row flex-wrap items-stretch md:gap-8 gap-4 mt-6 mb-6 ">
        <Statistic item={{ ...topR[0], top: statistic?.percentage || 0 }} />
        <Statistic onClick={forceComplete} item={{ ...topR[1], top: statistic?.needReview || 0 }} />
        <Statistic item={{ ...topR[2], top: data?.students?.length }} />
        <div className="ml-auto md:mb-6 mt-[45%] md:mt-0">
          <RefreshButton handleRefesh={refeshData} />
        </div>
      </div>

      <div className="md:flex md:flex-row gap-4 mt-4 pl-4 relative">
        <div id="scroll" className="w-full h-1 absolute -top-24 left-0"></div>
        <div className="md:basis-1/2 ">
          <p className="font-bold text-xl">{data?.title}</p>
          <p className="mt-4">Ngày bắt đầu: {dayjs(data?.date_start).format("DD/MM/YYYY")}</p>
          <p className="mt-4">Ngày kết thúc: {dayjs(data?.date_end).format("DD/MM/YYYY")}</p>
        </div>
      </div>
      <div className="md:flex md:flex-row gap-4 pt-10">
        <div className="md:basic-1/4 md:mb-0 mb-4 flex items-center w-full">
          <Input type="text" label="NAME" onChange={onChangeName} endContent={<MagnifyingGlassIcon className="w-5 h-5" />} />
        </div>
        <div className="md:basic-1/4 md:mb-0 mb-4 flex items-center w-full ">
          <Select items={sections} label="Week" placeholder="Select week" className="" onChange={onChange("section")}>
            {(item: any) => <SelectItem key={item.id}>{item.title}</SelectItem>}
          </Select>
        </div>
        <div className="md:basic-1/4 md:mb-0 mb-4 flex items-center w-full">
          <Select items={optionsType} label="Skill" placeholder="Select skill" className="" onChange={onChange("type")}>
            {(row: any) => <SelectItem key={row.value}>{row.label}</SelectItem>}
          </Select>
        </div>

        <div className="md:basic-1/4 md:mb-0 mb-4 flex items-center w-full">
          <Select items={statusFilter} label="Status" placeholder="Select status" selectedKeys={filter.status ? [filter.status] : undefined} onChange={onChange("status")}>
            {(item) => <SelectItem key={item?.value}>{item.status}</SelectItem>}
          </Select>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <>
          <WrapAnimateOpacity>
            <Table aria-label="Example table with custom cells" className="pt-4 md:pt-10">
              <TableHeader columns={columns}>
                {(column: any) => (
                  <TableColumn key={column.key} align={column.key === "actions" ? "center" : "start"}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                loadingContent={
                  <div className="p-10 bg-white/50 rounded-full">
                    <Spinner />
                  </div>
                }
                isLoading={isLoading}
                key={filter}
                emptyContent={"No users found"}
                items={answers}
              >
                {(item: any) => (
                  <TableRow className="cursor-pointer hover:bg-greenpastel !rounded-3xl duration-150 ease-in-out" onClick={() => onClickRow(item)} key={item.key}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </WrapAnimateOpacity>
        </>
      </AnimatePresence>
      {total > 0 && <Pagination className="pagination" showShadow key={filter.section + filter.quiz + filter.status} page={page} showControls onChange={setPage} total={total} />}
    </div>
  );
};
export default List;

const Statistic = ({ item, onClick }: any) => {
  const click = () => {
    if (onClick) onClick();
  };
  return (
    <div
      className={
        " border-[1px] duration-200 hover:shadow-lg hover:-translate-y-2 aspect-square border-solid py-2 px-3 rounded-2xl lg:w-[25%] 2xl:w-[18%] text-neutral-700 w-[47%] " +
        item.bgcolor
      }
      key={item.top + item.bot}
      onClick={click}
    >
      <div className="flex items-center justify-center p-6">
        <img src={"/images/" + item.avatar} alt="" className="w-20 h-20 rounded-full bg-white " />
      </div>
      <p className="flex items-center justify-center text-xl font-bold">{item.top}</p>
      <p className="flex items-center justify-center text-md mb-4 text-center">{item.bot}</p>
    </div>
  );
};
