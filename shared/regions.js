import { BRAZIL_CITIES, brazilCity } from './brazil.js';
import { SPAIN_CITIES, spainCity } from './spain.js';
export const REGIONS = {
  IE: {name:'Ireland', city:'Dublin', currency:'EUR', timezone:'Europe/Dublin', timezones:['Europe/Dublin'], cities:['Dublin','Cork','Galway'].map(name=>({name,timezone:'Europe/Dublin'}))},
  BR: {name:'Brazil', city:'São Paulo', currency:'BRL', timezone:'America/Sao_Paulo', timezones:['America/Sao_Paulo'], cities:BRAZIL_CITIES.filter(city=>city.name==='São Paulo')},
  ES: {name:'Spain', city:'Barcelona', currency:'EUR', timezone:'Europe/Madrid', timezones:['Europe/Madrid'], cities:SPAIN_CITIES.filter(city=>city.name==='Barcelona')},
};
export function regionalCity(country, city) {
  return country==='BR' ? brazilCity(city) : country==='ES' ? spainCity(city) : REGIONS.IE.cities.find(item=>item.name.toLowerCase()===String(city).toLowerCase());
}
