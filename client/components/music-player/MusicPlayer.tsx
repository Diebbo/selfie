import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Image,
  Button,
  Slider,
  Divider,
} from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { PauseCircleIcon } from "./PauseCircleIcon";
import { NextIcon } from "./NextIcon";
import { PreviousIcon } from "./PreviousIcon";
import { RepeatOneIcon } from "./RepeatOneIcon";
import { ShuffleIcon } from "./ShuffleIcon";
import { Song } from "../../helpers/types";
import AudioVisualizer from "./AudioVisualizer";
import { VolumeOffIcon, VolumeUpIcon } from "./VolumeIcons";

export default function MusicPlayer() {
  const [currentSong, setCurrentSong] = React.useState<Song>({
    title: "",
    album: "",
    duration: "",
    progress: "",
    cover: "https://nextui.org/images/album-cover.png",
    liked: false,
  });
  const [liked, setLiked] = React.useState(currentSong.liked);
  const [sound, setSound] = React.useState(new Audio("/song/Test Song1.wav"));
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [repeat, setRepeat] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null,
  );
  const [volume, setVolume] = React.useState(1);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false);

  useEffect(() => {
    fetchSong("/api/musicplayer/currentsong");
  }, []);

  useEffect(() => {
    if (sound && isPlaying) {
      sound.play();
    }
  }, [sound, isPlaying]);

  useEffect(() => {
    const newSound = new Audio(`/song/${currentSong.title}.wav`);
    setSound(newSound);
    setAudioElement(newSound);

    const handleLoadedMetadata = () => {
      setDuration(newSound.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(newSound.currentTime);
    };

    const handleSongEnd = () => {
      if (repeat) {
        newSound.currentTime = 0;
        newSound.play();
      } else {
        handleNextSong();
      }
    };

    newSound.addEventListener("loadedmetadata", handleLoadedMetadata);
    newSound.addEventListener("timeupdate", handleTimeUpdate);
    newSound.addEventListener("ended", handleSongEnd);

    return () => {
      newSound.removeEventListener("loadedmetadata", handleLoadedMetadata);
      newSound.removeEventListener("timeupdate", handleTimeUpdate);
      newSound.removeEventListener("ended", handleSongEnd);
    };
  }, [currentSong, repeat]);

  const handlePlayPause = () => {
    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleClickRepeat = () => {
    sound.loop = !repeat;
    setRepeat(!repeat);
  };

  const handleClickShuffle = () => {
    setShuffle(!shuffle);
  };

  const handleVolumeChange = (value: number) => {
    const newVolume = value / 100;
    setVolume(newVolume);
    if (sound) {
      sound.volume = newVolume;
    }
    setIsInteractingWithSlider(true);
  };

  const fetchSong = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });
      const song = await response.json();
      setCurrentSong({
        title: song.title,
        album: song.album,
        duration: song.duration,
        progress: "0:00",
        cover: "https://nextui.org/images/album-cover.png",
        id: song._id,
        liked: song.isLiked,
      });
      setLiked(song.isLiked);
      if (isPlaying) {
        sound.pause();
        setIsPlaying(false);
      }
      setCurrentTime(0);
    } catch (error) {
      console.error("Error fetching song:", error);
    }
  };

  const handleNextSong = () => {
    if (isPlaying) {
      sound.pause();
    }
    if (shuffle) {
      fetchSong("/api/musicplayer/randomsong");
      setIsPlaying(true);
    } else {
      fetchSong("/api/musicplayer/nextsong");
      setIsPlaying(true);
    }
  };
  const handlePrevSong = () => {
    if (isPlaying) {
      sound.pause();
    }
    if (shuffle) {
      fetchSong("/api/musicplayer/randomsong");
      setIsPlaying(true);
    } else {
      fetchSong("/api/musicplayer/prevsong");
      setIsPlaying(true);
    }
  };
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AudioVisualizer audio={audioElement} />
      <Card
        isBlurred
        className="border-green-200 border-2 bg-background/60 dark:bg-default-100/50"
        shadow="lg"
      >
        <CardBody style={{ height: "100%" }}>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2 md:gap-4 items-center justify-center h-full">
            <div className="col-span-6 md:col-span-4">
              <Image
                alt="Album cover"
                className="object-cover"
                shadow="md"
                src={currentSong.cover}
                width="100%"
              />
            </div>

            <div className="flex flex-col col-span-6 md:col-span-8 h-full">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0">
                  <h3 className="font-semibold text-foreground/90">
                    {currentSong.album}
                  </h3>
                  <p className="text-small text-foreground/80">
                    Selfie Music Player
                  </p>
                  <h1 className="text-large font-medium mt-4">
                    {currentSong.title}
                  </h1>
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

              <div className="flex flex-col mt-6 gap-1">
                <Slider
                  aria-label="Music progress"
                  classNames={{
                    track: "bg-default-500/30",
                    thumb: "w-0 h-0",
                  }}
                  color="foreground"
                  value={(currentTime / duration) * 100}
                  onChange={(value) => {
                    if (sound) {
                      sound.currentTime = ((value as number) / 100) * duration;
                    }
                  }}
                  size="sm"
                />
                <div className="flex justify-between">
                  <p className="text-small">{formatTime(currentTime)}</p>
                  <p className="text-small text-foreground/50">
                    {formatTime(duration)}
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center justify-evenly m-auto">
                <Button
                  isIconOnly
                  className="data-[hover]:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onPress={handleClickRepeat}
                >
                  <RepeatOneIcon
                    className={
                      repeat ? "text-blue-500/80" : "text-foreground/80"
                    }
                  />
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
                  onPress={handlePlayPause}
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
                  onPress={handleClickShuffle}
                >
                  <ShuffleIcon
                    className={
                      shuffle ? "text-blue-500/80" : "text-foreground/80"
                    }
                  />
                </Button>
              </div>
              <div className="flex flex-col items-center mt-4">
                <div
                  className="relative flex items-center justify-center w-full"
                  onMouseEnter={() => setIsVolumeSliderVisible(true)}
                  onMouseLeave={() => {
                    if (!isInteractingWithSlider) {
                      setIsVolumeSliderVisible(false);
                    }
                  }}
                >
                  <div
                    className={`flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${isVolumeSliderVisible || isInteractingWithSlider ? "w-full" : "w-auto"}`}
                  >
                    <VolumeOffIcon
                      className="text-foreground/80 transition-all duration-300 ease-in-out"
                      width={20}
                      height={20}
                    />
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isVolumeSliderVisible || isInteractingWithSlider ? "w-full opacity-100" : "w-0 opacity-0"}`}
                    >
                      <Slider
                        aria-label="Volume"
                        size="sm"
                        color="primary"
                        value={volume * 100}
                        onChange={(value) => handleVolumeChange(Number(value))}
                        onChangeEnd={() => {
                          setIsInteractingWithSlider(false);
                          if (!isVolumeSliderVisible) {
                            setTimeout(
                              () => setIsVolumeSliderVisible(false),
                              1000,
                            );
                          }
                        }}
                        className="w-full"
                        classNames={{
                          track: "h-1",
                        }}
                      />
                    </div>
                    <VolumeUpIcon
                      className="text-foreground/80 transition-all duration-300 ease-in-out"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
