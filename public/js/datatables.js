// Inicialize o DataTables após o DOM estar carregado
document.addEventListener('DOMContentLoaded', () => {
  const tableElement = document.getElementById('table');

  if (tableElement) {
    const dataTable = new DataTable(tableElement, {
      pageLength: 25,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        url: 'lib/datatables.json',
      },
      columnDefs: [
        { orderable: false, width: '50px', targets: -1 },
        { targets: '_all', className: 'dt-head-left dt-body-left' }
      ],
    });
  }
});



async function Delete(url) {
  Swal.fire({
    title: 'Confirma a Exclusão?',
    text: 'Esta ação não pode ser revertida!',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim, Excluir!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Realizar a exclusão com fetch
      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async (response) => {
          const data = await response.json(); 
          if (response.ok) {
            Swal.fire(
              'Registro Excluído!',
              data.message,
              'success'
            ).then(() => {
              location.reload();
            });
          } else {
            Swal.fire(
              'Erro ao tentar Excluir!',
              data.message || 'Não foi possível excluir o registro.',
              'error'
            );
          }
        })
        .catch((error) => {
          console.error('Erro:', error);
          Swal.fire('Erro!', 'Algo deu errado.', 'error');
        });
    }
  });
}