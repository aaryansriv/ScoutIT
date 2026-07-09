"use client";

import { usePathname, useRouter } from "next/navigation";
import { Map, Bookmark, BarChart2, GitCompare, Moon, Sun, Home, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { FloatingDock } from "@/components/ui/floating-dock";
import { useState } from "react";
import { CityQuickNav } from "./map/city-quick-nav";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar({ 
  searchBar,
  activeCity,
  onCitySelect
}: { 
  searchBar?: React.ReactNode;
  activeCity?: string;
  onCitySelect?: (city: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showCities, setShowCities] = useState(false);

  const navItems = [
    { href: "/",          label: "Home",          icon: <Home className="w-5 h-5" /> },
    { href: "/bookmarks", label: "Bookmarks",     icon: <Bookmark className="w-5 h-5" /> },
    { href: "/tracker",   label: "Tracker",       icon: <BarChart2 className="w-5 h-5" /> },
    { 
      label: "Cities",       
      icon: <MapPin className="w-5 h-5" />,
      onClick: () => setShowCities(!showCities)
    },
  ];

  const dockItems = navItems.map((item) => ({
    title: item.label,
    icon: item.icon,
    href: item.href,
    onClick: item.onClick,
  }));

  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-full max-w-4xl px-4 pointer-events-none flex flex-col items-center">
      <div className="pointer-events-auto relative">
        <FloatingDock items={dockItems}>
          {searchBar && (
            <div className="mr-4 flex items-center">
              {searchBar}
            </div>
          )}
        </FloatingDock>

        <AnimatePresence>
          {showCities && onCitySelect && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-4 left-1/2 -translate-x-1/2"
            >
              <CityQuickNav 
                activeCity={activeCity || ""} 
                onCitySelect={(city) => {
                  onCitySelect(city);
                  setShowCities(false);
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
