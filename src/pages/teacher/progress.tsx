import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  useDisclosure,
  User,
  Modal,
  ModalHeader,
  ModalBody,
  ModalContent,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";

import { infocolumns, inforows, weekFilter } from "./data";
import React, { useMemo, useState } from "react";
import { domainCMS } from "@/services/helper";
import dayjs from "dayjs";
import useSWR from "swr";
import { fetcherController } from "@/libs/api/axios-controller";
import Loading from "@/components/system/result";
import { UserProfile } from "./list";

const Progress = ({ data }: any) => {
  const { data: statistics, isLoading } = useSWR("/teacher/statistic/" + data.id, fetcherController as any);
  const columns = [
    {
      key: "title",
      label: "TÊN BÀI HỌC",
    },
    {
      key: "type",
      label: "LOẠI",
    },
    {
      key: "percentage",
      label: "TỈ LỆ HOÀN THÀNH",
    },
    {
      key: "statistics",
      label: "SỐ HS HOÀN THÀNH",
    },
    {
      key: "reviewed",
      label: "ĐÃ CHẤM",
    },
  ];

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [itemActive, setItemActive]: any = useState(null);
  const onClick = (item: any) => {
    setItemActive(item);
    onOpen();
  };

  const totalStudent = statistics?.students || 0;

  const renderCell = (record: any, columnKey: any, total: number = 0) => {
    const value = record[columnKey];
    const { collection, title } = record;
    switch (columnKey) {
      case "title":
        return <div className="w-[300px] min-h-[30px] flex items-center truncate">{title}</div>;
      case "percentage":
        return <div className="text-left ml-3 font-semibold w-[100px]">{value}%</div>;
      case "statistics":
        return (
          <div className="text-left ml-3 font-semibold w-[100px]">
            {value}/{totalStudent}
          </div>
        );
      case "reviewed":
        return (
          <div className="text-left ml-3 font-semibold w-[100px]">
            {value}/{record.submitted}
          </div>
        );
      case "type":
        return (
          <div className={"px-2 py-1 rounded-full w-fit " + (collection === "quiz" ? "bg-orangepastel text-primary2" : "bg-bluepastel text-blurgray")}>
            {collection === "quiz" ? "Quiz" : "Lesson"}
          </div>
        );
      default:
        return value;
    }
  };

  const [select, setSelect]: any = useState("");

  const render = (statistics?.data || []).filter((item: any) => {
    if (!select || select === "All Section") return true;
    return item.sectionName === select;
  });
  const filter = statistics?.data || [];

  if (isLoading)
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <Loading />
      </div>
    );

  return (
    <div className="">
      <div className="md:flex md:flex-row gap-4 pt-4 pl-4">
        <div className="md:basis-1/2 ">
          <p className="font-bold text-xl">{data.title}</p>
          <p className="mt-4">Ngày bắt đầu: {dayjs(data.date_start).format("DD/MM/YYYY")}</p>
          <p className="mt-4">Ngày kết thúc: {dayjs(data.date_end).format("DD/MM/YYYY")}</p>
        </div>
      </div>

      <div className="md:w-[25%] mt-8">
        <Select
          items={[{ sectionName: "All Section" }, ...filter]}
          label="Week"
          placeholder="Select week"
          className=""
          onChange={(e: any) => {
            setSelect(e.target.value);
          }}
        >
          {(item: any) => <SelectItem key={item?.sectionName}>{item.sectionName}</SelectItem>}
        </Select>
      </div>

      <div className="pt-8">
        <div className="">
          {render.map((item: any) => {
            const parts = item?.data;
            const total = item.total;
            return (
              <div className="" key={item.sectionName}>
                <p className="pb-4 font-bold">Week: {item.sectionName}</p>
                <Table aria-label="Example table with dynamic content" className="pb-8">
                  <TableHeader columns={columns}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
                  <TableBody items={parts}>
                    {(item: any) => (
                      <TableRow onClick={() => onClick(item)} className="cursor-pointer hover:bg-greenpastel py-2 rounded-md overflow-hidden">
                        {(columnKey) => <TableCell>{renderCell(item, columnKey, total)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2 ">
        <Modal size="5xl" isOpen={isOpen} onClose={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalBody className="p-4">
                  <div className="p-5">
                    <div className="pb-6 body1"> {itemActive.title} </div>
                    <ModalDetail key={data.id} data={itemActive} classData={data} classId={data.id} />
                  </div>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Progress;

const domain = import.meta.env.VITE_CMS;
const ModalDetail = ({ data, classId, classData }: any) => {
  const { collection, id } = data;

  const urlQuiz = `/items/answer?fields=*,user_created.*&filter[class][_eq]=${classId}&filter[quiz]=${id}`;
  const urlTracking = `/items/tracking?fields=*,user_created.*&filter[class][_eq]=${classId}&filter[lesson][_eq]=${id}`;

  const params = {
    fields: ["students.directus_users_id.*", "students.*"],
  };
  const { data: info } = useSWR([`/items/class/` + classId, params]);
  const { data: result, isLoading } = useSWR(collection === "quiz" ? urlQuiz : urlTracking);
  const records = result?.data?.data || [];
  const studentsInclass = info?.data?.data?.students || [];
  console.log(studentsInclass);

  const students = (studentsInclass || []).map((std: any) => {
    const record = records.find((item: any) => item.user_created?.id === std.directus_users_id?.id);
    if (record) return record;
    else return { user_created: std.directus_users_id, id: std.id };
  });

  const renderCell = React.useCallback((record: any, columnKey: any) => {
    const { user_created, date_created, review, type } = record;
    switch (columnKey) {
      case "name":
        return (
          <div className="w-[200px]">
            <UserProfile user_created={user_created} />
          </div>
        );

      case "submit-time":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm">{record?.date_created ? dayjs(record?.date_created).format("hh:mm:ss") : <span className="text-primary">Chưa hoàn thành</span>}</p>
            <p className="text-bold text-sm capitalize text-default-400">{record?.date_created ? dayjs(record?.date_created).format("DD/MM/YYYY") : ""}</p>
          </div>
        );

      case "review-time":
        const date = type === 1 || type === 2 ? dayjs(date_created) : review?.date_created ? dayjs(review.date_created) : null;
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{date?.format("hh:mm:ss")}</p>
            <p className="text-bold text-sm capitalize text-default-400">{date?.format("DD/MM/YYYY")}</p>
          </div>
        );

      default:
        return "cellValue";
    }
  }, []);
  if (isLoading) return <Loading className="h-[400px]" />;
  return (
    // <div></div>
    <Table
      isHeaderSticky
      aria-label=""
      classNames={{
        base: "max-h-[520px]",
        table: "max-h-[200px]",
      }}
    >
      <TableHeader columns={infocolumns}>{(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}</TableHeader>
      <TableBody emptyContent="No answer found" items={students} className="min-h-[500px] max-[500px]">
        {(item: any) => <TableRow key={item.key}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
      </TableBody>
    </Table>
  );
};
