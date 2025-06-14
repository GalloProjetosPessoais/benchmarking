document.addEventListener('DOMContentLoaded', () => {
  const tableElement = document.getElementById('table');

  if (tableElement) {
    // Verifica se é um dispositivo móvel
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    
    const dataTable = new DataTable(tableElement, {
      pageLength: 25,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        url: '../../lib/datatables.json',
      },
      columnDefs: [
        { width: '200px', targets: [0, 1] },
        { width: '100px', targets: [2] },
        { width: '30px', targets: [3, 4] },
        { orderable: false, width: '20px', targets: [-1, -2], className: 'dt-head-center dt-body-center' },
        { targets: '_all', className: 'dt-head-left dt-body-left' },
      ],
      // Habilita scrollX apenas em dispositivos móveis
      scrollX: isMobile,
      // Força o DataTables a respeitar as larguras definidas
      autoWidth: false,
      layout: {
        topStart: 'pageLength', 
        topEnd: 'search',       
        top2Start: {
          buttons: [
            { extend: 'copy', exportOptions: { columns: ':visible(:not(.not-export-col))' } },
            { extend: 'csv', exportOptions: { columns: ':visible(:not(.not-export-col))' } },
            { extend: 'excel', exportOptions: { columns: ':visible(:not(.not-export-col))' } },
            { extend: 'pdf', exportOptions: { columns: ':visible(:not(.not-export-col))' } },
            { extend: 'print', exportOptions: { columns: ':visible(:not(.not-export-col))' } },
            { extend: 'colvis', text: "Campos" }
          ],
        }
      },
    });

    // Ajusta as colunas quando a tabela é redimensionada
    window.addEventListener('resize', () => {
      dataTable.columns.adjust();
    });

    dataTable.on('init', function () {
      document.getElementById('table_wrapper').parentNode.classList.remove('d-none');
      dataTable.columns.adjust().draw();
    });
  }
});