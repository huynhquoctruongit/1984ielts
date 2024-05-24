import Button from "../../ui/button/index";
import { LocateIcon } from "@/components/icons";
import { Link } from "react-router-dom";
const LocationButton = ({ sameLocate, id }: any) => {

  let idSame = 0;
  const regex = new RegExp(`\\b${id}\\b`);
  for (const item of sameLocate) {
    if (regex.test(item)) {
      idSame = item;
    }
  }


  return (
    <Link to={location.pathname + location.search + `#location-${id}`}>
      <Button className="border-green1 border-[1px] bg-white text-green1">
        <LocateIcon className="mr-[4px]" fill="#23AF6E" />
        Locate
      </Button>
    </Link>
  );
};
export default LocationButton;
