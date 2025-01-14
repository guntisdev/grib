import { interpolateColors } from '../../helpers/interpolateColors'
import { MeteoConversion } from '../../interfaces/interfaces'
import { ColorEntry, PRECIPITATION } from './constants'

type RGBAu8 = [number, number, number, number]

const IS_INTERPOLATED = true

export function precipitationColors(
    encodedValue: number,
    { reference, binaryScale, decimalScale}: MeteoConversion,
): RGBAu8 {
    const rainMM = (reference + encodedValue * Math.pow(2, binaryScale)) * Math.pow(10, -decimalScale) / 1000

    return IS_INTERPOLATED
        ? colorFromTempInterpolated(rainMM)
        : colorFromTempThreshold(rainMM)
}

function colorFromTempThreshold(value: number): [number, number, number, number] {
    const entries = PRECIPITATION.filter(t => t.value <= value)

    return entries.length === 0 ? PRECIPITATION[PRECIPITATION.length-1].color : entries[0].color
}

function colorFromTempInterpolated(value: number): [number, number, number, number] {
    const minIdx = PRECIPITATION.length-1
    if (value >= PRECIPITATION[0].value) return PRECIPITATION[0].color
    if (value <= PRECIPITATION[minIdx].value) return PRECIPITATION[minIdx].color

    let closeMax: ColorEntry = PRECIPITATION[0]
    let closeMin: ColorEntry = PRECIPITATION[minIdx]
    for (let i=0; i<PRECIPITATION.length; i++) {
        const currentDeg = PRECIPITATION[i].value
        if (currentDeg >= value && currentDeg < closeMax.value) {
            closeMax = PRECIPITATION[i]
        }

        if (currentDeg <= value && currentDeg > closeMin.value) {
            closeMin = PRECIPITATION[i]
        }
    }

    const maxDeg = closeMax.color.slice(0, 3) as [number, number, number]
    const minDeg = closeMin.color.slice(0, 3) as [number, number, number]
    const scale = Math.abs(closeMax.value - closeMin.value)
    const delta = 255*(value - closeMin.value)/scale
    const rgba = interpolateColors(delta, minDeg, maxDeg)

    return rgba
}