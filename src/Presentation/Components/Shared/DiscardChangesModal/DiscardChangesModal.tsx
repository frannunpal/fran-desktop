import { type FC } from 'react';
import { Modal, Text, Button, Group } from '@mantine/core';

export interface DiscardChangesModalProps {
  opened: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DiscardChangesModal: FC<DiscardChangesModalProps> = ({
  opened,
  onConfirm,
  onCancel,
}) => (
  <Modal opened={opened} onClose={onCancel} title="Unsaved Changes" centered withinPortal>
    <Text size="sm" mb="lg">
      You have unsaved changes. Are you sure you want to discard them?
    </Text>
    <Group justify="flex-end" mt="md">
      <Button variant="default" onClick={onCancel}>
        Cancel
      </Button>
      <Button color="red" onClick={onConfirm}>
        Discard Changes
      </Button>
    </Group>
  </Modal>
);
