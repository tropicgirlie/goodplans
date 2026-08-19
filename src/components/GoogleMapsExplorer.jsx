import { useState } from 'react';
import { ArrowUpRight, CalendarDays, ExternalLink, MapPin, Star, Ticket } from 'lucide-react';

const venues = [
  { id: 'fumbally', name: 'The Fumbally', address: 'Fumbally Lane, Dublin 8', kind: 'Long-table lunch', fit: 'Easy for a mixed group', color: 'coral' },
  { id: 'lighthouse', name: 'Light House Cinema', address: 'Market Square, Smithfield, Dublin 7', kind: 'Small-screen evening', fit: 'A good one-to-one plan', color: 'blue' },
  { id: 'hightlanes', name: 'Hugh Lane Gallery', address: 'Parnell Square North, Dublin 1', kind: 'Gallery late', fit: 'Start here, decide later', color: 'olive' },
  { id: 'howth', name: 'Howth Harbour', address: 'Howth, Co. Dublin', kind: 'A day out of town', fit: 'Best when everyone wants fresh air', color: 'orange' },
];

export default function GoogleMapsExplorer({ city = 'Dublin', activity, onSelectVenue }) {
  const [selectedVenue, setSelectedVenue] = useState(venues[0]);

  return (
    <section className="maps-section" id="map">
      <div className="maps-intro">
        <p className="eyebrow">where could this happen?</p>
        <h2>Let the city<br />join the plan.</h2>
        <p>Start with your activity palette, then keep a small shortlist that makes sense for the day you actually have.</p>
        <span className="maps-note"><MapPin /> {city} ideas {activity ? `for ${activity}` : ''}, powered by Google Maps</span>
      </div>
      <div className="maps-board">
        <div className="venue-list">
          {venues.map((venue, index) => (
            <button key={venue.id} className={`venue-row ${selectedVenue.id === venue.id ? 'active' : ''}`} onClick={() => setSelectedVenue(venue)}>
              <span className={`venue-number ${venue.color}`}>0{index + 1}</span>
              <span className="venue-copy"><b>{venue.name}</b><small>{venue.kind}</small></span>
              <span className="venue-arrow"><ArrowUpRight /></span>
            </button>
          ))}
        </div>
        <div className="map-stage">
          <iframe
            title={`Google Map for ${selectedVenue.name}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${selectedVenue.name}, ${selectedVenue.address}`)}&z=14&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-place-card">
            <div className={`place-pin ${selectedVenue.color}`}><MapPin /></div>
            <div><span>{selectedVenue.kind}</span><h3>{selectedVenue.name}</h3><p>{selectedVenue.address}</p><b><Star /> {selectedVenue.fit}</b></div>
            <button onClick={() => onSelectVenue?.(selectedVenue)}><CalendarDays /> Add to the plan</button>
          </div>
        </div>
        <div className="map-footer"><span><Ticket /> Suggestions matched to the pace of your group.</span><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedVenue.name} ${selectedVenue.address}`)}`} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink /></a></div>
      </div>
    </section>
  );
}
