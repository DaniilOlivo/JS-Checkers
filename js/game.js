$(document).ready(init);
var i
var j
var n = 8

function comparing_arrays(array_1, array_2) {
    for(var l = 0; l < array_1.length; l++)
        if (array_1[l] != array_2[l])
            return false
    return true
}

class Desk{
    constructor() {
        this.sel = null
        this.action = false
        this.turn = 1
        this.mandatory_taking = false
        
        this.array = new Array(n)
        for(i = 0; i < n; i++)
            this.array[i] = new Array(n)
    }

    fill_zero() {
        for(i = 0; i < n; i++)
            for(j = 0; j < n; j++)
                this.array[i][j] = 0
    }

    place_checkers() {
        this.fill_zero()
        for(i = 0; i < n; i++)
            if (i < 3 || i > 4) {
                if (i % 2 == 0)
                    j = 0
                else
                    j = 1
                
                for(j; j < n; j += 2) {
                    var color
                    if (i < 3) 
                        color = 1
                    else
                        color = 0
                        
                    this.array[i][j] = new Checker([i, j], color, this)
                    this.array[i][j].display()
                } 
            }   
    }
    
    get_cell(index) {
        if (0 <= index[0] && 0 <= index[1] && index[0] < n && index[1] < n)
            return this.array[index[0]][index[1]]
        else
            return -1
    }

    set_cell(index, value) {
        this.array[index[0]][index[1]] = value
    }

    handler(id) {
        var cell = this.get_cell(id)
        
        if (cell != 0)
            this.select(cell)
        else 
            if (this.sel != null) {
                var check_take = this.sel.take_check(id)
                if (check_take[0]) {
                    this.sel.movement(id)
                    check_take[1].removal()
                    if (!this.sel.take_check()) {
                        this.mandatory_taking = false
                        this.action = true
                    }
                }

                if (this.sel.motion_check(id) && !this.mandatory_taking) {
                    this.sel.movement(id)
                    this.action = true
                }

                this.sel.check_queen()

                if (this.action) {
                    this.next_turn()
                    this.action = false
                    this.check()
                }
            }
    }

    check() {
        var cell
        for(var k = 0; k < n; k++) {
            for(var t = 0; t < n; t++) {
                cell = this.array[k][t]
                if (cell != 0)
                    if (cell.color == this.turn) 
                        cell.take_check()
            }
        }
    }

    select(cell) {
        if (this.sel != null)
            this.sel.select(false)
        if (cell.color == this.turn) {
            cell.select(true)
            this.sel = cell
        }        
    }

    next_turn() {
        this.sel.select(false)
        this.sel = null
        if (this.turn == 1)
            this.turn = 0
        else
            this.turn = 1
    }
}

class Checker {
    constructor(cell, color, desk) {
        this.cell = cell;
        this.color = color;
        this.desk = desk;
        this.type = "checker"

        this.selecting = false;
        
        this.update_image()
    }

    update_image() {
        var color
        if (this.color == 1)
            color = "white"
        else
            color = "black"

        if (this.selecting)
            this.image = "img/selecting_" + this.type + "_"+ color +".png" 
        else
            this.image = "img/" + this.type + "_"+ color +".png"
    }

    indexing() {
        return $('#index'+ this.cell[0] + '-' + this.cell[1])
    }

    display() {
        this.indexing().html('<img src="'+ this.image +'" class="checker">')
    }

    remove() {
        this.indexing().empty()
    }

    select(value) {
        this.selecting = value;
        this.update_image()
        this.display()
    }

    relative_index(y, x) {
        return [this.cell[0] + y, this.cell[1] + x]
    }

    comp_arr(index, y, x) {
        return comparing_arrays(index, this.relative_index(y, x))
    }

    removal() {
        this.remove()
        this.desk.set_cell(this.cell, 0)
    }

    movement(index) {
        this.remove()
        this.desk.set_cell(this.cell, 0)
        this.desk.set_cell(index, this)
        this.cell = index
        this.display()
    }

    motion_check(index) {
        var direct
        if (this.color == 1)
            direct = + 1
        else
            direct = - 1
        
        if (this.comp_arr(index, direct, -1) || this.comp_arr(index, direct, +1))
            return true
        return false
    }

    take_check(index) {
        var intermediate_cell
        var cell

        for(i = -1; i <= 1; i += 2)
            for(j = -1; j <= 1; j += 2) {

                if (index === undefined)
                    cell = this.desk.get_cell(this.relative_index(i * 2, j * 2)) == 0
                else
                    cell = this.comp_arr(index, i * 2, j * 2)

                if (cell) {
                    intermediate_cell = this.desk.get_cell(this.relative_index(i, j))
                    if (intermediate_cell != 0)
                        if (intermediate_cell.color != this.color) {
                            this.desk.mandatory_taking = true
                            if (index === undefined)    
                                return true
                            return [true, intermediate_cell]
                        }
                }
            }
        return false
    }

    check_queen() {
        if (this.type == "checker")
            if (this.color == 1 && this.cell[0] == 7 ||
                this.color == 0 && this.cell[0] == 0)
                this.transoformation_queen()
    }

    transoformation_queen() {
        this.removal()
        this.desk.set_cell(this.cell, new Queen(this.cell, this.color, this.desk))
    }
}


class Vector {
    constructor(initial_coordinates, step_y, step_x) {
        var k = 0
        this.array = [[initial_coordinates[0] + step_y, initial_coordinates[1] + step_x]]
        
        while (0 < this.array[k][0] && this.array[k][0] < n - 1 &&
            0 < this.array[k][1] && this.array[k][1] < n - 1) {
            this.array.push([this.array[k][0] + step_y, this.array[k][1] + step_x])
            k++
            }
        
            this.len = k + 1
    } 
}


class Queen extends Checker {
    constructor(cell, color, desk) {
        super(cell, color, desk)
        this.type = "queen"
        this.update_image()

        this.display()
    }

    motion_check(index) {
        for(i = -1; i <= 1; i += 2)
            for(j = -1; j <= 1; j += 2) {
                var vector = new Vector(this.cell, i, j)
                var available_moves = []
                for(var t = 0; t < vector.len; t++)
                    if (this.desk.get_cell(vector.array[t]) == 0)
                        available_moves.push(vector.array[t])
                    else
                        break
                for(t = 0; t < available_moves.length; t++)
                    if (comparing_arrays(available_moves[t], index))
                        return true
            }
        return false
    }

    take_check(index) {
        var intermediate_cell
        var cell
        var flag = false

        for(i = -1; i <= 1; i += 2)
            for(j = -1; j <= 1; j += 2) {

                var vector = new Vector(this.cell, i, j)

                for(var t = 0; t < vector.len; t++) {
                    cell = this.desk.get_cell(vector.array[t])
                    if (cell != 0)
                        if (cell.color != this.color)
                            flag = true
                        else
                            break
                    else
                        if (flag) {
                                this.desk.mandatory_taking = true 
                                if (index === undefined)    
                                    return true
                                return [true, this.desk.get_cell(vector.array[t - 1])]
                            }
                        else
                            break
                }
            }
        return false
    }
} 


function init() {
    var music = document.getElementById('music');

    function switch_music(new_music) {
        music.pause()
        music.src = new_music;
        music.play();
    }

    create_HTML_table()
    function create_HTML_table() {
        for(i = 7; i >= 0; i--) {
            $('#desk').append('<tr id="row'+ i +'"></tr>')
            for(j = 0; j < n; j++)
                $('#row'+ i).append('<td id="index'+ i +'-'+ j +'" class="cell"></td>')
        } 
    }
    
    var desk = new Desk()

    $('#start button').on('click', start);

    function start() {
        switch_music("music/main.mp3")

        $('#start').hide();
        $('#game').show();

        desk.place_checkers()
    }

    $('#desk').on('click', '.cell', function() {
        var id = $(this).attr('id')
        id = [+id[5], +id[7]]

        desk.handler(id)
    })
}