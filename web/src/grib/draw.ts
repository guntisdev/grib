import { GribMessage } from '../interfaces/interfaces.ts'

export function drawGrib(
    canvas: HTMLCanvasElement,
    grib: GribMessage,
    buffer: Uint8Array,
): void {
    canvas.width = grib.grid.cols
    canvas.height = grib.grid.rows
    const ctx = canvas.getContext('2d')!
    const imgData = ctx.createImageData(grib.grid.cols, grib.grid.rows)
    
    for (let row = 0; row < grib.grid.rows; row++) {
        for (let col = 0; col < grib.grid.cols; col++) {

            const bufferI = (row * grib.grid.cols + col) * 2
            const index = (row * grib.grid.cols + col) * 4

            const val1 = buffer[bufferI]
            const val2 = buffer[bufferI+1]
            imgData.data[index] = val1;     // R
            imgData.data[index + 1] = 0; // G
            imgData.data[index + 2] = 0; // B
            imgData.data[index + 3] = 255;   // A
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
