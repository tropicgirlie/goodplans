import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Star,
  Ticket,
} from "lucide-react";
import { activityCategories } from "../../shared/recommendations";
import { findVenues } from "../lib/goodPlansApi";

const venues = [
  {
    id: "fumbally", category: "dinner-out",
    name: "The Fumbally",
    address: "Fumbally Lane, Dublin 8",
    kind: "Long-table lunch",
    fit: "Easy for a mixed group",
    color: "coral",
  },
  {
    id: "lighthouse", category: "cinema",
    name: "Light House Cinema",
    address: "Market Square, Smithfield, Dublin 7",
    kind: "Small-screen evening",
    fit: "A good one-to-one plan",
    color: "blue",
  },
  {
    id: "hightlanes", category: "gallery",
    name: "Hugh Lane Gallery",
    address: "Parnell Square North, Dublin 1",
    kind: "Gallery late",
    fit: "Start here, decide later",
    color: "olive",
  },
  {
    id: "howth", category: "outdoor-walk",
    name: "Howth Harbour",
    address: "Howth, Co. Dublin",
    kind: "A day out of town",
    fit: "Best when everyone wants fresh air",
    color: "orange",
  },
];

export default function GoogleMapsExplorer({
  city = "Dublin",
  activity,
  onSelectVenue,
}) {
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);
  const [shortlist, setShortlist] = useState(venues);
  const [source, setSource] = useState("demo");
  const [loadedMap, setLoadedMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setLoadedMap(null);
    setShortlist([]); setSelectedVenue(null);
    const fallback = city.toLowerCase() === "dublin" ? venues.filter(venue => !activity || activityCategories(activity).includes(venue.category)) : [];

    findVenues({ city, activity, limit: 4 })
      .then((result) => {
        if (!active) return;
        const prepared = (result.venues?.length ? result.venues : fallback)
          .slice(0, 4)
          .map((venue, index) => ({
            ...venue,
            ...(venue.venue || {}),
            id: venue.id || `venue-${index}`,
            color:
              venue.color || ["coral", "blue", "olive", "orange"][index % 4],
            kind: venue.kind || "A good local option",
            fit: venue.explanation || venue.fit || "A considered local fit",
          }));
        setShortlist(prepared);
        setSelectedVenue(prepared[0] || null);
        setSource(result.venues?.length ? result.source : "demo");
      })
      .catch(() => {
        if (active) {
          setShortlist(fallback);
          setSelectedVenue(fallback[0] || null);
          setError("We couldn’t refresh venue ideas. Any options shown are an illustrative shortlist.");
          setSource("demo");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, [city, activity]);

  return (
    <section className="maps-section" id="map">
      <div className="maps-intro">
        <p className="eyebrow">where could this happen?</p>
        <h2>
          Let the city
          <br />
          join the plan.
        </h2>
        <p>
          Start with your activity palette, then keep a small shortlist that
          makes sense for the day you actually have.
        </p>
        <span className="maps-note">
          <MapPin /> {city} ideas {activity ? `for ${activity}` : ""} ·{" "}
          {source === "google_places"
            ? "live venue search"
            : "starter shortlist"}
        </span>
      </div>
      {loading && <p role="status">Finding a starter shortlist…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !shortlist.length && <p>No starter venues match this activity in {city} yet. You can choose your own venue in a draft.</p>}
      {selectedVenue && <div className="maps-board">
        <div className="venue-list">
          {shortlist.map((venue, index) => (
            <button
              key={venue.id}
              className={`venue-row ${selectedVenue.id === venue.id ? "active" : ""}`}
              onClick={() => { setSelectedVenue(venue); setLoadedMap(null); }}
            >
              <span className={`venue-number ${venue.color}`}>
                0{index + 1}
              </span>
              <span className="venue-copy">
                <b>{venue.name}</b>
                <small>{venue.kind}</small>
              </span>
              <span className="venue-arrow">
                <ArrowUpRight />
              </span>
            </button>
          ))}
        </div>
        <div className="map-stage">
          {loadedMap === selectedVenue.id ? <iframe
            title={`Google Map for ${selectedVenue.name}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent([selectedVenue.name, selectedVenue.address].filter(Boolean).join(", "))}&z=14&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer"
          /> : <div className="map-placeholder"><MapPin aria-hidden="true" /><p>See {selectedVenue.name} on the map.</p><p className="gp-field-note">Loading this map connects to Google, which receives your IP address and browser information.</p><button className="primary" onClick={() => setLoadedMap(selectedVenue.id)}>Load Google map</button></div>}
          <div className="map-place-card">
            <div className={`place-pin ${selectedVenue.color}`}>
              <MapPin />
            </div>
            <div>
              <span>{selectedVenue.kind}</span>
              <h3>{selectedVenue.name}</h3>
              <p>{selectedVenue.address}</p>
              <b>
                <Star /> {selectedVenue.fit}
              </b>
            </div>
            <button onClick={() => onSelectVenue?.(selectedVenue)}>
              <CalendarDays /> Add to the plan
            </button>
          </div>
        </div>
        <div className="map-footer">
          <span>
            <Ticket /> Starter suggestions · confirm details with the venue.
          </span>
          <a
            href={
              selectedVenue.mapsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([selectedVenue.name, selectedVenue.address].filter(Boolean).join(" "))}`
            }
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <ExternalLink />
          </a>
        </div>
      </div>}
    </section>
  );
}
