'use client'

import {
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FiMessageSquare } from 'react-icons/fi'
import { AIChat } from './AiChat'

export function FloatingChatButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const modalSize = useBreakpointValue({ base: 'full', md: 'xl' })

  return (
    <>
      <IconButton
        aria-label="Open AI Assistant"
        icon={<FiMessageSquare />}
        position="fixed"
        bottom={4}
        right={4}
        size="lg"
        colorScheme="brand"
        borderRadius="full"
        boxShadow="lg"
        onClick={onOpen}
        zIndex={10}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay />
        <ModalContent h="700px" my={{ base: 0, md: 16 }}>
          <ModalCloseButton />
          <ModalBody p={0}>
            <AIChat onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}