//Felix Albrigtsen 2020
//Main file
//Each section is described in comments

//Board / size constants
const cellSize = 46;
const padding = 3;
const textsize = cellSize * 0.7;
const circlepadding = cellSize / 6;
const boardSize = ((cellSize + padding) * 8) + padding;
const border = cellSize;
const canvSize = boardSize + border;

//Font constant, unicode
const pictureCharacters = [
    ["♙", "♗", "♘", "♖", "♕", "♔"],
    ["♟", "♝", "♞", "♜", "♛", "♚"]
]

//Display settings
var showMarked = true;
var colorScheme = 0; //0 = green, 1 = b&w
var colors; //Defined in setup
var pictures = [];
var flipBoard = false;

//Game state variables
var markedCells = [];
var selectedPiece = -1;
var board = [];
var king_position = [];
var turn = 0;
var is_checked = [false, false];
var has_moved = [[false, false, false], [false, false, false]]; //[white, black], and each color is [king, rook-A, rook-H]
var score = [0, 0];
var captured = [];

//Sound settings and objects
var sound_error;
var sound_capture;
var sound_move;
var sound_finish;
var enableSound = false;

//Each cell of the board is a list [x, y], where x is the piece type and y is the color
//Pieces:
//-1: Empty cell
//0: Pawn
//1: Bishop
//2: Knight
//3: Rook
//4: Queen
//5: King

//Colors:
//0: White
//1: Black


//TODO: 
// - (En passant)
// - (Detect Stalemate)

function preload() {
    set1 = [
        [
            loadImage("assets/set1/w_p.png"),
            loadImage("assets/set1/w_b.png"),
            loadImage("assets/set1/w_kn.png"),
            loadImage("assets/set1/w_r.png"),
            loadImage("assets/set1/w_q.png"),
            loadImage("assets/set1/w_ki.png")
        ],
        [
            loadImage("assets/set1/b_p.png"),
            loadImage("assets/set1/b_b.png"),
            loadImage("assets/set1/b_kn.png"),
            loadImage("assets/set1/b_r.png"),
            loadImage("assets/set1/b_q.png"),
            loadImage("assets/set1/b_ki.png")
        ]
    ];

    set2  = [
        [
            loadImage("assets/set2/w_p.png"),
            loadImage("assets/set2/w_b.png"),
            loadImage("assets/set2/w_kn.png"),
            loadImage("assets/set2/w_r.png"),
            loadImage("assets/set2/w_q.png"),
            loadImage("assets/set2/w_ki.png")
        ],
        [
            loadImage("assets/set2/b_p.png"),
            loadImage("assets/set2/b_b.png"),
            loadImage("assets/set2/b_kn.png"),
            loadImage("assets/set2/b_r.png"),
            loadImage("assets/set2/b_q.png"),
            loadImage("assets/set2/b_ki.png")
        ]
    ];
}

//Most statements in this function relies on P5JS
function setup() {
    //Create HTML5 Canvas as a javascript object.
    var canv = createCanvas(canvSize, canvSize).parent("canvasDiv");
    textFont("Trebuchet MS", textsize);
    colors = [ [color(230, 250, 200),color(70, 130, 70)], [color(255), color(70)] ];
    pictures = set1;
    noLoop();
    ellipseMode(CORNER);
    reset();
}

function setSound(enable) {
    //Takes a boolean true or false, and enables/disables all sound effects accordingly using 
    //HTML5 audiocontects
    enableSound = enable;
    if (enable) {
        getAudioContext().resume();

        soundFormats("mp3", "wav");
        sound_capture = loadSound("assets/Capture.mp3");
        sound_capture.setVolume(0.5);

        sound_error = loadSound("assets/Error.wav");
        sound_error.setVolume(0.5);

        sound_finish = loadSound("assets/Finished.mp3");
        sound_finish.setVolume(0.5);

        sound_move = loadSound("assets/Move1.mp3");
        sound_move.setVolume(0.5);
    } else {
        getAudioContext().suspend();
    }
}

function reset() {
    //board = (new Array(64)).fill([-1,0]); // <--- Empty board
    board = [
        [3,1], [2,1], [1,1], [4,1], [5,1], [1,1], [2,1], [3,1], //Black officers
        [0,1], [0,1], [0,1], [0,1], [0,1], [0,1], [0,1], [0,1], //Black pawns
        [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0],
        [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0],
        [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0],
        [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0], [-1,0],
        [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], [0,0], //White pawns
        [3,0], [2,0], [1,0], [4,0], [5,0], [1,0], [2,0], [3,0]  //White officers
    ]
    markedCells = [];
    selectedPiece = -1;
    king_position = [60, 4];
    turn = 0;
    is_checked = [false, false];
    has_moved = [[false, false, false], [false, false, false]];
    score = [0, 0];
    captured = [[],[]];
    drawBoard();
}

function drawBoard() {
    //Empty screen
    background(10);

    //Draw the borders
    fill(100);
    noStroke();
    rect(boardSize, 0, border + padding, canvSize);
    rect(0, boardSize, canvSize, border + padding);

    //Draw letters and numbers on the border of the board
    fill(255);
    for (var i = 0; i < 8; i++) {
        if ((flipBoard) && (turn == 1)) { j = 7 - i; } else { j = i; }
        text((j+1).toString(), boardSize+(border / 4), boardSize - (i*(cellSize+padding)) - (cellSize / 3));
        text("ABCDEFGH"[j], i * (cellSize + padding) + (border / 3), boardSize + border - (cellSize / 3));
    }
    

    //Display captured pieces to the right of the board
    document.getElementById("whitePieceBox").innerHTML = captured[1].join("");
    document.getElementById("blackPieceBox").innerHTML = captured[0].join("");

    var ix = 0;
    var iy = 0;

    for (var i = 0; i < board.length; i++) { //Draw each square on the board
        ix = i % 8;
        iy = (i-ix) / 8;

        if ((flipBoard) && (turn == 1)) { //Flip the board
            iy = 7 - iy;
            ix = 7 - ix;
        }

        //Set the square colors
        if ((flipBoard) && (turn == 1)) {
            fill(colors[colorScheme][abs(((i+iy)%2)-1)]);
        } else {
            fill(colors[colorScheme][(i+iy)%2]);
        }
        

        rect(ix*(padding + cellSize) + padding, iy*(padding + cellSize) + padding, cellSize, cellSize);

        //Markers for the current move.
        stroke(1);
        if ((showMarked) && (markedCells.includes(i))) { //Display the orange mark for all marked squares
            fill(250, 200, 0);
            ellipse(ix*(padding + cellSize) + padding + circlepadding, iy*(padding + cellSize) + padding + circlepadding, cellSize - 2*circlepadding, cellSize - 2*circlepadding);
        }
        if (i == selectedPiece) { //Blue marker for selected piece
            fill(100, 100, 255);
            ellipse(ix*(padding + cellSize) + padding + circlepadding, iy*(padding + cellSize) + padding + circlepadding, cellSize - 2*circlepadding, cellSize - 2*circlepadding);
        }

        //Draw the sprite of the piece.
        if (board[i][0] != -1) {
            image(pictures[board[i][1]][board[i][0]], ix*(padding + cellSize) + 2*padding, iy*(padding + cellSize) + 2*padding, cellSize-2*padding, cellSize-2*padding);
        }
    }
}


function test_mate(color) {
    //Backup, we want to test without permanently altering the board
    var prev_board = board.slice();
    var prev_marked = markedCells.slice();
    var checked = [false, false];
    checked[color] = true;

    for (var i = 0; i < board.length; i++) {
        if ((board[i][0] != -1) && (board[i][1] == color)) { // For every <color> piece
            markPieces(i, true);
            for (var j = 0; j < markedCells.length; j++) { // Try every possible move, denoted in markedcells
                var pre_move_board = board.slice();
                var prev_king_position = king_position.slice();

                //Move
                // "i" is the piece that is being moved.
                // "index" is the place it is being moved to.
                //This logic should be a copy of the moves sepcified in mouseClicked()
                var index = markedCells[j]
                board[index] = board[i];
                board[i] = [-1, 0];

                var castleChecked = false;

                if ((board[index][0] == 5) && (abs(i-index) != 1)) {
                    if (index == 2 || index == 6) {
                        castleChecked = test_check()[1];
                    }
                    if (index == 58 || index == 62) {
                        castleChecked = test_check()[0];
                    }
        
                    //Move the rook and check that the "passing" square is not being attacked/checked
                    if (index == 2) { //Black long

                        //Passing square
                        board[3] = board[2]; //Move king
                        board[2] = [-1, 0] //Clear new king spot
                        king_position[1] = 3;
                        castleChecked = castleChecked || test_check()[1];
                        //Undo test-move
                        board[2] = board[3]; //Move king
                        king_position[1] = 2;

                        //Rook
                        board[3] = board[0];
                        board[0] = [-1,0];

                    }
        
                    if (index == 6) { //Black short

                        //Passing square
                        board[5] = board[6]; //Move king
                        board[6] = [-1, 0] //Clear new king spot
                        king_position[1] = 5;
                        castleChecked = castleChecked || test_check()[1];
                        //Undo test-move
                        board[6] = board[5]; //Move king
                        king_position[1] = 6;


                        //Rook 
                        board[5] = board[7];
                        board[7] = [-1, 0];
                    }
        
                    if (index == 58) { //White long

                        //Passing square
                        board[59] = board[58]; //Move king
                        board[58] = [-1, 0] //Clear new king spot
                        king_position[0] = 59;
                        castleChecked = castleChecked || test_check()[0];
                        //Undo test-move
                        board[58] = board[59]; //Move king
                        king_position[0] = 58;


                        //Rook
                        board[59] = board[56];
                        board[56] = [-1, 0];
                    }
        
                    if (index == 62) { //White short

                        //Passing square
                        board[61] = board[62]; //Move king
                        board[62] = [-1, 0] //Clear new king spot
                        king_position[0] = 61;
                        castleChecked = castleChecked || test_check()[0];
                        //Undo test-move
                        board[62] = board[61]; //Move king
                        king_position[0] = 62;


                        //Rook
                        board[61] = board[63];
                        board[63] = [-1, 0];
                    }
                }

                if (board[index][0] == 5) { //Update king position index
                    king_position[color] = index;
                }
                //Check if still checked
                var stillChecked = test_check();

                if ((!stillChecked[color]) && (!castleChecked)) {
                    markedCells = prev_marked;
                    board = prev_board;
                    king_position = prev_king_position;
                    return false;
                }
                //Undo Move
                board = pre_move_board;
                king_position = prev_king_position;
            }
        }
    }
    markedCells = prev_marked;
    board = prev_board;
    king_position = prev_king_position;
    
    return true;
}

function test_check() {
    //Returns an array of booleans; [white-is-checked, black-is-checked]
    var prev_marked = markedCells.slice();
    markedCells = [];

    var white_check = false;
    for (var i = 0; i < board.length; i++) {
        if ((board[i][0] != -1) && (board[i][1] == 1)) {
            //If the square consists a black piece, mark every square it threatens
            markPieces(i, false);
            if (markedCells.includes(king_position[0])) {
                white_check = true;
                //console.log(i);
                break;
            }
        }
    }

    markedCells = [];
    var black_check = false;
    for (var i = 0; i < board.length; i++) {
        if ((board[i][0] != -1) && (board[i][1] == 0)) {
            //If the square consists a white piece, mark every square it threatens
            markPieces(i, false);
            if (markedCells.includes(king_position[1])) {
                black_check = true;
                //console.log(i);
                break;
            }
        }
    }
    markedCells = prev_marked;
    is_checked = [white_check, black_check];

    return [white_check, black_check];
}

function mouseClicked() {
    document.getElementById("gameStatus").innerHTML = "";
    //When you click; one of four things happen:
    //1: Select a new piece. If you click a piece that is not already selected, select this piece and mark possible moves
    //2: Move: If you click a marked square, move the selected piece there.
        //2.5: Take a piece: If the clicked cell contains an opponents piece, move there and delete the piece that was there. Keep score.
    //3: Deselect / Do nothing: If an empty cell that is not marked is clicked, remove all markers and do nothing

    //Ignore clicks outside the board
    if ((mouseX > boardSize) || (mouseX < 0) ){ return; }
    if ((mouseY > boardSize) || (mouseY < 0)) { return; }

    //Find out what square was clicked
    var xPos = ((mouseX - padding) - ((mouseX - padding) % (padding + cellSize))) / (padding + cellSize);
    var yPos = ((mouseY - padding) - ((mouseY - padding) % (padding + cellSize))) / (padding + cellSize);

    if ((flipBoard) && (turn == 1)) { yPos = 7 - yPos; xPos = 7 - xPos; } //Board is flipped if flipBoard is true;
    
    var index = (yPos * 8) + xPos;
    //console.log("Clicked " + index.toString());

    var prev_board = board.slice(); //"Back up" the board in case the user puts himself in check
    //Slice is used because javascript assigns a reference to the array specified and not a copy

    var prev_has_moved = has_moved.slice();
    var prev_score = score.slice();
    var prev_captured = captured.slice();

    if (markedCells.includes(index)) { //If you click a marked cell, move the selected piece there
        if (turn == 0) { turn = 1; } else { turn = 0; } //Alternate turns

        if (board[index][0] != -1) { //If the square already contains a piece, take it
            console.log("Capture!"); 
            if (enableSound) {
                sound_capture.play();
            }

            var color = abs(board[index][1] - 1);
            captured[color].push(pictureCharacters[board[index][1]][board[index][0]]);
            switch (board[index][0]) {
                case 0:
                    score[color] += 1;
                    break;
                case 1:
                    score[color] += 3;
                    break;
                case 2:
                    score[color] += 3;
                    break;
                case 3:
                    score[color] += 5;
                    break;
                case 4:
                    score[color] += 9;
                    break;
            }

        }

        //Check if these pieces have moved, to prohibit future casting
        if (selectedPiece == 60) { has_moved[0][0] = true; } //White King
        if (selectedPiece == 4) { has_moved[1][0] = true; } //Black King

        if (selectedPiece == 56) { has_moved[0][1] = true; } //White Rook A
        if (selectedPiece == 63) { has_moved[0][2] = true; } //White Rook H
        if (selectedPiece == 0) { has_moved[1][1] = true; } //Black Rook A
        if (selectedPiece == 7) { has_moved[1][2] = true; } //Black Rook H
        

        //Move to the clicked cells
        board[index] = board[selectedPiece];
        board[selectedPiece] = [-1, 0];

        var castleChecked = false;

        if ((board[index][0] == 5) && (abs(selectedPiece-index) != 1)) {
            if (index == 2 || index == 6) {
                castleChecked = test_check()[1];
            }
            if (index == 58 || index == 62) {
                castleChecked = test_check()[0];
            }

            //Move the king and check that the "passing" square is not being attacked/checked
            if (index == 2) { //Black long

                //Passing square
                board[3] = board[2]; //Move king
                board[2] = [-1, 0] //Clear new king spot
                king_position[1] = 3;
                castleChecked = castleChecked || test_check()[1];
                //Undo test-move
                board[2] = board[3]; //Move king
                king_position[1] = 2;

                //Rook
                board[3] = board[0];
                board[0] = [-1,0];

            }

            if (index == 6) { //Black short

                //Passing square
                board[5] = board[6]; //Move king
                board[6] = [-1, 0] //Clear new king spot
                king_position[1] = 5;
                castleChecked = castleChecked || test_check()[1];
                //Undo test-move
                board[6] = board[5]; //Move king
                king_position[1] = 6;


                //Rook 
                board[5] = board[7];
                board[7] = [-1, 0];
            }

            if (index == 58) { //White long

                //Passing square
                board[59] = board[58]; //Move king
                board[58] = [-1, 0] //Clear new king spot
                king_position[0] = 59;
                castleChecked = castleChecked || test_check()[0];

                //Undo test-move
                board[58] = board[59]; //Move king
                king_position[0] = 58;


                //Rook
                board[59] = board[56];
                board[56] = [-1, 0];
            }

            if (index == 62) { //White short

                //Passing square
                board[61] = board[62]; //Move king
                board[62] = [-1, 0] //Clear new king spot
                king_position[0] = 61;
                castleChecked = castleChecked || test_check()[0];
                //Undo test-move
                board[62] = board[61]; //Move king
                king_position[0] = 62;


                //Rook
                board[61] = board[63];
                board[63] = [-1, 0];
            }
        }

        if (board[index][0] == 0) {  //Upgrade pawns to queens.
            if (((board[index][1] == 0) && (index < 8)) || ((board[index][1] == 1) && (index >= 56))) {
                board[index][0] = 4;
            }
        }


        if (enableSound) {sound_move.play();}
        
        //Deselect everything
        selectedPiece = -1;
        markedCells = [];

        if (board[index][0] == 5) { //Update king position index
            king_position[board[index][1]] = index;
        }


        var checked = test_check();
        if (checked[board[index][1]] || castleChecked) { //If the user that just moved put himself into check, or did an illegal castling, revert move and keep turn.
            if (turn == 0) { turn = 1; } else { turn = 0; }
            console.log("Illegal move, in check");
            if (!(document.getElementById("gameStatus").innerHTML.includes("Illegal"))) {
                document.getElementById("gameStatus").innerHTML = document.getElementById("gameStatus").innerHTML + "Illegal move, under check!";
            }
            if(enableSound) {
                sound_error.play();
            }

            //Revert previous game state because no move has happened
            board = prev_board;
            has_moved = prev_has_moved;
            score = prev_score;
            captured = prev_captured;
        }

    } else {
        if ((board[index][0] != -1) && (board[index][1] != turn)) {
            return; //Don't interact with opponent pieces
        }
        //Select a piece, or if the cell is empty deselect everything
        if (board[index][0] == -1) {
            selectedPiece = -1;
            markedCells = [];
        } else {
            selectedPiece = index;
            markPieces(index, true);
        }
    }
    var checked = test_check();
    if (checked[0]) {
        if (!(document.getElementById("gameStatus").innerHTML.includes("Illegal"))) {
            document.getElementById("gameStatus").innerHTML = "White is checked";
        }
    }
    if (checked[1]) {
        if (!(document.getElementById("gameStatus").innerHTML.includes("Illegal"))) {
            document.getElementById("gameStatus").innerHTML = "Black is checked";
        }
    }

    drawBoard();
    if (checked[0] || checked[1]) {
        var mate = test_mate(0) || test_mate(1);
    } else {
        var mate = false;
    }

    if (mate) {
        if (checked[0]) {
            console.log("Checkmate! Black won!");
            document.getElementById("gameStatus").innerHTML = "Checkmate; Black won!";
        } else if (checked[1]) {
            console.log("Checkmate! White won!");
            document.getElementById("gameStatus").innerHTML = "Checkmate; White won!";
        }

        if (enableSound) {
            sound_finish.play();
        }  
    }
}

//Drawboard draws the border, and for each cell it draws correctly colored square, marker and the piece itself
//Reset defaults the required variables.
