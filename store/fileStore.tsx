import { create } from "zustand";

interface FileStore {
  file: FileList | null;
  setFile: (files: FileList | null) => void;
}

export const useFileStore = create<FileStore>()((set) => ({
  file: null,
  setFile: (files: FileList | null) => set(() => ({ file: files })),
}));
