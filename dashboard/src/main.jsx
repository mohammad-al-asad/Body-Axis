import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './router/Routes'
import { RouterProvider } from 'react-router-dom'
import { ProtocolProvider } from './context/ProtocolContext'
import { ExerciseProvider } from './context/ExerciseContext'
import { VideoProvider } from './context/VideoContext'

createRoot(document.getElementById('root')).render(
  <ProtocolProvider>
    <ExerciseProvider>
      <VideoProvider>
        <RouterProvider router={router} />
      </VideoProvider>
    </ExerciseProvider>
  </ProtocolProvider>
)
