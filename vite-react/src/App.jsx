import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { getData } from "./service";

function App() {
  return (
    <>
      <button
        onClick={async () => {
          const res = await getData({ name: "JACK" });
        }}
      >
        POST
      </button>
    </>
  );
}

export default App;
