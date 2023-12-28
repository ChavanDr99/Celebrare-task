import React, { useState, useRef, useEffect } from "react";
import Select from "react-dropdown-select";
import  { Toaster } from 'react-hot-toast';
import {toast} from 'react-hot-toast';

function App() {
  const [selectedValues, setSelectedValues] = useState([]);
  const [fontSize, setFontSize] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [history, setHistory] = useState([]);
  const historyIndex = useRef(-1);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [enteredText, setEnteredText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const options = [
    { value: 1, label: "ui-monospace" },
    { value: 2, label: "arial" },
    { value: 3, label: "cursive" },
    { value: 4, label: "system-ui" },
  ];

  useEffect(() => {
    const mainDiv = document.getElementById("mainDiv");
    if (mainDiv) {
      mainDiv.style.fontFamily = selectedValues.length > 0 ? selectedValues[0].label : "initial";
      mainDiv.style.fontSize = fontSize ? `${fontSize}px` : "initial";
      mainDiv.style.color = textColor;
    }
  }, [selectedValues, fontSize, textColor]);

  const onTextDragStart = (event) => {
    setIsDragging(true);
    const textContent = event.target.innerText;
    event.dataTransfer.setData("text/plain", textContent);
  };

  const onTextDragOver = (event) => {
    event.preventDefault();
  };

  const onTextDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const textContent = event.dataTransfer.getData("text/plain");
    const mouseX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const mouseY = event.clientY - event.currentTarget.getBoundingClientRect().top;

    setTextPosition({ x: mouseX, y: mouseY });
    setEnteredText(textContent);
    saveHistory();
  };

  const onChange = (values) => {
    setSelectedValues(values);
    saveHistory();
  };

  const onSizeChange = (event) => {
    const newSize = event.target.value;
    setFontSize(newSize);
    saveHistory();
  };

  const onColorChange = (event) => {
    const newColor = event.target.value;
    setTextColor(newColor);
    saveHistory();
  };

  const onAddTextClick = () => {
    if (enteredText.trim() !== "") {
      setEnteredText(enteredText);
      setTextPosition({ x: 0, y: 0 });
      saveHistory();
  
      toast.success('Text added successfully!', {
        position: "top-center"
      });
    } else {
      toast.error('Enter some Text', {
        position: "top-center"
      });
    }
  };
  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      applyHistory();
    }
  };

  const redo = () => {
    if (historyIndex.current < history.length - 1) {
      historyIndex.current++;
      applyHistory();
    }
  };

  const saveHistory = () => {
    const currentState = {
      fontFamily: selectedValues.length > 0 ? selectedValues[0].label : "initial",
      fontSize: fontSize ? `${fontSize}px` : "initial",
      color: textColor,
      positionX: textPosition.x,
      positionY: textPosition.y,
      textContent: enteredText,
    };

    const newHistory = [...history.slice(0, historyIndex.current + 1), currentState];
    setHistory(newHistory);
    historyIndex.current = newHistory.length - 1;
  };

  const applyHistory = () => {
    if (history.length > 0 && historyIndex.current >= 0) {
      const currentState = history[historyIndex.current];
      setSelectedValues([{ value: currentState.fontFamily, label: currentState.fontFamily }]);
      setFontSize(parseInt(currentState.fontSize));
      setTextColor(currentState.color);
      setTextPosition({ x: currentState.positionX, y: currentState.positionY });
      setEnteredText(currentState.textContent);

      const mainDiv = document.getElementById("mainDiv");
      if (mainDiv) {
        mainDiv.style.fontFamily = currentState.fontFamily;
        mainDiv.style.fontSize = currentState.fontSize;
        mainDiv.style.color = currentState.color;
      }
    }
  };

  return (
    <div className="">
      <h1 className="text-center ml-[20%] md:ml-auto text-5xl mt-5">Text Editor</h1>
      <div className="w-[100%] flex flex-col md:flex-row justify-center gap-4 p-10">
      <div className="w-[200px] h-[200px] p-8 flex flex-row md:flex-col items-center justify-center ml-[25%] md:ml-auto gap-5 md:gap-y-5" id="redo-undo">
        <button onClick={undo} className="px-6 p-2 bg-blue-400 hover:bg-blue-600 rounded-md font-semibold text-white">Undo</button>
        <button onClick={redo} className="px-6 p-2 bg-blue-400 hover:bg-blue-600 rounded-md font-semibold text-white">Redo</button>
      </div>
        <div
          className="w-[390px] h-[400px] md:w-[600px] md:h-[500px] border-2 border-blue-200 rounded-md p-5"
          id="mainDiv"
          onDragOver={onTextDragOver}
          onDrop={onTextDrop}
          style={{ position: "relative" }}
        >
          {enteredText && (
            <p
              draggable
              onDragStart={onTextDragStart}
              style={{
                cursor: isDragging ? "grabbing" : "move",
                position: "absolute",
                left: `${textPosition.x}px`,
                top: `${textPosition.y}px`,
                fontFamily: selectedValues.length > 0 ? selectedValues[0].label : "initial",
                fontSize: fontSize ? `${fontSize}px` : "initial",
                color: textColor,
              }}
            >
              {enteredText}
            </p>
          )}
        </div>
        <div className="w-[390px] h-[500px] border-2 border-blue-200 flex flex-col p-5 rounded-md">
          <h1 className="mt-5 text-3xl text-center">Edit Text</h1>
          <h1 className="mt-5">Font Family</h1>
          <Select options={options} onChange={(values) => onChange(values)} />

          <h1 className="mt-5">Size</h1>
          <input
            type="number"
            placeholder="Size"
            className="border border-blue-400 px-4"
            value={fontSize}
            onChange={(event) => onSizeChange(event)}
          />

          <h1 className="mt-5">Color</h1>
          <input
            type="color"
            className="border border-blue-400 px-4"
            value={textColor}
            onChange={(event) => onColorChange(event)}
          />

          <textarea
            type="text"
            placeholder="Enter new text"
            className="border border-blue-400 px-4 mt-5"
            value={enteredText}
            onChange={(event) => setEnteredText(event.target.value)}
          />

          <button
            onClick={onAddTextClick}
            className="mt-5 px-6 p-2 bg-blue-400 hover:bg-blue-600 rounded-md font-semibold text-white"
          >
            Add Text
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
