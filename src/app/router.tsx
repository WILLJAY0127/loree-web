import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/features/shell/HomePage'

export const router = createBrowserRouter([{ path: '/', element: <HomePage /> }])
