// Evergreen ideas, not dated event listings. Check each venue's official programme.
export const BRAZIL_CITIES = [
  ['São Paulo', 'SP', 'America/Sao_Paulo'], ['Rio de Janeiro', 'RJ', 'America/Sao_Paulo'],
  ['Belo Horizonte', 'MG', 'America/Sao_Paulo'], ['Brasília', 'DF', 'America/Sao_Paulo'],
  ['Curitiba', 'PR', 'America/Sao_Paulo'], ['Porto Alegre', 'RS', 'America/Sao_Paulo'],
  ['Salvador', 'BA', 'America/Bahia'], ['Recife', 'PE', 'America/Recife'],
  ['Fortaleza', 'CE', 'America/Fortaleza'], ['Belém', 'PA', 'America/Belem'],
  ['Manaus', 'AM', 'America/Manaus'], ['Cuiabá', 'MT', 'America/Cuiaba'],
  ['Rio Branco', 'AC', 'America/Rio_Branco'], ['Fernando de Noronha', 'PE', 'America/Noronha'],
].map(([name, state, timezone]) => ({ name, state, timezone }));
export const cityKey = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const brazilCity = value => BRAZIL_CITIES.find(city => cityKey(city.name) === cityKey(value));
export const BRAZIL_TIMEZONES = [...new Set(BRAZIL_CITIES.map(city => city.timezone))];
export const BRAZIL_PLACES = [
  {id:'br-masp',city:'São Paulo',category:'gallery',name:"Art and conversation at MASP",venue:{name:'MASP',address:'Avenida Paulista, São Paulo · SP'},url:'https://masp.org.br/',description:"Choose an exhibition and leave time to chat afterwards. Check tickets and the programme on the official website."},
  {id:'br-ibirapuera',city:'São Paulo',category:'outdoor-walk',name:"A walk in Ibirapuera",venue:{name:'Parque Ibirapuera',address:'São Paulo · SP'},url:'https://prefeitura.sp.gov.br/web/meio_ambiente/w/parques/regiao_sul/14062',description:"Plan a walk at your own pace. Check park guidance and the weather before heading out."},
  {id:'br-sesc',city:'São Paulo',category:'pottery-workshop',name:"A creative activity at Sesc",venue:{name:'Sesc São Paulo',address:"Choose a location in the city of São Paulo"},url:'https://www.sescsp.org.br/programacao/',description:"Browse the Sesc programme and choose a creative activity. Confirm the location, date, availability, price and registration before making a plan."},
  {id:'br-pinacoteca',city:'São Paulo',category:'gallery',name:"An afternoon at the Pinacoteca",venue:{name:'Pinacoteca de São Paulo',address:'São Paulo · SP'},url:'https://pinacoteca.org.br/visita/planeje-sua-visita/',description:"Choose the building and exhibition before meeting. Check tickets and visitor information with the official source."},
];
export function brazilVenues(city, categories = []) {
  return BRAZIL_PLACES.filter(place => cityKey(place.city) === cityKey(city) && (!categories.length || categories.includes(place.category))).map(place => ({...place,iconName:place.category,kind:place.name,explanation:"Check the programme, availability, price and accessibility with the official source."}));
}
export const BRAZIL_FRIENDS = [
  {id:'f1',name:'Ana',interests:['Café na padaria','Aquarela'],likes:'café, aquarela',avatar:null},
  {id:'f2',name:'Camila',interests:['Jantar com amigos','Aulas criativas'],likes:'jantar, aquarela, cerâmica',avatar:null},
  {id:'f3',name:'Joana',interests:['Cinema','Passeio no parque'],likes:'cinema, caminhada',avatar:null},
  {id:'f4',name:'Beatriz',interests:['Exposições','Música ao vivo'],likes:'exposição, música ao vivo',avatar:null},
  {id:'f5',name:'Mariana',interests:['Jogos de tabuleiro','Bem-estar'],likes:'jogos de tabuleiro, bem-estar',avatar:null},
];
