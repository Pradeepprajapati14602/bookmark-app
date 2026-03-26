import { Bookmark } from '@/types/database'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  bookmark: Bookmark | null
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({ isOpen, bookmark, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen || !bookmark) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete bookmark?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {bookmark.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {bookmark.url}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
