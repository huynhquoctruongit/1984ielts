import Result from "./result/index";
import { useEffect, useState } from "react";
const CheckResult = ({ getLayout, classUser }: any) => {
  useEffect(() => {
    getLayout(false);
  }, []);
  return (
    <div>
      <Result classUser={classUser}></Result>
    </div>
  );
};
export default CheckResult;
