import React from "react";
import Cell from "./Cell";
import { STAGE, STAGE_CELL } from "../gameHelpers";

interface Props {
  stage: STAGE;
}

const Stage: React.FC<Props> = ({ stage }) => (
  <div
    className="stage"
    style={{
      gridTemplateRows: `repeat(${stage.length}, 1fr)`,
      gridTemplateColumns: `repeat(${stage[0].length}, 1fr)`,
    }}
  >
    {stage.map((row) =>
      row.map((cell: STAGE_CELL, x: number) => (
        <Cell key={x} type={cell[0]} status={cell[1]} />
      )),
    )}
  </div>
);

export default Stage;
