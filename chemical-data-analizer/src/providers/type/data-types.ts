export interface Element{
    name:string;
    unit:string;
}
export interface Sample{
    date:string;
    machine:string;
    values: number[];
    unit?:string;
    component?:string;
    zone?:string;
    country?:string;
    model?:string;
    specialValues?: Record<string, number>;
}
export interface ChemicalData{
    elements: Element[];
    samples:Sample[];
}
export interface ElementRanges{
    optimal:[number, number];
    warning:[number, number];
}
export const OIL_ANALYSIS_RANGES: Record<string, ElementRanges> = {

    Fe: { optimal: [0, 30], warning: [30, 100] },     
    Cu: { optimal: [0, 20], warning: [20, 50] },      
    Al: { optimal: [0, 15], warning: [15, 40] },      
    Pb: { optimal: [0, 10], warning: [10, 30] },     
    Cr: { optimal: [0, 5],  warning: [5, 15] },       
    Sn: { optimal: [0, 5],  warning: [5, 15] },      
    Ni: { optimal: [0, 5],  warning: [5, 15] },      
    Ag: { optimal: [0, 3],  warning: [3, 10] },      
    Ti: { optimal: [0, 3],  warning: [3, 10] },       
    V:  { optimal: [0, 3],  warning: [3, 10] },       
    Mn: { optimal: [0, 5],  warning: [5, 20] },       
    Cd: { optimal: [0, 1],  warning: [1, 3] },       
    Sb: { optimal: [0, 5],  warning: [5, 15] },      
    Li: { optimal: [0, 2],  warning: [2, 5] },        
    Sr: { optimal: [0, 10], warning: [10, 30] },
    W:  { optimal: [0, 1],   warning: [1, 3] },      
    Co: { optimal: [0, 3],   warning: [3, 10] },    
    Ga: { optimal: [0, 1],   warning: [1, 3] },     
    Y:  { optimal: [0, 1],   warning: [1, 3] },      
    Zn: { optimal: [0, 1_000], warning: [1_000, 1_500] }, 
    P:  { optimal: [0, 1_000], warning: [1_000, 1_500] },
    Ca: { optimal: [0, 3_000], warning: [3_000, 4_000] }, 
    Mg: { optimal: [0, 500],   warning: [500, 800] },     
    Ba: { optimal: [0, 500],   warning: [500, 800] },    
    B:  { optimal: [0, 20],    warning: [20, 50] },      
    Mo: { optimal: [0, 5],     warning: [5, 15] }, 
    S:  { optimal: [0, 3500], warning: [3500, 4500] },       
    Si:         { optimal: [0, 20],  warning: [20, 50] },  
    Na:         { optimal: [0, 30],  warning: [30, 100] },  
    K:          { optimal: [0, 30],  warning: [30, 100] }, 
    "Na/K Ratio": { optimal: [0, 1], warning: [1, 2] },
    Cl:         { optimal: [0, 20],  warning: [20, 50] },
    F:          { optimal: [0, 5],   warning: [5, 10] }, 
    "Agua (%)": { optimal: [0, 0.1], warning: [0.1, 0.3] }, 
    Glicol:     { optimal: [0, 100], warning: [100, 300] }, 
    "Fuel (%)": { optimal: [0, 2],   warning: [2, 4] },     
    Hollín:     { optimal: [0, 1],   warning: [1, 3] },    
    PQI:        { optimal: [0, 100], warning: [100, 300] }, 
    TAN:            { optimal: [0, 2],   warning: [2, 4] },   
    TBN:            { optimal: [7, 15],  warning: [4, 7] },   
    Oxidación:      { optimal: [0, 20],  warning: [20, 40] }, 
    Nitración:      { optimal: [0, 20],  warning: [20, 40] }, 
    Sulfatación:    { optimal: [0, 20],  warning: [20, 40] },
    Contaminación:  { optimal: [0, 20],  warning: [20, 40] }, 
    "Viscosidad 100 °C (cSt)": { optimal: [10, 14], warning: [14, 18] },
    "Viscosidad 40 °C (cSt)": { optimal: [32, 68], warning: [68, 90] },
    VI:                   { optimal: [110, 150], warning: [95, 110] },
    "Flash Point (°C)"   : { optimal: [200, 260], warning: [180, 200] },
    "Demulsibilidad 40/40/0 (min)" : { optimal: [0, 15], warning: [15, 30] },
    "Foaming Seq I (ml)" : { optimal: [0, 50],  warning: [50, 150] },
    "Density 15 °C (kg/m³)" : { optimal: [840, 930], warning: [930, 960] },
    "Dielectric Constant":   { optimal: [0, 2],   warning: [2, 4] },
    "RULER (%)": { optimal: [50, 100], warning: [20, 50] },
    "RPVOT (min)": { optimal: [200, 1000], warning: [150, 200] },
    "ISO 4406 >4µm":  { optimal: [0, 18], warning: [18, 20] },
    "ISO 4406 >6µm":  { optimal: [0, 16], warning: [16, 18] },
    "ISO 4406 >14µm": { optimal: [0, 13], warning: [13, 16] },
    "Carbonyl (abs/cm)"    : { optimal: [0, 20], warning: [20, 40] },
    "Water Index (abs/cm)" : { optimal: [0, 0.1], warning: [0.1, 0.3] },
    "Sulfate/Nitro (abs/cm)": { optimal: [0, 20], warning: [20, 40] },
    "Penetración trabajada 60x (0.1 mm)":      { optimal: [265, 295], warning: [295, 320] },
    "Penetración trabajada 100.000x (0.1 mm)": { optimal: [275, 310], warning: [310, 340] },
    "Punto de goteo (°C)":                     { optimal: [190, 300], warning: [150, 190] },
    "Separación de aceite (ASTM D1742 %)":     { optimal: [0, 5],     warning: [5, 10] },
    "Water Washout 79 °C (%)":                 { optimal: [0, 5],     warning: [5, 10] },
    "4-Ball Weld (kg)":                        { optimal: [260, 800], warning: [200, 260] },
    "4-Ball Wear (mm)":                        { optimal: [0, 0.5],   warning: [0.5, 1.0] },
    "Timken OK Load (lb)":                     { optimal: [40, 100],  warning: [30, 40] },
    "Corrosión cobre (ASTM D130)":             { optimal: [1, 1],     warning: [1, 2] },
    "Foaming Seq II (ml)": { optimal: [0, 50],  warning: [50, 150] },
    "Foaming Seq III (ml)":{ optimal: [0, 50],  warning: [50, 150] },
    "ISO 4406 >4µm (hyd)":  { optimal: [0, 17], warning: [17, 19] },
    "TAN (hyd)":            { optimal: [0, 1],  warning: [1, 2] },
    "Viscosidad 40 °C (gear)": { optimal: [90, 150], warning: [150, 200] },
    "Foaming Seq II (gear)":   { optimal: [0, 50],   warning: [50, 250] },
    "Foaming Seq III (gear)":  { optimal: [0, 50],   warning: [50, 250] },
    "RPVOT (turb) (min)":       { optimal: [1000, 3000], warning: [400, 1000] },
    "ISO 4406 >4µm (turb)":     { optimal: [0, 16],       warning: [16, 18] },
    "TAN (turb)":               { optimal: [0, 0.5],      warning: [0.5, 1.0] },
    "Dielectric Breakdown (kV)": { optimal: [30, 70], warning: [25, 30] },
    "Moisture (ppm)":            { optimal: [0, 30],  warning: [30, 60] },
    "Furans (ppm)":              { optimal: [0, 0.1], warning: [0.1, 0.5] },
    "Viscosidad 40 °C (comp)": { optimal: [46, 68], warning: [68, 90] },
    "Flash Point (°C) (comp)": { optimal: [220, 260], warning: [200, 220] },
  };
  
  
  export function getElementRange(elementName: string): ElementRanges {
    // Buscar coincidencia exacta
    if (OIL_ANALYSIS_RANGES[elementName]) {
      return OIL_ANALYSIS_RANGES[elementName]
    }
  
    // Buscar coincidencia parcial (por ejemplo, si el nombre incluye unidades)
    for (const key of Object.keys(OIL_ANALYSIS_RANGES)) {
      if (elementName.toLowerCase().includes(key.toLowerCase())) {
        return OIL_ANALYSIS_RANGES[key]
      }
    }
  
    // Buscar por símbolo químico
    const symbolMatch = elementName.match(/$$([A-Za-z]+)$$/)
    if (symbolMatch && symbolMatch[1] && OIL_ANALYSIS_RANGES[symbolMatch[1]]) {
      return OIL_ANALYSIS_RANGES[symbolMatch[1]]
    }
  
    // Valores predeterminados si no se encuentra coincidencia
    return { optimal: [0, 50], warning: [50, 100] }
  }
  
  // Función para determinar el estado de un valor
  export function getValueStatus(value: number, elementName: string): "optimal" | "warning" | "danger" {
    const ranges = getElementRange(elementName)
  
    if (value >= ranges.optimal[0] && value <= ranges.optimal[1]) {
      return "optimal"
    } else if (value >= ranges.warning[0] && value <= ranges.warning[1]) {
      return "warning"
    } else {
      return "danger"
    }
  }