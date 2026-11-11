import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core'
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon'
import type { ItemStatus, PromotionItem } from '../types'
import { newItem } from '../model'
import { useItems, upsertItem } from '../store'
import { StatusLabel } from '../components/StatusLabel'
import AddItemModal from '../components/AddItemModal'

const OWNER = 'karl' // v1: no auth yet (Auth decision in #2 pending); hardcode current user

const GROUPS: { key: string; label: string; statuses: ItemStatus[] }[] = [
  { key: 'in-progress', label: 'In progress', statuses: ['draft', 'ready'] },
  { key: 'pending', label: 'Pending', statuses: ['pending'] },
  { key: 'done', label: 'Done', statuses: ['done'] },
]

export function formatUpdated(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function QueuePage() {
  const { items, loaded } = useItems()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  const filtered = useMemo(
    () =>
      items.filter((i) => i.title.toLowerCase().includes(search.trim().toLowerCase())),
    [items, search],
  )

  const groups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        rows: filtered
          .filter((i) => g.statuses.includes(i.status))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      })),
    [filtered],
  )

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title) return
    const item = newItem(title, newDate, OWNER)
    await upsertItem(item)
    setAddOpen(false)
    setNewTitle('')
    setNewDate('')
    navigate(`/items/${item.id}`)
  }

  if (loaded && items.length === 0) {
    return (
      <>
        <EmptyState titleText="No promotion items yet" headingLevel="h2" icon={SearchIcon}>
          <EmptyStateBody>
            Track everything the team wants to promote — from idea to posted announcement.
          </EmptyStateBody>
          <EmptyStateActions>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              Add item
            </Button>
          </EmptyStateActions>
        </EmptyState>
        <AddItemModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          newTitle={newTitle}
          onTitleChange={setNewTitle}
          newDate={newDate}
          onDateChange={setNewDate}
          onAdd={handleAdd}
        />
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        <Title headingLevel="h1" size="xl">
          Promotion queue
        </Title>
        <Button variant="primary" onClick={() => setAddOpen(true)}>
          Add item
        </Button>
      </div>
      <Toolbar style={{ paddingTop: '0.5rem' }}>
        <ToolbarContent>
          <ToolbarItem>
            <TextInput
              type="search"
              aria-label="Search items by title"
              placeholder="Search by title…"
              value={search}
              onChange={(_e, v) => setSearch(v)}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {groups.map((g) => (
        <section key={g.key} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0.75rem 0 0.25rem' }}>
            {g.label.toUpperCase()} ({g.rows.length})
          </h3>
          {g.rows.length === 0 ? (
            <p style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: '0.25rem 0' }}>No items</p>
          ) : (
            <Table aria-label={`${g.label} items`} variant="compact">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Status</Th>
                  <Th>Owner</Th>
                  <Th>Target</Th>
                  <Th>Updated</Th>
                </Tr>
              </Thead>
              <Tbody>
                {g.rows.map((item: PromotionItem) => (
                  <Tr key={item.id}>
                    <Td dataLabel="Title">
                      <Link to={`/items/${item.id}`}>{item.title}</Link>
                    </Td>
                    <Td dataLabel="Status">
                      <StatusLabel status={item.status} />
                    </Td>
                    <Td dataLabel="Owner">{item.owner}</Td>
                    <Td dataLabel="Target">{item.targetDate || 'TBD'}</Td>
                    <Td dataLabel="Updated">{formatUpdated(item.updatedAt)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </section>
      ))}
      <AddItemModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        newTitle={newTitle}
        onTitleChange={setNewTitle}
        newDate={newDate}
        onDateChange={setNewDate}
        onAdd={handleAdd}
      />

    </>
  )
}
