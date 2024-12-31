import { u8ToBits } from '../helpers/u8ToBits.ts'
import { GribMessage, MeteoGrid } from '../interfaces/interfaces.ts'

export type CropBounds = { x: number, y: number, width: number, height: number }

export function drawGrib(
    canvas: HTMLCanvasElement,
    grib: GribMessage,
    buffer: Uint8Array,
    bitmask: Uint8Array | undefined,
    colors: [string, string],
    cropBounds: CropBounds | undefined,
): void {
    const bytesPerPoint = grib.bitsPerDataPoint / 8
    let { grid } = grib
    let { cols, rows } = grid

    let fullBuffer = bitmask ? getFullBuffer(grid, buffer, bitmask, bytesPerPoint) : buffer

    if (cropBounds) {
        fullBuffer = extractBbox(grib.grid, fullBuffer, cropBounds, bytesPerPoint)
        cols = cropBounds.width
        rows = cropBounds.height
    }

    canvas.width = cols
    canvas.height = rows
    canvas.style.width = '100%'
    canvas.style.minWidth = '1280px'
    const ctx = canvas.getContext('2d')!
    const imgData = ctx.createImageData(cols, rows)
    
    fillImageData(imgData, grid, fullBuffer, bytesPerPoint, colors)

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
    colors: [string, string],
) {
    const fromColor = rgbHexToU8(colors[0])
    const toColor = rgbHexToU8(colors[1])

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {

            const bufferI = (row * grid.cols + col) * bytesPerPoint
            const index = (row * grid.cols + col) * 4

            const firstByte = buffer[bufferI]

            const color = interpolateColors(firstByte, fromColor, toColor)
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

function rgbHexToU8(hex: string): RGBu8 {
    return [
        parseInt(`0x${hex.slice(1, 3)}`),
        parseInt(`0x${hex.slice(3, 5)}`),
        parseInt(`0x${hex.slice(5, 7)}`),
    ]
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
    cropBounds: CropBounds,
    bytesPerPoint: number,
): Uint8Array {
    const { x, y, width, height } = cropBounds

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
        const inputBuffer = source.slice(inputOffset, inputOffset+readBytes)
        output.set(inputBuffer, i)
        i += readBytes
    }

    return output
}
