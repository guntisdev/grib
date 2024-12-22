import { GribMessage } from "../interfaces/interfaces.ts";
import { API_ORIGIN } from "../consts.ts";
import { createSelectSidebar } from './selectSidebar.ts'
import { sortMeteoParams } from '../interfaces/meteoMapping.ts'

export function createGribView(container: HTMLDivElement) {
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            createSelectSidebar(container, gribArr, canvas)
        })
}