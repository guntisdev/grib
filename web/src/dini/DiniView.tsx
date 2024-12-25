import { Component, createSignal } from 'solid-js'
import { fetchLatestDini, ModelFeature } from './fetchDini'
import { API_ORIGIN } from '../consts'
import { Loading } from '../compontents/loading/Loading'
import styles from './dini.module.css'
import { fetchJson } from '../helpers/fetch'

export const DiniView: Component<{}> = () => {
    const [getFeatures, setFeatures] = createSignal<ModelFeature[]>([])
    const [getIsLoading, setIsLoading] = createSignal(true)
    const [getServerMessage, setServerMessage] = createSignal('')

    fetchLatestDini()
        .then(features => {
            setIsLoading(false)
            setFeatures(features)
        })
        .catch(err => console.warn(err.message))

    function onFeatureClick(id: string) {
        setFeatures([])
        setIsLoading(true)
        fetchJson(`${API_ORIGIN}/download-grib/${id}`)
            .then(response => {
                setIsLoading(false)
                setServerMessage(JSON.stringify(response))
            })
            .catch(err => console.warn(err.message))

        return false
    }

    return <>
        <a href='/' class={styles.back}>
            <span class='material-icons'>arrow_back_ios</span>
            back
        </a>
        <ul>
            { getIsLoading() && <Loading /> }
            { !!getServerMessage() && getServerMessage() }
            { getFeatures().map(({ created, datetime, modelRun, id}) =>
                <li>
                    <span>{modelRun} {created}</span>
                    <a href='' onClick={() =>onFeatureClick(id)}>{datetime}</a>
                </li>
            )}
        </ul>
    </>
}
