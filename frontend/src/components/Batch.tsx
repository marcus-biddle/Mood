
type Props = {
  batchName: string;
  batch: any[];
};

export const Batch = ({ batchName, batch }: Props) => {
  return (
    <div>
      <div>
        <h2>{batchName}</h2>
      </div>
      <div className="flex overflow-x-auto space-x-4 py-2">
        {batch &&
          batch.map((song) => (
            <div
              key={song.id}
              className="flex flex-col items-center backdrop-blur-xl transition-all duration-300 cursor-pointer group p-4 text-black bg-slate-900/10 hover:bg-slate-900/20 rounded-md min-w-[150px]"
            >
              <div className="relative mb-4">
                <img
                  src={song.spotify_image}
                  alt={song.title}
                  className="shadow-lg aspect-square object-cover rounded-xl"
                />
              </div>
              <div className="flex flex-col justify-center w-full items-start">
                <p className="text-md truncate font-semibold max-w-full">
                  {song.title}
                </p>
                <p className="text-gray-300 text-sm truncate max-w-full">
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};