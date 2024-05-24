import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner } from "@nextui-org/react";
import { Select, SelectItem, User, Chip } from "@nextui-org/react";
import { columns, statusFilter } from "./data";
import React, { useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import useSWR from "swr";
import { AnimatePresence } from "framer-motion";
import { WrapAnimateOpacity } from "@/components/system/animate";
import { debounce } from "lodash";
import RefreshButton from "@/components/reports/widget/refresh-button";

const statusColorMap: any = {
  completed: "warning",
  reviewed: "success",
};

const convertFilterToQuery = (filter: any, classId: string) => {
  const payload = { _and: [] as any[] } as any;
  if (filter.section) payload._and.push({ section: { _eq: filter.section } });
  if (filter.quiz) payload._and.push({ quiz: { _eq: filter.quiz } });
  if (filter.status) payload._and.push({ status: { _eq: filter.status } });

  if (filter.search?.trim()) payload._and.push({ user_created: { _or: [{ fullname: { _contains: filter.search } }, { email: { _contains: filter.search } }] } });
  payload._and.push({ class: { _eq: classId } });
  return payload;
};

const domain = import.meta.env.VITE_CMS;
const List = ({ data }: any) => {
  const [filter, setFilter]: any = useState({});
  const limit = 10;
  const [page, setPage] = useState(0);
  const refData: any = useRef();
  const {
    data: dataAnswer,
    isLoading,
    mutate: mutateAnswer,
  } = useSWR(
    "/items/answer?sort=-date_created&fields=*,user_created.*,review.*,quiz.*.*,section.*&limit=10&page=" +
      page +
      "&meta=filter_count&filter=" +
      JSON.stringify(convertFilterToQuery(filter, data?.id)),
    { revalidateIfStale: true },
  );

  console.log(data);
  
  if (dataAnswer?.data?.data) refData.current = dataAnswer?.data;
  const { data: answers, meta } = refData.current || { data: [], meta: { filter_count: 0 } };
  const total = Math.ceil(meta?.filter_count / limit);
  const sections = data?.course?.sections || [];

  const renderCell = React.useCallback(
    (user: any, columnKey: any) => {
      const cellValue = user[columnKey];
      const { review, detail = {}, type } = user;
      // const details = isArray(detail) ? detail : convertArray(detail);
      const summary = user.summary || {};

      switch (columnKey) {
        case "user_created":
          return (
            <div className="w-[200px]">
              <User
                avatarProps={{ radius: "lg", src: cellValue.avatar ? domain + "/assets/" + cellValue.avatar : "/images/bean.png" }}
                description={<span className="truncate block max-w-[160px]">{cellValue.email}</span>}
                name={<span className="truncate block max-w-[160px]">{cellValue.fullname || "Student"}</span>}
              ></User>
            </div>
          );
        case "section":
          return (
            <div className="flex flex-col w-[150px]">
              <p className="text-bold text-sm capitalize">{user.section.title}</p>
              <p className="text-bold text-sm capitalize text-default-400"></p>
            </div>
          );
        case "status":
          return (
            <Chip className="capitalize" color={statusColorMap[user.status || "completed"]} size="sm" variant="flat">
              <span className={"whitespace-nowrap w-full block"}>{user.status || "completed"}</span>
            </Chip>
          );

        case "quiz":
          return (
            <div className="w-[150px]">
              <span className="w-full block ">{cellValue?.title}</span>
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
      return { ...filter, search: data.target.value };
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

  const onClick = (item: any) => {
    onClickRow(item);
  };

  return (
    <div className="">
      <div className="md:flex flex-row gap-4 pt-10 md:pl-4">
        <div className="basis-1/2 ">
          <p className="font-bold text-xl">{data?.title}</p>
          <p className="mt-4">Ngày bắt đầu: {dayjs(data.date_start).format("DD/MM/YYYY")}</p>
          <p className="mt-4">Ngày kết thúc: {dayjs(data.date_end).format("DD/MM/YYYY")}</p>
        </div>

        <div className="ml-auto mt-10 flex items-center gap-4">
          {/* <div
            onClick={gotoGoogleDoc}
            className={
              "bg-warning-400 shadow-small text-white hover:text-white hover:bg-warning-500 px-3 py-2 w-fit rounded-lg flex items-center transition-color duration-200 ease-in-out cursor-pointer "
            }
          >
            <span className="font-meidum">Go to Writing file</span>
          </div> */}
          <RefreshButton handleRefesh={mutateAnswer} />
        </div>
      </div>
      <div className="md:flex flex-row gap-4 pt-10">
        {/* <div className="basic-1/4 flex items-center w-full">
          <Input type="text" label="NAME" onChange={onChangeName} endContent={<SearchOutline className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />} />
        </div> */}
        <div className="basic-1/4 flex items-center w-full pb-2 ">
          <Select items={sections} label="Week" placeholder="Select week" className="" onChange={onChange("section")}>
            {(item: any) => <SelectItem key={item.id}>{item.title}</SelectItem>}
          </Select>
        </div>
        <div className="basic-1/4 flex items-center w-full pb-2">
          {/* <Select items={quizs} label="Quiz Name" placeholder="Select quiz name" className="" onChange={onChange("quiz")}>
            {(row: any) => <SelectItem key={row.id}>{row.title}</SelectItem>}
          </Select> */}
        </div>

        <div className="basic-1/4 flex items-center w-full pb-2">
          <Select items={statusFilter} label="Status" placeholder="Select status" onChange={onChange("status")}>
            {(item) => <SelectItem key={item?.value}>{item.status}</SelectItem>}
          </Select>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <>
          <WrapAnimateOpacity>
            <Table aria-label="Example table with custom cells" className="pt-10">
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
