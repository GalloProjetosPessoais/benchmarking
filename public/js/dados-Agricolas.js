document.addEventListener("DOMContentLoaded", () => {
  // Filtro de empresas por grupo
  document
    .querySelector("#grupoId")
    .addEventListener("change", async (event) => {
      const grupoId = event.target.value;
      try {
        const response = await fetch(`/buscar/empresaGrupo/${grupoId}`);
        if (!response.ok) throw new Error("Erro ao buscar empresas.");

        const empresas = await response.json();

        const empresaSelect = document.getElementById("empresaId");
        empresaSelect.innerHTML = "";

        empresas.forEach((empresa) => {
          const option = document.createElement("option");
          option.value = empresa.id;
          option.textContent = empresa.nome;
          empresaSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        alert("Erro ao carregar empresas. Tente novamente.");
      }
    });

  // Filtro de periodos por safra
  document
    .querySelector("#safraId")
    .addEventListener("change", async (event) => {
      const safraId = event.target.value;
      try {
        const response = await fetch(`/buscar/periodosSafra/${safraId}`);
        if (!response.ok) throw new Error("Erro ao buscar períodos.");

        const periodos = await response.json();

        const periodoSelect = document.getElementById("periodoId");
        periodoSelect.innerHTML = "";
        periodoSelect.innerHTML =
          '<option value="" disabled selected>Selecione um Período</option>';
        periodos.forEach((periodo) => {
          if (periodo.ativo) {
            const dataInicio = new Date(periodo.dataInicio).toLocaleDateString(
              "pt-BR"
            );
            const dataFim = new Date(periodo.dataFim).toLocaleDateString(
              "pt-BR"
            );
            const option = document.createElement("option");
            option.value = periodo.id;
            option.textContent = `${dataInicio} - ${dataFim}`;
            periodoSelect.appendChild(option);
          }
        });
      } catch (error) {
        console.error("Erro ao buscar periodos:", error);
        alert("Erro ao carregar períodos. Tente novamente.");
      }
    });

  // Carregar o ambiente de produção
  document.querySelector("#ambiente").addEventListener("click", async () => {
    const container = document.getElementById("partial-container");
    const safraId = document.getElementById("safraId").value;
    const grupoId = document.getElementById("grupoId").value;
    const empresaId = document.getElementById("empresaId").value;

    if (!safraId || !grupoId || !empresaId) {
      Swal.fire({
        icon: "warning",
        title: "Filtros Incompletos",
        text: "Por favor, selecione a Safra, o Grupo e a Empresa antes de continuar.",
        confirmButtonColor: "var(--primary)",
      });
      return;
    }
    const safraAno = document
      .getElementById("safraId")
      .selectedOptions[0].textContent.trim();

    try {
      const response = await fetch(
        `/partials/ambiente-producao?safraId=${safraId}&empresaId=${empresaId}&safraAno=${safraAno}`
      );

      if (!response.ok)
        throw new Error(
          "Erro ao carregar o formulário de Ambiente de Produção."
        );
      const html = await response.text();
      container.innerHTML = html;
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar o formulário. Tente novamente.");
    }
  });

  // Carregar os dados agrícolas
  document.querySelector("#dados").addEventListener("click", async () => {
    const container = document.getElementById("partial-container");
    const safraId = document.getElementById("safraId").value;
    const grupoId = document.getElementById("grupoId").value;
    const empresaId = document.getElementById("empresaId").value;
    const periodoId = document.getElementById("periodoId").value;

    if (!safraId || !grupoId || !empresaId || !periodoId) {
      Swal.fire({
        icon: "warning",
        title: "Filtros Incompletos",
        text: "Por favor, selecione a Safra, o Período, o Grupo e a Empresa antes de continuar.",
        confirmButtonColor: "var(--primary)",
      });
      return;
    }

    try {
      const response = await fetch(
        `/partials/dados-agricolas?safraId=${safraId}&empresaId=${empresaId}&periodoId=${periodoId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Erro ao carregar o formulário de Ambiente de Produção."
        );
      }
      const html = await response.text();
      container.innerHTML = html;
      // Adiciona o evento para calcular automaticamente ao digitar nos campos
      document
        .getElementById("moagemRealizado")
        .addEventListener("input", calcularRealizado);
      document
        .getElementById("realizadoCanaPropria")
        .addEventListener("input", calcularCanaFornecedor);
    } catch (error) {
      Swal.fire({
        icon: "warning",
        title: "Problemas ao Carregar Dados",
        text: error.message,
        confirmButtonColor: "var(--primary)",
      });
    }
  });

  // Salvar o ambiente de produção
  document.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;

    if (form.id == "form-ambiente-producao") {
      if (!validarSomaAmbientes()) {
        return;
      }
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.safraId = document.getElementById("safraId").value;
      data.empresaId = document.getElementById("empresaId").value;
      try {
        const response = await fetch("/ambientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Sucesso",
            text: result.message || "Ambiente de Produção salvo com sucesso!",
            confirmButtonColor: "var(--primary)",
          });
          // Recarregar ou limpar o formulário
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: result.message || "Falha ao salvar o Ambiente de Produção.",
            confirmButtonColor: "var(--primary)",
          });
        }
      } catch (error) {
        //console.error('Erro ao salvar Ambiente de Produção:', error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro inesperado. Tente novamente mais tarde.",
          confirmButtonColor: "var(--primary)",
        });
      }
    }

    if (form.id == "form-dados-agricolas") {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.periodoSafraId = document.getElementById("periodoId").value;
      try {
        const response = await fetch("/dados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Sucesso",
            text: result.message || "Dados Agrícolas salvo com sucesso!",
            confirmButtonColor: "var(--primary)",
          });
          // Recarregar ou limpar o formulário
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: result.message || "Falha ao salvar os Dados Agrícolas.",
            confirmButtonColor: "var(--primary)",
          });
        }
      } catch (error) {
        //console.error('Erro ao salvar Dados Agrícolas:', error);
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro inesperado. Tente novamente mais tarde.",
          confirmButtonColor: "var(--primary)",
        });
      }
    }
  });

  function calcularRealizado() {
    const moagemRealizada =
      parseFloat(document.getElementById("moagemRealizado").value) || 0;
    const moagemEstimada =
      parseFloat(document.getElementById("moagemEstimada").value) || 0;
    const moagemReestimada =
      parseFloat(document.getElementById("moagemReestimada").value) || null;

    // Definir a base de comparação: Se houver moagemReestimada, usá-la; caso contrário, usar moagemEstimada
    const base = moagemReestimada !== null ? moagemReestimada : moagemEstimada;

    // Evitar divisão por zero
    if (base === 0) {
      document.getElementById("realizado").value = 0;
      return;
    }

    // Cálculo da porcentagem
    const realizado = (moagemRealizada / base) * 100;

    // Atualiza o input com o valor formatado
    document.getElementById("realizado").value = realizado.toFixed(2);
  }

  function calcularCanaFornecedor() {
    const realizadoCanaPropria =
      parseFloat(document.getElementById("realizadoCanaPropria").value) || 0;

    if (realizadoCanaPropria === 0)
      document.getElementById("realizadoCanaFornecedor").value = 0;

    const realizadoCanaFornecedor = 100 - realizadoCanaPropria;
    document.getElementById("realizadoCanaFornecedor").value =
      realizadoCanaFornecedor;
  }

  function validarSomaAmbientes() {
    // Seleciona os inputs
    const inputs = [
      document.getElementById("ambienteA"),
      document.getElementById("ambienteB"),
      document.getElementById("ambienteC"),
      document.getElementById("ambienteD"),
      document.getElementById("ambienteE"),
    ];

    // Soma os valores dos inputs (convertendo para número)
    const soma = inputs.reduce(
      (acc, input) => acc + (parseFloat(input.value) || 0),
      0
    );

    // Verifica se a soma é diferente de 100
    if (soma !== 100) {
      Swal.fire({
        icon: "error",
        title: "Erro na Soma",
        text: "A soma dos valores dos ambientes deve ser exatamente 100!",
        confirmButtonColor: "var(--primary)",
      });
      return false;
    }
    return true;
  }
});
