import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './router/Routes'
import { RouterProvider } from 'react-router-dom'
import { PlanProvider } from './context/PlanContext'
import { ExerciseProvider } from './context/ExerciseContext'
import { VideoProvider } from './context/VideoContext'

createRoot(document.getElementById('root')).render(
  <PlanProvider>
    <ExerciseProvider>
      <VideoProvider>
        <RouterProvider router={router} />
      </VideoProvider>
    </ExerciseProvider>
  </PlanProvider>
)
