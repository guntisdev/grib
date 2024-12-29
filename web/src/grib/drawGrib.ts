import { u8ToBits } from '../helpers/u8ToBits.ts'
import { GribMessage, MeteoGrid } from '../interfaces/interfaces.ts'

export const VIOLET: RGBu8 = [127, 0, 255]
export const YELLOW: RGBu8 = [255, 255, 0]
export const BLUE: RGBu8 = [0, 0, 255]
export const ORANGE: RGBu8 = [255, 43, 0]
export const DARK_VIOLET: RGBu8 = [51, 0, 102]

const IS_CROPPED = false

export function drawGrib(
    canvas: HTMLCanvasElement,
    grib: GribMessage,
    buffer: Uint8Array,
    bitmask: Uint8Array | undefined,
): void {
    const bytesPerPoint = grib.bitsPerDataPoint / 8
    let { grid } = grib
    // cropps latvia out of europe map
    if (IS_CROPPED) {
        const croppedWidth = 400
        const croppedHeight = 300
        const croppedX = 1906-1-croppedWidth
        const croppedY = 950
        const croppedBuffer = extractBbox(grib.grid, buffer, croppedX, croppedY, croppedWidth, croppedHeight, bytesPerPoint)
        grid.cols = croppedWidth
        grid.rows = croppedHeight
        buffer = croppedBuffer
    }

    canvas.width = grid.cols
    canvas.height = grid.rows
    canvas.style.width = '100%'
    canvas.style.minWidth = '1280px'
    const ctx = canvas.getContext('2d')!
    const imgData = ctx.createImageData(grid.cols, grid.rows)
    
    const fullBuffer = bitmask ? getFullBuffer(grid, buffer, bitmask, bytesPerPoint) : buffer
    fillImageData(imgData, grid, fullBuffer, bytesPerPoint)

    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = imgData.width
    tempCanvas.height = imgData.height
    tempCtx.putImageData(imgData, 0, 0)

    ctx.save()
    ctx.scale(1, -1)
    ctx.drawImage(tempCanvas, 0, -canvas.height)
    // ctx.drawImage(tempCanvas, 0, 0)
    ctx.restore()
}

function fillImageData(
    imgData: ImageData,
    grid: MeteoGrid,
    buffer: Uint8Array,
    bytesPerPoint: number,
) {
    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {

            const bufferI = (row * grid.cols + col) * bytesPerPoint
            const index = (row * grid.cols + col) * 4

            const firstByte = buffer[bufferI]

            const color = interpolateColors(firstByte, BLUE, YELLOW)
            imgData.data[index] = color[0]
            imgData.data[index + 1] = color[1]
            imgData.data[index + 2] = color[2]
            imgData.data[index + 3] = 255
            
        }
    }
}

function getFullBuffer(
    grid: MeteoGrid,
    buffer: Uint8Array,
    bitmask: Uint8Array,
    bytesPerPoint: number,
): Uint8Array {
    const newBuffer = new Uint8Array(grid.rows * grid.cols * bytesPerPoint)

    let i=0, bufferI=0
    for (; i<bitmask.length; i++) {
        const bits = u8ToBits(bitmask[i])
        for (let bitI=0; bitI<bits.length; bitI++) {
            const newI = (i*8 + bitI) * bytesPerPoint
            if (newI >= newBuffer.length) {
                break;
            }
            if (bits[bitI]) {
                newBuffer[newI] = buffer[bufferI]
                newBuffer[newI+1] = buffer[bufferI+1]
                newBuffer[newI+2] = buffer[bufferI+2]
                bufferI += bytesPerPoint
            } else {
                newBuffer[newI] = 255
                newBuffer[newI+1] = 255
                newBuffer[newI+2] = 255
            }
        }
    }

    return newBuffer
}


type RGBu8 = [number, number, number]
function interpolateColors(value: number, a: RGBu8, b: RGBu8): RGBu8 {
    const color = a.slice(0).map((from, i) => {
        const to = b[i]
        const delta = (to - from) * (value/255)
        return from + delta
    })

    return color as RGBu8
}

function extractBbox(
    grid: MeteoGrid,
    source: Uint8Array,
    x: number,
    y: number,
    width: number,
    height: number,
    bytesPerPoint = 2,
): Uint8Array {
    if (
        x < 0
        || y < 0
        || x + width > grid.cols-1
        || y + height > grid.rows-1
    ) {
        throw new Error('Extract bbox out of grid bounds')
    }

    const output = new Uint8Array(width*height*bytesPerPoint)
    for (let row=y, i=0; row < y+height; row++) {
        const inputOffset = (row*grid.cols + x)*bytesPerPoint
        const readBytes = width*bytesPerPoint
        const inputBuffer = source.subarray(inputOffset, inputOffset+readBytes)
        output.set(inputBuffer, i)
        i += readBytes
    }

    return output
}
