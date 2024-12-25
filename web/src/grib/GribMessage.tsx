import { Component } from "solid-js";
import { GribMessage } from "../interfaces/interfaces";

export const GribMessageView: Component<{
    id: number,
    message: GribMessage,
    onMessageClick: (id: number) => void,
}> = ({ id, message, onMessageClick }) => {
    const { discipline, category, product } = message.meteo
    const shortTitle = message.title.split(', ').slice(1).join(', ')
    const text = `${discipline}-${category}-${product} ${shortTitle}`

    return <li onClick={() => onMessageClick(id)}>
        { text }
    </li>
}
