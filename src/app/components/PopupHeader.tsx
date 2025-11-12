import { XIcon } from "@phosphor-icons/react";

interface PopupHeaderProps {
  title: string;
  onClose: () => void;
}

export default function PopupHeader({ title, onClose }: PopupHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        {title}
      </h2>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}