import { Accessor, Component, createSignal } from 'solid-js'

import { GribMessageView } from './GribMessage'
import { GribMessage } from '../interfaces/interfaces'

import styles from './select.module.css'
import { fetchJson } from '../helpers/fetch'
import { API_ORIGIN } from '../consts'

export const Select: Component<{
    getMessages: Accessor<GribMessage[]>,
    onMessageClick: (id: number) => void,
    triggerSidebar: () => void,
}> = ({
    getMessages,
    onMessageClick,
    triggerSidebar,
}) => {
    const [getFileName, setFileName] = createSignal('')
    const [getSelectedMessage, setSelectedMessage] = createSignal(-1)

    fetchJson(`${API_ORIGIN}/grib-name`)
        .then(response => setFileName(response.fileName))
        .catch(err => console.warn(err.message))
    
    function getShortFilename () { return getFileName().replace('HARMONIE_DINI_SF_', '') }

    return <div class={styles.sidebar}>
        <div class={styles.header}>
            <b>{ getShortFilename() }</b>
            <span onClick={triggerSidebar} class='material-icons'>close</span>
        </div>
        <ul>
            { getMessages().map((message, i) =>
                <GribMessageView
                    id={i}
                    message={message}
                    getSelected={()=>i===getSelectedMessage()}
                    onMessageClick={() => {
                        setSelectedMessage(i)
                        onMessageClick(i)
                    }}
                />
            )}
        </ul>
    </div>
}
