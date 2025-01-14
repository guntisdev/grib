import { MeteoConversion } from '../../interfaces/interfaces'
import { interpolateColors } from './drawGrib'

const TEMPERATURES: { degree: number, color: [number, number, number, number]}[] = [
    { degree: 50, color: [133, 0, 62, 255] },
    { degree: 40, color: [195, 0, 0, 255] },
    { degree: 30, color: [255, 76, 56, 255] },
    { degree: 20, color: [255, 175, 111, 255] },
    { degree: 10, color: [255, 243, 81, 255] },
    { degree: 0, color: [195, 246, 215, 255] },
    { degree: -10, color: [94, 231, 240, 255] },
    { degree: -20, color: [63, 201, 243, 255] },
    { degree: -30, color: [79, 157, 232, 255] },
    { degree: -40, color: [0, 81, 163, 255] },
    { degree: -50, color: [79, 15, 134, 255] },
]

const IS_INTERPOLATED = true

export function temperatureColors(
    temp16bit: number,
    { reference, binaryScale, decimalScale}: MeteoConversion,
): [number, number, number, number] {
    const temperatureC = (reference + temp16bit * Math.pow(2, binaryScale)) * Math.pow(10, -decimalScale) - 273.15

    return IS_INTERPOLATED
        ? colorFromTempInterpolated(temperatureC)
        : colorFromTempThreshold(temperatureC)
}

function colorFromTempThreshold(temperature: number): [number, number, number, number] {
    const entries = TEMPERATURES.filter(t => t.degree <= temperature)

    return entries.length === 0 ? TEMPERATURES[TEMPERATURES.length-1].color : entries[0].color
}

function colorFromTempInterpolated(temperature: number): [number, number, number, number] {
    const coldestI = TEMPERATURES.length-1
    if (temperature >= TEMPERATURES[0].degree) return TEMPERATURES[0].color
    if (temperature <= TEMPERATURES[coldestI].degree) return TEMPERATURES[coldestI].color

    const entry = TEMPERATURES.find(t => t.degree === temperature)
    if (entry) return entry.color

    // returns two color
    const entries = TEMPERATURES.filter(t => Math.abs(t.degree - temperature) < 10)

    const c1 = entries[0].color.slice(0, 3) as [number, number, number]
    const c2 = entries[1].color.slice(0, 3) as [number, number, number]
    const scale = Math.abs(entries[0].degree - entries[1].degree)
    const delta = 255*(temperature - entries[1].degree)/scale
    const rgba = interpolateColors(delta, c2, c1)

    return rgba
}
