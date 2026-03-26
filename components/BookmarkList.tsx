'use client'

import { useState, useRef } from 'react'
import { Bookmark } from '@/types/database'
import { createClientComponentClient } from '@/lib/supabase-client'
import DeleteConfirmDialog from './DeleteConfirmDialog'

interface BookmarkListProps {
  bookmarks: Bookmark[]
  loading: boolean
}

export default function BookmarkList({ bookmarks, loading }: BookmarkListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null)
  const supabaseRef = useRef<ReturnType<typeof createClientComponentClient> | null>(null)

  if (!supabaseRef.current) {
    supabaseRef.current = createClientComponentClient()
  }

  const supabase = supabaseRef.current

  const handleDeleteClick = (bookmark: Bookmark) => {
    setBookmarkToDelete(bookmark)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookmarkToDelete) return

    setDeletingId(bookmarkToDelete.id)
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkToDelete.id)

      if (error) throw error

      setShowDeleteDialog(false)
      setBookmarkToDelete(null)
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      alert('Failed to delete bookmark. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
    setBookmarkToDelete(null)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading your bookmarks...</p>
        </div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            Start building your collection by adding your first bookmark above!
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors block mb-1 truncate"
                >
                  {bookmark.title}
                </a>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors block truncate mb-3"
                >
                  {bookmark.url}
                </a>
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bookmark.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDeleteClick(bookmark)}
                disabled={deletingId === bookmark.id}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Delete bookmark"
              >
                {deletingId === bookmark.id ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Added {new Date(bookmark.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        bookmark={bookmarkToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancelDelete}
      />
    </>
  )
}
