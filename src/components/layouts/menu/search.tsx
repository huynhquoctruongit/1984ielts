import { useDeferredValue, useEffect, useRef, useState } from "react";
import ModalView from "../modal/template";
import { CiSearch } from "react-icons/ci";
import { MdKeyboardCommandKey } from "react-icons/md";

import { useNavigate, useParams } from "react-router-dom";
import useClass from "./helper/use-class";
import { EnumCollection } from "@/pages/course/helper/enum-icon";
import { source, TypeSkill } from "@/services/enum";
import { center } from "@/services/config";
// import { TypeSkill } from "@/pages/dashboard/enum";

const SearchModal = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const textSearch = useDeferredValue(search);
  const ref: any = useRef();

  useEffect(() => {
    if (open) {
      ref.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === "KeyK" && event.metaKey === true) {
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const logo = center === source.ielts1984 ? "/images/logo-1984.png" : "/images/logo.png";
  return (
    <div className="search-modal relative z-[10000]">
      <div
        onClick={() => setOpen(true)}
        className="w-full rounded-full md:border-neutral-06 md:border md:py-2 md:px-6 lg:mb-6 flex items-center gap-2  cursor-pointer hover:bg-slate-50 duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.35632 2C5.29354 2 2 5.29354 2 9.35632C2 13.4191 5.29354 16.7126 9.35632 16.7126C11.0563 16.7126 12.6216 16.136 13.8673 15.1677L15.2073 16.5077C14.9716 17.22 15.1371 18.036 15.7038 18.6028L18.5007 21.3996C19.3012 22.2001 20.5991 22.2001 21.3996 21.3996C22.2001 20.5991 22.2001 19.3012 21.3996 18.5007L18.6028 15.7038C18.036 15.1371 17.22 14.9716 16.5077 15.2073L15.1677 13.8673C16.136 12.6216 16.7126 11.0563 16.7126 9.35632C16.7126 5.29354 13.4191 2 9.35632 2ZM3.83908 9.35632C3.83908 6.30923 6.30923 3.83908 9.35632 3.83908C12.4034 3.83908 14.8736 6.30923 14.8736 9.35632C14.8736 12.4034 12.4034 14.8736 9.35632 14.8736C6.30923 14.8736 3.83908 12.4034 3.83908 9.35632Z"
            fill="#3C3C43"
            fillOpacity="0.6"
          />
        </svg>
        <span className="text-light-02 hidden md:block whitespace-nowrap">Tìm kiếm</span>{" "}
      </div>
      <ModalView open={open} toggle={() => setOpen(false)}>
        <div className="w-[calc(100vw-40px)] lg:w-[40rem] h-[90vh] md:h-[60vh] mx-auto">
          <div className="rounded-md bg-white shadow-xl overflow-hidden h-full flex flex-col">
            <div className="border-b border-neutral-04 flex items-center">
              <CiSearch className="w-6 stroke-[1px] h-6 text-neutral-04 ml-6" />
              <input ref={ref} value={search} onChange={(e) => setSearch(e.target.value)} type="text" className="h-[3.5rem] px-6 text-sm w-full bg-white" placeholder="Search..." />
              <div onClick={() => setOpen(false)} className="px-2 py-1.5 text-sm font-bold rounded-md shadow mr-6 cursor-pointer duration-200 hover:shadow-md">
                ESC
              </div>
            </div>
            <div className="grow">
              <Result setOpen={setOpen} textSearch={textSearch} />
            </div>
            <div className="flex items-center p-2 py-4 border-t border-slate-100 pr-4 w-full">
              <div className="ml-auto flex items-center gap-2" >
                <span className="text-light-02 ml-auto" >Search by</span>{" "}
                <span className="font-bold">
                  <img src={logo} className="h-5" />
                </span>
              </div>
              <div
                onClick={() => setOpen(false)}
                className="px-2 flex items-center py-1.5 text-sm font-bold rounded-md shadow ml-6 mr-2 cursor-pointer duration-200 hover:shadow-md"
              >
                <MdKeyboardCommandKey className="w-4 h-4" /> <span className="ml-0.5">K</span>
              </div>
            </div>
          </div>
        </div>
      </ModalView>
    </div>
  );
};

const searchFun = (value, search) => {
  return value.toLowerCase().includes(search.toLowerCase());
};
const searchList = (list = [], search) => {
  return list.filter((item) => searchFun(item.title, search));
};

const Result = ({ textSearch, setOpen }: any) => {
  const params = useParams();
  const navigate = useNavigate();
  const classId = params["*"].split("/")[1];
  const { menus } = useClass(classId);
  const result = textSearch
    ? menus
        .map((section) => {
          const topics = section.topics.filter((topic) => {
            return searchList(topic.parts || [], textSearch).length > 0;
          });
          return { ...section, topics };
        })
        .filter((section) => section.topics.length > 0)
    : menus;

  const onSection = (id: string) => {
    navigate("/class/" + classId + "?section=" + id);
    setOpen(false);
  };

  return (
    <div className="h-full relative grow">
      <div className="overflow-y-scroll absolute top-0 left-0 w-full h-full">
        {result.map((section) => {
          return (
            <div className="border-b border-neutral-04 p-4" key={section.id}>
              <div onClick={() => onSection(section.id)} className="text-sm font-semibold hover:bg-slate-100 duration-200 cursor-pointer hover:text-white  px-3 py-2.5 rounded-md">
                {section.title}
              </div>
              <div className="ml-2 rounded-xl flex flex-col gap-2 mt-2">
                {section.topics.map((data) => {
                  const visibleTile = data.title.toLowerCase().includes(textSearch.toLowerCase());
                  const visibleQuiz = (data.parts || []).find((item) => item.title.toLowerCase().includes(textSearch.toLowerCase()));
                  if (!visibleTile && !visibleQuiz) return null;
                  return (
                    <div className="" key={data.id}>
                      <div>
                        <div onClick={() => onSection(section.id)} className="text-sm bg-slate-50 hover:bg-slate-100  px-3 py-2.5 rounded-md cursor-pointer">
                          {data.title}
                        </div>
                        <div className="ml-4 mt-2 flex flex-col gap-2">
                          {(data.parts || []).map((item) => {
                            const onClick = () => {
                              if (item.collection === "quiz")
                                navigate(`/class/${classId}/courses/section/${section.id}/${item.collection}/${TypeSkill[item.type]}/${item.item_id}`);
                              if (item.collection === "lesson") navigate(`/class/${classId}/courses/section/${section.id}/${item.collection}/${item.item_id}`);
                              setOpen(false);
                            };
                            const type = item.collection === "quiz" ? item.quiz_type : item.type;
                            const collection = EnumCollection[item.collection + "-" + type];
                            if (!visibleTile && !item.title.toLowerCase().includes(textSearch.toLowerCase())) return null;
                            return (
                              <div key={item.id} onClick={onClick} className="bg-slate-50 hover:bg-slate-100 duration-200  px-3 py-2.5 rounded-md flex items-center cursor-pointer">
                                <div className="w-6 h-6 bg-white flex items-center justify-center rounded-md shadow mr-3">
                                  {collection.icon}
                                  {/* <PenTool02 className="w-2.5" /> */}
                                </div>
                                <div className="text-sm">{item.title}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchModal;
