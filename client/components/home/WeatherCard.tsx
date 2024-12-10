"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Divider } from "@nextui-org/react";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiHumidity,
  WiStrongWind,
} from "react-icons/wi";
import { getWeather } from "@/actions/weather";

interface WeatherCardProps {
  position: {
    latitude: number;
    longitude: number;
  } | null;
}

interface WeatherData {
  temp: number;
  weather: string;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

interface ForecastDay {
  date: string;
  temp: number;
  weather: string;
  icon: string;
}

// Dizionario per le traduzioni
const weatherTranslations: { [key: string]: string } = {
  "clear sky": "Cielo sereno",
  "few clouds": "Poco nuvoloso",
  "scattered clouds": "Nuvole sparse",
  "broken clouds": "Nuvoloso",
  "shower rain": "Rovesci",
  rain: "Pioggia",
  thunderstorm: "Temporale",
  snow: "Neve",
  mist: "Nebbia",
  "overcast clouds": "Molto nuvoloso",
  "light rain": "Pioggia leggera",
  "moderate rain": "Pioggia moderata",
  "heavy rain": "Pioggia intensa",
};

const WeatherCard: React.FC<WeatherCardProps> = ({ position }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!position) return;

      try {
        await getWeather(position).then((data) => {
          setWeather(data.current);
          setForecast(data.forecast);
          setError(data.error);
        });
      } catch (err) {
        setError("Impossibile caricare i dati meteo");
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (weather: string, size: "sm" | "lg" = "lg") => {
    const sizeClass = size === "lg" ? "w-20 h-20" : "w-10 h-10";
    switch (weather.toLowerCase()) {
      case "clear":
        return <WiDaySunny className={`${sizeClass} text-yellow-400`} />;
      case "clouds":
        return <WiCloudy className={`${sizeClass} text-gray-400`} />;
      case "rain":
        return <WiRain className={`${sizeClass} text-blue-400`} />;
      case "snow":
        return <WiSnow className={`${sizeClass} text-blue-200`} />;
      case "thunderstorm":
        return <WiThunderstorm className={`${sizeClass} text-purple-400`} />;
      default:
        return <WiDaySunny className={`${sizeClass} text-yellow-400`} />;
    }
  };

  const translateWeather = (description: string) => {
    return weatherTranslations[description.toLowerCase()] || description;
  };

  if (!position) return null;

  return (
    <Card className="bg-default-100 dark:bg-default-50 shadow-lg">
      <CardBody className="py-5">
        {loading ? (
          <div className="flex justify-center items-center h-[150px]">
            <Spinner color="primary" />
          </div>
        ) : error ? (
          <div className="text-danger text-center">{error}</div>
        ) : weather ? (
          <div className="flex flex-row">
            {/* Current Weather Section - Left Side */}
            <div className="flex-1 flex flex-col items-center md:border-r border-divider">
              <div className="text-xl font-semibold mb-2">
                Oggi a {weather.city}
              </div>
              <div className="mb-2">{getWeatherIcon(weather.weather)}</div>
              <div className="text-4xl font-bold mb-2">{weather.temp}°C</div>
              <div className="text-lg capitalize text-default-600 mb-4">
                {translateWeather(weather.description)}
              </div>
              <div className="flex gap-4 text-default-600">
                <div className="flex items-center gap-1">
                  <WiHumidity className="w-6 h-6" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <WiStrongWind className="w-6 h-6" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Forecast Section - Right Side */}
            <div className="flex-1 mt-4 md:mt-0 md:ml-4">
              <h4 className="text-center mb-4 text-default-600 font-medium">
                Prossimi giorni
              </h4>
              <div className="flex flex-col gap-0">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-2 rounded-lg hover:bg-default-100 transition-colors"
                  >
                    <div className="font-medium min-w-[80px]">{day.date}</div>
                    <div className="flex items-center gap-0">
                      {getWeatherIcon(day.weather, "sm")}
                      <div className="font-bold">{day.temp}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default WeatherCard;
