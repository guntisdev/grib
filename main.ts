import { toInt, toString } from "./src/parser.ts";

export function add(a: number, b: number): number {
    return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
    // console.log("Result", add(2, 7));
    const filePath = 'data/harmonie_dini_sf.grib'
    await parseGribFile(filePath)
}


async function parseGribFile(filePath: string) {
    const { size: fileSize } = await Deno.stat(filePath)
    console.log(`fileSize: ${fileSize}`)

    const file = await Deno.open(filePath)

    let position = 0
    let count = 0
    while (position < fileSize) {
        count++
        await file.seek(position, Deno.SeekMode.Start)
        const buffer = new Uint8Array(16)
        const bytesRead = await file.read(buffer)
        const discipline = buffer[6] // 0=meteo, 1=hydro, 2=land surface, 3=space products
        const gribVersion = buffer[7]
        // console.log(`${bytesRead} bytes: ${buffer}`)
        const messageType = toString(buffer.slice(0, 4))
        const messageLength = toInt(buffer.slice(8, 16))
        const messageLengthMB = (messageLength / 1024 / 1024).toFixed(2)
        // this is also a 0th section
        console.log(`${messageType} v${gribVersion} d${discipline} size: ${messageLengthMB} MB .. ${messageLength}`)

        if (count <= 91) {
            await parseGribMessage(file, position)
        }


        position += messageLength
    }

    console.log(`GRIB count: ${count}`)    

    file.close()
}

async function parseGribMessage(file: Deno.FsFile, position: number) {
    /* ++++++++++++ 1st section ++++++++++++++++ */
    await file.seek(position+16, Deno.SeekMode.Start)
    const sizeBuffer = new Uint8Array(4)
    await file.read(sizeBuffer)
    const sectionSize = toInt(sizeBuffer.slice(0, 4))
    const buffer = new Uint8Array(sectionSize-4)
    await file.read(buffer)
    // console.log(`section size: ${sectionSize}, buffer: ${buffer}`)
    
    const sectionNumber = buffer[0]
    const year = toInt(buffer.slice(8, 10))
    const month = buffer[10]
    const day = buffer[11]
    const hour = buffer[12]
    const minute = buffer[13]
    const second = buffer[14]
    // console.log(`n: ${sectionNumber} ${year}-${month}-${day} ${hour}:${minute}:${second}`)


    /* ++++++++++++ 3rd section ++++++++++++++++ */
    // second section is skipped as there is data for local dev use
    const sizeBuffer3 = new Uint8Array(4)
    await file.read(sizeBuffer3)
    const sectionSize3 = toInt(sizeBuffer3.slice(0, 4))
    const buffer3 = new Uint8Array(sectionSize3-4)
    await file.read(buffer3)
    // console.log(`section size: ${sectionSize3}, buffer: ${buffer3}`)

    const sectionNumber3 = buffer3[0]
    const gridDefinition = buffer[1] // 0 - defined in this section
    const gridPoints = toInt(buffer.slice(2, 6))
    const optionalGridPoints = buffer[6] // 0 - not included
    const templateNumber = buffer[7]  // 0 - lat/lon
    // console.log(`n: ${sectionNumber3}, gridPoints: ${gridPoints}`)


    /* ++++++++++++ 4th section ++++++++++++++++ */
    const sizeBuffer4 = new Uint8Array(4)
    await file.read(sizeBuffer4)
    const sectionSize4 = toInt(sizeBuffer4.slice(0, 4))
    const buffer4 = new Uint8Array(sectionSize4-4)
    await file.read(buffer4)
    // console.log(`section size: ${sectionSize4}, buffer: ${buffer4}`)
    // console.log(buffer4.slice(4, 8).toString())

    const sectionNumber4 = buffer4[0]
    const dataPoints = toInt(buffer.slice(1, 5))
    // console.log(`n: ${sectionNumber4}, dataPoints: ${dataPoints}`)


    /* ++++++++++++ 5th section ++++++++++++++++ */
    const sizeBuffer5 = new Uint8Array(4)
    await file.read(sizeBuffer5)
    const sectionSize5 = toInt(sizeBuffer5.slice(0, 4))
    const buffer5 = new Uint8Array(sectionSize5-4)
    await file.read(buffer5)
    // console.log(`section size: ${sectionSize5}, buffer: ${buffer5}`)


    /* ++++++++++++ 6th section ++++++++++++++++ */
    const sizeBuffer6 = new Uint8Array(4)
    await file.read(sizeBuffer6)
    const sectionSize6 = toInt(sizeBuffer6.slice(0, 4))
    const buffer6 = new Uint8Array(sectionSize6-4)
    await file.read(buffer6)
    // console.log(`section size: ${sectionSize6}, buffer: ${buffer6}`)


    /* ++++++++++++ 7th section ++++++++++++++++ */
    // actual data here
    const buffer7 = new Uint8Array(16)
    await file.read(buffer7)
    // console.log(buffer7)
    const sectionSize7 = toInt(buffer7.slice(0, 4))
    // console.log(`size: ${sectionSize7}, section: ${buffer7[4]}`)


    // handling end of section
    const totalSectionSize = 16 + sectionSize + sectionSize3 + sectionSize4 + sectionSize5 + sectionSize6 + sectionSize7
    // console.log(`totalSectionSize ${totalSectionSize}`)
    await file.seek(position+totalSectionSize, Deno.SeekMode.Start)
    const bufferEnd = new Uint8Array(16)
    await file.read(bufferEnd)
    // console.log(bufferEnd) // ends with 55, 55, 55, 55 which in 7777 in ASCII
}
