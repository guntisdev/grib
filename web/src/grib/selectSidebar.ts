import { GribMessage } from "../interfaces/interfaces.ts";
import { API_ORIGIN } from "../consts.ts";
import { drawGrib } from "./draw.ts";

import styles from './sidebar.module.css'

export function createSelectSidebar(
    container: HTMLDivElement,
    gribArr: GribMessage[],
    canvas: HTMLCanvasElement,
) {
    const sidebar = document.createElement('div')
    container.appendChild(sidebar)
    sidebar.className = styles.sidebar

    const ul = document.createElement('ul')
    sidebar.appendChild(ul)
    for (const grib of gribArr) {
        const li = document.createElement('li')
        ul.appendChild(li)
        const { discipline, category, product } = grib.meteo
        li.innerHTML = `${discipline}-${category}-${product} ${grib.title}`
        li.onclick = () => {
            const binarySection = grib.sections.find(section => section.id === 7)
            if (!binarySection) throw new Error('Binary section not found')

            const offset = binarySection.offset + 5
            const length = binarySection.size - 5

            fetch(`${API_ORIGIN}/binary-chunk/${offset}/${length}`)
                .then(re => re.arrayBuffer())
                .then(buffer => drawGrib(canvas, grib, new Uint8Array(buffer)))
        }
    }
}