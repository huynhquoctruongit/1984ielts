import Button from "../../ui/button/index";
import { LocateIcon } from "@/components/icons";
import { Link, useNavigate } from "react-router-dom";
const LocationButton = ({ sameLocate, id }: any) => {
  let navigate = useNavigate();
  let idSame = 0;
  const regex = new RegExp(`\\b${id}\\b`);
  for (const item of sameLocate) {
    if (regex.test(item)) {
      idSame = item;
    }
  }
  const handleScroll = (id) => {
    var url: any = new URL(window.location.href);
    url.searchParams.set("location", id);
    navigate(url.pathname + url.search)
    const element = document.getElementsByClassName(id)[0];
    element.scrollIntoView({
      block: 'center',
      inline: 'center', behavior: "smooth"
    });
  };
  return (
    <div onClick={(e) => handleScroll(`location-${id}`)}>
      <Button className="border-green1 border-[1px] bg-white text-green1">
        <LocateIcon className="mr-[4px]" fill="#23AF6E" />
        Locate
      </Button>
    </div>
  );
};
export default LocationButton;
