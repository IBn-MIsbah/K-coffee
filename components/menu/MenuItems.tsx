/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Card, CardDescription, CardTitle } from "../ui/card";

interface MenuItemsProps {
  name: string;
  description?: string | null;
  imageUrl: string | null;
  price: any;
}
const MenuItems = ({ name, description, price, imageUrl }: MenuItemsProps) => {
  return (
    <Card className="p-5 border-0 bg-amber-100">
      <Avatar>
        {imageUrl ? (
          <AvatarImage className="h-64 rounded-lg" src={imageUrl} alt={name} />
        ) : null}
      </Avatar>
      <div>
        <CardTitle className="text-2xl font-bold mb-1 text-amber-950">
          {name}{" "}
        </CardTitle>
        {description ? (
          <CardDescription className="mb-2">{description} </CardDescription>
        ) : null}
        <div className="font-bold text-lg">${price}</div>
      </div>

      <Button>Add to Cart</Button>
    </Card>
  );
};

export default MenuItems;
