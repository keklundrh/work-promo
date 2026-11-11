import { Route, Routes } from 'react-router-dom'
import { Page, PageSection } from '@patternfly/react-core'
import QueuePage from './pages/QueuePage'
import EditorPage from './pages/EditorPage'
import GenerationPage from './pages/GenerationPage'

export default function App() {
  return (
    <Page>
      <PageSection>
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/items/:id" element={<EditorPage />} />
          <Route path="/items/:id/generate" element={<GenerationPage />} />
        </Routes>
      </PageSection>
    </Page>
  )
}
