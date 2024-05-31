import { Outlet } from "react-router-dom";
import { memo } from "react";
import SideSection from "@/components/layouts/menu/section";
import useResponsive from "@/hook/use-responsive";

const LayoutSection = memo(() => {
  const { isMd } = useResponsive();
  return (
    <div className="flex container-full">
      {!isMd && <SideSection />}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
});

export default LayoutSection;
