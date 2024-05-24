import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
const ButtonToggle = (props: any) => {
  const { textActive, textInActive, active, setActive } = props;
  const clx = active ? "bg-orangepastel hover:bg-orange-200  text-primary2" : "bg-default-200  hover:bg-default-300";
  return (
    <div className="flex items-center">
      <div className={"py-1.5 cursor-pointer duration-200 px-3 flex items-center w-fit rounded-md " + clx} onClick={() => setActive(!active)}>
        <p className="text-sm font-medium"> {active ? textActive : textInActive}</p>
      </div>
      {!active ? <LockClosedIcon className="ml-2 stroke-2 w-4" /> : <LockOpenIcon className="ml-2 stroke-2 w-4" />}
    </div>
  );
};

export default ButtonToggle;
