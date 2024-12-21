import { createDiniView } from './dini/diniView.ts'
import { createGribView } from './grib/gribView.ts'


window.onload = () => {
    const container = document.querySelector('#app')!

    switch (location.pathname) {
        case '/dini':
            createDiniView(container)
        break;
        default:
            createGribView(container)
        break;
    }
}
