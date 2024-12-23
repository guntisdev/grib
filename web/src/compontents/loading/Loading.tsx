import { Component } from 'solid-js'

import styles from './loading.module.css'

export const Loading: Component<{}> = () => {
    return <div class={styles.loader}></div>
}
