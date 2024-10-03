import React from "react";
import { Card, CardBody, Image, Button, Slider } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";

export default function MusicPlayer() {
  const [currentSong, setCurrentSong] = React.useState<{
    title: string;
    album: string;
    duration: string;
    progress: string;
    cover: "https://nextui.org/images/album-cover.png";
    id?: string;
    liked: boolean;
  }>({
    title: "Omar Il Kebabbaro",
    album: "Daily Mix",
    duration: "4:32",
    progress: "1:23",
    cover: "https://nextui.org/images/album-cover.png",
    liked: true,
  });
  const [liked, setLiked] = React.useState(currentSong.liked);
  

  const fetchSong = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });
      const song = await response.json();
      console.log(song);
      setCurrentSong({
        title: song.title,
        album: song.album,
        duration: song.duration,
        progress: "0:00",
        cover: "https://nextui.org/images/album-cover.png",
        id : song._id,
        liked: song.isLiked
      });
      setLiked(song.isLiked);
    } catch (error) {
      console.error("Error fetching song:", error);
    }
  };

  const handleNextSong = () => fetchSong("/api/musicplayer/nextsong");
  const handlePrevSong = () => fetchSong("/api/musicplayer/prevsong");
  const handleAddLike = () => (liked ? removeLike() : addLike());
  


  const addLike = async () => {
    try {
      const response = await fetch("/api/musicplayer/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ songId: currentSong.id }),
      });
      if (response.ok) {
        setLiked(true);
      } else {
        console.error("Error adding like:", await response.json());
      }
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const removeLike = async () => {
    try {
      const response = await fetch("/api/musicplayer/like", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ songId: currentSong.id }),
      });
      if (response.ok) {
        setLiked(false);
      } else {
        console.error("Error removing like:", await response.json());
      }
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  return (
    <Card
      isBlurred
      className="border-green-200 border-2 bg-background/60 dark:bg-default-100/50 max-w-[1000px]"
      shadow="sm"
    >
      <CardBody>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
          <div className="relative col-span-6 md:col-span-4">
            <Image
              alt="Album cover"
              className="object-cover"
              height={200}
              shadow="md"
              src={currentSong.cover}
              width="100%"
            />
          </div>

          <div className="flex flex-col col-span-6 md:col-span-8">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0">
                <h3 className="font-semibold text-foreground/90">{currentSong.album}</h3>
                <p className="text-small text-foreground/80">12 Tracks</p>
                <h1 className="text-large font-medium mt-2">{currentSong.title}</h1>
              </div>
              <Button
                isIconOnly
                className="text-default-900/60 data-[hover]:bg-foreground/10 -translate-y-2 translate-x-2"
                radius="full"
                variant="light"
                onPress={handleAddLike}
              >
                <HeartIcon
                  className={liked ? "[&>path]:stroke-transparent" : ""}
                  fill={liked ? "currentColor" : "none"}
                />
              </Button>
            </div>

            <div className="flex flex-col mt-3 gap-1">
              <Slider
                aria-label="Music progress"
                classNames={{
                  track: "bg-default-500/30",
                  thumb: "w-2 h-2 after:w-2 after:h-2 after:bg-foreground",
                }}
                color="foreground"
                defaultValue={33}
                size="sm"
              />
              <div className="flex justify-between">
                <p className="text-small">{currentSong.progress}</p>
                <p className="text-small text-foreground/50">{currentSong.duration}</p>
              </div>
            </div>

            <div className="flex w-full items-center justify-center">
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <RepeatOneIcon className="text-foreground/80" />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onPress={handlePrevSong}
              >
                <PreviousIcon />
              </Button>
              <Button
                isIconOnly
                className="w-auto h-auto data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <PauseCircleIcon size={54} />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
                onPress={handleNextSong}
              >
                <NextIcon />
              </Button>
              <Button
                isIconOnly
                className="data-[hover]:bg-foreground/10"
                radius="full"
                variant="light"
              >
                <ShuffleIcon className="text-foreground/80" />
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}