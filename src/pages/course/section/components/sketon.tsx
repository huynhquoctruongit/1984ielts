import Loading from "@/components/system/result";

const SketonSection = () => {
  return (
    <>
      <div className="min-w-10 w-full flex items-center justify-center md:hidden">
        <div className="w-full md:w-3/8 md:w-[374px] bg-white h-[calc(100vh-72px)] overflow-hidden">
          <div className="px-5">
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
          </div>
        </div>
      </div>
      <div className="p-10">
        <div className="w-full max-w-[690px] justify-center hidden md:flex">
          <div className="w-full bg-white  overflow-hidden">
            <div className="px-10">
              <div className="mt-4 flex items-center gap-3 animate-purple h-32 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
              <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SketonSection;
