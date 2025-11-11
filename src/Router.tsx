import { Routes, Route } from 'react-router-dom'
import FunctionPlotter from './pages/FunctionPlotter'
import ComplexFunctionPlotter from './pages/ComplexFunctionPlotter'

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<FunctionPlotter />} />
            <Route path="/complex" element={<ComplexFunctionPlotter />} />
            <Route path="*" element={<FunctionPlotter />} />
        </Routes>
    )
}
