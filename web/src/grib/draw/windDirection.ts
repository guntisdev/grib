import { API_ORIGIN } from '../../consts'
import { fetchBuffer } from '../../helpers/fetch'
import { valueToColorInterpolated } from '../../helpers/interpolateColors'
import { GribMessage, MeteoConversion } from '../../interfaces/interfaces'
import { WIND_SPEED } from './constants'

export function windDirectionColors(
    encodedU: number,
    encodedV: number,
    convU: MeteoConversion,
    convV: MeteoConversion,
) {
    // TODO extract also direction, currently only speed here
    const windSpeedU = (convU.reference + encodedU * Math.pow(2, convU.binaryScale)) * Math.pow(10, -convU.decimalScale)
    const windSpeedV = (convV.reference + encodedV * Math.pow(2, convV.binaryScale)) * Math.pow(10, -convV.decimalScale)
    const windSpeed = Math.sqrt(Math.pow(windSpeedU, 2) + Math.pow(windSpeedV, 2))

    return valueToColorInterpolated(windSpeed, WIND_SPEED)
}

export function windSpeedColors(
    encodedValue: number,
    { reference, binaryScale, decimalScale}: MeteoConversion,
) {
    const windSpeed = (reference + encodedValue * Math.pow(2, binaryScale)) * Math.pow(10, -decimalScale)
    return valueToColorInterpolated(windSpeed, WIND_SPEED)
}

export function fetchWindData(
    customMessage: GribMessage,
    gribArr: GribMessage[],
): Promise<[GribMessage[], ArrayBuffer[], ArrayBuffer[]]> {
    const windU = gribArr.find(m => m.meteo.discipline===0 && m.meteo.category===2 && m.meteo.product===2 && m.meteo.levelType===103 && m.meteo.levelValue===10)
    const windV = gribArr.find(m => m.meteo.discipline===0 && m.meteo.category===2 && m.meteo.product===3 && m.meteo.levelType===103 && m.meteo.levelValue===10)
    if (!windU || !windV) throw new Error('Didnt found u/v components of wind')

    const section7u = windU.sections.find(section => section.id === 7)
    const section7v = windV.sections.find(section => section.id === 7)
    if (!section7u || !section7v) throw new Error('Didnt found binaru section for wind u/v')

    const uBinaryOffset = section7u.offset + 5
    const uBinaryLength = section7u.size - 5

    const vBinaryOffset = section7v.offset + 5
    const vBinaryLength = section7v.size - 5

    return Promise.all([
        fetchBuffer(`${API_ORIGIN}/binary-chunk/${uBinaryOffset}/${uBinaryLength}`),
        fetchBuffer(`${API_ORIGIN}/binary-chunk/${vBinaryOffset}/${vBinaryLength}`),
    ]).then(([bufferU, bufferV]) => {
        const buffer = new Uint8Array(bufferU.byteLength + bufferV.byteLength)
        buffer.set(new Uint8Array(bufferU))
        buffer.set(new Uint8Array(bufferV), bufferU.byteLength)
        const messages = [customMessage, windU, windV]
        const buffers = [bufferU, bufferU, bufferV]
        return [messages, buffers, []]
    })
}
