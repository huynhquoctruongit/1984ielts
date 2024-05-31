import { ChevronLeftIcon } from "@heroicons/react/20/solid";

const HeaderMobile = ({ onBack, title }) => {
  return (
    <div className="flex items-center py-4 pr-4 bg-white shadow-sm min-h-[56px]">
      <div className="px-4" onClick={onBack}>
        <ChevronLeftIcon className="w-6 h-6 fill-black" />
      </div>
      <div className="h9 truncate whitespace-nowrap">{title}</div>
    </div>
  );
};

export default HeaderMobile;
