const storage = localStorage
const get_property = (key) => storage.getItem(key)
const set_property = (key, value) => storage.setItem(key, value)

window.onload = start

function start(){
    //other
    document.getElementById('PL_button').disabled = true
    document.getElementById('EN_button').disabled = true

    //colors
    if (!get_property('mode')){
        lightModeButton.disabled = true
        set_property('mode', 'light')
        }
    setTheme(get_property('mode'))

    if (!get_property('menu')){
        set_property('menu', true)

    }
}

function change_video(){
    //console.log('huj')
}