import { Component, createSignal } from 'solid-js'

import { API_ORIGIN } from '../consts'
import { GribMessage } from '../interfaces/interfaces'
import { sortMeteoParams } from '../interfaces/meteoMapping'
import { GribMessageView } from './GribMessage'
import { drawGrib } from './drawGrib'
import { Loading } from '../compontents/loading/Loading'
import styles from './grib.module.css'

export const GribView: Component<{}> = () => {
    let canvas: HTMLCanvasElement | undefined
    const [getMessages, setMessages] = createSignal<GribMessage[]>([])
    const [getFileName, setFileName] = createSignal('')
    const [getIsLoading, setIsLoading] = createSignal(true)
    const [getIsSidebarOpen, setIsSidebarOper] = createSignal(true)

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            setMessages(gribArr)
        })
        .finally(() => setIsLoading(false))
    
    fetch(`${API_ORIGIN}/grib-name`)
        .then(re => re.json())
        .then(response => setFileName(response.fileName))

    function onMessageClick(id: number) {
        if (!canvas) throw new Error('canvas not found')
        const message = getMessages()[id]

        const binarySection = message.sections.find(section => section.id === 7)
        if (!binarySection) throw new Error('Binary section not found')

        const offset = binarySection.offset + 5
        const length = binarySection.size - 5

        setIsLoading(true)
        fetch(`${API_ORIGIN}/binary-chunk/${offset}/${length}`)
            .then(re => re.arrayBuffer())
            .then(buffer => drawGrib(canvas, message, new Uint8Array(buffer)))
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
            <a href='/dini'>Get latest harmonie dini sf</a>
        </div>
    </>
}