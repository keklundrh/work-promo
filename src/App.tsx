import { Route, Routes } from 'react-router-dom'
import {
  Masthead,
  MastheadBrand,
  MastheadMain,
  Page,
  PageSection,
} from '@patternfly/react-core'
import FedoraIcon from '@patternfly/react-icons/dist/esm/icons/fedora-icon'
import QueuePage from './pages/QueuePage'
import EditorPage from './pages/EditorPage'
import GenerationPage from './pages/GenerationPage'

// App identity per decision in #2: fedora logo, "CAI promotion tool", footer credit.
const APP_NAME = 'CAI promotion tool'

export default function App() {
  return (
    <Page
      masthead={
        <Masthead>
          <MastheadMain>
            <MastheadBrand>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FedoraIcon color="#e00" width={28} height={28} />
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{APP_NAME}</span>
              </span>
            </MastheadBrand>
          </MastheadMain>
        </Masthead>
      }
      footer={
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--pf-t--global--border--color--default)',
            color: 'var(--pf-t--global--text--color--subtle)',
          }}
        >
          built with ❤️ by RH AI BU CAI
        </div>
      }
    >
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
