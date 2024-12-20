import { GribMessage } from '../../src/interfaces.ts'

export function draw(
    canvas: HTMLCanvasElement,
    grib: GribMessage,
    buffer: Uint8Array,
): void {
    canvas.width = grib.grid.cols
    canvas.height = grib.grid.rows
    const ctx = canvas.getContext('2d')!

    ctx.lineWidth = 10;
    ctx.strokeRect(75, 140, 150, 110);
    ctx.fillRect(130, 190, 40, 60);
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(150, 60);
    ctx.lineTo(250, 140);
    ctx.closePath();
    ctx.stroke();


    const normalized: number[] = []
    for (let i=0; i<buffer.length; i+=2) {
        // const value = Math.round((buffer[i] * buffer[i+1]) / 256)
        const value = buffer[i]
        normalized.push(value)
    }
    // console.log()
    const normalizedU8 = new Uint8Array(normalized)

    const imgData = ctx.createImageData(grib.grid.cols, grib.grid.rows)

    
    for (let row = 0; row < grib.grid.rows; row++) {
        for (let col = 0; col < grib.grid.cols; col++) {
            const normalizedInd = row * grib.grid.cols + col
            const index = normalizedInd * 4

            const value = normalizedU8[normalizedInd]; // Normalized to [0, 255]
            imgData.data[index] = value;     // R
            imgData.data[index + 1] = value; // G
            imgData.data[index + 2] = value; // B
            imgData.data[index + 3] = 255;   // A (opaque)
        }
    }

    console.log(normalizedU8, imgData.width*imgData.height)


    ctx.putImageData(imgData, 0, 0)
}