$(document).ready(init);

var enable_music
var background
var color_font

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

    reset() {
        this.sel = null
        this.action = false
        this.turn = 1
        this.mandatory_taking = false
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
                    return this.check_win()
                }
            }
        return 0
    }

    check_win() {
        var black_checkers = 0
        var white_checkers = 0
        for(var k = 0; k < n; k++)
            for(var t = 0; t < n; t++) {
                var cell = this.array[k][t]
                if (cell != 0)
                    if (cell.color == 0)
                        black_checkers++
                    else
                        white_checkers++
            }
        
        if (black_checkers == 0)
            return 1
        else if (white_checkers == 0)
            return 2
        else
            return 0
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
        this.desk.sel = this.desk.get_cell(this.cell)
    }
}


class Vector {
    constructor(initial_coordinates, step_y, step_x, desk) {
        var k = 0
        var run = true

        this.array_index = [initial_coordinates]
        this.array_cell = []

        var new_index = []

        while (run) {
            new_index = [this.array_index[k][0] + step_y, this.array_index[k][1] + step_x]
            if (0 <= new_index[0] && new_index[0] < n &&
                0 <= new_index[1] && new_index[1] < n) {
                    this.array_index.push(new_index)
                    this.array_cell.push(desk.get_cell(new_index))
                    k++
                }
            else
                run = false
        }

        this.array_index.shift()
        this.len = k
    }

    sequence(element) {
        var vector = []

        for(var k = 0; k < this.len; k++) 
            if(this.array_cell[k] === element)
                vector.push(this.array_index[k])
            else
                break
                
        return vector
    }

    not_element(element) {
        var vector = []

        for(var k = 0; k < this.len; k++)
            if(this.array_cell[k] !== element)
                vector.push(this.array_index[k])
        
        return vector
    }

    after(index, return_type) {
        for(var k = 0; k < this.len - 1; k++)
            if(comparing_arrays(index, this.array_index[k]))
                if (return_type == "cell")
                    return this.array_cell[k + 1]
                else
                    return this.array_index[k + 1]
        return -1
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

                var vector = new Vector(this.cell, i, j, this.desk)
                var available_moves = vector.sequence(0)

                for(var t = 0; t < available_moves.length; t++)
                    if (comparing_arrays(available_moves[t], index))
                        return true
            }
        return false
    }
    
    take_check(index) {
        for(i = -1; i <= 1; i += 2)
            for(j = -1; j <= 1; j += 2) {

                var vector = new Vector(this.cell, i, j, this.desk)
                var available_moves = vector.not_element(0)

                if(available_moves.length > 0)                
                    if(this.desk.get_cell(available_moves[0]).color != this.color) {
                        var cell = vector.after(available_moves[0], "cell")

                        if(cell == 0) {
                            this.desk.mandatory_taking = true 
                            if (index === undefined)    
                                return true
                            else 
                                if(comparing_arrays(index, vector.after(available_moves[0], "index")))
                                    return [true, this.desk.get_cell(available_moves[0])]
                        }
                            
                    }
            }
        return false
    }
} 


function init() {
    if($('#theme').attr('value')) {
        background = "../img/bg.png"
        color_font = "darkgray"
    }
    else {
        background = "../img/bg2.jpg"
        color_font = "black"
    }

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

    function transition(where) {
        $('#start').hide();
        $('#menu_settings').hide();  
        $('#game').hide();
        $('#win').hide()

        $(where).show()
    }

    $('#start_game').on('click', start);
    $('#settings').on('click', function() {transition('#menu_settings')})
    $('#menu_settings button').on('click', function() {transition('#start')})

    function start() {
        desk.reset()

        switch_music("music/main.mp3")

        transition('#game')

        desk.place_checkers()
    }

    $('#desk').on('click', '.cell', function() {
        var id = $(this).attr('id')
        id = [+id[5], +id[7]]

        var result = desk.handler(id)
        if(result != 0)
            win(result)
    })

    function win(winner) {
        transition('#win')
        
        var losser = ""

        if(winner == 1) {
            winner = "белыe"
            losser = "Черныe"
        }
        else {
            winner = "черныe"
            losser = "Белыe"
        }


        $('#win h1').html("Победили " + winner + "!")
        $('#win h2').html(losser + " глотают пыль!")
    }

    $('#win button').on('click', start)
}
