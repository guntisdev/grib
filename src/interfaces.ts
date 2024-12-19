export type MeteoParam = {
    discipline: number, // 0=meteo, 1=hydro, 2=land surface, 3=space products
    category: number, // 0=temperature, 1=moisture, 6=cloud, 19=atmospheric
    product: number,
}

export type GribMessage = {
    offset: number,
    size: number,
    version: number,
    meteo: MeteoParam,
    sections: GribSection[],
}

export type GribSection = {
    offset: number,
    size: number,
    id: number,
}