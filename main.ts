import { GribMessage } from "./src/interfaces.ts";
import { meteoCodeToName, sortMeteoParams } from "./src/meteoMapping.ts";
import { toInt } from "./src/parser.ts";
import { parseGribFile } from "./src/parser.ts";

export function add(a: number, b: number): number {
    return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
    // console.log("Result", add(2, 7));
    const filePath = 'data/harmonie_dini_sf.grib'
    const gribArr = await parseGribFile(filePath)

    // console.log(gribArr)

    // const meteoStr = gribArr
    //     .map(g => g.meteo)
    //     .sort(sortMeteoParams)
    //     .map(meteoCodeToName)
    //     // .map(p => [p.discipline, p.category, p.product])
    //     .map(arr => arr.join(', '))
    //     .join(';\n') + ';'
    // console.log(meteoStr)

    const heatFlux = gribArr.filter(g => g.meteo.discipline === 0 && g.meteo.category === 0 && g.meteo.product === 10)
    if (heatFlux[0]) {
        parseData(filePath, heatFlux[0])
    } else console.log('HEAT FLUX NOT FOUND')
    // console.log(heatFlux)
}

async function parseData(filePath: string, gribMeta: GribMessage) {
    console.log(gribMeta)

    const file = await Deno.open(filePath)

    // const binarySection = gribMeta.sections.find(sec => sec.id === 7)!
    // await file.seek(binarySection.offset, Deno.SeekMode.Start)
    // const sizeBuffer = new Uint8Array(4)
    // await file.read(sizeBuffer)
    // const size = toInt(sizeBuffer)
    // console.log(`flux binary size: ${size}`)

    file.close()
}
