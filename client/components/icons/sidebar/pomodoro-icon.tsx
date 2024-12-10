import React from "react";

export const PomodoroIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#969696"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cerchio esterno */}
      <circle cx="12" cy="12" r="10" />
      
      {/* Lancetta */}
      <path d="M12 6v6l4 2" />
    </svg>
  );
};
