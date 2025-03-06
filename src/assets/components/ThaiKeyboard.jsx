import { useState, useEffect } from "react";
import axios from "axios";
import "./Components.css";
import html2canvas from "html2canvas";
import AYG from '../../assets/LogoAYG.svg';

export default function ThaiKeyboard() {
  const thaiCharacters = [
    "ก", "ข", "ค", "ง", "จ", "ฉ", "ช", "ซ", "ญ", "ฎ",
    "ฏ", "ฐ", "ฑ", "ฒ", "ณ", "ด", "ต", "ถ", "ท", "ธ",
    "น", "บ", "ป", "ผ", "ฝ", "พ", "ฟ", "ม", "ย", "ร",
    "ล", "ว", "ศ", "ษ", "ส", "ห", "ฬ", "อ", "ฮ",
    "ะ", "ั", "า", "ำ", "ิ", "ี", "ึ", "ื", "ุ", "ู",
    "เ", "แ", "โ", "ใ", "ไ", "๐", "๑", "๒", "๓", "๔",
    "๕", "๖", "๗", "๘", "๙",
    "่", "้", "๊", "๋", "็", "์", "ๆ", "ฯ", "ฺ"
  ];

  const [text, setText] = useState([]);
  const [color, setColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(24);
  const [translatedText, setTranslatedText] = useState("");
  const [clickedButton, setClickedButton] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleKeyPress = (char) => {
    setText((prev) => {
      const newText = [...prev];
  
      // Si hay un carácter seleccionado, reemplazamos en esa posición
      if (selectedIndex !== null && selectedIndex >= 0) {
        newText.splice(selectedIndex, 1, { char, color }); // Reemplazamos el carácter en la posición seleccionada
        setSelectedIndex(selectedIndex + 1); // Movemos el cursor a la derecha después de escribir
      } else if (char === "\u00A0") { // Si el carácter es un espacio
        newText.push({ char, color }); // Agregar espacio al final
        setSelectedIndex(newText.length); // Asegura que el cursor se quede al final después de agregar el espacio
      } else {
        newText.push({ char, color });
        setSelectedIndex(newText.length);
      }
  
      return newText;
    });
  };
  

// Función para capturar el área de escritura y descargarla como imagen
const handleDownload = () => {
  const areaToCapture = document.getElementById("textArea"); // El contenedor del área donde se escribe el texto

  html2canvas(areaToCapture).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "thai-text.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

const handleBackspace = () => {
  setText((prev) => {
    if (prev.length === 0) return prev; // Si no hay texto, no hacer nada

    let newText = [...prev];
    let newIndex = selectedIndex;

    if (selectedIndex !== null) {
      newText.splice(selectedIndex, 1); // Eliminar el carácter seleccionado
      newIndex = selectedIndex - 1; // Mover el índice una posición atrás
    } else {
      newText.pop(); // Si no hay selección, borrar el último carácter
      newIndex = newText.length - 1; // Ajustar índice al último elemento
    }

    setSelectedIndex(newText.length > 0 ? Math.max(newIndex, 0) : null);
    return newText;
  });
};

const handleSpace = () => {
  setText((prev) => {
    const newText = [...prev];
    newText.push({ char: "\u00A0", color }); // Agregar espacio al final
    setSelectedIndex(newText.length); // Asegura que el cursor se quede al final después de agregar el espacio

    return newText;
  });
};

  // Función para traducir de tailandés a español
const handleTranslateToSpanish = async () => {
  const inputText = text.map(({ char }) => char).join("");
  try {
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
      params: {
        client: "gtx",
        sl: "th", // Origen: tailandés
        tl: "es", // Destino: español
        dt: "t",
        q: inputText,
      },
    });
    setTranslatedText(response.data[0].map((t) => t[0]).join(""));
  } catch (error) {
    console.error("Error al traducir:", error);
  }
};

// Función para traducir de español a tailandés
const handleTranslateToThai = async () => {
  const inputText = text.map(({ char }) => char).join("");
  try {
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
      params: {
        client: "gtx",
        sl: "es", // Origen: español
        tl: "th", // Destino: tailandés
        dt: "t",
        q: inputText,
      },
    });
    setTranslatedText(response.data[0].map((t) => t[0]).join(""));
  } catch (error) {
    console.error("Error al traducir:", error);
  }
};


  const handleButtonClick = (buttonType) => {
    setClickedButton(buttonType);
    setTimeout(() => {
      setClickedButton(null);
    }, 200);
  };

  // Manejar el pegado (paste) de texto
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text");
    setText((prev) => [
      ...prev,
      ...pastedText.split("").map((char) => ({ char, color }))
    ]);
  };

  // Actualiza el color general y, si hay un carácter seleccionado, actualiza su color
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (selectedIndex !== null) {
      setText((prev) =>
        prev.map((item, idx) => (idx === selectedIndex ? { ...item, color: newColor } : item))
      );
    }
  };

  const handleCharClick = (index) => {
    if (selectedIndex === index) {
      // Si el carácter ya está seleccionado, desmarcarlo
      setSelectedIndex(null);
      setColor("#000000"); // O el color predeterminado que desees
    } else {
      // Si es otro carácter, seleccionarlo
      setSelectedIndex(index);
      setColor(text[index].color); // Usar el color del carácter seleccionado
    }
  };


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Backspace") {
        handleBackspace();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="container">
      <div className="box">
        <div className="boxes">
          <div className="flex flex-col items-center p-4">
            {/* Área de texto */}
            <div className="left">
              <header>
                <h1><span className="text-gradient">ThaiApp</span></h1>
              </header>
              <div className="downBad">
                <div id="textArea" className="w-full max-w-lg min-h-[100px] p-4 rounded-lg bg-white shadow-md flex flex-wrap text-center">
                  {text.map(({ char, color }, index) => (
                    <span
                      key={index}
                      style={{ color, fontSize, cursor: "pointer" }}
                      className={selectedIndex === index ? "selected-char" : ""}
                      onClick={() => handleCharClick(index)}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* Controles de color y tamaño */}
                <div className="flex gap-2 mt-2">
                  <input type="color" value={color} onChange={handleColorChange} />
                  <input
                    type="number"
                    value={fontSize}
                    min="10"
                    max="100"
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="border p-1 rounded"
                  />
                </div>
                {/* Botones de acción */}
                <div className="flex gap-2 mt-4">
                <button className={`p-2 bg-pink-300 hover:bg-pink-500 text-white rounded-lg ${clickedButton === "backspace" ? "clicked" : ""}`}
                 onClick={() => {handleBackspace(); handleButtonClick("backspace");}}>
                  Borrar
                </button>


                  <button
                    className={`p-2 bg-pink-600 hover:bg-pink-800 text-white rounded-lg ${
                      clickedButton === "space" ? "clicked" : ""
                    }`}
                    onClick={() => {
                      handleSpace();
                      handleButtonClick("space");
                    }}
                  >
                    Espacio
                  </button>
                  <button
                    className={`p-2 bg-red-500 hover:bg-red-700 text-white rounded-lg ${
                      clickedButton === "download" ? "clicked" : ""
                    }`}
                    onClick={() => {
                      handleDownload();
                      handleButtonClick("download");
                    }}
                  >
                    Descargar como imagen
                  </button>
                 {/* Botón para traducir de tailandés a español */}
                <button className={`p-2 bg-violet-500 hover:bg-violet-700 text-white rounded-lg`} onClick={handleTranslateToSpanish}>
                  Traducir a Español
                </button>
                {/* Botón para traducir de español a tailandés */}
                <button className={`p-2 bg-purple-600 hover:bg-purple-800 text-white rounded-lg`} onClick={handleTranslateToThai}>
                  Traducir a Tailandés
                </button>
                </div>

                {/* Área de traducción */}
                <div className="mt-4 p-4 border rounded bg-white shadow-md">
                  <h3 className="text-lg font-bold">Traducción:</h3>
                  <p>{translatedText}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="boxes">
            <div className="right">
              {/* Botones de caracteres tailandeses */}
              <div className="grid grid-cols-10 gap-2 mt-4">
                {thaiCharacters.map((char) => (
                  <button
                    key={char}
                    className={`p-3 text-2xl bg-gray-200 rounded-lg hover:bg-gray-300 ${
                      clickedButton === char ? "clicked" : ""
                    }`}
                    onClick={() => {
                      handleKeyPress(char);
                      handleButtonClick(char);
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
              <div className="footer">
                <div className="finalText">
                <div className="box">
                <p className="finalT">Todos los derechos reservados Aránzazu Galvaliz 2025©</p>
                <img src={AYG} alt="logo" className='logoF'/></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

