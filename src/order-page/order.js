
const orderBtn = document.querySelector('input#order');

orderBtn.onclick = () => {
    const Http = new XMLHttpRequest();
    Http.open("POST",  '/order');
    Http.send();
};