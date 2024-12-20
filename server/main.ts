import { GribMessage } from "./interfaces.ts";
import { meteoCodeToName, sortMeteoParams } from "./meteoMapping.ts";
import { extractBinaryChunk, toInt } from "./parser.ts";
import { parseGribFile } from "./parser.ts";

import "jsr:@std/dotenv/load"

const FILE_PATH = 'data/harmonie_dini_sf.grib'
const API_PREFIX = '/api'

Deno.serve({
    onListen: ({ port }) => {
      console.log("Deno server listening on *:", port);
    },
  }, async (req: Request) => {
    const harmonieUrl = Deno.env.get("HARMONIE_URL")
    const harmonieApiKey = Deno.env.get("HARMONIE_API_KEY")
    if (!harmonieUrl || ! harmonieApiKey) {
        return new Response(JSON.stringify({error: "Invalid config for harmonie dini sf"}),
            { status: 500, ...jsonHeaders })
    }

    const urlObject = new URL(req.url)
    const path = urlObject.pathname
    console.log(`method: ${req.method}, path: ${path}`)

    const binaryChunkPattern = new URLPattern({ pathname: "/api/binary-chunk/:from/:length" }).exec(req.url)
    const downloadGribPattern = new URLPattern({ pathname: "/api/download-grib/:id" }).exec(req.url)

    if (req.method === 'GET') {
        if (path === `${API_PREFIX}/grib-structure`) {
            const gribArr = await parseGribFile(FILE_PATH)
            return new Response(JSON.stringify(gribArr), jsonHeaders)
        }
        else if(path === `${API_PREFIX}/dini-sf-structure`) {
            const diniUrl = `${harmonieUrl}/v1/forecastdata/collections/harmonie_dini_sf/items?api-key=${harmonieApiKey}`
            const diniSf = await fetch(diniUrl).then(re => re.json())
            return new Response(JSON.stringify(diniSf), jsonHeaders)
        }
        else if (downloadGribPattern) {
            const { id } = downloadGribPattern.pathname.groups
            if (typeof id !== 'string') return new Response(JSON.stringify({ error: "Incorrect grib id" }),
            { status: 500, ...jsonHeaders })
            const gribUrl = `${harmonieUrl}/v1/forecastdata/download/${id}?api-key=${harmonieApiKey}`
            const outputPath = `data/${id}`
            const response = await fetch(gribUrl);
            if (!response.ok) {
                return new Response(JSON.stringify({ error: "Failed to download file" }),
                { status: 500, ...jsonHeaders })
            }

            const file = await Deno.open(outputPath, { write: true, create: true })
            await response.body?.pipeTo(file.writable)

            const fileInfo = await Deno.stat(outputPath)
            return new Response(
                JSON.stringify({ outputPath, fileSize: fileInfo.size }),
                { status: 200, ...jsonHeaders }
            )
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

const jsonHeaders = {
    headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
    },
}
