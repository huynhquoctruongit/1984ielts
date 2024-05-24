import { Avatar } from "@nextui-org/react";

const AvatarIELTS = ({ src, ...rest }: any) => {
  const url = import.meta.env.VITE_CMS + "/assets/" + src;
  if (src) return <Avatar src={url} {...rest} />;
  else return <Avatar {...rest} />;
};

export default AvatarIELTS;
