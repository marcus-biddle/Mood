import { Card, CardContent, CardFooter } from "./ui/card";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type Props = {
  batchName: string;
  batch: any[];
};

export const Batch = ({ batchName, batch }: Props) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{batchName}</h3>
      </div>
      <div className="flex justify-center items-center">
        <Carousel
        opts={{
        align: "start",
        }}
        className="w-full max-w-7xl"
        >
        <CarouselContent className="">
          {batch &&
          batch.map((song, index) => (
            <CarouselItem key={index} className="py-4 basis-2/3 md:basis-1/8 min-w-2xs backdrop-blur-lg">
              <Card className="">
                <CardContent className="aspect-auto">
                  <img
                  src={song.spotify_image}
                  alt={song.title}
                  className="object-cover aspect-auto w-full h-full rounded-md"
                />
                </CardContent>
                <CardFooter className="flex flex-col">
                  <p className="text-md truncate font-semibold max-w-full">
                    {song.title}
                  </p>
                  <p className="text-gray-300 text-sm truncate max-w-full">
                    {song.artist}
                  </p>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
          
          {/* <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem>
          <CarouselItem className="md:basis-1/2 lg:basis-1/3">...</CarouselItem> */}
        </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};