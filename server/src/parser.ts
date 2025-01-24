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
    const meteo = { discipline, category: -1, product: -1, subType: 'none', levelType: -1, levelValue: -1 } // to be updated in 4th section
    const conversion = { reference: -1, binaryScale: -1, decimalScale: -1 }
    const grid = { cols: -1, rows: -1, template: -1, lambert: [-1] } // to be updated in 3rd section
    const version = initBuffer[7]
    let bitsPerDataPoint = 0
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
        const tmp = buffer.slice()
        const tmpSize = size
        switch (section.id) {
            case 3:
                grid.cols = toInt(buffer.slice(26, 30))
                grid.rows = toInt(buffer.slice(30, 34))
                grid.template = toInt(buffer.slice(8, 10)) // 30 - lambert projection
                grid.lambert = [toSignedInt(buffer.slice(34, 38)), toSignedInt(buffer.slice(38, 42)), toSignedInt(buffer.slice(42, 46)), toSignedInt(buffer.slice(46, 50))]
                // console.log(buffer)
                // data points toInt(buffer.slice(2, 6))
                break
            case 4:
                meteo.category = buffer[5]
                meteo.product = buffer[6]
                meteo.levelType = buffer[18]
                meteo.levelValue = buffer[23]
                if (buffer[4] === 1) meteo.subType = 'now'
                if (buffer[4] === 11) meteo.subType = 'period'
                // 0 = No rain, 1 = Drizzle, 2 = Light rain, 3 = Moderate rain, 4 Heavy rain
                if (meteo.category === 2 && meteo.product === 2 && meteo.levelType === 103 && meteo.levelValue === 10) {
                    // console.log(buffer[18], buffer[23])
                    // console.log(tmpSize)
                    // console.log(tmp)
                }
                break;
            case 5:
                bitsPerDataPoint = buffer[15]
                // if (meteo.category === 0 && meteo.product === 0) console.log(buffer)

                    /*
                    - Reference value (R): The minimum value of the parameter (often referred to as the offset). 4 byte float
                    - Binary scale factor (B): Determines how the values are scaled. 2 byte int
                    - Decimal scale factor (D): Adjusts the precision of the values. 2 byte int

                    Physical Value=(R+Encoded Value×2^B)×10^−D
                */
                conversion.reference = toFloat(buffer.slice(7, 11))
                conversion.binaryScale = -buffer[12]
                conversion.decimalScale = buffer[14]
                
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
        bitsPerDataPoint,
        conversion,
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

export function toSignedInt(bytes: Uint8Array): number {
    const unsigned = toInt(bytes)

    const signBit = 1 << (bytes.length * 8 - 1) // Example: 16-bit -> 0x8000
    if (unsigned & signBit) {
        // If the sign bit is set, compute the two's complement
        return unsigned - (1 << (bytes.length * 8))
    }

    return unsigned // If the sign bit is not set, return as is
}

export function toFloat(bytes: Uint8Array): number {
    return new DataView(bytes.buffer).getFloat32(0, false)
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
}
