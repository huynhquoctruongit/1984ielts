import React, { useState, Fragment, useEffect } from "react";
import { Outlet, Navigate, useRoutes, useNavigate } from "react-router-dom";
import Menu from "@/components/layouts/menu/index";
import Header from "@/components/layouts/header/index";
import { AnimatePresence, motion } from "framer-motion";
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
import { changeTheme } from "@/services/helper";
import VerifyEmail from "@/pages/auth/verify";
import WritingSelfPracticeResult from "@/pages/writing-self-practice/index";
import * as amplitude from "@amplitude/analytics-browser";
import { useLocalStorage } from "usehooks-ts";
import dayjs from "dayjs";
import config, { keyAmplitude } from "@/services/constant";
import { amplitudeSendTrack } from "@/services/amplitude";

if (config.isProduction) amplitude.init(keyAmplitude);
console.log(config.isProduction);


export const PrivateRoute = () => {
  const [isLayout, setLayout] = useState(true);
  const [isNav, setNav] = useState(true);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const { isLogin, profile, error } = useAuth();
  const [access, setAccess] = useLocalStorage("access", "");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLogin === false) navigate("/login");
    else if (isLogin === true && !profile.is_active) {
    } else if (isLogin === true && pathname === "/") {
      profile.roleName === "Teacher" || profile.roleName === "Operator" ? navigate("/teacher") : (window.location.href = "/home");
    }

    if (isLogin === true) {
      const date = dayjs().format("YYYY-MM-DD");
      if (access !== date) {
        setAccess(date);
        amplitudeSendTrack("Access App", { user_id: profile.id, email: profile.email });
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

  const getLayout = (status: any) => {
    setLayout(status);
  };
  const openNav = () => {
    setNav(!isNav);
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
    changeTheme("theme2");
  }, []);

  const studentRoutes = [
    { path: "/home", element: <HomePage getLayout={getLayout} /> },
    { path: "/", element: <Home /> },
    { path: "/class/:classId/courses/section/:sectionId/lesson/:id", element: <Lessons openNav={openNav} getLayout={getLayout} /> },
    { path: "/class/:classId/courses/section/:sectionId/quiz/:type/:id", element: <Lessons openNav={openNav} getLayout={getLayout} /> },
    { path: "/student", element: <Student /> },
    { path: "/migrate", element: <PrivateMigrateData /> },
  ];

  const teacherRoutes = [
    { path: "/", element: <Navigate to="/teacher" /> },
    { path: "/teacher", element: <Teacher /> },
  ];

  const bothRoutes = [
    { path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId", element: <Listening getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId/result", element: <ResultListening getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/listening/:quizId/review", element: <ReviewListening getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/reading/:quizId/result", element: <ResultReading getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/writing/:quizId/result/:id", element: <ResultWriting getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/reading/:quizId", element: <Reading getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/writing/:quizId", element: <Writing getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/speaking/:quizId", element: <Speaking getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/speaking/:quizId/result/:id", element: <ResultSpeaking getLayout={getLayout} /> },
    { path: "/speaking-result/:answerId/:audioId", element: <ElsaSpeaking getLayout={getLayout} /> },
    { path: "/review/speaking/:answerId", element: <Review getLayout={getLayout} /> },
    { path: "/review/writing/:answerId", element: <WritingReview /> },
    { path: "/verify", element: <VerifyEmail /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/writing-self-practice/:quizId", element: <WritingSelfPracticeResult getLayout={getLayout} /> },
    { path: "/class/:classId/course/:courseId/section/:sectionId/writing-self-practice/:quizId/result/:answerId", element: <WritingSelfPracticeResult getLayout={getLayout} /> },
  ];

  const role = profile.role?.name;
  const routerRender = useRoutes(role === "Teacher" || role === "Operator" ? [...teacherRoutes, ...bothRoutes] : [...studentRoutes, ...bothRoutes]);
  if (!routerRender) return null;
  const listExclude = ["/login", "/report", "/courses", "/migrate"];
  const hiddenHeader = listExclude.find((item) => location.pathname.includes(item));
  const listExcludeMenu = ["/login", "/report", "/teacher", "/student", "/home", "/migrate", "/verify", "/review"];
  const hiddenMenu = listExcludeMenu.find((item) => location.pathname.includes(item)) || profile.role?.name === "Teacher";
  if (!isLogin || error) return <div className="flex items-center justify-center h-screen"></div>;

  if (loading) return;
  return (
    <div>
      {isLayout && (hiddenHeader === "/courses" || !hiddenHeader) && <Header />}
      <div className="flex">
        {!hiddenMenu && isLayout && pathname != "/login" && (
          <Menu openNav={openNav} className={`${isNav ? "block" : "hidden lg:block"} lg:w-[30%] w-full`} idLayout="default-menu" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          <div className={`${!isNav ? "block" : location.pathname.includes("/courses") && "hidden lg:block"} ${hiddenHeader ? "w-full" : "w-full"}`}>
            <motion.div exit="hidden" initial="hidden" animate="visible" key={location.pathname}>
              {React.cloneElement(routerRender as any, { key: location.pathname })}
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export const PublicRouter = () => {
  return false ? <Outlet /> : <Navigate to="/" />;
};
