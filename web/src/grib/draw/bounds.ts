import { MeteoGrid } from '../../interfaces/interfaces'
import { CropBounds } from './drawGrib'

export function extractFromBounds(
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
