import { Component, createSignal } from 'solid-js'

import styles from './grib.module.css'
import { API_ORIGIN } from '../consts'
import { GribMessage } from '../interfaces/interfaces'
import { sortMeteoParams } from '../interfaces/meteoMapping'
import { GribMessageView } from './GribMessage'
import { drawGrib } from './drawGrib'

export const GribView: Component<{}> = () => {
    let canvas: HTMLCanvasElement | undefined
    const [getMessages, setMessages] = createSignal<GribMessage[]>([])

    fetch(`${API_ORIGIN}/grib-structure`)
        .then(re => re.json())
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            setMessages(gribArr)
        })

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
            <ul>
                TODO - request for cached file name
                { getMessages().map((message, i) =>
                    <GribMessageView id={i} message={message} onMessageClick={onMessageClick} />
                )}
            </ul>
        </div>
    </>
}