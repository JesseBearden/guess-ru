import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import { DragRacer } from "../types/DragRacer";

type Props = {
  racer: DragRacer;
  solution: DragRacer;
  isRevealing?: boolean;
};

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

getSeasonItem = (racerSeason, solutionSeason) => {
  let itemClass: string = "";

  console.log("Season Delta " + (racerSeason - solutionSeason).toString);

  if (racerSeason === solutionSeason) {
    // Color Green
    itemClass = "green";
  } else if (
    racerSeason - solutionSeason < 2 &&
    racerSeason - solutionSeason > -2
  ) {
    itemClass = "yellow";
  }

  if (racerSeason > solutionSeason) {
    return <Item className={itemClass}>{racerSeason} ↓</Item>;
  } else if (racerSeason < solutionSeason) {
    return <Item className={itemClass}>{racerSeason} ↑</Item>;
  } else if (racerSeason == solutionSeason) {
    return <Item className={itemClass}>{racerSeason}</Item>;
  } else {
    console.log("We got a problem");
  }
};

getOutcomeItem = (racerOutcome, solutionOutcome) => {
  let itemClass: string = "";

  if (racerOutcome === solutionOutcome) {
    // Color Green
    itemClass = "green";
  } else if (
    racerOutcome - solutionOutcome < 2 &&
    racerOutcome - solutionOutcome > -2
  ) {
    itemClass = "yellow";
  }

  if (racerOutcome > solutionOutcome) {
    return <Item className={itemClass}>{racerOutcome} ↓</Item>;
  } else if (racerOutcome < solutionOutcome) {
    return <Item className={itemClass}>{racerOutcome} ↑</Item>;
  } else if (racerOutcome == solutionOutcome) {
    return <Item className={itemClass}>{racerOutcome}</Item>;
  } else {
    console.log("We got a problem");
  }
};

getAgeItem = (racerAge, solutionAge) => {
  let itemClass: string = "";

  if (racerAge === solutionAge) {
    // Color Green
    itemClass = "green";
  } else if (racerAge - solutionAge < 2 && racerAge - solutionAge > -2) {
    itemClass = "yellow";
  }

  if (racerAge > solutionAge) {
    return <Item className={itemClass}>{racerAge} ↓</Item>;
  } else if (racerAge < solutionAge) {
    return <Item className={itemClass}>{racerAge} ↑</Item>;
  } else if (racerAge == solutionAge) {
    return <Item className={itemClass}>{racerAge}</Item>;
  } else {
    console.log("We got a problem");
  }
};

getNameItem = (racerName, solutionName) => {
  let itemClass: string = "";

  if (racerName === solutionName) {
    itemClass = "green";
  }

  return <Item className={itemClass}>{racerName}</Item>;
};

export const CompletedRow = ({ racer, solution, isRevealing }: Props) => {
  return (
    <Grid container spacing={0.3}>
      <Grid item xs={12} md={3}>
        {getNameItem(racer.name, solution.name)}
      </Grid>
      <Grid item xs={2} md={1}>
        {getSeasonItem(racer.season, solution.season)}
      </Grid>
      <Grid item xs={2} md={1}>
        {getOutcomeItem(racer.outcome, solution.outcome)}
      </Grid>
      <Grid item xs={2} md={1}>
        {getAgeItem(racer.age, solution.age)}
      </Grid>
      <Grid item xs={6} md={3}>
        <Item>
          <div>{racer.hometown}</div>
        </Item>
      </Grid>
    </Grid>
  );
};
