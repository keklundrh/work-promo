import { Route, Routes } from 'react-router-dom'
import { Page, PageSection } from '@patternfly/react-core'
import QueuePage from './pages/QueuePage'
import EditorPage from './pages/EditorPage'

export default function App() {
  return (
    <Page>
      <PageSection>
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/items/:id" element={<EditorPage />} />
        </Routes>
      </PageSection>
    </Page>
  )
}
