import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagState {
  tags: Tag[];
}

const initialState: TagState = {
  tags: [
    { id: 'tag-1', name: 'Frontend', color: 'bg-blue-500' },
    { id: 'tag-2', name: 'Backend', color: 'bg-green-500' },
    { id: 'tag-3', name: 'Bug', color: 'bg-red-500' },
    { id: 'tag-4', name: 'Feature', color: 'bg-purple-500' },
    { id: 'tag-5', name: 'Documentation', color: 'bg-yellow-500' },
  ],
};

const tagSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<{ name: string; color: string }>) => {
      const newTag: Tag = {
        id: `tag-${state.tags.length + 1}`,
        name: action.payload.name,
        color: action.payload.color,
      };
      state.tags.push(newTag);
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag.id !== action.payload);
    },
    updateTag: (state, action: PayloadAction<{ id: string; name?: string; color?: string }>) => {
      const tagIndex = state.tags.findIndex(tag => tag.id === action.payload.id);
      if (tagIndex !== -1) {
        state.tags[tagIndex] = { ...state.tags[tagIndex], ...action.payload };
      }
    },
  },
});

export const { addTag, removeTag, updateTag } = tagSlice.actions;
export default tagSlice.reducer;

