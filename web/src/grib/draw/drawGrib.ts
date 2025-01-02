import { GribMessage, MeteoParam } from '../../interfaces/interfaces.ts'
import { applyBitmask } from './bitmask.ts'
import { extractFromBounds } from './bounds.ts'
import { precipitationColors } from './precipitation.ts'

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

    let fullBuffer = bitmask ? applyBitmask(grid, buffer, bitmask, bytesPerPoint) : buffer

    if (cropBounds) {
        fullBuffer = extractFromBounds(grib.grid, fullBuffer, cropBounds, bytesPerPoint)
        cols = cropBounds.width
        rows = cropBounds.height
    }

    canvas.width = cols
    canvas.height = rows
    canvas.style.width = '100%'
    canvas.style.minWidth = '1280px'
    const ctx = canvas.getContext('2d')!
    const imgData = ctx.createImageData(cols, rows)
    
    fillImageData(imgData, grib, fullBuffer, bytesPerPoint, colors)

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

const CATEGORICAL_RAIN = [0, 1, 192]

function fillImageData(
    imgData: ImageData,
    grib: GribMessage,
    buffer: Uint8Array,
    bytesPerPoint: number,
    colors: [string, string],
) {
    const { meteo, grid } = grib
    const fromColor = rgbHexToU8(colors[0])
    const toColor = rgbHexToU8(colors[1])

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {

            const bufferI = (row * grid.cols + col) * bytesPerPoint
            const index = (row * grid.cols + col) * 4
            const firstByte = buffer[bufferI]

            let color = [255, 255, 255, 255]
            if (isEqual(meteo, CATEGORICAL_RAIN)) {
                color = precipitationColors(firstByte)
            } else {
                color = interpolateColors(firstByte, fromColor, toColor)
                
            }

            imgData.data[index] = color[0]
            imgData.data[index + 1] = color[1]
            imgData.data[index + 2] = color[2]
            imgData.data[index + 3] = color[3]
        }
    }
}


function rgbHexToU8(hex: string): RGBu8 {
    return [
        parseInt(`0x${hex.slice(1, 3)}`),
        parseInt(`0x${hex.slice(3, 5)}`),
        parseInt(`0x${hex.slice(5, 7)}`),
    ]
}

type RGBu8 = [number, number, number]
type RGBAu8 = [number, number, number, number]
function interpolateColors(value: number, a: RGBu8, b: RGBu8): RGBAu8 {
    const color = a.slice(0).map((from, i) => {
        const to = b[i]
        const delta = (to - from) * (value/255)
        return from + delta
    })

    return [...color, 255] as RGBAu8
}

function isEqual(meteo: MeteoParam, arr: number[]): boolean {
    const arr2 = [meteo.discipline, meteo.category, meteo.product]
    return arr.length === arr2.length && arr.every((value, index) => value === arr2[index])
}
