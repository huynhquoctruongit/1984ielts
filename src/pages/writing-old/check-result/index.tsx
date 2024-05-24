import Result from "./result/index";
import { useEffect, useState } from "react";
const CheckResult = ({ getLayout }: any) => {
  useEffect(() => {
    getLayout(false);
  }, []);
  return (
    <div>
      <Result></Result>
    </div>
  );
};
export default CheckResult;
