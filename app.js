CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2
    if (h < 2 * r) r = h / 2
    this.beginPath()
    this.moveTo(x+r, y)
    this.arcTo(x+w, y,   x+w, y+h, r)
    this.arcTo(x+w, y+h, x,   y+h, r)
    this.arcTo(x,   y+h, x,   y,   r)
    this.arcTo(x,   y,   x+w, y,   r)
    this.closePath()
    return this
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

class Tablature {
    constructor() {
        this.name = "Tab Name"
        this.author = "Song Author"
        this.transcriptor = "Unknown"
        this.tempo = 100
        this.tuning = {
            name: "Classic",
            keys: ["E", "A", "D", "G", "B", "E"]
        }
        this.signature = "44"

        this.line_list = []
        this.params = {
            line_height: 180,
            gap: 25,
            header_height: 200
        }
        this.is_hovered = undefined
        this.is_selected = undefined
        this.set_canvas_size()
    }
    set_canvas_size() {
        canvas.height = this.params.header_height + (this.line_list.length* (this.params.line_height + this.params.gap))
        canvas.width = 1000

    }
    draw(context) {
        this.set_canvas_size()
        this.draw_header(context)
        this.line_list.forEach((line, line_index) => {
            this.draw_line({context, line_index, line})
        })
        if(this.is_hovered) this.draw_note_overlay(this.is_hovered)
        if(this.is_selected) this.draw_note_overlay(this.is_selected)
    }
    draw_header(context) {
        context.fillStyle = "#fff"
        context.fillRect(0,0,canvas.width,this.params.header_height)

        ctx.fillStyle = '#000'

        context.textAlign = "center"
        context.textBaseline = "middle"

        context.font = "500 38px Arial"

        context.fillText(this.name, canvas.width/2, (this.params.header_height / 10) * 2.5)


        context.font = "100 20px Arial"

        context.fillText(`by ${this.author}`, canvas.width/2, (this.params.header_height / 10) * 4.5)
        context.fillText(`tab by ${this.transcriptor}`, canvas.width/2, (this.params.header_height / 10) * 6)


        context.beginPath()
        context.ellipse(65, this.params.header_height - 30, 7, 4, 0, 0, 2 * Math.PI)
        context.fill()
        context.fillRect(70, this.params.header_height - 50, 2, 20)
        
        context.font = "500 18px Arial"
        context.textAlign = "left"
        context.fillText(`= ${this.tempo}`, 90, this.params.header_height - 37)
        context.fillText(`guitar tab`, canvas.width-150, this.params.header_height - 37)
    }
    draw_line({context, line_index, line}) {

        context.fillStyle = "#fff"
        context.fillRect(0, this.params.header_height + this.params.gap + (line_index * (this.params.line_height + this.params.gap)), canvas.width, this.params.line_height)

        this.padding = 35
        this.usable_width = canvas.width - (this.padding*2)


        ctx.fillStyle = "#000"
        for(let i = 1; i<=6; i++) {
            ctx.fillRect(this.padding, this.params.header_height + this.params.gap + (line_index * (this.params.line_height + this.params.gap)) + ((this.params.line_height/7)*i), this.usable_width, 1)
        }

        
        ctx.fillRect(this.padding, this.params.header_height + this.params.gap + (line_index * (this.params.line_height + this.params.gap)) + (this.params.line_height / 7), 1, (this.params.line_height / 7)*5)

        ctx.fillRect(this.padding + (this.usable_width / 2), this.params.header_height + this.params.gap + (line_index * (this.params.line_height + this.params.gap)) + (this.params.line_height / 7), 2, (this.params.line_height / 7)*5)

        ctx.fillRect(this.padding+this.usable_width - 1, this.params.header_height + this.params.gap + (line_index * (this.params.line_height + this.params.gap)) + (this.params.line_height / 7), 1, (this.params.line_height / 7)*5)

        if(line_index == 0) {
            context.textAlign = "right"
            context.textBaseline = "top"
            context.fillStyle = "#000"
            context.font = "15px Arial"
            this.tuning.keys.forEach((tune, tune_index) => {
                context.fillText(tune, this.padding - 6, this.params.header_height + this.params.gap + ((this.params.line_height/7) * (tune_index + 1)) - 6)
            })
        }
        if(!line.quarters) return
        line.quarters.forEach((quarter, quarter_index) => {
            this.draw_number({context, quarter, quarter_index, line_index})
        })
    }
    draw_number({context, quarter, quarter_index, line_index}) {
        quarter.forEach((chord, chord_id) => {
            chord.forEach((note, note_index) => {
                if(note.trim() == "") return
                ctx.fillStyle = "#fff"
                ctx.fillRect(this.padding + ((this.usable_width/2)*quarter_index)+(((this.usable_width/2)/9)*(chord_id + 1))-(25/2),this.params.header_height + this.params.gap + ((this.params.line_height+this.params.gap)*line_index) + ((this.params.line_height/7)*(note_index + 1))-10,25,20)


                context.textAlign = "center"
                context.textBaseline = "middle"
                context.fillStyle = "#000"
                context.font = "15px Arial"
                ctx.fillText(note.trim(), this.padding + ((this.usable_width/2)*quarter_index)+(((this.usable_width/2)/9)*(chord_id + 1)), this.params.header_height  + ((this.params.line_height+this.params.gap)*line_index) + this.params.gap + ((this.params.line_height/7)*(note_index + 1)))
            })
        })
    }
    draw_note_overlay({line_index, chord_index}) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        ctx.roundRect(
            this.padding + ((this.usable_width/2)*0)+(((this.usable_width/2)/9)*chord_index)-(25/2),
            this.params.header_height + this.params.gap + ((this.params.line_height+this.params.gap)*line_index) + ((this.params.line_height/7)*1)-10,
            25, 150, 5
        ).fill()
    }
    toJSON() {
        let json = {
            song_name: this.name,
            author_name: this.author,
            transcriptor: this.transcriptor,
            tempo: this.tempo,
            signature: this.signature,
            tuning: this.tuning,
            lines: this.line_list
        }
        return JSON.stringify(json)
    }
}
let tab;

const reset = () => {
    tab = new Tablature()
    tab.line_list.push({
        effects: [],
        quarters: [
            [
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
            ],
            [
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
            ]
        ]
    })
}
reset()

let line_1 = document.getElementById("line_1")
let line_2 = document.getElementById("line_2")
let line_3 = document.getElementById("line_3")
let line_4 = document.getElementById("line_4")
let line_5 = document.getElementById("line_5")
let line_6 = document.getElementById("line_6")


const set_inputs_to = (values) => {
    if(values === undefined) values = ['', '', '', '', '', '']
    line_1.value = values[0]
    line_2.value = values[1]
    line_3.value = values[2]
    line_4.value = values[3]
    line_5.value = values[4]
    line_6.value = values[5]
}
line_1.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[0] = e.target.value
})
line_2.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[1] = e.target.value
})
line_3.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[2] = e.target.value
})
line_4.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[3] = e.target.value
})
line_5.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[4] = e.target.value
})
line_6.addEventListener('input', (e) => {
    let chord = tab.is_selected.chord_index
    if(tab.is_selected.chord_index > 9) {
        chord = tab.is_selected.chord_index - 9
    }
    let chord_value = tab.line_list[tab.is_selected.line_index].quarters[tab.is_selected.quarter][chord-1]
    chord_value[5] = e.target.value
})
const update = () => {
    requestAnimationFrame(update)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    tab.draw(ctx)
}
update()
let add_line_btn = document.getElementById('add_line')
add_line_btn.addEventListener('click', () => {
    tab.line_list.push({
        effects: [],
        quarters: [
            [
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
            ],
            [
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
                ["","","","","",""],
            ]
        ]
    })
})
canvas.addEventListener('mousemove', (e) => {
    let note_index = 0
    let chord_index = 0
    let line_index = 0

    if(e.offsetX >= tab.padding && e.offsetX <= tab.usable_width + tab.padding) {
        chord_index = (Math.floor((e.offsetX / ((tab.usable_width / 2) / 18))) / 2) - 0.5
        if(chord_index == 9 || chord_index == 18 || chord_index%1 !== 0) {chord_index = 0}
    }

    let list_height = canvas.height-tab.params.header_height
    let tare_mouse_offset = e.offsetY - tab.params.header_height
    let line_number = tab.line_list.length
    if(tare_mouse_offset > 0) {
        line_index = Math.floor(tare_mouse_offset/(list_height / line_number))
    }

    if(e.offsetY >= tab.params.header_height + tab.params.gap && line_index >= 0 && chord_index > 0) {
        tab.is_hovered = {line_index, note_index, chord_index}
        document.body.style.cursor = 'pointer';
    } else {
        tab.is_hovered = undefined
        document.body.style.cursor = 'default';
    }
})
canvas.addEventListener('click', (e) => {
    let chord_index = 0
    let line_index = 0

    if(e.offsetX >= tab.padding && e.offsetX <= tab.usable_width + tab.padding) {
        chord_index = (Math.floor((e.offsetX / ((tab.usable_width / 2) / 18))) / 2) - 0.5
        if(chord_index == 9 || chord_index == 18 || chord_index%1 !== 0) {chord_index = 0}
    }

    let list_height = canvas.height-tab.params.header_height
    let tare_mouse_offset = e.offsetY - tab.params.header_height
    let line_number = tab.line_list.length
    if(tare_mouse_offset > 0) {
        line_index = Math.floor(tare_mouse_offset/(list_height / line_number))
    }
    if(e.offsetY >= tab.params.header_height + tab.params.gap && line_index >= 0 && chord_index > 0) {
        
        let quarter;
        if(chord_index > 9) {
            quarter = 1
        } else {
            quarter = 0
        }

        tab.is_selected = {line_index, chord_index, quarter}
        set_inputs_to(tab.line_list[line_index].quarters[quarter][chord_index>=9 ? chord_index-10 : chord_index-1])
        document.body.style.cursor = 'pointer';
    } else {
        tab.is_selected = undefined
        document.body.style.cursor = 'default';
    }
})
canvas.addEventListener('mouseout', () => {
    tab.is_hovered = undefined
})

const save_btn = document.getElementById("save")

save_btn.addEventListener('click', () => {
    localStorage.setItem("saves", tab.toJSON())
})

const load_btn = document.getElementById("load")

load_btn.addEventListener('click', () => {

    const loadFromJSON = (json) => {
        let infos = JSON.parse(json)

        tab.name = infos.song_name
        tab.author = infos.author_name
        tab.transcriptor = infos.transcriptor
        tab.tempo = infos.tempo,
        tab.signature = infos.signature,
        tab.tuning = infos.tuning,
        tab.line_list.pop()
        infos.lines.forEach(line => {
            tab.line_list.push(line)
        })
    }
    loadFromJSON(localStorage.getItem("saves"))
})

const reset_btn = document.getElementById("reset")

reset_btn.addEventListener('click', () => {
    reset()
})


const song_name_input = document.getElementById("song_name")

song_name_input.addEventListener('input', (e) => {
    e.target.value !== "" ? tab.name = e.target.value : tab.name = e.target.placeholder
})

const song_author_input = document.getElementById("song_author")

song_author_input.addEventListener('input', (e) => {
    e.target.value !== "" ? tab.author = e.target.value : tab.author = "Song Author"
})

const song_transcriptor_input = document.getElementById("transcriptor")

song_transcriptor_input.addEventListener('input', (e) => {
    e.target.value !== "" ? tab.transcriptor = e.target.value : tab.transcriptor = "Unknown"
})

const song_tempo_input = document.getElementById("tempo")

song_tempo_input.addEventListener('input', (e) => {
    e.target.value !== "" ? tab.tempo = e.target.value : tab.tempo = "100"
})

const song_tuning_input = document.getElementById("tuning")

song_tuning_input.addEventListener('input', (e) => {
    // e.target.value !== "" ? tab.tuning = e.target.value : tab.tuning = "100"
    console.log(e.target.value)
})

const menu = document.getElementById('menu')
const open_menu = document.getElementById('open_menu')

open_menu.addEventListener('click', (e) => {
    menu.classList.toggle("open")
})