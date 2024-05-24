import React from "react";
import { PrivateRoute } from "./router/auth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from "swr";
import ToastProvider from "./context/toast";
import * as dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrAfter";
import relativeTime from "dayjs/plugin/relativeTime";
import { NextUIProvider } from "@nextui-org/react";
import "./custom.scss";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import Login from "./pages/login/index";
import { fetcherClient } from "./libs/api/axios-client";
import PublicRouter from "./router/public";
import { useAuth } from "./hook/auth";
import Register from "./pages/register";
import Reset from "./pages/auth/reset";
import Onboarding from "./pages/login/onboarding";
import Forgot from "./pages/auth/forgot";
import Verify from "./pages/verify";
import { Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(relativeTime);
dayjs.locale('vi');

function App() {
  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
      <NextUIProvider>
        <SWRConfig
          value={{
            revalidateIfStale: false,
            revalidateOnFocus: false,
            fetcher: fetcherClient,
          }}
        >
          <RoutesWrap />
        </SWRConfig>
      </NextUIProvider>
    </Worker>
  );
}

const RoutesWrap = () => {
  const { isLogin } = useAuth({ revalidateOnMount: true });
  if (isLogin === null) return <></>;
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Login />
              </PublicRouter>
            }
            path="/login"
          />
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Forgot />
              </PublicRouter>
            }
            path="/auth/forgot-password"
          />
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Reset />
              </PublicRouter>
            }
            path="/change-password/:token/:user_id/:expire"
          />
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Onboarding />
              </PublicRouter>
            }
            path="/onboarding"
          />
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Register />
              </PublicRouter>
            }
            path="/register"
          />
          <Route
            element={
              <PublicRouter isLogin={isLogin}>
                <Verify />
              </PublicRouter>
            }
            path="/auth/verify"
          />

          <Route element={<PrivateRoute />} path="*" />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
