import { Component } from 'solid-js'
import { GribMessage } from '../interfaces/interfaces'

export const GribMessageView: Component<{
    id: number,
    message: GribMessage,
    getSelected: () => boolean,
    onMessageClick: (id: number) => void,
}> = ({ id, message, getSelected, onMessageClick }) => {
    const { discipline, category, product, subType, levelType, levelValue } = message.meteo
    const shortTitle = message.title.split(', ').slice(1).join(', ')
    let text = `${discipline}-${category}-${product}-${subType}`
    if (discipline === 0 && category === 0 && product === 0) {
        text += ` ${levelType}-${levelValue}`
    }
    text += ` ${shortTitle}`

    return <li
        style={{ 'font-weight': getSelected() ? 'bold' : 'normal' }}
        onClick={() => onMessageClick(id)}
        >
            { text }
        </li>
}
