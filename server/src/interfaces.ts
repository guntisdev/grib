import { cloudProducts, electrodynamicsProducts, longWaveRadiationProducts, massProducts, moistureProducts, momentumProducts, physicalAtmosphericProducts, shortWaveRadiationProducts, temperatureProducts, thermodynamicStabilityProducts } from "./meteoProducts.ts";

export type MeteoParam = {
    discipline: number, // 0=meteo, 1=hydro, 2=land surface, 3=space products
    category: number, // 0=temperature, 1=moisture, 6=cloud, 19=atmospheric
    product: number,
    subType: string, // now or over time avg/sum
    levelType: number, // 102 - entire atmosphere, 103 - above ground, above sea level
    levelValue: number, // meters above ground/sea level
}

export type MeteoGrid = {
    cols: number,
    rows: number,
    template: number, // 0 - regular lat/lon
}

export type MeteoConversion = {
    reference: number, // float
    binaryScale: number, // int
    decimalScale: number, // int
}

export type MeteoTime = {
    referenceTime: string,
    forecastTime: string,
}

export type GribMessage = {
    offset: number,
    size: number,
    version: number,
    title: string,
    time: MeteoTime,
    meteo: MeteoParam,
    grid: MeteoGrid,
    bitsPerDataPoint: number,
    conversion: MeteoConversion,
    sections: GribSection[],
}

export type GribSection = {
    offset: number,
    size: number,
    id: number,
}


export interface MeteoTree {
    [discipline: number]: {
        name: string;
        categories: {
            [category: number]: {
                name: string;
                products: {
                    [product: number]: string;
                }
            }
        }
    }
}

export const METEO_TREE: MeteoTree = {
    0: {
        name: 'meteorologic',
        categories: {
            0: { name: 'temperature', products: temperatureProducts },
            1: { name: 'moisture', products: moistureProducts },
            2: { name: 'momentum', products: momentumProducts },
            3: { name: 'mass', products: massProducts },
            4: { name: 'short-wave-radiation', products: shortWaveRadiationProducts },
            5: { name: 'long-wave-radiation', products: longWaveRadiationProducts },
            6: { name: 'cloud', products: cloudProducts },
            7: { name: 'thermodynamic-stability', products: thermodynamicStabilityProducts },
            17: { name: 'electrodynamics', products: electrodynamicsProducts },
            19: { name: 'physical-atmospheric', products: physicalAtmosphericProducts },
        },
    },
    1: {
        name: 'hydrologic',
        categories: {},
    },
    2: {
        name: 'land-surface',
        categories: {
            0: { name: 'vegetation-biomass', products: { 0: 'land-cover' }},
        },
    },
    3: {
        name: 'space',
        categories: {
            2: { name: 'charged-particle-mass', products: { 1: 'electron-density' }},
            6: { name: 'solar-electromagnetic-emissions', products: { 3: 'solar-euv-irradiance' }},
        },
    },
}
