import { GribMessage, GribSection } from "./interfaces.ts";
import { meteoCodeToName } from "./meteoMapping.ts";

export async function parseGribFile(filePath: string): Promise<GribMessage[]> {
    const gribArr: GribMessage[] = []
    const { size: fileSize } = await Deno.stat(filePath)
    const file = await Deno.open(filePath)

    let position = 0
    while (position < fileSize) {
        await file.seek(position, Deno.SeekMode.Start)
        const buffer = new Uint8Array(16)
        await file.read(buffer)
        const messageLength = toInt(buffer.slice(8, 16))

        const message = await parseGribMessage(file, position)
        gribArr.push(message)

        position += messageLength
    }

    console.log(`GRIB count: ${gribArr.length}, fileSize: ${fileSize}`)    
    file.close()

    return gribArr
}


export async function parseGribMessage(file: Deno.FsFile, initPosition: number): Promise<GribMessage> {
    const sections: GribSection[] = []
    let position = initPosition
    await file.seek(position, Deno.SeekMode.Start)
    const initBuffer = new Uint8Array(16)
    await file.read(initBuffer)
    const messageType = toString(initBuffer.slice(0, 4))
    if (messageType !== 'GRIB') console.error('Not a GRIB message!')
    const messageLength = toInt(initBuffer.slice(8, 16))
    // console.log(messageLength)
    const discipline = initBuffer[6]
    const meteo = { discipline, category: -1, product: -1 } // to be updated in 4th section
    const grid = { cols: -1, rows: -1, template: -1 } // to be updated in 3rd section
    const version = initBuffer[7]
    position += 16
    while (position < initPosition + messageLength - 4) { // last 4 bytes 55, 55, 55, 55 which indicates end of message
        await file.seek(position, Deno.SeekMode.Start)
        const sizeBuffer = new Uint8Array(4)
        await file.read(sizeBuffer)
        const size = toInt(sizeBuffer)
        const bufferSize = Math.min(size, 64) // don't read more than 64 bytes from section
        const buffer = new Uint8Array(bufferSize)
        await file.read(buffer)
        const section: GribSection = {
            id: buffer[0],
            offset: position,
            size: size,
        }
        sections.push(section)

        switch (section.id) {
            case 3:
                grid.cols = toInt(buffer.slice(26, 30))
                grid.rows = toInt(buffer.slice(30, 34))
                grid.template = buffer[1]
                break
            case 4:
                meteo.category = buffer[5]
                meteo.product = buffer[6]
                break;
        }

        position += size
    }
    
    return {
        offset: initPosition,
        size: messageLength,
        version,
        meteo,
        grid,
        title: meteoCodeToName(meteo).join(', '),
        sections,
    }
}

export async function extractBinaryChunk(filePath: string, offset: number, length: number): Promise<Uint8Array> {
    const buffer = new Uint8Array(length)

    const file = await Deno.open(filePath)
    await file.seek(offset, Deno.SeekMode.Start)
    await file.read(buffer)
    file.close()

    return buffer
}


export function toInt (bytes: Uint8Array): number {
    return bytes.reduce((acc, curr) => acc * 256 + curr)
}

export function toString (bytes: Uint8Array): string {
    return String.fromCharCode(...bytes)
}


// TODO delete after moving all parsed data to new parser
async function parseGribMessage2(file: Deno.FsFile, position: number) {
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
    console.log(buffer4.slice(4, 8).toString())

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
