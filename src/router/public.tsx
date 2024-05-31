import { useAuth } from "@/hook/auth";
import { Navigate, useSearchParams } from "react-router-dom";
import { changeTheme } from "@/services/helper";
import { center } from "@/services/config";
import { source } from "@/services/enum";

const PublicRouter = ({ element, children, ...props }: any) => {
  let [searchParams] = useSearchParams();
  const backLink = searchParams.get("backUrl");
  const backUrlLocal = localStorage.getItem("backUrl");
  if (center === source.ielts1984) {
    changeTheme("theme2");
  } else {
    changeTheme("theme1");
  }
  const { isLogin, profile } = useAuth({ revalidateOnMount: true });
  if (backLink !== null) {
    if (isLogin) {
      return <Navigate to={`/${backLink}`} />;
    }
  } else {
    if (backUrlLocal != "null" && isLogin) {
      return <Navigate to={`/${backUrlLocal}`} />;
    } else {
      if (isLogin && profile?.role?.name === "Teacher") return <Navigate to="/teacher" />;
      if (isLogin && profile?.role?.name === "End User") return <Navigate to="/home" />;
      if (isLogin && profile?.role?.name === "Operator") return <Navigate to="/teacher" />;
    }
  }

  return children;
};

export default PublicRouter;
