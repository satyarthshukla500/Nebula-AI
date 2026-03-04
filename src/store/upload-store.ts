// File upload state management
import { create } from 'zustand'
import { FileUpload, WorkspaceType } from '@/types'

interface UploadState {
  uploads: FileUpload[]
  currentWorkspace: WorkspaceType | null
  
  addUpload: (upload: FileUpload) => void
  updateUpload: (id: string, updates: Partial<FileUpload>) => void
  removeUpload: (id: string) => void
  setUploads: (uploads: FileUpload[]) => void
  setWorkspace: (workspace: WorkspaceType) => void
  clearUploads: () => void
  getUploadsByWorkspace: (workspace: WorkspaceType) => FileUpload[]
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: [],
  currentWorkspace: null,
  
  addUpload: (upload) => set((state) => ({ 
    uploads: [...state.uploads, upload] 
  })),
  
  updateUpload: (id, updates) => set((state) => ({
    uploads: state.uploads.map(upload =>
      upload.id === id ? { ...upload, ...updates } : upload
    ),
  })),
  
  removeUpload: (id) => set((state) => ({
    uploads: state.uploads.filter(upload => upload.id !== id),
  })),
  
  setUploads: (uploads) => set({ uploads }),
  
  setWorkspace: (currentWorkspace) => set({ currentWorkspace }),
  
  clearUploads: () => set({ uploads: [] }),
  
  getUploadsByWorkspace: (workspace) => {
    return get().uploads.filter(upload => 
      upload.metadata?.workspace === workspace
    )
  },
}))
