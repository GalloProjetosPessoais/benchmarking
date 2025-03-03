let foto = document.getElementById('foto-avatar');
let inputFile = document.getElementById('arquivoFoto');

document.addEventListener('DOMContentLoaded', () => {
    if (foto != undefined)
        foto.addEventListener('click', () => {
            inputFile.click();
        });

    if (inputFile != undefined)
        inputFile.addEventListener('change', (event) => {
            let file = event.target.files[0]; // Obtém o arquivo
            if (file) {
                let reader = new FileReader();
                reader.onload = (e) => {
                    foto.src = e.target.result; // Atualiza o src da imagem
                };
                reader.readAsDataURL(file); // Converte a imagem para URL
            }
        });
});