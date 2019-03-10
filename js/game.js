
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

    conditional_test(id) {
        var cell = this.get_cell(id)
        
        if (cell != 0)
            this.select(cell)
        else 
            if (this.sel != null) {
                this.sel.motion_check(id)
                this.sel.check_take(id)

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
}

class Checker {
    constructor(cell, color, desk) {
        /*
        cell - индекс ячейки, где находится шашка
        color - цвет: 0 (черная) или 1 (белая)
        desk - ссылка на доску
        */
        this.cell = cell;
        this.color = color;
        this.desk = desk;

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

    motion_check(index) {
        var direct
        if (this.color == 1)
            direct = + 1
        else
            direct = - 1
        
        if (this.comp_arr(index, direct, -1) || this.comp_arr(index, direct, +1)) {
            this.move(index)
            this.desk.action = true
        }
    }

    move(index) {
        this.remove()
        this.desk.set_cell(this.cell, 0)
        this.desk.set_cell(index, this)
        this.cell = index
        this.display()
    }

    check_take(index) {
        var sides = [[+1, -1], [+1, +1], [-1, -1], [-1, +1]]
        var y
        var x
        var intermediate_cell // Клетка между index и клетткой, где стоит шашка
        var index_intermediate_cell

        for(i = 0; i < 4; i++) {
            y = sides[i][0]
            x = sides[i][1]
            if (this.comp_arr(index, y * 2, x  * 2)) {
                index_intermediate_cell = this.relative_index(y, x)
                intermediate_cell = this.desk.get_cell(index_intermediate_cell)
                if (intermediate_cell != 0)
                    if (intermediate_cell.color != this.color) {
                        this.move(index)
                        intermediate_cell.take()
                        this.desk.action = true
                    }
            }
        }
    }

    take() {
        this.remove()
        this.desk.set_cell(this.cell, 0)
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

        desk.conditional_test(id)
    })
}