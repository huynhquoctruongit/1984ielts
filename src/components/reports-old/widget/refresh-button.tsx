import { InboxArrowDownIcon } from "@heroicons/react/20/solid";
import { Button, Spinner } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";

const RefreshButton = ({ handleRefesh, totalCount = 10 }: any) => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const timeout = useRef<any>();
  const refeshData = async () => {
    if (loading || count > 0) return;
    setLoading(true);
    await handleRefesh();
    setLoading(false);
    setCount(totalCount);
  };

  useEffect(() => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      if (count <= 0) return clearTimeout(timeout.current);
      setCount((count) => {
        if (count <= 0) return 0;
        return count - 1;
      });
    }, 1000);
  }, [count]);

  useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  const classActive = count <= 0 ? "bg-success-400 shadow-small text-white hover:text-white hover:bg-success-300" : " bg-gray-50 text-black/50";
  return (
    <div onClick={refeshData} className={"px-3 py-2 w-fit rounded-lg flex items-center transition-color duration-200 ease-in-out cursor-pointer " + classActive}>
      {count !== 0 && <span className="mr-3 px-1.5 p-1 rounded-md bg-gray-100 text-[12px] block  font-meidum">{count < 10 ? "0" + count : count}</span>}
      {loading && <Spinner className="mr-2" color="secondary" size="sm" />}
      <InboxArrowDownIcon className="w-4 h-4 " />
      <span className="font-meidum ml-3">Refresh</span>
    </div>
  );
};

export default RefreshButton;
