"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [folders, setFolders] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [activeSub, setActiveSub] = useState<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFolderId = searchParams.get('folderId')

  const fetchContent = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      const [foldersRes, filesRes, subRes] = await Promise.all([
        fetch(`${baseUrl}/api/folders${currentFolderId ? `?parentId=${currentFolderId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/files${currentFolderId ? `?folderId=${currentFolderId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/subscriptions/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (foldersRes.ok) setFolders(await foldersRes.json())
      if (filesRes.ok) setFiles(await filesRes.json())
      if (subRes.ok) {
        const subContent = await subRes.json()
        setActiveSub(subContent)
      }
    } catch (err) {
      console.error('Failed to fetch content:', err)
    } finally {
      setLoading(false)
    }
  }, [currentFolderId])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      router.push('/login')
      return
    }

    setUser(JSON.parse(storedUser))
    fetchContent()
  }, [router, fetchContent])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeSub) {
      alert('Please choose a subscription plan before uploading files.')
      router.push('/dashboard/upgrade')
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    if (currentFolderId) formData.append('folderId', currentFolderId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        fetchContent()
      } else {
        const data = await response.json()
        if (data.error === 'No subscription') {
          alert('You do not have an active subscription. Redirecting to plan selection...')
          router.push('/dashboard/upgrade')
        } else {
          alert(data.error || 'Upload failed')
        }
      }
    } catch (err) {
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newFolderName, parentId: currentFolderId })
      })

      if (response.ok) {
        setNewFolderName('')
        setIsCreateFolderOpen(false)
        fetchContent()
      }
    } catch (err) {
      alert('Failed to create folder')
    }
  }

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/files/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) fetchContent()
    } catch (err) {
      alert('Delete failed')
    }
  }

  const navigateToFolder = (id: string | null) => {
    if (id) {
      router.push(`/dashboard?folderId=${id}`)
    } else {
      router.push('/dashboard')
    }
  }

  if (!user) return <div className="flex min-h-screen items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateToFolder(null)}>
            <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">SaaS Drive</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm py-2 px-4 rounded-lg font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!activeSub && !loading && (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">No active subscription found</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">Choose a plan to start uploading files and managing your folders.</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/upgrade')}
              className="w-full md:w-auto px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              Select a Plan
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Storage</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
              <span className="hover:underline cursor-pointer" onClick={() => navigateToFolder(null)}>Home</span>
              {currentFolderId && (
                <>
                  <span>/</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Folder</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New Folder
            </button>
            <label className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              {uploading ? 'Uploading...' : 'Upload File'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {isCreateFolderOpen && (
          <div className="mb-8 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleCreateFolder} className="flex gap-3">
              <input
                type="text"
                placeholder="Folder name"
                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-zinc-500"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="px-5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold">Create</button>
              <button type="button" onClick={() => setIsCreateFolderOpen(false)} className="px-4 py-2 text-zinc-500">Cancel</button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? (
            <div className="col-span-full py-20 text-center text-zinc-500 animate-pulse">Loading files and folders...</div>
          ) : (
            <>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => navigateToFolder(folder.id)}
                  className="group p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 mb-3 text-amber-500 dark:text-amber-400">
                    <svg fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                  </div>
                  <h3 className="text-sm font-semibold truncate text-zinc-900 dark:text-zinc-50">{folder.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{folder._count?.files || 0} items</p>
                </div>
              ))}

              {files.map(file => {
                const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${file.path.replace(/\\/g, '/')}`

                return (
                  <div
                    key={file.id}
                    className="group relative p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm flex flex-col items-center text-center cursor-pointer"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <div className="w-12 h-12 mb-3 text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                    </div>
                    <h3 className="text-sm font-bold truncate w-full text-zinc-900 dark:text-zinc-50 px-2">{file.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                      className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all z-10"
                      title="Delete file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                )
              })}

              {!loading && folders.length === 0 && files.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-zinc-200 dark:text-zinc-800">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <p className="text-zinc-500">This folder is empty</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
