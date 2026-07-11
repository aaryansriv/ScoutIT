import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyLogoProps {
  url?: string;
  fallbackInitial?: string;
  fallbackColor?: string;
  name: string;
  className?: string;
  iconClassName?: string;
}

export function CompanyLogo({ 
  url, 
  fallbackInitial, 
  fallbackColor = "#3b82f6", 
  name, 
  className,
  iconClassName
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);

  const showFallback = hasError || !url;

  if (showFallback) {
    return (
      <div 
        className={cn("flex items-center justify-center font-bold text-white", className)}
        style={{ backgroundColor: fallbackColor }}
      >
        {fallbackInitial || <Building2 className={cn("w-1/2 h-1/2 opacity-80", iconClassName)} />}
      </div>
    );
  }

  return (
    <img 
      src={url}
      alt={name}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
