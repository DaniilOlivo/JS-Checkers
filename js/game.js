$(document).ready(init);
var i
var j
var n = 8

// Фунукция сравнения массивов
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
                        color = 1 // Расстановка белых шашек
                    else
                        color = 0 // Расстановка черных шашек
                        
                    this.array[i][j] = new Checker([i, j], color, this)
                    this.array[i][j].display()
                } 
            }   
    }
    
    get_cell(index) {
        return this.array[index[0]][index[1]]
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
                this.sel.action(id)

                if (this.action) {
                    this.next_turn()
                    this.action = false
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

    check() {
        for(i = 0; i < n; i++)
            for(j = 0; j < n; j++)
                if (this.array[i][j] != 0)
                    this.array[i][j].check()
    }
}

class Checker {
    constructor(cell, color, desk) {
        this.cell = cell;
        this.color = color;
        this.desk = desk;
        
        this.mandatory_taking = false //Должна ли шашка бить
        this.possible_actions = []

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
            this.image = "img/selecting_checker_"+ color +".png" 
        else
            this.image = "img/checker_"+ color +".png"
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

    // Относительный индекс от шакшки
    relative_index(y, x) {
        return [this.cell[0] + y, this.cell[1] + x]
    }

    // Сокращенная проверка клеток
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

    check() {
        this.motion_check()
        this.take_check()
    }

    motion_check() {
        var direct
        if (this.color == 1)
            direct = + 1
        else
            direct = - 1
        
        for(i = -1; i <= 2; i += 2)
            if (this.desk.get_cell(direct, i) == 0)
                this.possible_actions.push({"Index": [direct, i]})
    }

    take_check() {
        var intermediate_cell // Клетка между index и клетткой, где стоит шашка

        for(i = -1; i <= 1; i += 2)
            for(j = -1; j <= 1; j += 2)
                if (this.desk.get_cell([i * 2, j * 2]) == 0) {
                    intermediate_cell = this.desk.get_cell(this.relative_index(i, j))
                    if (intermediate_cell != 0)
                        if (intermediate_cell.color != this.color) {
                            this.possible_actions.push({"Index": [i * 2, j * 2], "Target": intermediate_cell})
                            this.mandatory_taking = true
                        }
                }
    }

    action(index) {
        for(i = 0; i < this.possible_actions.length; i++) {
            var action = this.possible_actions[i]
            if (comparing_arrays(action["Index"], index))
                if ("Target" in action) {
                    this.movement(index)
                    action["Target"].removal()
                }
                else
                    this.movement(index)
        }
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