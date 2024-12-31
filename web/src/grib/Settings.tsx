import { Component, Signal } from 'solid-js'

import styles from './settings.module.css'

export const Settings: Component<{
    fromColor: Signal<string>,
    toColor: Signal<string>,
    isCrop: Signal<boolean>,
    triggerSettings: () => void,
}> = ({
    fromColor: [getFromColor, setFromColor],
    toColor: [getToColor, setToColor],
    isCrop: [getIsCrop, setIsCrop],
    triggerSettings,
}) => {
    return <div class={styles.settings}>
        <div class={styles.header}>
            <span onClick={triggerSettings} class='material-icons'>close</span>
            <b>Settings</b>
        </div>
        <div>
            <input type='color' value={getFromColor()} onChange={e => setFromColor(e.target.value)}/>
            &nbsp;from color 0
        </div>
        <div>
            <input type='color' value={getToColor()} onChange={e => setToColor(e.target.value)} />
            &nbsp;to color 255
        </div>
        <hr />
        <div>
            <label>
                <input type='checkbox' checked={getIsCrop()} onChange={() => setIsCrop(!getIsCrop())} /> Crop Latvia part
            </label>
        </div>
        <hr />
        <div>
            <a href='/dini'>&gt;&gt; Get latest harmonie dini sf &lt;&lt;</a>
        </div>
    </div>
}
