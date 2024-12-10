import { Song } from "@/helpers/types";

export const musicPlayerService = {
  async fetchCurrentSong(): Promise<Song> {
    return await fetchSong("/api/musicplayer/currentsong");
  },

  async fetchNextSong(): Promise<Song> {
    return await fetchSong("/api/musicplayer/nextsong");
  },

  async fetchPrevSong(): Promise<Song> {
    return await fetchSong("/api/musicplayer/prevsong");
  },

  async fetchRandomSong(): Promise<Song> {
    return await fetchSong("/api/musicplayer/randomsong");
  },

  async addLike(songId: string): Promise<void> {
    const response = await fetch("/api/musicplayer/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ songId }),
    });

    if (!response.ok) {
      throw new Error("Failed to add like");
    }
  },

  async removeLike(songId: string): Promise<void> {
    const response = await fetch("/api/musicplayer/like", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ songId }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove like");
    }
  },
};

async function fetchSong(endpoint: string): Promise<Song> {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
    });
    const songData = await response.json();

    return {
      title: songData.title,
      album: songData.album,
      duration: songData.duration,
      cover: "https://nextui.org/images/album-cover.png",
      id: songData._id,
      liked: songData.isLiked,
    };
  } catch (error) {
    console.error("Error fetching song:", error);
    throw error;
  }
}
