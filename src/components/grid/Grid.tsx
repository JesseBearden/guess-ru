import { MAX_CHALLENGES } from "../../constants/settings";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
};

export const Grid = ({ guesses }: Props) => {
  return (
    <>
      {guesses.map((guess, i) => (
        <CompletedRow key={i} guess={guess} />
      ))}
    </>
  );
};
