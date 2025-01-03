import { MeteoParam, METEO_TREE } from './interfaces.ts'

const UNKNOWN = '???'

export function meteoCodesToNames(meteoArr: MeteoParam[]): [string, string, string][] {
    return meteoArr.map(meteoCodeToName)
}

export function meteoCodeToName(meteo: MeteoParam): [string, string, string] {
    return codeArrToNameArr([meteo.discipline, meteo.category, meteo.product])
}

function codeArrToNameArr(
    [disciplineCode, categoryCode, productCode]: [number, number, number]
): [string, string, string] {
    const discipline = METEO_TREE[disciplineCode]
    if (!discipline) return [UNKNOWN+disciplineCode, UNKNOWN+categoryCode, UNKNOWN+productCode]

    const category = discipline.categories[categoryCode]
    if (!category) return [discipline.name, UNKNOWN+categoryCode, UNKNOWN+productCode]

    const productName = category.products[productCode]
    if (!productName) return [discipline.name, category.name, UNKNOWN+productCode]

    return [discipline.name, category.name, productName]
}
