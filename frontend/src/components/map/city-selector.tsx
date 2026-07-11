'use client';

import * as React from 'react';
import { CheckIcon, ChevronsUpDownIcon, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

// Generic city interface
export interface CityOption {
	id: string;
	name: string;
}

// Context for city state management
interface CityContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	selectedCity: CityOption | undefined;
	cities: CityOption[];
	onCitySelect: (city: CityOption) => void;
}

const CityContext = React.createContext<CityContextValue | null>(null);

function useCityContext() {
	const context = React.useContext(CityContext);
	if (!context) {
		throw new Error('City components must be used within CityProvider');
	}
	return context;
}

// Main provider component
interface CityProviderProps {
	children: React.ReactNode;
	cities: CityOption[];
	selectedCityId?: string;
	onCityChange?: (city: CityOption) => void;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

function CityProvider({
	children,
	cities,
	selectedCityId,
	onCityChange,
	open: controlledOpen,
	onOpenChange,
}: CityProviderProps) {
	const [internalOpen, setInternalOpen] = React.useState(false);

	const open = controlledOpen ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	const selectedCity = React.useMemo(() => {
		if (!selectedCityId) return cities[0];
		return (
			cities.find((c) => c.id === selectedCityId) || cities[0]
		);
	}, [cities, selectedCityId]);

	const handleCitySelect = React.useCallback(
		(city: CityOption) => {
			onCityChange?.(city);
			setOpen(false);
		},
		[onCityChange, setOpen],
	);

	const value: CityContextValue = {
		open,
		setOpen,
		selectedCity,
		cities,
		onCitySelect: handleCitySelect,
	};

	return (
		<CityContext.Provider value={value}>
			<Popover open={open} onOpenChange={setOpen}>
				{children}
			</Popover>
		</CityContext.Provider>
	);
}

// Trigger component
interface CityTriggerProps extends Omit<React.ComponentProps<'button'>, 'title'> {
    titlePrefix?: string;
}

function CityTrigger({
	className,
    titlePrefix = "Companies in",
	...props
}: CityTriggerProps) {
	const { open, selectedCity } = useCityContext();

	if (!selectedCity) return null;

	return (
		<PopoverTrigger
			data-state={open ? 'open' : 'closed'}
			className={cn(
				'flex items-center gap-2 group cursor-pointer border-none bg-transparent',
				className,
			)}
			{...props as any}
		>
			<h2 className="text-xl font-bold text-white tracking-tight">{titlePrefix}</h2>
            <div className="flex items-center gap-1.5 transition-opacity hover:opacity-80">
                <span className="text-xl font-bold text-primary truncate">
                    {selectedCity.name}
                </span>
                <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
		</PopoverTrigger>
	);
}

// Content component
interface CityContentProps extends React.ComponentProps<typeof PopoverContent> {
	title?: string;
	searchable?: boolean;
}

function CityContent({
	className,
	children,
	title = 'Cities',
	searchable = true,
	...props
}: CityContentProps) {
	const {
		cities,
		selectedCity,
		onCitySelect,
	} = useCityContext();

	const [searchQuery, setSearchQuery] = React.useState('');

	const filteredCities = React.useMemo(() => {
		if (!searchQuery) return cities;
		return cities.filter((c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [cities, searchQuery]);

	return (
		<PopoverContent
			className={cn('p-0 w-[240px] bg-[#181818] border-white/10 rounded-xl overflow-hidden shadow-2xl', className)}
			align={props.align || 'start'}
            sideOffset={8}
			{...props}
		>
			<div className="border-b border-white/5 px-3 py-2.5">
				<p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{title}</p>
			</div>

			{searchable && (
				<div className="border-b border-white/5 px-3 py-2">
					<input
						type="text"
						placeholder="Search cities..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full border-none bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
					/>
				</div>
			)}

			<div className="max-h-[300px] overflow-y-auto custom-scrollbar">
				{filteredCities.length === 0 ? (
					<div className="text-muted-foreground px-3 py-4 text-center text-sm">
						No cities found
					</div>
				) : (
					<div className="p-1">
						{filteredCities.map((city) => {
							const isSelected = selectedCity && selectedCity.id === city.id;

							return (
								<button
									key={city.id}
									onClick={() => onCitySelect(city)}
									className={cn(
										'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm',
										'hover:bg-white/10 text-white/80 hover:text-white transition-colors',
										'focus:outline-none focus:bg-white/10',
										isSelected && 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary',
									)}
								>
                                    <div className={cn(
                                        "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                                        isSelected ? "bg-primary/20" : "bg-white/5"
                                    )}>
                                        <MapPin className={cn("w-3.5 h-3.5", isSelected ? "text-primary" : "text-muted-foreground")} />
                                    </div>
									<div className="flex min-w-0 flex-1 flex-col items-start">
				                        <span className={cn("truncate font-medium", isSelected ? "text-primary" : "text-white")}>{city.name}</span>
			                        </div>
									{isSelected && <CheckIcon className="ml-auto h-4 w-4 text-primary" />}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{children && (
				<>
					<div className="border-t border-white/5" />
					<div className="p-1">{children}</div>
				</>
			)}
		</PopoverContent>
	);
}

export { CityProvider as CitySelector, CityTrigger, CityContent };
