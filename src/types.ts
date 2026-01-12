export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string | null;
  notes: string | null;
  category: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface EntryInput {
  title: string;
  username: string;
  password: string;
  url: string | null;
  notes: string | null;
  category: string;
  favorite: boolean;
}

export interface UpdateEntryInput extends EntryInput {
  id: string;
}

export type ViewMode = 'all' | 'favorites' | 'category';
