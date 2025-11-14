import { Routes, Route } from 'react-router-dom'
import FunctionPlotter from './pages/FunctionPlotter'
import ComplexFunctionPlotter from './pages/ComplexFunctionPlotter'
import ComplexPlanePlotter from './pages/ComplexPlanePlotter'

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<FunctionPlotter />} />
            <Route path="/complex" element={<ComplexFunctionPlotter />} />
            <Route path="/complex-plane" element={<ComplexPlanePlotter />} />
            <Route path="*" element={<FunctionPlotter />} />
        </Routes>
    )
}
