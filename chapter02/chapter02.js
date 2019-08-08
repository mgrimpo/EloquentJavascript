/*jshint esversion: 6 */

(function () {

  let size = 16;
  let blackSymbol = "#";
  let whiteSymbol = "O";

  let chessBoard = "";
  for (let i = 0; i < size; i++){
    let currentLine = "";
    for (let j = 0; j < size; j++){
      if ( (i + j) % 2 == 0) {
        currentLine += whiteSymbol;
      }
      else {
        currentLine += blackSymbol;
      }
    }
    currentLine += "\n";
    chessBoard += currentLine;
  }

  console.log(chessBoard);
}());
