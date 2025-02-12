interface ConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold text-gray-800">Save changes?</h3>
        <p className="text-gray-600 mt-2">
          Are you sure you want to save the changes to this task?
        </p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-500 px-4 py-2 rounded-lg text-white hover:bg-indigo-600"
            onClick={onConfirm}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
