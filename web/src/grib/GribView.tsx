import { Component, createEffect, createSignal } from 'solid-js'

import { API_ORIGIN } from '../consts'
import { GribMessage } from '../interfaces/interfaces'
import { sortMeteoParams } from '../interfaces/meteoMapping'
import { drawGrib } from './drawGrib'
import { Loading } from '../compontents/loading/Loading'
import { fetchBuffer, fetchJson } from '../helpers/fetch'

import styles from './grib.module.css'
import { Select } from './Select'
import { Settings } from './Settings'

const CROP_BOUNDS = { x: 1906-1-400, y: 950, width: 400, height: 300 }

export const GribView: Component<{}> = () => {
    let canvas: HTMLCanvasElement | undefined
    const [getMessages, setMessages] = createSignal<GribMessage[]>([])
    const [getIsLoading, setIsLoading] = createSignal(true)
    const [getIsSelectOpen, setIsSelectOpen] = createSignal(true)
    const [getIsSettingsOpen, setIsSettingsOpen] = createSignal(false)
    const fromColor = createSignal('#0000ff')
    const toColor = createSignal('#ffff00')
    const isCrop = createSignal(false)

    let cachedMessage: GribMessage | undefined
    let cachedBuffer: Uint8Array | undefined
    let cachedBitmask: Uint8Array | undefined

    fetchJson(`${API_ORIGIN}/grib-structure`)
        .then(async (gribArr: GribMessage[]) => {
            gribArr.sort(sortMeteoParams)
            setMessages(gribArr)
        })
        .catch(err => console.warn(err.message))
        .finally(() => setIsLoading(false))

    createEffect(() => {
        const colors: [string, string] = [fromColor[0](), toColor[0]()]
        const cropBounds = isCrop[0]() ? CROP_BOUNDS : undefined
        if (!cachedMessage || !cachedBuffer || !canvas) return;

        drawGrib(canvas, cachedMessage, cachedBuffer, cachedBitmask, colors, cropBounds)
    })

    function onMessageClick(id: number) {
        if (!canvas) throw new Error('canvas not found')
        const message = getMessages()[id]

        const bitmaskSection = message.sections.find(section => section.id === 6)
        if (!bitmaskSection) throw new Error('Binary section not found')
        const bitmaskOffset = bitmaskSection.offset + 6
        const bitmaskLength = bitmaskSection.size - 6
        const bitmaskPromise = bitmaskSection.size > 6
            ? fetchBuffer(`${API_ORIGIN}/binary-chunk/${bitmaskOffset}/${bitmaskLength}`)
            : Promise.resolve(undefined)

        const binarySection = message.sections.find(section => section.id === 7)
        if (!binarySection) throw new Error('Binary section not found')
        const binaryOffset = binarySection.offset + 5
        const binaryLength = binarySection.size - 5

        setIsLoading(true)

        Promise.all([
            fetchBuffer(`${API_ORIGIN}/binary-chunk/${binaryOffset}/${binaryLength}`),
            bitmaskPromise,
        ])
            .then(([binaryBuffer, bitmaskBuffer]) => {
                cachedMessage = message
                cachedBuffer = new Uint8Array(binaryBuffer)
                cachedBitmask = bitmaskBuffer && new Uint8Array(bitmaskBuffer)
                const colors: [string, string] = [fromColor[0](), toColor[0]()]
                const cropBounds = isCrop[0]() ? CROP_BOUNDS : undefined 
                drawGrib(canvas, cachedMessage, cachedBuffer, cachedBitmask, colors, cropBounds)
            })
            .catch(err => console.warn(err.message))
            .finally(() => setIsLoading(false))
    }
    
    function triggerSidebar() { return setIsSelectOpen(!getIsSelectOpen()) }
    function triggerSettings() { return setIsSettingsOpen(!getIsSettingsOpen())}
    function menuHiddenCss() { return getIsSelectOpen() ? styles.hidden : '' }
    function settingsHiddenCss() { return getIsSettingsOpen() ? styles.hidden : '' }

    return <>
        <canvas ref={canvas} />
        <div class={styles.top}>
            <span class={`material-icons ${menuHiddenCss()}`} onClick={triggerSidebar}>menu</span>
            <span>{ getIsLoading() && <Loading /> }</span>
            <span class={`material-icons ${settingsHiddenCss()}`} onClick={triggerSettings}>settings</span>
        </div>
        <div style={{ visibility: getIsSelectOpen() ? 'visible' : 'hidden'}}>
            <Select
                getMessages={getMessages}
                onMessageClick={onMessageClick}
                triggerSidebar={triggerSidebar}
            />
        </div>
        <div style={{ visibility: getIsSettingsOpen() ? 'visible' : 'hidden'}}>
            <Settings
                fromColor={fromColor}
                toColor={toColor}
                isCrop={isCrop}
                triggerSettings={triggerSettings}
            />
        </div>
    </>
}