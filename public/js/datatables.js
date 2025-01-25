// Inicialize o DataTables após o DOM estar carregado
document.addEventListener('DOMContentLoaded', () => {
  const tableElement = document.getElementById('table');

  if (tableElement) {
    const dataTable = new DataTable(tableElement, {
      pageLength: 25,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        url: '../../lib/datatables.json',
      },
      columnDefs: [
        { orderable: false, width: '50px', targets: -1 },
        { targets: '_all', className: 'dt-head-left dt-body-left' }
      ],
    });
  }
});