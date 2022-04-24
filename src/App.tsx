import "./styles.css";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { racers } from "./constants/racers";
import { useState } from "react";
import { Navbar } from "./components/navbar/Navbar";
import { DragRacer } from "./components/types/DragRacer";
import { RuGrid } from "./components/grid/RuGrid";
import Rand from "rand-seed";

const getQueenOfTheDay = () => {
  // January 1, 2022 Game Epoch
  const epochMs = new Date(2022, 0).valueOf();
  const now = Date.now();
  const msInDay = 86400000;
  const seed = Math.floor((now - epochMs) / msInDay);

  const rand = new Rand(seed.toString());
  const index = Math.floor(rand.next() * racers.length);
  console.log(index.toString());

  const solution: DragRacer = {
    name: racers[index].label,
    season: racers[index].season,
    outcome: racers[index].outcome,
    age: racers[index].age,
    hometown: racers[index].hometown
  };

  return solution;
};

export default function App() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [guesses, setGuesses] = useState<DragRacer[]>([]);

  const handleOnChangeText = (event: any, newValue: any) => {
    const solution: DragRacer = getQueenOfTheDay();
    console.log("Solution " + JSON.stringify(solution));

    if (newValue !== null) {
      if (newValue.label === solution.name) {
        console.log("You're a winner baby!");
      }

      const currentGuess: DragRacer = {
        name: newValue.label,
        season: newValue.season,
        outcome: newValue.outcome,
        age: newValue.age,
        hometown: newValue.hometown
      };
      console.log("Guess" + JSON.stringify(currentGuess));
      setGuesses([...guesses, currentGuess]);
      console.log("Guesses" + JSON.stringify(guesses));
    }
  };

  return (
    <div className="game h-screen flex flex-col">
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
      />

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={racers}
        sx={{ width: 300 }}
        onChange={handleOnChangeText}
        renderInput={(params) => <TextField {...params} label="Drag Queen" />}
      />

      <RuGrid guesses={guesses} solution={getQueenOfTheDay()} />
    </div>
  );
}
