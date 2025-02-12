interface EditDescriptionModalProps {
  taskId: string;
  editedDescription: string;
  setEditedDescription: (description: string) => void;
  descRef: React.RefObject<HTMLTextAreaElement>;
  onClose: () => void;
}

const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  taskId,
  editedDescription,
  setEditedDescription,
  descRef,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl overflow-auto">
        <h3 className="text-xl font-semibold text-gray-800">
          Edit Task Description
        </h3>
        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            ref={descRef}
            className="mt-1 w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-md py-2 px-3 focus:outline-none"
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-500 px-4 py-2 rounded-lg text-white hover:bg-indigo-600"
            onClick={() => {}}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDescriptionModal;
