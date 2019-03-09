
$(document).ready(init);

/*
Прежде чем читать данный код, сядь, сделай глубокий вдох, подумай о чем-нибудь хорошем,
ведь то что ты сейчас увидишь будет страшным и непонятным. Лучше поставь рядом мою фотографию
и при прочтении каждой строчки отправляй оскарбления и ругательства в сторону моей фотографии.
Надеюсь я тебя подготовил, и удачи тебе! Она тебе понадобится
*/



//Описание класса шашек
class Checker {
    constructor(cell, color, queen, desk) {
        /*
        cell - индекс ячейки, где находится шашка
        color - цвет: 0 (черная) или 1 (белая)
        queen - логическое значение - дамка ли это?
        desk - ссылка на доску
        */
        this.cell = cell;
        this.color = color;
        this.queen = queen;
        this.desk = desk;
        this.selecting = false; //Выделена ли шашка
        
        if (this.color == 1)
            this.image = "img/checker_white.png"
        else
            this.image = "img/checker_black.png"
    }

    // Индесакция клетки в HTML таблицы
    indexing() {
        return $('#index'+ this.cell[0] + '-' + this.cell[1])
    }

    // Замена изображения в клетке другим изображением
    display() {
        this.indexing().html('<img src="'+ this.image +'" class="checker">')
    }

    // Удаления изображения из клетки
    remove() {
        this.indexing().empty()
    }

    // Выделение шашки
    select() {
        this.selecting = true;
        if (this.color == 1)
            this.image = "img/selecting_checker_white.png"
        else
            this.image = "img/selecting_checker_black.png"
        this.display()
    }

    // Снятие выделения
    unselect() {
        this.selecting = false;
        if (this.color == 1)
            this.image = "img/checker_white.png"
        else
            this.image = "img/checker_black.png"
        this.display()
    }

    relative_index(bias, direct) {
        var y = bias;
        var x = bias
        if (direct == 0) {
            y = -y
            x = -x
        }
        else if (direct == 1)
            y = -y
        else if (direct == 2)
            x = -x
        return [this.cell[0] + y, this.cell[1] + x]
    }

    // Движение шашки
    move(new_cell, index) {
        if (new_cell == 0) {
            var direct; // Направление движения шашки, если черная то вниз, если белая то верх
            if (this.color == 1)
                direct = this.cell[0] + 1
            else
                direct = this.cell[0] - 1

            if (index[0] == direct)
                if (index[1] == this.cell[1] - 1 || index[1] == this.cell[1] + 1) {
                    this.remove() // Убираем изображение шашки с прошлой клетки
                    this.desk[this.cell[0]][this.cell[1]] = 0 // Помечаем клетку, где стояла шашка, как пустую
                    this.desk[index[0]][index[1]] = this // Записываем ссылку на шашку в новой клетке
                    this.cell = index // Даем шашки новые координаты
                    this.display() // Отображаем изображение шашки
                    return index // Возвращаем новый индекс выделенной шашки
                }
        }
        return this.cell // Возврашаем старый индекс выделенной шашки
    }

    // Взятие шашки опонента
    /*
    take(new_cell, index) {
        for(var i = 0; i <= 4; i++) {
            var nearest_cell = this.relative_index(1, i)
            
            if (this.desk[nearest_cell[0]][nearest_cell[1]] != 0) {
                console.log(this.relative_index(2, i))
                if (this.desk[nearest_cell[0]][nearest_cell[1]].color != this.color &&
                    this.relative_index(2, i) == index) {
                    this.remove() // Убираем изображение шашки с прошлой клетки
                    this.desk[this.cell[0]][this.cell[1]] = 0 // Помечаем клетку, где стояла шашка, как пустую
                    this.desk[index[0]][index[1]] = this // Записываем ссылку на шашку в новой клетке
                    this.cell = index // Даем шашки новые координаты
                    this.display() // Отображаем изображение шашки
                    return index // Возвращаем новый индекс выделенной шашки
                }
            }
        }
        return this.cell

    }
    */
}


function init() {
    
    var i, j; //Счетчики
    var n = 8; // Размер шахматной доски

    var turn = 1

    var sel = []; // Хранение индекса выделенной шашки

    /*
    Создание HTML таблицы
    Данная таблица будет отвечать за корректное отображение шашек
    Каждая ячейка таблицы точно выровнена под клетку доски
    Каждая ячейка обладает своим уникальным id
    Индексация анологична логической таблице (см. ниже)
    */
    for(i = 7; i >= 0; i--) {
        $('#desk').append('<tr id="row'+ i +'"></tr>')
        for(j = 0; j < n; j++)
            $('#row'+ i).append('<td id="index'+ i +'-'+ j +'" class="cell"></td>')
    }

    /* 
    Создание логической таблицы доски и заполнение ее нулями, где нули это пустые клетки
    Индексация таблицы [строка, столбец], где все строки и столбцы начинаются с 0 до 7
    Индексация идет с нижнего левого угла, слева на право и наварх
    В связи с этим на четной строчке шашки стоят и ходят только на четные стобцы
    А на нечетных строчках шашки стоят и ходять только на нечетные столбцы
    Связано это с тем, что шашки ходят только по черным клеткам
    */
    // Создание массива
    var desk = new Array(n) //Количество строк, диапазон цифр на доске 1 - 8    
    for(i = 0; i < n; i++)
          desk[i] = new Array(n); // Количество стобцов, дипазон букв

    function fill_zero() {
        for(i = 0; i < n; i++)
            for(j = 0; j < n; j++)
                desk[i][j] = 0
    }

    // Расстановка шашек
    function place_checkers() {
        fill_zero()
        for(i = 0; i < n; i++)
            if (i < 3 || i > 4) {

                if (i % 2 == 0)
                    j = 0
                else
                    j = 1
                
                for(j; j < n; j += 2) {

                    if (i < 3) 
                        color = 1 // Расстановка белых шашек
                    else
                        color = 0 // Расстановка черных шашек
                        
    
                    desk[i][j] = new Checker([i, j], color, false, desk)
                    desk[i][j].display()
                } 
            }   
    } 


    var music = document.getElementById('music');

    function switch_music(new_music) {
        music.pause()
        music.src = new_music;
        music.play();
    }

    $('#start button').on('click', start);

    function start() {
        switch_music("music/main.mp3")

        $('#start').hide();
        $('#game').show();

        place_checkers()
    }


    // Выделение шашки на доске
    function select(cell) {
        if (sel.length != 0)
            desk[sel[0]][sel[1]].unselect()
        cell.select()
        sel = [cell.cell[0], cell.cell[1]]
    }

    // Обработка тыка на доску
    $('#desk').on('click', '.cell', function() {
        var id = $(this).attr('id') // Получаем id клетки
        id = [parseInt(id[5]), parseInt(id[7])] // Переводим в число и запихиваем в массив
        var cell = desk[id[0]][id[1]] // Находим по id ячейку в логической таблице

        // Если на клетке есть шашка
        if (cell != 0)
            select(cell)
        else // Если на клетке нет шашки то проверяем все возможные действия для выделенной шашки
            if (sel.length != 0) {
                sel = desk[sel[0]][sel[1]].move(cell, id)
                //sel = desk[sel[0]][sel[1]].take(cell, id)
            }
      
    })
}