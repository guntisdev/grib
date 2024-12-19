import { meteoCodeToName, sortMeteoParams } from "./src/meteoMapping.ts";
import { parseGribFile } from "./src/parser.ts";

export function add(a: number, b: number): number {
    return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
    // console.log("Result", add(2, 7));
    const filePath = 'data/harmonie_dini_sf.grib'
    const gribArr = await parseGribFile(filePath)

    const meteoStr = gribArr
        .map(g => g.meteo)
        .sort(sortMeteoParams)
        .map(meteoCodeToName)
        .map(arr => arr.join(', '))

    console.log(meteoStr)

}
