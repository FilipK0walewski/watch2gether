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

//buttons
const lightModeButton = document.getElementById('light_mode_button')
const darkModeButton = document.getElementById('dark_mode_button')
const menuButton = document.getElementById('menu_button')
const menuLinks = document.querySelectorAll('.menu_link')

lightModeButton.addEventListener('click', function(){setTheme('light')})
darkModeButton.addEventListener('click', function(){setTheme('dark')})
menuButton.addEventListener('click', activeMenu)

function setTheme(color){
    set_property('mode', color)
    lightModeButton.disabled = true
    darkModeButton.disabled = true
    let r = document.documentElement

    if (color == 'light'){
        darkModeButton.disabled = false
        r.style.setProperty('--bg_color_0', bg_light_0)
        r.style.setProperty('--font_color_0', font_light_2)
        r.style.setProperty('--title_color_0', font_light_0)
        r.style.setProperty('--subtitle_color_0', font_light_1)
        r.style.setProperty('--header_color_0', bg_light_1)
        r.style.setProperty('--hoover_color_0', hover_light)
        r.style.setProperty('--disable_color_0', disable_light)
    }
    else if (color == 'dark'){
        lightModeButton.disabled = false
        r.style.setProperty('--bg_color_0', bg_dark_0)
        r.style.setProperty('--font_color_0', font_dark_2)
        r.style.setProperty('--title_color_0', hover_dark)
        r.style.setProperty('--subtitle_color_0', font_dark_1)
        r.style.setProperty('--header_color_0', bg_dark_1)
        r.style.setProperty('--hoover_color_0', hover_dark)
        r.style.setProperty('--disable_color_0', disable_dark)
    }
}

function activeMenu(){
    let menu = get_property('menu')
    console.log('huj')
    if (menu == 'true'){
        set_property('menu', false)
        document.getElementById('menu_id').style.transform = 'translateX(100%)'
    }
    else{
        set_property('menu', true)
        document.getElementById('menu_id').style.transform = 'translateX(75%)'
    }
}
