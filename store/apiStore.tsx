import {create} from 'zustand'


interface ApiStore {
  apiKey: String | null,
  setApiKey: (key: String) => void
}


const useApiStore = create<ApiStore>()((set) => ({
  apiKey: null,
  setApiKey: (key: String) => set(() => ({apiKey: key}))
}))
