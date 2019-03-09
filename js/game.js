
$(document).ready(init);
var i
var j
var n = 8

class Desk{
    constructor() {
        this.sel = null

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
            }
    }

    select(cell) {
        if (this.sel != null)
            this.sel.select(false)
        cell.select(true)
        this.sel = cell
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

    motion_check(index) {
        var direct
        if (this.color == 1)
            direct = this.cell[0] + 1
        else
            direct = this.cell[0] - 1
        
        if (index[0] == direct)
            if (index[1] == this.cell[1] - 1 || index[1] == this.cell[1] + 1)
                this.move(index)
    }

    move(index) {
        this.remove()
        this.desk.set_cell(this.cell, 0)
        this.desk.set_cell(index, this)
        this.cell = index
        this.display()
    }
}


function init() {
    var music = document.getElementById('music');

    function switch_music(new_music) {
        music.pause()
        music.src = new_music;
        music.play();
    }

    var turn = 1

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