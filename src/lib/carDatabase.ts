// Car database with automatic size categorization for CleanFoss

export interface CarModel {
  id: string;
  brand: string;
  model: string;
  size: 'mini' | 'mellem' | 'sedan' | 'stationcar' | 'suv' | 'mpv' | 'varevogn';
  searchTerms: string[]; // For better search matching
}

export const CAR_DATABASE: CarModel[] = [
  // MINI BILER (0.8x pris)
  { id: 'toyota-aygo', brand: 'Toyota', model: 'Aygo', size: 'mini', searchTerms: ['toyota', 'aygo'] },
  { id: 'vw-up', brand: 'Volkswagen', model: 'Up!', size: 'mini', searchTerms: ['volkswagen', 'vw', 'up'] },
  { id: 'peugeot-108', brand: 'Peugeot', model: '108', size: 'mini', searchTerms: ['peugeot', '108'] },
  { id: 'citroen-c1', brand: 'Citroën', model: 'C1', size: 'mini', searchTerms: ['citroen', 'citroën', 'c1'] },
  { id: 'fiat-500', brand: 'Fiat', model: '500', size: 'mini', searchTerms: ['fiat', '500'] },
  { id: 'smart-fortwo', brand: 'Smart', model: 'ForTwo', size: 'mini', searchTerms: ['smart', 'fortwo'] },
  { id: 'kia-picanto', brand: 'Kia', model: 'Picanto', size: 'mini', searchTerms: ['kia', 'picanto'] },
  { id: 'hyundai-i10', brand: 'Hyundai', model: 'i10', size: 'mini', searchTerms: ['hyundai', 'i10'] },

  // MELLEM BILER (1.0x pris)
  { id: 'vw-golf', brand: 'Volkswagen', model: 'Golf', size: 'mellem', searchTerms: ['volkswagen', 'vw', 'golf'] },
  { id: 'ford-focus', brand: 'Ford', model: 'Focus', size: 'mellem', searchTerms: ['ford', 'focus'] },
  { id: 'opel-astra', brand: 'Opel', model: 'Astra', size: 'mellem', searchTerms: ['opel', 'astra'] },
  { id: 'toyota-corolla', brand: 'Toyota', model: 'Corolla', size: 'mellem', searchTerms: ['toyota', 'corolla'] },
  { id: 'nissan-leaf', brand: 'Nissan', model: 'Leaf', size: 'mellem', searchTerms: ['nissan', 'leaf'] },
  { id: 'peugeot-308', brand: 'Peugeot', model: '308', size: 'mellem', searchTerms: ['peugeot', '308'] },
  { id: 'renault-megane', brand: 'Renault', model: 'Mégane', size: 'mellem', searchTerms: ['renault', 'megane', 'mégane'] },
  { id: 'seat-leon', brand: 'Seat', model: 'Leon', size: 'mellem', searchTerms: ['seat', 'leon'] },
  { id: 'skoda-octavia', brand: 'Škoda', model: 'Octavia', size: 'mellem', searchTerms: ['skoda', 'škoda', 'octavia'] },
  { id: 'honda-civic', brand: 'Honda', model: 'Civic', size: 'mellem', searchTerms: ['honda', 'civic'] },
  { id: 'mazda-3', brand: 'Mazda', model: '3', size: 'mellem', searchTerms: ['mazda', '3', 'mazda3'] },
  { id: 'kia-ceed', brand: 'Kia', model: 'Ceed', size: 'mellem', searchTerms: ['kia', 'ceed'] },
  { id: 'hyundai-i30', brand: 'Hyundai', model: 'i30', size: 'mellem', searchTerms: ['hyundai', 'i30'] },

  // SEDAN BILER (1.1x pris)
  { id: 'vw-passat', brand: 'Volkswagen', model: 'Passat', size: 'sedan', searchTerms: ['volkswagen', 'vw', 'passat'] },
  { id: 'audi-a4', brand: 'Audi', model: 'A4', size: 'sedan', searchTerms: ['audi', 'a4'] },
  { id: 'audi-a6', brand: 'Audi', model: 'A6', size: 'sedan', searchTerms: ['audi', 'a6'] },
  { id: 'bmw-3-series', brand: 'BMW', model: '3-serie', size: 'sedan', searchTerms: ['bmw', '3-serie', '3 serie', '320', '330'] },
  { id: 'bmw-5-series', brand: 'BMW', model: '5-serie', size: 'sedan', searchTerms: ['bmw', '5-serie', '5 serie', '520', '530'] },
  { id: 'mercedes-c-class', brand: 'Mercedes-Benz', model: 'C-Klasse', size: 'sedan', searchTerms: ['mercedes', 'mercedes-benz', 'c-klasse', 'c klasse', 'c200', 'c220'] },
  { id: 'mercedes-e-class', brand: 'Mercedes-Benz', model: 'E-Klasse', size: 'sedan', searchTerms: ['mercedes', 'mercedes-benz', 'e-klasse', 'e klasse', 'e200', 'e220'] },
  { id: 'ford-mondeo', brand: 'Ford', model: 'Mondeo', size: 'sedan', searchTerms: ['ford', 'mondeo'] },
  { id: 'toyota-camry', brand: 'Toyota', model: 'Camry', size: 'sedan', searchTerms: ['toyota', 'camry'] },
  { id: 'volvo-s60', brand: 'Volvo', model: 'S60', size: 'sedan', searchTerms: ['volvo', 's60'] },
  { id: 'volvo-s90', brand: 'Volvo', model: 'S90', size: 'sedan', searchTerms: ['volvo', 's90'] },
  { id: 'tesla-model-3', brand: 'Tesla', model: 'Model 3', size: 'sedan', searchTerms: ['tesla', 'model 3', 'model3'] },

  // STATIONCAR (1.2x pris)
  { id: 'vw-passat-variant', brand: 'Volkswagen', model: 'Passat Variant', size: 'stationcar', searchTerms: ['volkswagen', 'vw', 'passat', 'variant'] },
  { id: 'audi-a4-avant', brand: 'Audi', model: 'A4 Avant', size: 'stationcar', searchTerms: ['audi', 'a4', 'avant'] },
  { id: 'audi-a6-avant', brand: 'Audi', model: 'A6 Avant', size: 'stationcar', searchTerms: ['audi', 'a6', 'avant'] },
  { id: 'bmw-3-touring', brand: 'BMW', model: '3-serie Touring', size: 'stationcar', searchTerms: ['bmw', '3-serie', 'touring', '320', '330'] },
  { id: 'bmw-5-touring', brand: 'BMW', model: '5-serie Touring', size: 'stationcar', searchTerms: ['bmw', '5-serie', 'touring', '520', '530'] },
  { id: 'mercedes-c-estate', brand: 'Mercedes-Benz', model: 'C-Klasse Estate', size: 'stationcar', searchTerms: ['mercedes', 'c-klasse', 'estate'] },
  { id: 'mercedes-e-estate', brand: 'Mercedes-Benz', model: 'E-Klasse Estate', size: 'stationcar', searchTerms: ['mercedes', 'e-klasse', 'estate'] },
  { id: 'volvo-v60', brand: 'Volvo', model: 'V60', size: 'stationcar', searchTerms: ['volvo', 'v60'] },
  { id: 'volvo-v70', brand: 'Volvo', model: 'V70', size: 'stationcar', searchTerms: ['volvo', 'v70'] },
  { id: 'volvo-v90', brand: 'Volvo', model: 'V90', size: 'stationcar', searchTerms: ['volvo', 'v90'] },
  { id: 'skoda-octavia-combi', brand: 'Škoda', model: 'Octavia Combi', size: 'stationcar', searchTerms: ['skoda', 'škoda', 'octavia', 'combi'] },
  { id: 'ford-focus-stationcar', brand: 'Ford', model: 'Focus Stationcar', size: 'stationcar', searchTerms: ['ford', 'focus', 'stationcar'] },

  // SUV (1.3x pris)
  { id: 'audi-q3', brand: 'Audi', model: 'Q3', size: 'suv', searchTerms: ['audi', 'q3'] },
  { id: 'audi-q5', brand: 'Audi', model: 'Q5', size: 'suv', searchTerms: ['audi', 'q5'] },
  { id: 'audi-q7', brand: 'Audi', model: 'Q7', size: 'suv', searchTerms: ['audi', 'q7'] },
  { id: 'bmw-x1', brand: 'BMW', model: 'X1', size: 'suv', searchTerms: ['bmw', 'x1'] },
  { id: 'bmw-x3', brand: 'BMW', model: 'X3', size: 'suv', searchTerms: ['bmw', 'x3'] },
  { id: 'bmw-x5', brand: 'BMW', model: 'X5', size: 'suv', searchTerms: ['bmw', 'x5'] },
  { id: 'mercedes-gla', brand: 'Mercedes-Benz', model: 'GLA', size: 'suv', searchTerms: ['mercedes', 'gla'] },
  { id: 'mercedes-glc', brand: 'Mercedes-Benz', model: 'GLC', size: 'suv', searchTerms: ['mercedes', 'glc'] },
  { id: 'mercedes-gle', brand: 'Mercedes-Benz', model: 'GLE', size: 'suv', searchTerms: ['mercedes', 'gle'] },
  { id: 'volvo-xc40', brand: 'Volvo', model: 'XC40', size: 'suv', searchTerms: ['volvo', 'xc40'] },
  { id: 'volvo-xc60', brand: 'Volvo', model: 'XC60', size: 'suv', searchTerms: ['volvo', 'xc60'] },
  { id: 'volvo-xc90', brand: 'Volvo', model: 'XC90', size: 'suv', searchTerms: ['volvo', 'xc90'] },
  { id: 'tesla-model-y', brand: 'Tesla', model: 'Model Y', size: 'suv', searchTerms: ['tesla', 'model y', 'modely'] },
  { id: 'toyota-rav4', brand: 'Toyota', model: 'RAV4', size: 'suv', searchTerms: ['toyota', 'rav4', 'rav 4'] },
  { id: 'nissan-qashqai', brand: 'Nissan', model: 'Qashqai', size: 'suv', searchTerms: ['nissan', 'qashqai'] },
  { id: 'mazda-cx5', brand: 'Mazda', model: 'CX-5', size: 'suv', searchTerms: ['mazda', 'cx5', 'cx-5'] },
  { id: 'hyundai-tucson', brand: 'Hyundai', model: 'Tucson', size: 'suv', searchTerms: ['hyundai', 'tucson'] },
  { id: 'kia-sportage', brand: 'Kia', model: 'Sportage', size: 'suv', searchTerms: ['kia', 'sportage'] },

  // MPV/MINIVAN (1.3x pris)
  { id: 'vw-sharan', brand: 'Volkswagen', model: 'Sharan', size: 'mpv', searchTerms: ['volkswagen', 'vw', 'sharan'] },
  { id: 'ford-galaxy', brand: 'Ford', model: 'Galaxy', size: 'mpv', searchTerms: ['ford', 'galaxy'] },
  { id: 'seat-alhambra', brand: 'Seat', model: 'Alhambra', size: 'mpv', searchTerms: ['seat', 'alhambra'] },
  { id: 'toyota-verso', brand: 'Toyota', model: 'Verso', size: 'mpv', searchTerms: ['toyota', 'verso'] },
  { id: 'opel-zafira', brand: 'Opel', model: 'Zafira', size: 'mpv', searchTerms: ['opel', 'zafira'] },
  { id: 'citroen-c4-picasso', brand: 'Citroën', model: 'C4 Picasso', size: 'mpv', searchTerms: ['citroen', 'citroën', 'c4', 'picasso'] },
  { id: 'peugeot-5008', brand: 'Peugeot', model: '5008', size: 'mpv', searchTerms: ['peugeot', '5008'] },

  // VAREVOGN (1.5x pris)
  { id: 'ford-transit', brand: 'Ford', model: 'Transit', size: 'varevogn', searchTerms: ['ford', 'transit'] },
  { id: 'mercedes-sprinter', brand: 'Mercedes-Benz', model: 'Sprinter', size: 'varevogn', searchTerms: ['mercedes', 'sprinter'] },
  { id: 'vw-crafter', brand: 'Volkswagen', model: 'Crafter', size: 'varevogn', searchTerms: ['volkswagen', 'vw', 'crafter'] },
  { id: 'iveco-daily', brand: 'Iveco', model: 'Daily', size: 'varevogn', searchTerms: ['iveco', 'daily'] },
  { id: 'renault-master', brand: 'Renault', model: 'Master', size: 'varevogn', searchTerms: ['renault', 'master'] },
  { id: 'peugeot-boxer', brand: 'Peugeot', model: 'Boxer', size: 'varevogn', searchTerms: ['peugeot', 'boxer'] },
  { id: 'citroen-jumper', brand: 'Citroën', model: 'Jumper', size: 'varevogn', searchTerms: ['citroen', 'citroën', 'jumper'] },
  { id: 'fiat-ducato', brand: 'Fiat', model: 'Ducato', size: 'varevogn', searchTerms: ['fiat', 'ducato'] },
];

/**
 * Search for cars based on user input
 */
export function searchCars(query: string, limit: number = 10): CarModel[] {
  if (!query || query.length < 2) return [];
  
  const searchQuery = query.toLowerCase().trim();
  
  // Search in search terms for exact matches
  const results = CAR_DATABASE.filter(car => {
    return car.searchTerms.some(term => 
      term.toLowerCase().includes(searchQuery)
    );
  });
  
  // Sort results by relevance (exact brand/model matches first)
  const sortedResults = results.sort((a, b) => {
    const aExactBrandMatch = a.brand.toLowerCase().startsWith(searchQuery);
    const bExactBrandMatch = b.brand.toLowerCase().startsWith(searchQuery);
    const aExactModelMatch = a.model.toLowerCase().startsWith(searchQuery);
    const bExactModelMatch = b.model.toLowerCase().startsWith(searchQuery);
    
    if (aExactBrandMatch && !bExactBrandMatch) return -1;
    if (!aExactBrandMatch && bExactBrandMatch) return 1;
    if (aExactModelMatch && !bExactModelMatch) return -1;
    if (!aExactModelMatch && bExactModelMatch) return 1;
    
    // Alphabetical sort as fallback
    return a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model);
  });
  
  return sortedResults.slice(0, limit);
}

/**
 * Get car by ID
 */
export function getCarById(id: string): CarModel | undefined {
  return CAR_DATABASE.find(car => car.id === id);
}

/**
 * Get all available brands
 */
export function getAllBrands(): string[] {
  const brandSet = new Set(CAR_DATABASE.map(car => car.brand));
  const brands = Array.from(brandSet);
  return brands.sort();
}

/**
 * Get cars by brand
 */
export function getCarsByBrand(brand: string): CarModel[] {
  return CAR_DATABASE.filter(car => 
    car.brand.toLowerCase() === brand.toLowerCase()
  );
}
