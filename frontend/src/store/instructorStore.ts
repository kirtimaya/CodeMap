import { create } from 'zustand';

interface InstructorStore {
  instructorEnabled: boolean;
  setInstructorEnabled: (v: boolean) => void;
}

export const useInstructorStore = create<InstructorStore>((set) => ({
  instructorEnabled: false,
  setInstructorEnabled: (v) => set({ instructorEnabled: v }),
}));
