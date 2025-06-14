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

async function resetPassword(email) {
    showLoading();
    try {
        const response = await fetch("/usuarios/resetPassword", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ email }), // Agora o email está dentro de um objeto
        });

        const result = await response.json();

        Swal.fire({
            icon: result.ok ? "success" : "error",
            title: result.ok ? "Troca de Senha" : "Erro",
            text: result.ok || "Enviado email de troca de senha.",
            confirmButtonColor: "var(--primary)",
        });
        hideLoading();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Erro inesperado. Tente novamente mais tarde.",
            confirmButtonColor: "var(--primary)",
        });
    }
    hideLoading();
}
