import { CompletedRow } from "./CompletedRow";
import { DragRacer } from "../types/DragRacer";

type Props = {
  guesses: DragRacer[];
  solution: DragRacer;
};

export const Grid = ({ guesses, solution }: Props) => {
  return (
    <>
      {guesses.map((guess, i) => (
        <CompletedRow racer={guess} solution={solution} />
      ))}
    </>
  );
};
