import { GribMessage } from '../interfaces/interfaces.ts'

export const VIOLET: RGBu8 = [127, 0, 255]
export const YELLOW: RGBu8 = [255, 255, 0]
export const BLUE: RGBu8 = [0, 0, 255]
export const ORANGE: RGBu8 = [255, 43, 0]
export const DARK_VIOLET: RGBu8 = [51, 0, 102]

export function drawGrib(
    canvas: HTMLCanvasElement,
    grib: GribMessage,
    buffer: Uint8Array,
): void {
    canvas.width = grib.grid.cols
    canvas.height = grib.grid.rows
    canvas.style.width = '100%'
    canvas.style.minWidth = '1280px'
    const ctx = canvas.getContext('2d')!
    const imgData = ctx.createImageData(grib.grid.cols, grib.grid.rows)
    
    for (let row = 0; row < grib.grid.rows; row++) {
        for (let col = 0; col < grib.grid.cols; col++) {

            const bufferI = (row * grib.grid.cols + col) * 2
            const index = (row * grib.grid.cols + col) * 4

            const val1 = buffer[bufferI]

            const color = interpolateColors(val1, BLUE, YELLOW)
            imgData.data[index] = color[0]
            imgData.data[index + 1] = color[1]
            imgData.data[index + 2] = color[2]
            imgData.data[index + 3] = 255
            
        }
    }

    // console.log(normalizedU8, imgData.width*imgData.height)

    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = imgData.width
    tempCanvas.height = imgData.height
    tempCtx.putImageData(imgData, 0, 0)

    ctx.save()
    ctx.scale(1, -1)
    ctx.drawImage(tempCanvas, 0, -canvas.height)
    ctx.restore()
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