import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const notesAdapter = createEntityAdapter({});

const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotes: builder.query({
            query: () => "/notes",
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError;
            },
            keepUnusedDataFor: 5,
            transformResponse: (responseData) => {
                const loadedNotes = responseData.map((note) => {
                    note.id = note._id;
                    return note;
                });
                return notesAdapter.setAll(initialState, loadedNotes);
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: "note", id: "LIST" },
                        ...result.ids.map((id) => ({ type: "note", id })),
                    ];
                } else return [{ type: "note", id: "LIST" }];
            },
        }),
    }),
});

export const { useGetNotesQuery } = notesApiSlice;

// return the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select();

// create memoized selector
const selectNotesData = createSelector(
    selectNotesResult,
    (noteResult) => noteResult.data // normalized state object with ids & entities
);

// getSelector creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds,
} = notesAdapter.getSelectors(
    (state) => selectNotesData(state) ?? initialState
);
