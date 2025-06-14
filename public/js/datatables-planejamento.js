// Inicialize o DataTables após o DOM estar carregado
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
        { orderable: false, width: '20px', targets: [-1, 0, 6], className: 'dt-head-center dt-body-center' },
        { targets: '_all', className: 'dt-head-left dt-body-left' }
      ],
      order: [[1, 'asc']],
      responsive: !isMobile,
      scrollX: isMobile,
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
            'colvis'
          ],
        },
        top2End: function () {
          let toolbar = document.createElement('div');
          toolbar.classList.add('row');
          toolbar.innerHTML = `<button class="btn btn-primary me-10" onclick='ativar()'>
                                  <i class='bx bx-plus-circle'></i>
                                  Ativar
                                </button> 
                                <button class="btn btn-danger" onclick='desativar()'>
                                  <i class='bx bx-minus-circle'></i>
                                  Desativar
                                </button>`;
          return toolbar;
        },
        bottomStart: 'info',
        bottomEnd: 'paging'
      },
      stateSave: true,
      stateSaveCallback: function (settings, data) {
        localStorage.setItem("DataTables_empresasSafras", JSON.stringify(data));
      },
      stateLoadCallback: function (settings) {
        return JSON.parse(localStorage.getItem("DataTables_empresasSafras"));
      },
    });

    // Evento disparado quando a tabela termina de ser inicializada
    dataTable.on('init', function () {
      document.getElementById('table_wrapper').parentNode.classList.remove('d-none');
      dataTable.columns.adjust().draw();
    });

    document.getElementById('select-all').addEventListener('change', function () {
      const isChecked = this.checked;
      document.querySelectorAll('.inp-cbx').forEach(checkbox => {
        checkbox.checked = isChecked;
        value = isChecked ? "true" : "";
      });
    });
  }
});

function getSelectedIds() {
  let selectedIds = [];
  document.querySelectorAll('.inp-cbx:checked:not(#select-all)').forEach(checkbox => {
    selectedIds.push(checkbox.dataset.id);
  });
  return selectedIds;
}

async function ativar() {
  let ids = getSelectedIds();
  const pathSegments = window.location.pathname.split('/');
  const parametro = pathSegments[pathSegments.length - 1];
  const data = { safra: parametro, ids, ativo: true }
  try {
    const response = await fetch("/empresasSafras/ativar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json(); 

    if (response.ok && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao ativar as empresas.",
        confirmButtonColor: "var(--primary)",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Erro inesperado. Tente novamente mais tarde.",
      confirmButtonColor: "var(--primary)",
    });
  }
}

async function desativar() {
  let ids = getSelectedIds();
  const pathSegments = window.location.pathname.split('/');
  const parametro = pathSegments[pathSegments.length - 1];
  const data = { safra: parametro, ids, ativo: false }
  try {
    const response = await fetch("/empresasSafras/ativar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json(); 

    if (response.ok && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao desativar as empresas.",
        confirmButtonColor: "var(--primary)",
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Erro inesperado. Tente novamente mais tarde.",
      confirmButtonColor: "var(--primary)",
    });
  }
}