import { Button, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  newTitle: string
  onTitleChange: (v: string) => void
  newDate: string
  onDateChange: (v: string) => void
  onAdd: () => void
}

export default function AddItemModal({
  isOpen,
  onClose,
  newTitle,
  onTitleChange,
  newDate,
  onDateChange,
  onAdd,
}: AddItemModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="small">
      <ModalHeader title="Add promotion item" />
      <ModalBody>
        <Form>
          <FormGroup label="Title" isRequired fieldId="add-title">
            <TextInput id="add-title" value={newTitle} onChange={(_e, v) => onTitleChange(v)} />
          </FormGroup>
          <FormGroup label="Target date (optional)" fieldId="add-date">
            <TextInput id="add-date" type="date" value={newDate} onChange={(_e, v) => onDateChange(v)} />
          </FormGroup>
          <p style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
            New items start as <strong>Pending</strong>.
          </p>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button key="add" variant="primary" onClick={onAdd} isDisabled={!newTitle.trim()}>
          Add
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
