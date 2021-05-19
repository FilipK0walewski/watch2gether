const storage = localStorage
const get_property = (key) => storage.getItem(key)
const set_property = (key, value) => storage.setItem(key, value)
let first_user = false

//colors
theme_button.click()
/*
if (!get_property('menu')){
    set_property('menu', true)
}
*/

if (!get_property('nick') || get_property('nick') == ''){
    console.log('no nick')
    first_user = true
}
