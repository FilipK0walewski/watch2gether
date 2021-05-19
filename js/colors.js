//colors
const bg_light_0 = '#0f052d'
const bg_light_1 = '#203671'

const font_light_0 = '#5fc75d'
const font_light_1 = '#5fc75d'
const font_light_2 = '#5fc75d'
const hover_light = '#36868f'
const disable_light = '#36868f'

const bg_dark_0 = '#130208'
const bg_dark_1 = '#1f0510'
const font_dark_0 = '#460e2b'
const font_dark_1 = '#7c183c'
const font_dark_2 = '#d53c6a'
const hover_dark = '#ff8274'
const disable_dark = '#31051e'

//theme_button
let change = false
const theme_button = document.getElementById('theme_button')
theme_button.addEventListener('click', () => changeTheme())

function changeTheme(){
    
    console.log(change)
    let color = get_property('theme')
    let r = document.documentElement

    console.log('color: ' + color)

    if (!color){
        set_property('theme', 'light')
        
    }
    else if (change == true){
        if (color == 'light'){
            set_property('theme', 'dark')
        }
        else if (color == 'dark'){
            set_property('theme', 'light')
        }
    }

    color = get_property('theme')

    if (color == 'light'){
        theme_button.innerHTML = '<i class="fas fa-moon"></i>'
        r.style.setProperty('--bg_color_0', bg_light_0)
        r.style.setProperty('--font_color_0', font_light_2)
        r.style.setProperty('--title_color_0', font_light_0)
        r.style.setProperty('--subtitle_color_0', font_light_1)
        r.style.setProperty('--header_color_0', bg_light_1)
        r.style.setProperty('--hoover_color_0', hover_light)
        r.style.setProperty('--disable_color_0', disable_light)
    }
    else if (color == 'dark'){
        theme_button.innerHTML = '<i class="fas fa-sun"></i>'
        r.style.setProperty('--bg_color_0', bg_dark_0)
        r.style.setProperty('--font_color_0', font_dark_2)
        r.style.setProperty('--title_color_0', hover_dark)
        r.style.setProperty('--subtitle_color_0', font_dark_1)
        r.style.setProperty('--header_color_0', bg_dark_1)
        r.style.setProperty('--hoover_color_0', hover_dark)
        r.style.setProperty('--disable_color_0', disable_dark)
    }
    change = true
}