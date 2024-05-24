import React from "react";
import { Spin } from "antd";
import { createContext, useContext, useRef, useState } from "react";
import ModalView from "../ui/modal";
import Toast from "../ui/toast";
const ToastContext = createContext({});

const ToastProvider = ({ children }: any) => {
  const timmer: any = useRef();
  const toast_: any = useRef();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    status: "",
    message: "",
    time: 100000,
  });
  toast_.current = toast;

  const toggleToast = async (data: any) => {
    clearTimeout(timmer.current);
    if (toast_.current.show) {
      setToast((state) => ({ ...state, show: false }));
      timmer.current = setTimeout(() => {
        toggleToast(data);
      }, 500);
      return;
    }
    const temp = { ...data };
    if (!temp.time) temp.time = 50000;
    setToast(temp);
    timmer.current = setTimeout(() => {
      setToast((state) => ({ ...state, show: false }));
    }, temp.time);
  };

  const onClose = () => {
    clearTimeout(timmer.current);
    setToast((state) => ({ ...state, show: false }));
  };
  const openToast = (message: string, type: "success" | "fail" | "warning" | "info" = "success") => {
    const data = {
      show: true,
      status: type,
      message: message,
      time: 5000,
    };
    toggleToast(data);
  };

  const success = (message: string) => {
    const data = {
      show: true,
      status: "success",
      message: message,
      time: 5000,
    };
    toggleToast(data);
  };
  const fail = (message: string) => {
    const data = {
      show: true,
      status: "fail",
      message: message,
      time: 5000,
    };
    toggleToast(data);
  };
  const warning = (message: string) => {
    const data = {
      show: true,
      status: "warning",
      message: message,
      time: 5000,
    };
    toggleToast(data);
  };
  const info = (message: string) => {
    const data = {
      show: true,
      status: "warning",
      message: message,
      time: 5000,
    };
    toggleToast(data);
  };

  return (
    <ToastContext.Provider value={{ setToast, toggleToast, openToast, setLoading, fail, success, warning, info }}>
      {children}
      <Toast toast={toast} onClose={onClose} />
      <ModalView
        open={loading}
        toggle={() => {
          setLoading(false);
        }}
        preventHideClickOverlay
      >
        <Spin size="large" />
      </ModalView>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const toast = useContext(ToastContext);
  return toast;
};

export default ToastProvider;
