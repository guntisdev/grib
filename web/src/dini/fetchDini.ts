import { API_ORIGIN } from '../consts.ts'

export function fetchLatestDiniSf() {
    return fetch(`${API_ORIGIN}/dini-sf-structure`)
        .then(re => re.json())
        .then(parseDini)
        .then(features => features.sort(sortRecentDini))
}

export function parseDini(json: any): ModelFeature[] {
    if (!Array.isArray(json.features)) throw new Error('Failed parsing features from dini_sf')

    const parsed = json.features.map((feature: any) => {
        if (
            typeof feature.id !== 'string'
            || typeof feature.properties !== 'object'
            || typeof feature.properties.created !== 'string'
            || typeof feature.properties.datetime !== 'string'
            || typeof feature.properties.modelRun !== 'string'
        ) throw new Error('Failed to parse harmonie feature')
        
        return {
            id: feature.id,
            created: feature.properties.created,
            datetime: feature.properties.datetime,
            modelRun: feature.properties.modelRun,
        }
    })

    return parsed
}

function sortRecentDini(a: ModelFeature, b: ModelFeature) {
    return a.modelRun > b.modelRun
        && a.created > b.created
        && a.datetime > b.datetime
        ? 1 : -1
}

export type ModelFeature = {
    id: string,
    created: string,
    datetime: string,
    modelRun: string,
}
