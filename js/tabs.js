//tabs
const chat_button = document.getElementById('chat_button')
const users_button = document.getElementById('users_button')
const me_button = document.getElementById('me_button')

chat_button.addEventListener('click', (event) => { openTab(event, 'message')})
users_button.addEventListener('click', (event) => { openTab(event, 'users')})
me_button.addEventListener('click', (event) => { openTab(event, 'me')})



function openTab(event, button_name){
    let tabcontent = document.getElementsByClassName('tabcontent')
    let tablinks = document.getElementsByClassName('tablink')

    for (i = 0; i < tabcontent.length; i++){
        tabcontent[i].style.display = 'none'
    }

    for (i = 0; i < tablinks.length; i++){
        tablinks[i].className = tablinks[i].className.replace(' active', '')
    }

    document.getElementById(button_name + '_box').style.display = 'flex'
    event.currentTarget.className += ' active'
}

chat_button.click()
