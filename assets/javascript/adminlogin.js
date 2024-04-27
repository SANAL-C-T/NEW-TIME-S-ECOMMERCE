
function validateFeild() {
    let username = document.getElementById("username")
    let password = document.getElementById("password")
    if (username.value.trim() == "") {
        username.style.border = "solid 2px red"

        return false
    }
    else if (password.value.trim() == "") {
        password.style.border = "solid 2px red"
        return false
    }
    else {
        return true;
    }
}










