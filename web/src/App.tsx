import { Route, Router } from '@solidjs/router'

import { DiniView } from './dini/DiniView'
import { GribView } from './grib/GribView'

function App() {
    return <Router>
        <Route path="/" component={GribView} />
        <Route path="/dini" component={DiniView} />
    </Router>
}

export default App
