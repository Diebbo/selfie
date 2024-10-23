import { useState, useEffect } from "react";

interface Position {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setError(`Error: ${error.message}`);
      },
    );
  }, []);

  return { position, error };
};
