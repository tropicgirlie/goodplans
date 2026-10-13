import { cityKey } from './brazil.js';
export const SPAIN_CITIES = [
  ['Madrid', 'Europe/Madrid'], ['Barcelona', 'Europe/Madrid'], ['Valencia', 'Europe/Madrid'],
  ['Sevilla', 'Europe/Madrid'], ['Bilbao', 'Europe/Madrid'], ['Málaga', 'Europe/Madrid'],
  ['Zaragoza', 'Europe/Madrid'], ['Granada', 'Europe/Madrid'],
  ['Las Palmas de Gran Canaria', 'Atlantic/Canary'], ['Santa Cruz de Tenerife', 'Atlantic/Canary'],
].map(([name, timezone]) => ({name, timezone}));
export const spainCity = value => SPAIN_CITIES.find(city => cityKey(city.name) === cityKey(value));
export const SPAIN_TIMEZONES = [...new Set(SPAIN_CITIES.map(city => city.timezone))];
// Evergreen visit ideas. Dates, availability and prices belong to the source.
export const SPAIN_PLACES = [
  {id:'es-ciutadella',city:'Barcelona',category:'outdoor-walk',name:'A walk in the Parc de la Ciutadella',venue:{name:'Parc de la Ciutadella',address:'Barcelona'},url:'https://www.barcelona.cat/es/que-hacer-en-bcn/parques-y-jardines/parc-de-la-ciutadella-92086011921',description:'Plan a walk at your own pace. Check park guidance and the weather before heading out.'},
];
export function spainVenues(city, categories = []) {
  return SPAIN_PLACES.filter(place => cityKey(place.city) === cityKey(city) && (!categories.length || categories.includes(place.category))).map(place => ({...place,iconName:place.category,kind:place.name,explanation:'Check the programme, availability, price and accessibility with the official source.'}));
}
export const SPAIN_FRIENDS = [
  {id:'f1',name:'Lucía',likes:'café, acuarela',avatar:null},
  {id:'f2',name:'Paula',likes:'cerámica, cena',avatar:null},
  {id:'f3',name:'Alba',likes:'cine, senderismo',avatar:null},
  {id:'f4',name:'Elena',likes:'museo, música',avatar:null},
  {id:'f5',name:'Sara',likes:'juegos de mesa, retiros',avatar:null},
];
