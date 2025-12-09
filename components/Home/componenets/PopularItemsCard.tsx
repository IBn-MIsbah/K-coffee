import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

interface PopularItemsCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
}
const PopularItemsCard = ({
  id,
  name,
  imageUrl,
  description,
}: PopularItemsCardProps) => {
  return (
    <Card
      className="max-w-sm h-full flex flex-col items-center text-center 
                 bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl 
                 transition-all duration-300 ease-in-out transform hover:-translate-y-1 
                 border border-amber-100"
    >
      <Avatar className="flex justify-center items-center mb-6">
        {imageUrl ? (
          <AvatarImage
            className="rounded-full w-56 h-56 object-cover ring-4 ring-amber-200 shadow-md cursor-pointer"
            src={imageUrl}
            id={id}
            alt={name}
          />
        ) : (
          <div className="rounded-full w-56 h-56 bg-amber-100 flex items-center justify-center text-amber-900 font-bold text-lg border-2 border-amber-300">
            [Image Unavailable]
          </div>
        )}
      </Avatar>

      <CardTitle
        className="text-3xl font-serif font-bold text-amber-950 mb-2 tracking-wide cursor-pointer"
        id={id}
      >
        {name}
      </CardTitle>
      {description && (
        <CardDescription className="text-base text-amber-800 italic px-2">
          {description}
        </CardDescription>
      )}
    </Card>
  );
};

export default PopularItemsCard;
