import { interpolateColors } from '../../helpers/interpolateColors.ts'
import { GribMessage, MeteoParam } from '../../interfaces/interfaces.ts'
import { applyBitmask } from './bitmask.ts'
import { extractFromBounds } from './bounds.ts'
import { categoricalRainColors } from './categoricalRain.ts'
import { precipitationColors } from './precipitation.ts'
import { temperatureColors } from './temperature.ts'

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
const TOTAL_PRECIPITATION = [0, 1, 52]
const RAIN_PRECIPITATION = [0, 1, 65]
const TEMPERATURE = [0, 0, 0]

function fillImageData(
    imgData: ImageData,
    grib: GribMessage,
    buffer: Uint8Array,
    bytesPerPoint: number,
    colors: [string, string],
) {
    const { meteo, conversion, bitsPerDataPoint } = grib
    const fromColor = rgbHexToU8(colors[0])
    const toColor = rgbHexToU8(colors[1])

    const cols = imgData.width
    const rows = imgData.height

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const bufferI = (row * cols + col) * bytesPerPoint
            const index = (row * cols + col) * 4
            const firstByte = buffer[bufferI]

            let color = [255, 255, 255, 255]
            if (isEqual(meteo, CATEGORICAL_RAIN)) {
                color = categoricalRainColors(firstByte)
            }
            else if (isEqual(meteo, TOTAL_PRECIPITATION)) {
                const encodedValue = toInt(buffer.slice(bufferI, bufferI+bitsPerDataPoint/8))
                color = precipitationColors(encodedValue, conversion)
            }
            else if (isEqual(meteo, RAIN_PRECIPITATION)) {
                const encodedValue = toInt(buffer.slice(bufferI, bufferI+bitsPerDataPoint/8))
                color = precipitationColors(encodedValue, conversion)
            }
            else if (isEqual(meteo, TEMPERATURE)) {
                const encodedValue = toInt(buffer.slice(bufferI, bufferI+bitsPerDataPoint/8))
                color = temperatureColors(encodedValue, conversion)
            } 
            else {
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

function isEqual(meteo: MeteoParam, arr: number[]): boolean {
    const arr2 = [meteo.discipline, meteo.category, meteo.product]
    return arr.length === arr2.length && arr.every((value, index) => value === arr2[index])
}

function toInt (bytes: Uint8Array): number {
    return bytes.reduce((acc, curr) => acc * 256 + curr)
}
