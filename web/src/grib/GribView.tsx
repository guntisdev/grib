import { Component, createSignal } from 'solid-js'

import { API_ORIGIN } from '../consts'
import { GribMessage } from '../interfaces/interfaces'
import { sortMeteoParams } from '../interfaces/meteoMapping'
import { GribMessageView } from './GribMessage'
import { drawGrib } from './drawGrib'
import { Loading } from '../compontents/loading/Loading'
import { fetchBuffer, fetchJson } from '../helpers/fetch'

import styles from './grib.module.css'

export const GribView: Component<{}> = () => {
    let canvas: HTMLCanvasElement | undefined
    const [getMessages, setMessages] = createSignal<GribMessage[]>([])
    const [getFileName, setFileName] = createSignal('')
    const [getIsLoading, setIsLoading] = createSignal(true)
    const [getIsSidebarOpen, setIsSidebarOper] = createSignal(true)

    fetchJson(`${API_ORIGIN}/grib-structure`)
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            setMessages(gribArr)
        })
        .catch(err => console.warn(err.message))
        .finally(() => setIsLoading(false))
    
    fetchJson(`${API_ORIGIN}/grib-name`)
        .then(response => setFileName(response.fileName))
        .catch(err => console.warn(err.message))

    function onMessageClick(id: number) {
        if (!canvas) throw new Error('canvas not found')
        const message = getMessages()[id]

        const binarySection = message.sections.find(section => section.id === 7)
        if (!binarySection) throw new Error('Binary section not found')

        const offset = binarySection.offset + 5
        const length = binarySection.size - 5

        setIsLoading(true)
        fetchBuffer(`${API_ORIGIN}/binary-chunk/${offset}/${length}`)
            .then(buffer => drawGrib(canvas, message, new Uint8Array(buffer)))
            .catch(err => console.warn(err.message))
            .finally(() => setIsLoading(false))
    }

    function getShortFilename () { return getFileName().replace('HARMONIE_DINI_SF_', '') }
    function triggerSidebar() { return setIsSidebarOper(!getIsSidebarOpen()) }
    function sidebarHiddenCss() { return getIsSidebarOpen() ? '' : styles.hidden }
    function menuHiddenCss() { return getIsSidebarOpen() ? styles.hidden : '' }

    return <>
        <canvas ref={canvas} />
        <div class={styles.top}>
            <span class={`material-icons ${menuHiddenCss()}`} onClick={triggerSidebar}>menu</span>
            <span>{ getIsLoading() && <Loading /> }</span>
            <span class='material-icons' style={{visibility:'hidden'}}>settings</span>
        </div>
        <div class={`${styles.sidebar} ${sidebarHiddenCss()}`}>
            <div class={styles.header}>
                <b>{ getShortFilename() }</b>
                <span onClick={triggerSidebar} class='material-icons'>close</span>
            </div>
            <ul>
                { getMessages().map((message, i) =>
                    <GribMessageView id={i} message={message} onMessageClick={onMessageClick} />
                )}
            </ul>
            <a href='/dini'>&gt;&gt; Get latest harmonie dini sf &lt;&lt;</a>
        </div>
    </>
}