import { Component, createSignal } from 'solid-js'
import { fetchLatestDini, ModelFeature } from './fetchDini'
import { API_ORIGIN } from '../consts'

export const DiniView: Component<{}> = () => {
    const [getFeatures, setFeatures] = createSignal<ModelFeature[]>([])

    fetchLatestDini().then(setFeatures)

    function onFeatureClick(id: string) {
        fetch(`${API_ORIGIN}/download-grib/${id}`)
            .then(re => re.json())
            .then(console.log)
        return false
    }

    return <ul>
        { getFeatures().map(({ created, datetime, modelRun, id}) =>
            <li>
                <span>{modelRun} {created}</span>
                <a href='' onClick={() =>onFeatureClick(id)}>{datetime}</a>
            </li>
        )}
    </ul>
}
