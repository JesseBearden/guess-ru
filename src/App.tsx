import "./styles.css";
import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { racers } from "./constants/racers";
import { TableContainer } from "@mui/material";
import { Paper } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState, useEffect } from "react";
import { Navbar } from "./components/navbar/Navbar";
import * as React from "react";
import { DragRacer } from "./components/types/DragRacer";
import { Grid } from "./components/grid/Grid";
import Rand, { PRNG } from "rand-seed";

function createData(
  queen: String,
  season: number,
  outcome: number,
  age: number,
  hometown: String
) {
  return { queen, season, outcome, age, hometown };
}

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

  const handleOnChangeText = (event, newValue) => {
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
      {/*}      <Button onClick={handleOpen}>How to play</Button> 
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >*
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            How to play
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            You probably shouldn't play this right now as it doesn't actually
            work
          </Typography>
        </Box>
      </Modal>*/}

      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={racers}
        sx={{ width: 300 }}
        onChange={handleOnChangeText}
        renderInput={(params) => <TextField {...params} label="Drag Queen" />}
      />

      <Grid guesses={guesses} solution={getQueenOfTheDay()} />
    </div>
  );
}
