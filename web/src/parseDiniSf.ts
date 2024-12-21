import { API_ORIGIN } from './main.ts'

export function fetchLatestDiniSf() {
    return fetch(`${API_ORIGIN}/dini-sf-structure`)
        .then(re => re.json())
        .then(parseDiniSf)
}

export function parseDiniSf(json: any) {
    if (!json.features) throw new Error('Failed parsing features from dini_sf')

    // TODO extract needed things
    return json
}
