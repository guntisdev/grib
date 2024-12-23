import { Component, createSignal } from 'solid-js'

import styles from './grib.module.css'
import { API_ORIGIN } from '../consts'
import { GribMessage } from '../interfaces/interfaces'
import { sortMeteoParams } from '../interfaces/meteoMapping'
import { GribMessageView } from './GribMessage'
import { drawGrib } from './drawGrib'
import { Loading } from '../compontents/loading/Loading'

export const GribView: Component<{}> = () => {
    let canvas: HTMLCanvasElement | undefined
    const [getMessages, setMessages] = createSignal<GribMessage[]>([])
    const [getFileName, setFileName] = createSignal('')

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            setMessages(gribArr)
        })
    
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

        fetch(`${API_ORIGIN}/binary-chunk/${offset}/${length}`)
            .then(re => re.arrayBuffer())
            .then(buffer => drawGrib(canvas, message, new Uint8Array(buffer)))
    }

    return <>
        <canvas ref={canvas} />
        <div class={styles.sidebar}>
            <b>{ getFileName() }</b>
            <ul>
                { getMessages().length === 0 && <Loading /> }
                { getMessages().map((message, i) =>
                    <GribMessageView id={i} message={message} onMessageClick={onMessageClick} />
                )}
            </ul>
        </div>
    </>
}