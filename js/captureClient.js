window.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('click', (event) => {
        const target = event.target;
        const name = target.nodeName;
        if (name.toLowerCase() === 'button') {
             const formElements = Array.from(document.forms['cameraOptions']);
             const options = formElements.filter(element => {
                 const nodeName = element.nodeName.toLowerCase();
                 return (nodeName !== 'button');
             }).map(element => {
                 const tagName = element.tagName.toLowerCase();
                 if (tagName === 'select') {
                     console.log(element.selectedOptions[0]);
                 }

                 return element;                 
             });
        }
    });
});
