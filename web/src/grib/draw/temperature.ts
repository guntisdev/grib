import { interpolateColors } from '../../helpers/interpolateColors'
import { MeteoConversion } from '../../interfaces/interfaces'
import { ColorEntry, TEMPERATURES } from './constants'

const IS_INTERPOLATED = true

export function temperatureColors(
    encodedValue: number,
    { reference, binaryScale, decimalScale}: MeteoConversion,
): [number, number, number, number] {
    const temperatureC = (reference + encodedValue * Math.pow(2, binaryScale)) * Math.pow(10, -decimalScale) - 273.15

    return IS_INTERPOLATED
        ? colorFromTempInterpolated(temperatureC)
        : colorFromTempThreshold(temperatureC)
}

function colorFromTempThreshold(temperature: number): [number, number, number, number] {
    const entries = TEMPERATURES.filter(t => t.value <= temperature)

    return entries.length === 0 ? TEMPERATURES[TEMPERATURES.length-1].color : entries[0].color
}

function colorFromTempInterpolated(temperature: number): [number, number, number, number] {
    const minIdx = TEMPERATURES.length-1
    if (temperature >= TEMPERATURES[0].value) return TEMPERATURES[0].color
    if (temperature <= TEMPERATURES[minIdx].value) return TEMPERATURES[minIdx].color

    let closeMax: ColorEntry = TEMPERATURES[0]
    let closeMin: ColorEntry = TEMPERATURES[minIdx]
    for (let i=0; i<TEMPERATURES.length; i++) {
        const currentDeg = TEMPERATURES[i].value
        if (currentDeg >= temperature && currentDeg < closeMax.value) {
            closeMax = TEMPERATURES[i]
        }

        if (currentDeg <= temperature && currentDeg > closeMin.value) {
            closeMin = TEMPERATURES[i]
        }
    }

    const maxDeg = closeMax.color.slice(0, 3) as [number, number, number]
    const minDeg = closeMin.color.slice(0, 3) as [number, number, number]
    const scale = Math.abs(closeMax.value - closeMin.value)
    const delta = 255*(temperature - closeMin.value)/scale
    const rgba = interpolateColors(delta, minDeg, maxDeg)

    return rgba
}
