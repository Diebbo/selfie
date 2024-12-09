import React, { useEffect, useState } from "react";
import { Card, CardBody, Image, Button, Slider } from "@nextui-org/react";
import { HeartIcon } from "./HeartIcon";
import { Song } from "../../helpers/types";
import { VolumeDownIcon, VolumeUpIcon } from "./VolumeIcons";
import Controls from "./Controls";
import { musicPlayerService } from "./musicPlayerService";

export default function MusicPlayer() {
  const [currentSong, setCurrentSong] = useState<Song>({
    title: "",
    album: "",
    duration: 0,
    id: "",
    cover: "https://nextui.org/images/album-cover.png",
    liked: false,
  });
  const [audioElement] = useState<HTMLAudioElement>(new Audio());
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    shuffle: false,
    repeat: false,
    volume: 1,
    currentTime: 0,
  });

  useEffect(() => {
    const initializePlayer = async () => {
      try {
        const song = await musicPlayerService.fetchCurrentSong();
        setCurrentSong(song);
        audioElement.src = "/song/" + song.title + ".wav";
      } catch (error) {
        console.error("Error initializing player:", error);
      }
    };
    initializePlayer();

    const handleLoadedMetadata = () => {
      setCurrentSong((prevSong) => ({
        ...prevSong,
        duration: audioElement.duration,
      }));
    };

    const handleTimeUpdate = () => {
      setAudioState((prev) => ({
        ...prev,
        currentTime: audioElement.currentTime,
      }));
    };

    audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("ended", handleSongEnd);

    return () => {
      audioElement.pause();
      audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("ended", handleSongEnd);
    };
  }, []);

  const handleSongEnd = () => {
    if (audioState.repeat) {
      audioElement.currentTime = 0;
      audioElement.play();
    } else {
      handleNextSong();
    }
  };

  const handlePlayPause = () => {
    if (audioState.isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleClickRepeat = () => {
    audioElement.loop = !audioState.repeat;
    setAudioState((prev) => ({ ...prev, repeat: !prev.repeat }));
  };

  const handleClickShuffle = () => {
    setAudioState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  };

  const handleVolumeChange = (value: number) => {
    audioElement.volume = value;
    setAudioState((prev) => ({ ...prev, volume: value }));
  };

  const handleNextSong = async () => {
    try {
      const song = audioState.shuffle
        ? await musicPlayerService.fetchRandomSong()
        : await musicPlayerService.fetchNextSong();
      setCurrentSong(song);
      audioElement.src = "/song/" + song.title + ".wav";
      await audioElement.load();
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioState((prev) => ({ ...prev, isPlaying: true }));
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setAudioState((prev) => ({ ...prev, isPlaying: false }));
          });
      }
    } catch (error) {
      console.error("Error fetching next song:", error);
    }
  };

  const handlePrevSong = async () => {
    try {
      const song = audioState.shuffle
        ? await musicPlayerService.fetchRandomSong()
        : await musicPlayerService.fetchPrevSong();
      setCurrentSong(song);
      audioElement.src = "/song/" + song.title + ".wav";
      await audioElement.load();
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioState((prev) => ({ ...prev, isPlaying: true }));
          })
          .catch((error) => {
            console.error("Playback failed:", error);
            setAudioState((prev) => ({ ...prev, isPlaying: false }));
          });
      }
    } catch (error) {
      console.error("Error fetching previous song:", error);
    }
  };

  const handleLike = async () => {
    try {
      if (currentSong.liked) {
        await musicPlayerService.removeLike(currentSong.id);
        setCurrentSong((current) => ({ ...current, liked: false }));
      } else {
        await musicPlayerService.addLike(currentSong.id);
        setCurrentSong((current) => ({ ...current, liked: true }));
      }
    } catch (error) {
      console.error("Error liking song:", error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex h-full justify-center align-center">
      {/* <AudioVisualizer audio={audioElement} /> */}
      <Card
        isBlurred
        className="border-blue-300 border-2 bg-background/60 dark:bg-default-100/60"
        shadow="lg"
      >
        <CardBody>
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

            <div className="grid col-span-6 md:col-span-8 h-full">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
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
                  className="text-default-900/60 data-[hover]:bg-foreground/10"
                  variant="light"
                  onPress={handleLike}
                >
                  <HeartIcon
                    fill={currentSong.liked ? "currentColor" : "none"}
                  />
                </Button>
              </div>

              <div className="flex flex-col mt-6 gap-1">
                <Slider
                  aria-label="Music progress"
                  classNames={{
                    track: "bg-default-500/30",
                    thumb: "w-5 h-5",
                  }}
                  color="foreground"
                  value={
                    currentSong.duration
                      ? (audioState.currentTime / currentSong.duration) * 100
                      : 0
                  }
                  onChange={(value) => {
                    if (currentSong.duration) {
                      const newTime =
                        ((value as number) / 100) * currentSong.duration;
                      // Check if the new time is not at the end of the song
                      audioElement.currentTime = Math.min(
                        newTime,
                        currentSong.duration - 0.1,
                      );
                    }
                  }}
                  size="sm"
                />
                <div className="flex justify-between">
                  <p className="text-small">
                    {formatTime(audioState.currentTime)}
                  </p>
                  <p className="text-small text-foreground/50">
                    {formatTime(currentSong.duration)}
                  </p>
                </div>
              </div>

              <Controls
                onPlayPause={handlePlayPause}
                onNext={handleNextSong}
                onPrev={handlePrevSong}
                onRepeat={handleClickRepeat}
                onShuffle={handleClickShuffle}
                isPlaying={audioState.isPlaying}
                repeat={audioState.repeat}
                shuffle={audioState.shuffle}
              />

              <div className="flex items-center justify-center gap-2 mt-6">
                <VolumeDownIcon className="text-foreground/80" />
                <Slider
                  aria-label="Volume"
                  size="sm"
                  color="primary"
                  value={audioState.volume * 100}
                  onChange={(value) => handleVolumeChange(Number(value) / 100)}
                />
                <VolumeUpIcon className="text-foreground/80" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
