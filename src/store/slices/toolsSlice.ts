import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coords } from "../../types";

type Tools = "zoom" | "move";

interface IToolsSlice {
  canvasScale: number;
  canvasOffset: Coords;
  selectedTool: Tools | null;
  selectedElement: any;
}

const initialState: IToolsSlice = {
  canvasScale: 1,
  canvasOffset: {
    x: 0,
    y: 0,
  },
  selectedTool: null,
  selectedElement: null,
};

const toolsSlice = createSlice({
  name: "toolsSlice",
  initialState,
  reducers: {
    setScale: (state, action: PayloadAction<number>) => {
      state.canvasScale = action.payload;
    },
    setOffset: (state, action: PayloadAction<Coords>) => {
      state.canvasOffset = action.payload;
    },
  },
});

export default toolsSlice.reducer;

export const { setScale, setOffset } = toolsSlice.actions;
