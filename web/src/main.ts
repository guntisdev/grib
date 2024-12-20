import { GribMessage } from '../../src/interfaces.ts'
import { draw } from './draw.ts';

// export const API_ORIGIN = import.meta.env.MODE === 'development'
//     ? 'http://0.0.0.0:8080/api' : `${location.origin}/api`
export const API_ORIGIN = 'http://0.0.0.0:8000/api'

window.onload = () => {
    console.log('window.onload')

    const container = document.querySelector('#app')!
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            const flux = gribArr.find(g => g.meteo.discipline === 0 && g.meteo.category === 0 && g.meteo.product === 0)
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
            draw(canvas, grib, new Uint8Array(buffer))
        })
        
}