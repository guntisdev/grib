import { API_ORIGIN } from '../consts.ts'
import { fetchLatestDiniSf } from "./fetchDini.ts";

export function createDiniView(container: HTMLDivElement) {
    fetchLatestDiniSf().then(features => drawList(container, features))
}

function drawList(container: HTMLDivElement, features: ModelFeature[]) {
    const ul = document.createElement('ul')
    container.appendChild(ul)

    for(const {created, datetime, modelRun, id} of features) {
        const li = document.createElement('li')
        ul.appendChild(li)
        const span = document.createElement('span')
        li.appendChild(span)
        span.innerHTML = `${modelRun} ${created} `
        const anchor = document.createElement('a')
        li.appendChild(anchor)
        anchor.innerHTML = datetime
        anchor.href = ''
        anchor.onclick = () => {
            fetch(`${API_ORIGIN}/download-grib/${id}`)
                .then(re => re.json())
                .then(console.log)
            return false // prevents going to different page
        }
    }
}