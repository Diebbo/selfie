"use server";
export async function getWeather(position: {
  latitude: number;
  longitude: number;
}) {
  const API_KEY = process.env.WEATHER_API;

  const currentWeatherResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${position.latitude}&lon=${position.longitude}&units=metric&appid=${API_KEY}&lang=it`,
  );

  // Fetch 5-day forecast
  const forecastResponse = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${position.latitude}&lon=${position.longitude}&units=metric&appid=${API_KEY}&lang=it`,
  );

  if (!currentWeatherResponse.ok || !forecastResponse.ok) {
    return {
      current: null,
      forecast: null,
      error: "Errore nel recupero dei dati meteo",
    };
  }

  const currentData = await currentWeatherResponse.json();
  const forecastData = await forecastResponse.json();

  return {
    current: {
      temp: Math.round(currentData.main.temp),
      weather: currentData.weather[0].main,
      description: currentData.weather[0].description,
      icon: currentData.weather[0].icon,
      city: currentData.name,
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6),
    },
    forecast: forecastData.list
      .filter((reading: any, index: number) => index % 8 === 0) // Get one reading per day
      .slice(0, 5) // Get next 4 days
      .map((reading: any) => ({
        date: new Date(reading.dt * 1000).toLocaleDateString("it-IT", {
          weekday: "short",
        }),
        temp: Math.round(reading.main.temp),
        weather: reading.weather[0].main,
        icon: reading.weather[0].icon,
      })),
    error: null,
  };
}
