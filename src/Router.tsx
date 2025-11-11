import { Routes, Route } from 'react-router-dom'
import FunctionPlotter from './pages/FunctionPlotter'

export default function Router() {
    return (
        <Routes>
            <Route path="*" element={<FunctionPlotter />} />
        </Routes>
    )
}
