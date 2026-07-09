"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import type { FilterState } from "@/app/map/page";
import { Company } from "@/lib/mock-data";

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ─── Global Styles for Tooltip ─────────────────────────────────────────── */
const clusterTooltipCSS = `
  .custom-cluster-tooltip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  .custom-cluster-tooltip::before {
    display: none !important;
  }
`;

/* ─── Premium SVG Markers ────────────────────────────────────────────────── */

function createMarkerIcon(company: Company) {
  const { hiring, logo_initial, logo_color } = company;
  const ringColor = hiring ? "#10b981" : "rgba(255,255,255,0.2)";
  const bg_color = logo_color || "#3b82f6";
  
  const html = `
    <div style="
      position: relative; width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        position: absolute; inset: -4px; 
        background: ${hiring ? '#10b98140' : 'transparent'}; 
        border-radius: 12px; filter: blur(4px);
      "></div>
      
      <div style="
        position: relative; z-index: 10; width: 100%; height: 100%;
        background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        border: 2px solid ${ringColor}; overflow: hidden;
      ">
        ${logo_initial ? `
          <img 
            src="https://www.google.com/s2/favicons?sz=128&domain=${company.domain || company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}" 
            alt="${company.name}" 
            style="width: 100%; height: 100%; object-fit: contain; padding: 2px;"
            onerror="this.style.setProperty('display', 'none', 'important'); this.nextElementSibling.style.setProperty('display', 'flex', 'important');"
          />
          <div style="
            width: 100%; height: 100%; 
            display: none; align-items: center; justify-content: center;
            background: ${bg_color}; color: white; 
            font-weight: 800; font-size: 16px; font-family: sans-serif;
          ">${logo_initial}</div>
        ` : `
          <div style="width: 20px; height: 20px; background: ${bg_color}; border-radius: 4px;"></div>
        `}
      </div>
      
      ${hiring ? `
        <div style="
          position: absolute; top: -4px; right: -4px; z-index: 20;
          width: 12px; height: 12px; background: #10b981;
          border: 2px solid #1a1b1e; border-radius: 50%;
        "></div>
      ` : ''}
    </div>
  `;

  return L.divIcon({ html, className: "premium-marker", iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20] });
}

function createClusterIcon(count: number) {
  const size = count > 100 ? 56 : count > 20 ? 46 : 36;
  const color = count > 100 ? "#8b5cf6" : count > 20 ? "#3b82f6" : "#06b6d4";
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px; background:${color}33; border:2px solid ${color}88;
      border-radius:50%; display:flex; align-items:center; justify-content:center;
      font-size:${size > 46 ? 14 : 12}px; font-weight:700; color:white; backdrop-filter:blur(8px);
    ">${count > 999 ? "999+" : count}</div>`,
    className: "custom-cluster-icon", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  });
}

/* ─── Popup HTML ─────────────────────────────────────────────────────────── */

function buildPopupHTML(c: Company) {
  const typeColors: Record<string, string> = { startup: "#3b82f6", product: "#8b5cf6", service: "#06b6d4", mnc: "#f59e0b", unicorn: "#ec4899" };
  const color = typeColors[c.company_type] || "#64748b";
  return `
    <div style="padding:16px;min-width:220px;font-family:'Inter',sans-serif">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:40px;height:40px;border-radius:10px;background:#ffffff;
                    display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
          <img 
            src="https://www.google.com/s2/favicons?sz=128&domain=${c.domain || c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}" 
            alt="${c.name}" 
            style="width: 100%; height: 100%; object-fit: contain; padding: 2px;"
            onerror="this.style.setProperty('display', 'none', 'important'); this.nextElementSibling.style.setProperty('display', 'flex', 'important');"
          />
          <div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;background:${c.logo_color || '#3b82f6'};color:white;font-weight:bold;font-size:18px;">
            ${c.logo_initial}
          </div>
        </div>
        <div>
          <div style="font-weight:700;font-size:15px;color:#f1f5f9;line-height:1.2">${c.name}</div>
          <div style="font-size:11px;text-transform:capitalize;color:${color};
                      background:${color}22;padding:2px 8px;border-radius:20px;
                      display:inline-block;margin-top:2px">${c.company_type}</div>
        </div>
      </div>
      ${c.hiring ? `
        <div style="font-size:11px;color:#22c55e;background:#22c55e22;
                    padding:4px 10px;border-radius:20px;display:inline-flex;
                    align-items:center;gap:4px;margin-bottom:10px">
          <span>●</span> Actively Hiring
        </div>` : ""}
      <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;display:flex;gap:8px">
        <a href="/company/${c.slug}"
           style="flex:1;text-align:center;padding:8px;border-radius:10px;
                  background:${color}33;color:${color};text-decoration:none;
                  font-size:12px;font-weight:600;border:1px solid ${color}44">
          View Profile →
        </a>
        <button class="delete-company-btn" data-id="${c.id}"
                style="padding:8px 12px;border-radius:10px;background:#ef444433;color:#ef4444;
                       border:1px solid #ef444444;cursor:pointer;font-weight:600;font-size:12px;">
          Delete
        </button>
      </div>
    </div>`;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

interface MapViewProps {
  companies: Company[];
  filters: FilterState;
  selectedCompany?: Company | null;
  onDeleteCompany?: (id: string) => void;
}

export default function MapView({ companies, filters, selectedCompany, onDeleteCompany }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const standaloneGroupRef = useRef<L.LayerGroup | null>(null);
  const onDeleteCompanyRef = useRef(onDeleteCompany);

  // Keep ref up to date to avoid map recreation
  useEffect(() => {
    onDeleteCompanyRef.current = onDeleteCompany;
  }, [onDeleteCompany]);

  // Initialize map ONLY ONCE
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20.5937, 78.9629], zoom: 5, zoomControl: false,
      attributionControl: true, maxZoom: 18,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© <a href="https://carto.com/">CARTO</a>', subdomains: "abcd", maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Groups
    const standaloneGroup = L.layerGroup().addTo(map);
    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: (cluster) => createClusterIcon(cluster.getChildCount()),
      showCoverageOnHover: false, maxClusterRadius: 50, spiderfyOnMaxZoom: true,
    });
    clusterGroup.addTo(map);

    // Hover Dock Logic
    clusterGroup.on('clustermouseover', (a: any) => {
      const cluster = a.layer;
      const count = cluster.getChildCount();
      
      if (count <= 10) {
        const children = cluster.getAllChildMarkers();
        const companiesListHtml = children.map((m: any) => {
          const c = m.options.companyData as Company;
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
              <div style="width:24px;height:24px;border-radius:4px;background:#ffffff;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;overflow:hidden;flex-shrink:0;">
                <img src="https://www.google.com/s2/favicons?sz=128&domain=${c.domain || c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}" onerror="this.style.setProperty('display','none','important'); this.nextElementSibling.style.setProperty('display','flex','important');" style="width:100%;height:100%;object-fit:contain;padding:2px;" />
                <div style="display:none;align-items:center;justify-content:center;width:100%;height:100%;background:${c.logo_color || '#3b82f6'};">${c.logo_initial}</div>
              </div>
              <div style="font-size:12px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
                ${c.name}
              </div>
            </div>
          `;
        }).join('');

        const html = `
          <div style="background:rgba(15,15,15,0.95);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;pointer-events:none;box-shadow:0 10px 25px rgba(0,0,0,0.8);min-width:180px;">
            <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-weight:600;text-transform:uppercase;">${count} Companies</div>
            <div style="display:flex;flex-direction:column;gap:2px;">
              ${companiesListHtml}
            </div>
          </div>
        `;

        cluster.bindTooltip(html, {
          direction: 'top', className: 'custom-cluster-tooltip', opacity: 1, offset: [0, -10]
        }).openTooltip();
      }
    });

    clusterGroup.on('clustermouseout', (a: any) => {
      a.layer.unbindTooltip();
    });

    standaloneGroupRef.current = standaloneGroup;
    clusterGroupRef.current = clusterGroup;
    mapRef.current = map;

    // Delete handling
    const handleMapClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const deleteBtn = target.closest('.delete-company-btn');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (id && onDeleteCompanyRef.current) onDeleteCompanyRef.current(id);
      }
    };
    containerRef.current.addEventListener('click', handleMapClick);

    return () => {
      if (containerRef.current) containerRef.current.removeEventListener('click', handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, []); // Empty deps! Fixes the map reset bug.

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    const standaloneGroup = standaloneGroupRef.current;
    if (!map || !clusterGroup || !standaloneGroup) return;

    clusterGroup.clearLayers();
    standaloneGroup.clearLayers();

    const clusterMarkers: L.Marker[] = [];
    const standaloneMarkers: L.Marker[] = [];

    companies.forEach((company) => {
      const marker = L.marker([company.lat, company.lng], {
        icon: createMarkerIcon(company),
        companyData: company // Inject data for hover dock
      } as any).bindPopup(buildPopupHTML(company), { maxWidth: 280, className: "scoutit-popup" });

      if (company.roles_count >= 100) {
        standaloneMarkers.push(marker);
      } else {
        clusterMarkers.push(marker);
      }
    });

    clusterGroup.addLayers(clusterMarkers);
    standaloneMarkers.forEach(marker => standaloneGroup.addLayer(marker));
  }, [companies]);

  // Pan to city
  useEffect(() => {
    if (!filters.city || !mapRef.current) return;
    const cityCoords: Record<string, [number, number]> = {
      Bengaluru: [12.971, 77.594], Noida: [28.535, 77.391], Hyderabad: [17.385, 78.487],
      Pune: [18.520, 73.856], Chennai: [13.082, 80.270], Mumbai: [19.076, 72.877], Gurugram: [28.459, 77.026],
    };
    const coords = cityCoords[filters.city];
    if (coords) mapRef.current.flyTo(coords, 12, { duration: 1.5, easeLinearity: 0.5 });
  }, [filters.city]);

  // Pan to selected company
  useEffect(() => {
    if (!selectedCompany || !mapRef.current) return;
    mapRef.current.flyTo([selectedCompany.lat, selectedCompany.lng], 16, { duration: 1.2, easeLinearity: 0.5 });
  }, [selectedCompany]);

  return (
    <>
      <style>{clusterTooltipCSS}</style>
      <div ref={containerRef} className="w-full h-full" id="scoutit-map" />
    </>
  );
}
