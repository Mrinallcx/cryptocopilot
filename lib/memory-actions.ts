// MEMORY FEATURE DISABLED/STUBBED OUT

export interface MemoryItem {
  id: string;
  name?: string;
  memory?: string;
  metadata?: {
    [key: string]: any;
  };
  user_id?: string;
  owner?: string;
  immutable?: boolean;
  expiration_date?: string | null;
  created_at: string;
  updated_at: string;
  categories?: string[];
}

export interface MemoryResponse {
  memories: MemoryItem[];
  total: number;
}

export const addMemory = async () => null;
export const searchMemories = async () => [];
export const getAllMemories = async () => [];
export const getMemoryById = async () => null; 