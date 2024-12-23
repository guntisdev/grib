import { Component, createSignal } from 'solid-js'
import { fetchLatestDini, ModelFeature } from './fetchDini'
import { API_ORIGIN } from '../consts'
import { Loading } from '../compontents/loading/Loading'

export const DiniView: Component<{}> = () => {
    const [getFeatures, setFeatures] = createSignal<ModelFeature[]>([])
    const [getIsLoading, setIsLoading] = createSignal(true)
    const [getServerMessage, setServerMessage] = createSignal('')

    fetchLatestDini().then(features => {
        setIsLoading(false)
        setFeatures(features)
    })

    function onFeatureClick(id: string) {
        setFeatures([])
        setIsLoading(true)
        fetch(`${API_ORIGIN}/download-grib/${id}`)
            .then(re => re.json())
            .then(response => {
                setIsLoading(false)
                setServerMessage(JSON.stringify(response))
            })

        return false
    }

    return <ul>
        { getIsLoading() && <Loading /> }
        { !!getServerMessage() && getServerMessage() }
        { getFeatures().map(({ created, datetime, modelRun, id}) =>
            <li>
                <span>{modelRun} {created}</span>
                <a href='' onClick={() =>onFeatureClick(id)}>{datetime}</a>
            </li>
        )}
    </ul>
}
