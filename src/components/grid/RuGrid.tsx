import { CompletedRow } from "./CompletedRow";
import { DragRacer } from "../types/DragRacer";
import Grid from "@mui/material/Grid";

type Props = {
  guesses: DragRacer[];
  solution: DragRacer;
};

export const RuGrid = ({ guesses, solution }: Props) => {
  return (
    <>
      <Grid container className="grid-header" spacing={0}>
        <Grid className="grid-header-cell" item xs={12} md={3.5}></Grid>
        <Grid className="grid-header-cell" item xs={2} md={1.66}>
          Season
        </Grid>
        <Grid className="grid-header-cell" item xs={2} md={1.66}>
          Position
        </Grid>
        <Grid className="grid-header-cell" item xs={2} md={1.66}>
          Age
        </Grid>
        <Grid className="grid-header-cell" item xs={6} md={3.5}>
          Hometown
        </Grid>
      </Grid>

      {guesses.map((guess, i) => (
        <CompletedRow racer={guess} solution={solution} />
      ))}
    </>
  );
};
