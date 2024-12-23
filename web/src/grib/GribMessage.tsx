import { Component } from "solid-js";
import { GribMessage } from "../interfaces/interfaces";

export const GribMessageView: Component<{
    id: number,
    message: GribMessage,
    onMessageClick: (id: number) => void,
}> = ({ id, message, onMessageClick }) => {
    const { discipline, category, product } = message.meteo
    const text = `${discipline}-${category}-${product} ${message.title}`

    return <li onClick={() => onMessageClick(id)}>
        { text }
    </li>
}
