"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityQuickNavProps {
  activeCity: string;
  onCitySelect: (city: string) => void;
}

const TOP_CITIES = [
  "Bengaluru",
  "Noida",
  "Hyderabad",
  "Pune",
  "Gurugram",
  "Mumbai",
  "Chennai",
];

export function CityQuickNav({ activeCity, onCitySelect }: CityQuickNavProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 glass-dark rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none">
      <div className="pl-3 pr-2 flex items-center justify-center border-r border-white/10">
        <MapPin className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1.5 px-1">
        {TOP_CITIES.map((city) => {
          const isActive = activeCity === city;
          return (
            <motion.button
              key={city}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCitySelect(isActive ? "" : city)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-transparent"
              )}
            >
              {city}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
