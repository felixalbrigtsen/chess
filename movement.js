//This file only contains two functions, markPieces and markCastling
//The markPieces-function is quite efficient, like the reuse of code between rook, queen and bishop.
//Even though it is efficient, i have emphasized readability and maintainability over being concise.

function markPieces(index, reset, checked) {
    //Takes the index(address) of a piece and marks all its possible moves, by adding the possible indexes to "markedCells"
    //The "reset"-flag decides if you should empty the array first. Otherwise, the new markings are just appended.
    
    //The board is indexed from the top left, in the same way as a page of text, looping down a single line.
    //This means that board[index+8] is directly below board[index]. board[index-2] means two cells to the left.

    if (reset) { markedCells = [];}
    switch (board[index][0]){
        case 0: //Pawn
            if (board[index][1] == 0) {//White
                if ((index > 7) && (board[index-8][0] == -1)) { //One up
                    markedCells.push(index-8);
                    if ((index > 15) && (board[index-16][0] == -1) && (index > 47)) { //Two up
                        markedCells.push(index-16);
                    }
                }
                //Take a piece                
                if (index > 7) {
                    if (index % 8 != 7) { //Check right capture
                        if ((board[index-7][0] != -1) && (board[index-7][1] == 1)) {
                            markedCells.push(index-7);
                        }
                    }
                    if (index % 8 != 0) { //Check left capture
                        if ((board[index-9][0] != -1) && (board[index-9][1] == 1)) {
                            markedCells.push(index-9);
                        }
                    }
                }
            } else { //Black
                if ((index < 56) && (board[index+8][0] == -1)) { //One down
                    markedCells.push(index+8);
                    if ((index < 48) && (board[index+16][0] == -1) && (index < 16)) { //Two down
                        markedCells.push(index+16);
                    }
                }
                if (index < 56) {
                    if (index % 8 != 7) { //Check right capture
                        if ((board[index+9][0] != -1) && (board[index+9][1] == 0)) {
                            markedCells.push(index+9);
                        }
                    }
                    if (index % 8 != 0) { //Check left capture
                        if ((board[index+7][0] != -1 )&& (board[index+7][1] == 0)) {
                            markedCells.push(index+7);
                        }
                    }
                }  
            }
            break;
        case 1: //Bishop      
            var moves = [-7, 7, -9, 9];
            var markIndex = 0;

            //For each direction, move one step, mark it and repeat. 
            //Stop when hitting the edge or your own piece. Stop after an opponent piece.

            for (var i = 0; i < moves.length; i++) {
                markIndex = index + moves[i];
                var direction = (moves[i] + 16) % 8; //0 if up/down; 1 if right; 7 if left
    
                while((markIndex >= 0) && (markIndex < 64)) {
                    //Check that you don't wrap around the edge
                    if ((direction == 7) && (markIndex % 8 == 7)) { break; }
                    if ((direction == 1) && (markIndex % 8 == 0)) { break; }
    
                    if ((board[markIndex][0] != -1) && (board[markIndex][1] == board[index][1])) { break; } //Stop when hitting one of your own pieces
                    markedCells.push(markIndex);
                    if ((board[markIndex][0] != -1) && (board[markIndex][1] != board[index][1])) { break; } //Stop AFTER the first opponent

                    markIndex += moves[i];
                }
            }
            break;
            
        case 2: //Knight
            var ix = index % 8;
            var iy = (index - ix) / 8;
            //All moves: -17 -15 -10 -6 6 10 15 17
            //"L shape" movement of a knight, 2 squares in one direction, then 1 square any direction perpendicular to the first.
            
            //PossibleMoves are all moves not bound by the edge of the board
            var possibleMoves = [];
            if ((ix > 0) && (iy > 1)) { possibleMoves.push(-17); }
            if ((ix < 7) && (iy > 1)) { possibleMoves.push(-15); }

            if ((ix > 1) && (iy > 0)) { possibleMoves.push(-10); }
            if ((ix < 6) && (iy > 0)) { possibleMoves.push(-6); }

            if ((ix > 1) && (iy < 7)) { possibleMoves.push(6); }
            if ((ix < 6) && (iy < 7)) { possibleMoves.push(10); }

            if ((ix > 0) && (iy < 6)) { possibleMoves.push(15); }
            if ((ix < 7) && (iy < 6)) { possibleMoves.push(17); }

            var markIndex = 0;
            for (var i = 0; i < possibleMoves.length; i++) {
                markIndex = index + possibleMoves[i];
                if ((board[markIndex][0] != -1) && (board[markIndex][1] == board[index][1])) { continue; } //Can't take your own pieces
                markedCells.push(markIndex);
            }
            break;

        case 3: //Rook
           var moves = [-8, -1, 1, 8];
           var markIndex = 0;

           //For each direction, move one step, mark it and repeat. 
           //Stop when hitting the edge or your own piece. Stop after an opponent piece.

           for (var i = 0; i < moves.length; i++) {
               markIndex = index + moves[i];
               var direction = (moves[i] + 16) % 8; //0 if up/down; 1 if right; 7 if left
   
               while((markIndex >= 0) && (markIndex < 64)) {
                   //Check that you don't wrap around the edge
                   if ((direction == 7) && (markIndex % 8 == 7)) { break; }
                   if ((direction == 1) && (markIndex % 8 == 0)) { break; }
   
                   if ((board[markIndex][0] != -1) && (board[markIndex][1] == board[index][1])) { break; } //Stop when hitting one of your own pieces
                   markedCells.push(markIndex);
                   if ((board[markIndex][0] != -1) && (board[markIndex][1] != board[index][1])) { break; } //Stop AFTER the first opponent

                   markIndex += moves[i];
               }
           }

           break;

        case 4: //Queen
            var moves = [-9,-8,-7,-1,1,7,8,9];
            var markIndex = 0;

            //For each direction, move one step, mark it and repeat. 
            //Stop when hitting the edge or your own piece. Stop AFTER an opponent piece.

            for (var i = 0; i < moves.length; i++) {
                markIndex = index + moves[i];
                var direction = (moves[i] + 16) % 8; //0 if up/down; 1 if right; 7 if left

                while((markIndex >= 0) && (markIndex < 64)) {
                    //Check that you don't wrap around the edge
                    if ((direction == 7) && (markIndex % 8 == 7)) { break; }
                    if ((direction == 1) && (markIndex % 8 == 0)) { break; }

                    if ((board[markIndex][0] != -1) && (board[markIndex][1] == board[index][1])) { break; } //Stop when hitting one of your own pieces
                    markedCells.push(markIndex);
                    if ((board[markIndex][0] != -1) && (board[markIndex][1] != board[index][1])) { break; } //Stop AFTER the first opponent

                    markIndex += moves[i];
                }
            }
            break;

        case 5: //King
            var ix = index % 8;
            var iy = (index - ix) / 8;

            //Check that the checked Cell is not outside the board and that it does not contain a friendly piece

            if ((ix > 0) && ((board[index-1][0] == -1) || (board[index-1][1] != board[index][1]))) { markedCells.push(index-1); } //Left
            if ((ix < 7) && ((board[index+1][0] == -1) || (board[index+1][1] != board[index][1]))) { markedCells.push(index+1); } //Right
            if ((iy > 0) && ((board[index-8][0] == -1) || (board[index-8][1] != board[index][1]))) { markedCells.push(index-8); } //Up
            if ((iy < 7) && ((board[index+8][0] == -1) || (board[index+8][1] != board[index][1]))) { markedCells.push(index+8); } //Down 
            if ((ix > 0) && (iy > 0) && ((board[index-9][0] == -1) || (board[index-9][1] != board[index][1]))) { markedCells.push(index-9); } //Up Left
            if ((ix < 7) && (iy > 0) && ((board[index-7][0] == -1) || (board[index-7][1] != board[index][1]))) { markedCells.push(index-7); } //Up Right
            if ((ix > 0) && (iy < 7) && ((board[index+7][0] == -1) || (board[index+7][1] != board[index][1]))) { markedCells.push(index+7); } //Down Left
            if ((ix < 7) && (iy < 7) && ((board[index+9][0] == -1) || (board[index+9][1] != board[index][1]))) { markedCells.push(index+9); } //Down Right

            mark_castling(index);
            
            break;
    }
}

function mark_castling(index) {
    //Check that the rook hasn't been moved and that the path between rook and king is clear. If both conditions apply, allow castle.
    var prev_board = board.slice();

    if (index == 4) { //Black king

        if (has_moved[1][0]) { return; } //Black king has moved


        if ((!has_moved[1][1]) && (board[1][0] == -1) && (board[2][0] == -1) && (board[3][0] == -1)) { markedCells.push(2); } //Long; A-column
        if ((!has_moved[1][2]) && (board[5][0] == -1) && (board[6][0] == -1)) { markedCells.push(6); } //Short; H-column

    
    } else if (index == 60) { //White king

        //if (checked[0]) { return; }
        if (has_moved[0][0]) { return; } //White king has moved

        if ((!has_moved[0][1]) && (board[57][0] == -1) && (board[58][0] == -1) && (board[59][0] == -1)) { markedCells.push(58); } //Long; A-column
        if ((!has_moved[0][2]) && (board[61][0] == -1) && (board[62][0] == -1)) { markedCells.push(62); } //Short; H-column
        
    } 
}
