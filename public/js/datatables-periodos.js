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
    const dataTable = new DataTable(tableElement, {
      pageLength: 50,
      lengthMenu: [5, 10, 25, 50, 100],
      language: {
        url: '../../lib/datatables.json',
      },
      columnDefs: [
        { type: 'date-br', targets: [0, 1] },
        { orderable: false, width: '50px', targets: -1 },
        { targets: '_all', className: 'dt-head-left dt-body-left' },
      ],
    });
  }
});