import { Component, Signal } from 'solid-js'

import styles from './settings.module.css'

export const Settings: Component<{
    fromColor: Signal<string>,
    toColor: Signal<string>,
    triggerSettings: () => void,
}> = ({
    fromColor: [getFromColor, setFromColor],
    toColor: [getToColor, setToColor],
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
        TODO:
        <ul>
            <li>color interpolation</li>
            <li>crop Latvia</li>
        </ul>
        <hr />
        <a href='/dini'>&gt;&gt; Get latest harmonie dini sf &lt;&lt;</a>
    </div>
}