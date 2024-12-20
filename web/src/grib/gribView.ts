import { GribMessage } from "../../../server/interfaces.ts";
import { API_ORIGIN } from "../consts.ts";
import { drawGrib } from "./draw.ts";

export function createGribView(container: HTMLDivElement) {
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            const flux = gribArr.find(g => g.meteo.discipline === 0 && g.meteo.category === 0 && g.meteo.product === 10)
            if (!flux) throw new Error('Flux meteo param not found')
            const binarySection = flux.sections.find(section => section.id === 7)
            if (!binarySection) throw new Error('Binary section not found')

            const offset = binarySection.offset + 5
            const length = binarySection.size - 5

            const buffer = await fetch(`${API_ORIGIN}/binary-chunk/${offset}/${length}`)
                .then(re => re.arrayBuffer())
            
            return [flux, buffer]
        })
        .then(([grib, buffer]) => {
            // console.log(grib, buffer)
            drawGrib(canvas, grib, new Uint8Array(buffer))
        })
}