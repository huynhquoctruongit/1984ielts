import {
  MenuIcon,
  HomeIcon,
  DocumentIcon,
  BarIcon,
  RightArrowIcon,
  MoonIcon,
  RightIcon,
  AccountIcon,
  BellIcon,
  ProfileIcon,
  CoursesIcon,
  LogoutIcon,
  CompressIcon,
} from "@/components/icons/index";
import { useAuth } from "@/hook/auth";
import { Menu } from "@headlessui/react";
import { Avatar } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { useState } from "react";
const Header = () => {
  const domain = import.meta.env.VITE_CMS;
  const { profile, logout } = useAuth();
  const [nav, setNav] = useState(false);
  const listMenu = [
    {
      name: "Khoá học của tôi",
      slug: "student",
      link: profile.roleName === "Teacher" ? "/teacher" : "/student",
      icon: <ProfileIcon className="w-[15px]" />,
    },
    {
      name: "Đăng xuất",
      slug: "log-out",
      link: "",
      action: logout,
      icon: <LogoutIcon className="w-[15px]" />,
    },
  ];
  const openNav = () => {
    setNav(!nav);
  };
  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const logo = brand ? "/images/logo-1984.png" : "/images/logo.png";

  const listExclude = ["/class"];
  const isMatch = listExclude.find((item) => location.pathname.includes(item));
  return (
    <div
      className="h-[64px] px-[30px] py-[10px] z-[100] sticky top-0 bg-white"
      style={{
        boxShadow: "0 1px 0 0 rgba(139,141,157,.05), 0 0 1px 0 rgba(65,71,108,.15)",
      }}
    >
      <div className="flex justify-between items-center h-full">
        <div className={`flex items-center lg:ml-[54px] ${isMatch && "ml-[30px]"}`}>
          {isMatch && (
            <Link to="/home" className="absolute left-[20px] back-button-class">
              <div className="bg-neu1 flex items-center rounded-[12px] text-white caption px-[4px] lg:px-[8px] py-[2px] cursor-pointer mr-[12px]">
                <RightArrowIcon fill="white" className="rotate-180 w-[25px] lg:w-[15px] mr-[2px]"></RightArrowIcon>
                <p className="hidden lg:block">Back</p>
              </div>
            </Link>
          )}
          <Link className="relative z-[100]" to={profile?.roleName === "Teacher" ? "/teacher" : "/home"}>
            <img className="lg:w-[100px] w-[80px]" src={logo} />
          </Link>
        </div>
        <div className="hidden lg:flex">
          <div className="flex items-center">
            <div className="h-[32px] w-[1px] bg-neu4 mx-[12px] "></div>
            {profile?.avatar ? (
              <img className="w-[32px] bg-gray-200  shadow-sm h-[32px] rounded-full mr-[12px] object-cover" src={`${domain + "/assets/" + profile?.avatar}`} />
            ) : (
              <AccountIcon className="w-[23px] mr-[12px] border-[1px] border-black rounded-full px-[2px] py-[2px]" />
            )}
            <div className="cursor-pointer flex items-center">
              <Menu>
                <Menu.Button className="flex items-center button-profile relative z-30">
                  <p className="lg:body2 body3">{profile?.fullname || profile?.email?.replace("@gmail.com", "")} </p>
                  <RightArrowIcon className="rotate-90 ml-[12px] w-[20px] h-[20px]" />
                </Menu.Button>
                <Menu.Items
                  className="absolute rounded-[4px] py-[10px] right-[30px] top-[70px] bg-white"
                  style={{
                    boxShadow: "0 6px 24px 0 rgba(0,0,0,.12), 0 3px 8px 0 rgba(0,0,0,.06)",
                  }}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <div className="border-b-[1px] border-primary1 px-[20px] py-[15px] flex items-center cursor-auto">
                        {profile.avatar && <Avatar src={`${domain + "/assets/" + profile.avatar}`} />}
                        {!profile.avatar && <Avatar>{profile.fullname?.slice(0, 2)}</Avatar>}
                        <div className="ml-2">
                          <p className={`text-black ${active && "text-black"}`}>
                            <p>{profile?.fullname || profile?.email?.replace("@gmail.com", "")}</p>
                          </p>
                          <p className={`text-neu2 body5 ${active && "text-black"}`}>
                            <p>{profile?.email}</p>
                          </p>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                  <div className="grid">
                    {listMenu.map((item) => (
                      <div className="flex items-center px-[20px] py-[5px]" key={item.name}>
                        {item.icon}
                        <div className="ml-[12px]">
                          <Menu.Item>
                            {({ active }) => {
                              if (!item.action)
                                return (
                                  <Link className={`body5 ${(active && "text-primary1") || "text-black"}`} to={item.link}>
                                    {item.name}
                                  </Link>
                                );
                              else
                                return (
                                  <span onClick={item.action} className={`body5 ${(active && "text-primary1") || "text-black"}`}>
                                    {item.name}
                                  </span>
                                );
                            }}
                          </Menu.Item>
                        </div>
                      </div>
                    ))}
                  </div>
                </Menu.Items>
              </Menu>
            </div>
            <div></div>
          </div>
        </div>
        <div className="flex lg:hidden">
          <BarIcon className="cursor-pointer" onClick={openNav}></BarIcon>
          {nav && (
            <div className="fixed left-0 top-[64px] p-[20px] w-full h-screen overflow-hidden bg-[#F6F8F9] z-[11111]">
              <div className="mt-[30px] mb-[20px] flex">
                {profile.avatar && <Avatar src={`${domain + "/assets/" + profile.avatar}`} />}
                {!profile.avatar && <Avatar>{profile.fullname?.slice(0, 2)}</Avatar>}
                <div className="ml-2">
                  <p className={`text-black`}>
                    <p>{profile?.fullname || profile?.email?.replace("@gmail.com", "")}</p>
                  </p>
                  <p className={`text-neu2 body5`}>
                    <p>{profile?.email}</p>
                  </p>
                </div>
              </div>
              <Link onClick={openNav} to="/home">
                <div className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5 bg-primary1 text-white`}>
                  <HomeIcon fill="white" className="w-[20px] h-[20px]" />
                  <p className="ml-[12px]">Trang chủ</p>
                </div>
              </Link>

              <Link to="/student" target="_blank">
                <div className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5`}>
                  <DocumentIcon fill="#B2B7BC" className="w-[22px] h-[22px]" />
                  <p className="ml-[12px] text-[#B2B7BC]">Quá trình học</p>
                </div>
              </Link>
              <Link to={profile.roleName === "Teacher" ? "/teacher" : "/student"} target="_blank">
                <div className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5`}>
                  <ProfileIcon fill="#B2B7BC" className="w-[22px] h-[22px]" />
                  <p className="ml-[12px] text-[#B2B7BC]">Khoá học của tôi</p>
                </div>
              </Link>
              <div onClick={logout} className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5`}>
                <LogoutIcon fill="#B2B7BC" className="w-[20px] h-[20px] ml-[2px]" />
                <p className="ml-[12px] text-[#B2B7BC]">Đăng xuất</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
