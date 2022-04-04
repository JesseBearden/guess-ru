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
  const index = Math.floor((now - epochMs) / msInDay) % racers.length;

  console.log("index" + index);
  return racers[index].label;
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
};

export default function App() {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [rows, setRows] = useState([]);

  const handleOnChangeText = (event, newValue) => {
    console.log(getQueenOfTheDay());

    if (newValue !== null) {
      if (newValue.label === getQueenOfTheDay()) {
        console.log("You're a winner baby!");
      }
      setRows([
        ...rows,
        createData(
          newValue.label,
          newValue.season,
          newValue.outcome,
          newValue.age,
          newValue.hometown
        )
      ]);
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

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell align="right">Season</TableCell>
              <TableCell align="right">Outcome</TableCell>
              <TableCell align="right">Age</TableCell>
              <TableCell align="right">Hometown</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.queen}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.queen}
                </TableCell>
                <TableCell align="right">{row.season}</TableCell>
                <TableCell align="right">{row.outcome}</TableCell>
                <TableCell align="right">{row.age}</TableCell>
                <TableCell align="right">{row.hometown}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
