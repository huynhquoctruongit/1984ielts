import useOnClickOutside from "@/hook/outside";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { DatePicker, Form } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

export const Input = (props: any) => {
  const { id, onChange, value, placeholder, ...rest } = props;
  const { status, errors } = Form.Item.useStatus();
  const [focus, setFocus] = useState(value || false);
  const ref: any = useRef();
  const last: any = useRef();
  useEffect(() => {
    const handleFocus = () => setFocus(true);
    const outFocus = () => {
      if (!ref.current?.value) setFocus(false);
    };
    ref.current?.addEventListener("focus", handleFocus);
    ref.current?.addEventListener("focusout", outFocus);
    // Calls onFocus when the ref.current? first loads

    // Specify how to clean up after this effect:
    return () => {
      ref.current?.removeEventListener("focus", handleFocus);
      ref.current?.removeEventListener("focusout", outFocus);
    };
  }, []);

  useOnClickOutside(ref, () => {
    if (focus && !value) setFocus(false);
  });
  const changeText = (e: any) => {
    const { value } = e.target;
    onChange(value);
  };

  const error = errors[0];
  if (error) last.current = error;
  const clx = status === "error" ? "border-red" : "border-[#D7EBFF] focus:ant-focus";
  const text = status === "error" ? "text-red" : "text-nue2";
  return (
    <div className="bg-white relative flex">
      <input
        ref={ref}
        onChange={changeText}
        type="text"
        value={value}
        {...rest}
        className={"bg-white  border transition duration-200 ease-in-out text-neu1 rounded-[99px] px-[20px] py-[12px] w-full text-[14px] " + clx}
      />
      <span
        className={" pointer-events-none absolute rounded-md left-3 text-[12px] bg-white text-neu2 px-2 transiton duration-200 ease-in-out " + text}
        style={{ fontSize: focus ? 12 : 14, top: focus ? 0 : "50%", transform: `translateY(-50%)` }}
      >
        {placeholder}
      </span>
    </div>
  );
};

export const DatePickerIELTS = (props: any) => {
  const { onChange, value, placeholder } = props;
  const { status } = Form.Item.useStatus();
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    if (focus && !value) setFocus(false);
  });
  const [focus, setFocus] = useState(false);
  const changeDate = (day: any) => {
    onChange(dayjs(day).toISOString());
    setFocus(true);
  };

  useEffect(() => {
    const input = ref.current.getElementsByTagName("input")[0];
    const outFocus = () => {
      if (!input?.value) setFocus(false);
    };
    const handleFocus = () => setFocus(true);
    input?.addEventListener("focus", handleFocus);
    input?.addEventListener("focusout", outFocus);
    return () => {
      input?.removeEventListener("focus", handleFocus);
      input?.removeEventListener("focusout", outFocus);
    };
  }, []);

  const clx = status === "error" ? "border-red" : "border-[#D7EBFF] ";
  const text = status === "error" ? "text-red" : "text-nue2";

  return (
    <div className="relative">
      <div className="bg-white" ref={ref}>
        <DatePicker
          format={"DD/MM/YYYY"}
          allowClear={false}
          value={value ? dayjs(value) : null}
          suffixIcon
          className="flex border-[#D7EBFF] relaitve items-center border rounded-[99px] focus:outline-none px-[20px] py-[12px] "
          onChange={changeDate}
          placeholder=""
        />
      </div>
      <span
        className={"pointer-events-none absolute rounded-md left-3 bg-white text-neu2 px-2 transiton duration-200 ease-in-out " + text}
        style={{ fontSize: focus ? 12 : 14, top: focus ? 0 : "50%", transform: `translateY(-50%)` }}
      >
        {placeholder}
      </span>
    </div>
  );
};

export const Password = (props: any) => {
  const [eye, setEye] = useState(true);
  const { id, onChange, value, placeholder } = props;
  const { status } = Form.Item.useStatus();
  const ref: any = useRef();

  useOnClickOutside(ref, () => {
    if (focus && !value) setFocus(false);
  });
  const [focus, setFocus] = useState(false);
  const changeText = (e: any) => {
    const { value } = e.target;
    onChange(value);
  };
  useEffect(() => {
    const handleFocus = () => setFocus(true);
    const outFocus = () => {
      if (!ref.current?.value) setFocus(false);
    };
    ref.current?.addEventListener("focus", handleFocus);
    ref.current?.addEventListener("focusout", outFocus);
    return () => {
      ref.current?.removeEventListener("focus", handleFocus);
      ref.current?.removeEventListener("focusout", outFocus);
    };
  }, []);
  const clx = status === "error" ? "border-red" : "border-[#D7EBFF] focus:ant-focus";
  const text = status === "error" ? "text-red" : "text-nue2";
  return (
    <div className={"bg-white relative flex w-full"}>
      <input
        ref={ref}
        onChange={changeText}
        type={eye ? "password" : "text"}
        className={"bg-white  border transition duration-200 ease-in-out text-neu1 rounded-[99px] px-[20px] py-[12px] w-full text-[14px] " + clx}
      />
      <span className="absolute absolute-y-center right-4">
        {eye ? (
          <EyeSlashIcon onClick={() => setEye((e) => !e)} className="h-6 w-6 ml-auto stroke-[#374957] " />
        ) : (
          <EyeIcon onClick={() => setEye((e) => !e)} className="h-6 w-6 stroke-[#374957]" />
        )}
      </span>
      <span
        className={"pointer-events-none absolute rounded-md left-3 text-[12px] bg-white text-neu2 px-2 transiton duration-200 ease-in-out " + text}
        style={{ fontSize: focus ? 12 : 14, top: focus ? 0 : "50%", transform: `translateY(-50%)` }}
      >
        {placeholder}
      </span>
    </div>
  );
};
