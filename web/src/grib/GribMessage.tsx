import { Component } from 'solid-js'
import { GribMessage } from '../interfaces/interfaces'
import { isMeteoEqual } from './draw/drawGrib'

export const GribMessageView: Component<{
    id: number,
    message: GribMessage,
    getSelected: () => boolean,
    onMessageClick: (id: number) => void,
}> = ({ id, message, getSelected, onMessageClick }) => {
    const { discipline, category, product, subType, levelType, levelValue } = message.meteo
    const shortTitle = message.title.split(', ').slice(1).join(', ')
    let text = `${discipline}-${category}-${product}-${subType}`
    if (
        isMeteoEqual(message.meteo, [0,0,0]) // temperature
        || isMeteoEqual(message.meteo, [0,2,2]) // wind u component
        || isMeteoEqual(message.meteo, [0,2,3]) //wind w component
    ) {
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
