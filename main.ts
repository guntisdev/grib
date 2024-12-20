import { GribMessage } from "./src/interfaces.ts";
import { meteoCodeToName, sortMeteoParams } from "./src/meteoMapping.ts";
import { extractBinaryChunk, toInt } from "./src/parser.ts";
import { parseGribFile } from "./src/parser.ts";

const FILE_PATH = 'data/harmonie_dini_sf.grib'
const API_PREFIX = '/api'

Deno.serve({
    onListen: ({ port }) => {
      console.log("Deno server listening on *:", port);
    },
  }, async (req: Request) => {
    const urlObject = new URL(req.url)
    const path = urlObject.pathname
    console.log(`method: ${req.method}, path: ${path}`)

    const binaryChunkPattern = new URLPattern({ pathname: "/api/binary-chunk/:from/:length" }).exec(req.url)

    if (req.method === 'GET') {
        if (path === `${API_PREFIX}/grib-structure`) {
            const gribArr = await parseGribFile(FILE_PATH)
            const re = JSON.stringify(gribArr)
            return new Response(re, {
                headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*", // Allow all origins
                },
          })
        }
        else if (binaryChunkPattern) {
            const { from, length } = binaryChunkPattern.pathname.groups
            const fromNumber = parseInt(from!, 10)
            const lengthNumber = parseInt(length!, 10)
            const buffer = await extractBinaryChunk(FILE_PATH, fromNumber, lengthNumber)

            return new Response(buffer, {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Access-Control-Allow-Origin": "*",
                    "Content-Disposition": `attachment; filename="binary-${from}-${length}.bin"`,
                },
            });
        }
    }
    
    return new Response('404')
  });

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
    console.log('on file run')
    // const gribArr = await parseGribFile(FILE_PATH)

    // // console.log(gribArr)

    // // const meteoStr = gribArr
    // //     .map(g => g.meteo)
    // //     .sort(sortMeteoParams)
    // //     .map(meteoCodeToName)
    // //     // .map(p => [p.discipline, p.category, p.product])
    // //     .map(arr => arr.join(', '))
    // //     .join(';\n') + ';'

    // const heatFlux = gribArr.filter(g => g.meteo.discipline === 0 && g.meteo.category === 0 && g.meteo.product === 10)
    // if (heatFlux[0]) {
    //     parseData(FILE_PATH, heatFlux[0])
    // } else console.log('HEAT FLUX NOT FOUND')
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
