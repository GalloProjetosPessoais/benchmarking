// Plugin de ordenação para formato brasileiro (dd/mm/yyyy)
jQuery.extend(jQuery.fn.dataTable.ext.type.order, {
  "date-br-pre": function (data) {
      if (data === null || data === "") {
          return 0;
      }
      const parts = data.split('/');
      return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
  },
  "date-br-asc": function (a, b) {
      return a - b;
  },
  "date-br-desc": function (a, b) {
      return b - a;
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const tableElement = document.getElementById('table');

  if (tableElement) {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const dataTable = new DataTable(tableElement, {
      pageLength: 50,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        url: '../../lib/datatables.json',
      },
      columnDefs: [
        { type: 'date-br', targets: [0, 1] },
        { orderable: false, width: '50px', targets: [-1, -2], className: 'dt-head-center dt-body-center' },
        { targets: '_all', className: 'dt-head-left dt-body-left' },
      ],
      responsive: !isMobile,
      scrollX: isMobile,
      layout: {
        topStart: 'pageLength', // Seletor de registros por página (esquerda)
        topEnd: 'search',       // Campo de pesquisa (direita)
        top2Start: {
            buttons: [
              { extend: 'copy', exportOptions: { columns: ':visible(:not(.not-export-col))'} },
              { extend: 'csv', exportOptions: { columns: ':visible(:not(.not-export-col))'} },
              { extend: 'excel', exportOptions: { columns: ':visible(:not(.not-export-col))'} },
              { extend: 'pdf', exportOptions: { columns: ':visible(:not(.not-export-col))'} },
              { extend: 'print', exportOptions: { columns: ':visible(:not(.not-export-col))'} },
              { extend: 'colvis', text: "Campos" }
            ],
        }
      }
    });

    // Evento disparado quando a tabela termina de ser inicializada
    dataTable.on('init', function () {
      tableElement.classList.remove('d-none');
      dataTable.columns.adjust().draw();
    });
  }
});