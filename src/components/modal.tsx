import {
  Button, ButtonGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  ModalProps,
} from "@chakra-ui/react";

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
            <Button variant="black-ghost" isLoading={isLoading} isDisabled={isLoading} onClick={onSubmit}>
              Submit
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
