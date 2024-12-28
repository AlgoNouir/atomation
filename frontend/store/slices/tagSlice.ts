import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagState {
  tags: Tag[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TagState = {
  tags: [],
  status: 'idle',
  error: null,
};

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (_, { getState }) => {
    const { auth } = getState() as RootState;
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tags/`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    return response.data;
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.status = 'succeeded';
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tags';
      });
  },
});

export const { addTag, removeTag, updateTag } = tagSlice.actions;
export default tagSlice.reducer;
