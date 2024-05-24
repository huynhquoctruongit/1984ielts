import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Spinner, Input } from "@nextui-org/react";
import { User } from "@nextui-org/react";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { Tooltip } from "@nextui-org/react";
import { UserProfile } from "./list";
import useSWR from "swr";
import Loading from "@/components/system/result";
const teachers = [
  { key: "user_created", label: "Teachers" },
  { key: "birthday", label: "Ngày sinh" },
];
const assistant = [
  { key: "user_created", label: "Assistants" },
  { key: "birthday", label: "Ngày sinh" },
];
const students = [
  { key: "user_created", label: "Students" },
  { key: "birthday", label: "Ngày sinh" },
  { key: "last_access", label: "Lần đăng nhập cuối" },
];

const columns = [teachers, assistant, students];

const Infomation = ({ data }: any) => {
  const params = { fields: ["*,teachers.*.*, students.*.*, assistant.*.*"] };
  const { data: res, isLoading } = useSWR(["/items/class/" + data.id, params]);
  const infomation = res?.data?.data || {};

 
  const renderCell = (user: any, columnKey: any) => {
    const cellValue = user.directus_users_id;

    if (!cellValue) return "cellValue";

    switch (columnKey) {
      case "user_created":
        return (
          <div className="w-[200px]">
            <UserProfile user_created={cellValue} />
          </div>
        );
      case "birthday":
        return (
          <div className={"w-[150px] " + (cellValue?.birthday ? "font-medium text-black/80" : "text-black/40")}>
            {cellValue?.birthday ? dayjs(cellValue.birthday).format("DD/MM/YYYY") : "Chưa cập nhật"}
          </div>
        );
      case "last_access":
        return (
          <div className={"w-[200px] " + (cellValue?.last_access ? "font-medium text-black/80" : "text-black/40")}>
            {cellValue?.last_access ? dayjs(cellValue.last_access).format("hh:mm:ss A DD/MM/YYYY") : "Chưa đăng nhập"}
          </div>
        );
      default:
        return "cellValue";
    }
  };
  const { teachers, assistant, students } = infomation;
  if (!infomation.course || isLoading) return <Loading className="h-[calc(100vh-64px)]"></Loading>;

  return (
    <div className="">
      <div className="md:grid md:grid-cols-2 gap-x-6">
        {[teachers, assistant].map((item: any, index: number) => {
          return (
            <div key={index + "tabs"}>
              <Table aria-label="Example table with custom cells" className="pt-10">
                <TableHeader columns={columns[index]}>
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
                  key={index + "tabs1"}
                  items={item}
                >
                  {(item: any) => <TableRow key={item.key}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>
      <Table aria-label="Example table with custom cells" className="pt-10">
        <TableHeader columns={columns[2]}>
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
          // key={filter}
          items={students?.filter((item: any) => item.directus_users_id) || []}
        >
          {(item: any) => <TableRow key={item.key}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>}
        </TableBody>
      </Table>
    </div>
  );
};
export default Infomation;
