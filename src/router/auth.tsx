import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useRoutes, useNavigate } from "react-router-dom";
import Header from "@/components/layouts/header/index";
import Home from "../pages/home";
import HomePage from "../pages/home/index";
import Lessons from "../pages/course/lessons/index";
import Reading from "../pages/reading/index";
import Speaking from "../pages/speaking/index";
import Writing from "../pages/writing/index";
import Listening from "../pages/listening/index";
import ResultReading from "../pages/reading/result/index";
import ResultListening from "../pages/listening/result/index";
import ReviewListening from "../pages/listening/review/index";
import ResultWriting from "../pages/writing/check-result/index";
import ResultSpeaking from "../pages/speaking/result/index";
import ElsaSpeaking from "../pages/speaking-result/index";
import { useLocation } from "react-router-dom";
import Review from "@/pages/review";
import { useAuth } from "@/hook/auth";
import WritingReview from "@/pages/review/writing";
import Teacher from "@/pages/teacher";
import Student from "@/pages/student";
import PrivateMigrateData from "@/pages/migrate";
// import ResultPayment from "@/pages/result-payment/page"; // only use in youpass
import VerifyEmail from "@/pages/auth/verify";
import WritingSelfPracticeResult from "@/pages/writing-self-practice/index";
import * as amplitude from "@amplitude/analytics-browser";
import { useLocalStorage } from "usehooks-ts";
import { AnimatePresence } from "framer-motion";
import { changeTheme } from "@/services/helper";
import dayjs from "dayjs";
import Section from "@/pages/course/section/screen";
import useResponsive from "@/hook/use-responsive";
import LayoutCourse from "@/pages/course/lessons/layout";
import LayoutSection from "@/pages/course/section/layout";
import { sendEvent } from "@/libs/tracking"; // send event youpass
import AxiosClient from "@/libs/api/axios-client";
import { center } from "@/services/config";
import { source } from "@/services/enum";

amplitude.init("5b9375dca6952d4310999853468b185d");

export const PrivateRoute = () => {
  const [classUser]: any = useState();
  const [isPayment, setPopupPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const { isLogin, profile, error } = useAuth();
  const [access, setAccess] = useLocalStorage("access", "");
  const [trackingGoogle, setTrackingGoogle] = useLocalStorage("trackingGoogle", "");
  const [sourceUTM, _] = useLocalStorage("utmSource", {});
  const navigate = useNavigate();
  useEffect(() => {
    if (center !== "youpass") return;
    if (trackingGoogle && isLogin) {
      const isNewUser = dayjs().unix() - dayjs(profile?.date_created).unix() < 30;
      if (isNewUser) {
        sendEvent("CompleteRegistration");
        AxiosClient.patch("/users/" + profile.id, { source: { ...sourceUTM, origin_domain: location.origin } });
      } else sendEvent("CompleteLogin");
      setTrackingGoogle("");
    }
  }, [isLogin, trackingGoogle]);
  useEffect(() => {
    if (isLogin === false) navigate("/login" + "?backUrl=" + location.href);
    else if (isLogin === true && pathname === "/") {
      profile.roleName === "Teacher" || profile.roleName === "Operator" ? navigate("/teacher") : navigate("/home");
    }

    if (isLogin === true) {
      const date = dayjs().format("YYYY-MM-DD");
      if (access !== date) {
        setAccess(date);
        amplitude.track("Access App", { user_id: profile.id, email: profile.email });
      }
    }
  }, [isLogin]);

  useEffect(() => {
    if (isLogin === true && !profile.is_active) {
      navigate("/verify");
    }
    if (pathname == "/null") {
      navigate("/home");
    }
  }, [pathname]);

  const getLayout = (status: any) => {};

  const openPayment = (status) => {
    setPopupPayment(typeof status == "boolean" ? status : !isPayment);
  };
  useEffect(() => {
    const root: any = document.getElementById("root") as any;
    const listExclude = ["/teacher", "/student"];
    const isMatch = listExclude.find((item) => location.pathname.includes(item));
    if (root && root.style && root.style.overflowX && !isMatch) {
      root.style.overflowX = "hidden";
      root.style.overflowY = "hidden";
    } else {
      root.style.overflowX = "unset";
      root.style.overflowY = "unset";
    }
  }, [pathname]);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
    if (center === source.ielts1984) {
      changeTheme("theme2");
    } else {
      changeTheme("theme1");
    }
  }, []);

  const studentRoutes = [
    { path: "/home", element: <HomePage getLayout={getLayout} /> },
    { path: "/", element: <Home /> },
    {
      path: "/class/:classId",
      element: <LayoutSection />,
      children: [
        {
          path: "",
          element: <Section />,
        },
      ],
    },
    {
      path: "/class/:classId/courses/section/:sectionId/",
      element: <LayoutCourse />,
      children: [
        {
          path: "lesson/:id",
          element: <Lessons />,
        },
        {
          path: "quiz/:type/:id",
          element: <Lessons />,
        },
      ],
    },
    { path: "/student", element: <Student /> },
    { path: "/migrate", element: <PrivateMigrateData /> },
    // { path: "/result-payment", element: <ResultPayment getLayout={getLayout} /> }, // only use on youpass
  ];

  const teacherRoutes = [
    { path: "/", element: <Navigate to="/teacher" /> },
    { path: "/teacher", element: <Teacher /> },
    { path: "/class/:classId/courses/section/:sectionId/quiz/:type/:id", element: <Lessons /> },
  ];

  const bothRoutes = [
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId",
      element: <Listening isPayment={isPayment} openPayment={openPayment} classUser={classUser} getLayout={getLayout} />,
    },
    { path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId/result", element: <ResultListening getLayout={getLayout} classUser={classUser} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId/review", element: <ReviewListening getLayout={getLayout} classUser={classUser} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/reading/:quizId/result", element: <ResultReading getLayout={getLayout} classUser={classUser} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/writing/:quizId/result/:id", element: <ResultWriting getLayout={getLayout} classUser={classUser} /> },
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/reading/:quizId",
      element: <Reading isPayment={isPayment} openPayment={openPayment} classUser={classUser} getLayout={getLayout} />,
    },
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/writing/:quizId",
      element: <Writing isPayment={isPayment} openPayment={openPayment} classUser={classUser} getLayout={getLayout} />,
    },
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/speaking/:quizId",
      element: <Speaking isPayment={isPayment} openPayment={openPayment} classUser={classUser} getLayout={getLayout} />,
    },
    { path: "/class/:classId/course/:courseId/section/:sectionId/speaking/:quizId/result/:id", element: <ResultSpeaking getLayout={getLayout} classUser={classUser} /> },
    { path: "/speaking-result/:answerId/:audioId", element: <ElsaSpeaking getLayout={getLayout} /> },
    { path: "/review/speaking/:answerId", element: <Review getLayout={getLayout} /> },
    { path: "/review/writing/:answerId", element: <WritingReview /> },
    { path: "/verify", element: <VerifyEmail /> },
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/writing-self-practice/:quizId",
      element: <WritingSelfPracticeResult getLayout={getLayout} classUser={classUser} />,
    },
    {
      path: "/class/:classId/course/:courseId/section/:sectionId/writing-self-practice/:quizId/result/:answerId",
      element: <WritingSelfPracticeResult getLayout={getLayout} classUser={classUser} />,
    },
  ];
  const { isMd } = useResponsive();
  const role = profile.role?.name;
  const routerRender = useRoutes(role === "Teacher" || role === "Operator" ? [...teacherRoutes, ...bothRoutes] : [...studentRoutes, ...bothRoutes]);
  if (!routerRender) return null;
  if (!isLogin || error) return <div className="flex items-center justify-center h-screen"></div>;
  if (loading) return;

  const headerDesktop = ["/class", "/teacher", "/student", "/home", "/dashboard", "/verify"];
  const headernMobile = ["/teacher", "/student", "/home", "/dashboard", "/verify"];
  const showTopNavBar = (!isMd ? headerDesktop : headernMobile).find((item) => location.pathname.includes(item) && !location.pathname.includes("/course/"));

  return (
    <div className="scrollbar-hide flex flex-col">
      {showTopNavBar && <Header />}
      <div className="grow">
        <div className="flex items-stretch">
          <div className="w-full">
            <AnimatePresence mode="wait">{routerRender}</AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicRouter = () => {
  return false ? <Outlet /> : <Navigate to="/" />;
};
