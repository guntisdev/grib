type RGBu8 = [number, number, number]
type RGBAu8 = [number, number, number, number]

export function interpolateColors(value: number, a: RGBu8, b: RGBu8): RGBAu8 {
    const color = a.slice(0).map((from, i) => {
        const to = b[i]
        const delta = (to - from) * (value/255)
        return from + delta
    })

    return [...color, 255] as RGBAu8
}