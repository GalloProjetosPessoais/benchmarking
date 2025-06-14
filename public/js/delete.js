async function Delete(url) {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirma a Exclusão?',
    text: 'Esta ação não pode ser revertida!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, Excluir!',
    cancelButtonText: 'Cancelar'
  });

  if (!isConfirmed) return;

  try {
    // 1. Faz a requisição DELETE sem seguir redirects automaticamente
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      redirect: 'manual' // 🔥 Importante: evita o 404!
    });

    // 2. Se a resposta for um redirect (302), pega a URL do Location
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('Location') || '/empresas';
      window.location.href = redirectUrl; // Redireciona manualmente
      return;
    }

    // 3. Se não houver redirect, recarrega a página atual (genérico)
    window.location.reload();

  } catch (error) {
    console.error('Erro na exclusão:', error);
    window.location.reload(); // Recarrega mesmo em caso de erro
  }
}