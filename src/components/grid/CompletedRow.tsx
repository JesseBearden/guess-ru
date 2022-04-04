import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";

type Props = {
  contestant: string;
  isRevealing?: boolean;
  season: number;
  outcome: number;
  age: number;
  hometown: string;
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary
}));

export const CompletedRow = ({
  contestant,
  isRevealing,
  season,
  outcome,
  age,
  hometown
}: Props) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={2}>
        <Item>{contestant}</Item>
      </Grid>
      <Grid item xs={2} md={1}>
        <Item>{season}</Item>
      </Grid>
      <Grid item xs={2} md={1}>
        <Item>{outcome}</Item>
      </Grid>
      <Grid item xs={2} md={1}>
        <Item>
          <div>{age}</div>
          <div>↑</div>
        </Item>
      </Grid>
      <Grid item xs={6} md={1}>
        <Item style={{ backgroundColor: "#f4e878" }}>
          <div>{hometown}</div>
          <div></div>
        </Item>
      </Grid>
    </Grid>
  );
};
