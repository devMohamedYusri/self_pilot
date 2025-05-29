'use client'

import { Bell } from 'lucide-react'
import { useState } from 'react'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <Bell className="h-5 w-5" />
        <span className="sr-only">View notifications</span>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg border z-20">
            <div className="p-4">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="mt-2 text-sm text-gray-500">
                No new notifications
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 