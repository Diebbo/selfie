import { useState, useEffect } from "react";

interface Position {
  latitude: number;
  longitude: number;
}

export const useGeolocation = () => {
    return navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setError(`Error: ${error.message}`);
        // If GPS is OFF set Default Position to Bologna
        setPosition({
          latitude: 44.494887,
          longitude: 11.3426163,
        });
      },
  );
};
