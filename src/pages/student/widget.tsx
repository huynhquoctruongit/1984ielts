import { AvatarGroup, Avatar } from "@nextui-org/react";

export const ListUser = ({ data = [], number = 10, defaultText }: any) => {
  return (
    <AvatarGroup
      size="sm"
      isBordered
      max={number}
      total={data.length - number}
      renderCount={(count) => <div className="text-small text-foreground font-medium ml-2">+{count} others</div>}
    >
      {data.slice(0, number).map((item: any) => {
        return <Avatar name={item.fullname || defaultText || "ST"}> </Avatar>;
      })}
    </AvatarGroup>
  );
};
