window.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button') {
             const formElements = document.forms['cameraOptions'];
             console.log(formElements);
        }
    });
});
