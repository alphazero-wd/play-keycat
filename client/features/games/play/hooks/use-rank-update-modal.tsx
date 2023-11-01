import { useState } from "react";

export const useRankUpdateModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onOpen = () => setIsModalOpen(true);
  const onClose = () => setIsModalOpen(false);
  return { isModalOpen, onOpen, onClose };
};
