import {
  ButtonGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ModalProps,
} from "@chakra-ui/react";

import { WritableButton } from "@/components/chakra";

export const CreateModal = ({
  isOpen,
  onClose,
  children,
  title,
  isLoading,
  onSubmit,
}: ModalProps & {
  title: string;
  isLoading: boolean;
  onSubmit(): void;
}) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <WritableButton
              tooltipProps={{ actionName: title }}
              variant="black-ghost"
              isLoading={isLoading}
              isDisabled={isLoading}
              onClick={onSubmit}
            >
              Submit
            </WritableButton>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
