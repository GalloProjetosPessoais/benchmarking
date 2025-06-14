document.addEventListener("DOMContentLoaded", () => {
  // Filtro de empresas por grupo
  document
    .querySelector("#grupoId")
    .addEventListener("change", async (event) => {
      const grupoId = event.target.value;
      if (!grupoId) return;
      try {
        const response = await fetch(`/buscar/empresaGrupo/${grupoId}`);
        if (!response.ok) throw new Error("Erro ao buscar empresas.");

        const empresas = await response.json();

        const empresaSelect = document.getElementById("empresaId");
        empresaSelect.innerHTML = "";

        empresas.forEach((empresa) => {
          if (empresa.ativo) {
            const option = document.createElement("option");
            option.value = empresa.id;
            option.textContent = empresa.nome;
            empresaSelect.appendChild(option);
          }
        });
        const container = document.getElementById("partial-container");
        container.innerHTML = "";
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        alert("Erro ao carregar empresas. Tente novamente.");
      }
      const grupoSafras = document.getElementById("safraId");
      if (grupoSafras) {
        grupoSafras.dispatchEvent(new Event("change"));
      }
    });

  const grupoSelect = document.getElementById("grupoId");
  if (grupoSelect) {
    grupoSelect.dispatchEvent(new Event("change"));
  }

  // Filtro de periodos por safra
  document
    .querySelector("#safraId")
    .addEventListener("change", async (event) => {
      const safraId = event.target.value;
      try {
        const empresaId = document.getElementById("empresaId").value;
        let response;
        if (empresaId)
          response = await fetch(
            `/buscar/periodosSafraEmpresa/${safraId}/${empresaId}`
          );
        else response = await fetch(`/buscar/periodosSafra/${safraId}`);
        if (!response.ok) throw new Error("Erro ao buscar períodos.");

        const periodos = await response.json();

        const periodoSelect = document.getElementById("periodoId");
        periodoSelect.innerHTML = "";
        periodoSelect.innerHTML =
          '<option value="" disabled selected>Selecione um Período</option>';
        periodos.forEach((periodo) => {
          let p;
          if (empresaId) p = periodo.periodoSafra;
          else p = periodo;
          if (empresaId ? periodo.ativo : p.ativo) {
            const dataInicio = new Date(p.dataInicio).toLocaleDateString(
              "pt-BR"
            );
            const dataFim = new Date(p.dataFim).toLocaleDateString("pt-BR");
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${dataInicio} - ${dataFim}`;
            periodoSelect.appendChild(option);
          }
        });
      } catch (error) {
        console.error("Erro ao buscar periodos:", error);
        alert("Erro ao carregar períodos. Tente novamente.");
      }
    });

  const grupoSafras = document.getElementById("safraId");
  if (grupoSafras) {
    grupoSafras.dispatchEvent(new Event("change"));
  }

  document.getElementById("periodoId").addEventListener("change", (event) => {
    const container = document.getElementById("partial-container");
    if (container.innerHTML != "") {
      container.innerHTML = "";
    }
  });


  document
    .querySelector("#empresaId")
    .addEventListener("change", async (event) => {
      const container = document.getElementById("partial-container");
      container.innerHTML = "";
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
      formatarNumeros();
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
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: result.message || "Falha ao salvar o Ambiente de Produção.",
            confirmButtonColor: "var(--primary)",
          });
        }
        document.querySelector("#ambiente").dispatchEvent(new Event("click"));
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
      formatarNumeros();
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
        document.querySelector("#dados").dispatchEvent(new Event("click"));
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

  // ➜ Aplica a formatação enquanto o usuário digita
  document.addEventListener("input", (event) => {
    if (!event.target.classList.contains("formatted-number")) return;

    let rawValue = event.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    let numericValue = parseFloat(rawValue) / 100; // Mantém 2 casas decimais

    if (!isNaN(numericValue)) {
      event.target.value = numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  });

  // ➜ Converte os valores antes de enviar ao backend
  function formatarNumeros() {
    document.querySelectorAll(".formatted-number").forEach((input) => {
      input.value = limparNumero(input.value);
    });
  }

  let timeout; // Evita que a formatação aconteça no meio da digitação

  function limparNumero(valor) {
    if (!valor || valor.trim() === "") return 0;

    // Remove pontos de milhar e troca a vírgula pelo ponto decimal
    valor = valor.replace(/\./g, "").replace(",", ".");

    let numero = parseFloat(valor);
    return isNaN(numero) ? 0 : numero;
  }

  function formatarNumero(valor) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function calcularRealizado() {
    clearTimeout(timeout); // Evita cálculos repetidos

    timeout = setTimeout(() => {
      let moagemRealizadaInput = document.getElementById("moagemRealizado");

      // 🔥 Captura SEM aplicar formatação no meio da digitação
      let moagemRealizada = limparNumero(moagemRealizadaInput.value);
      let moagemEstimada = document.getElementById("moagemEstimada").value || 0;
      let moagemReestimada = document.getElementById("moagemReestimada").value || 0;

      const base = moagemReestimada > 0 ? moagemReestimada : moagemEstimada;

      if (!base || base === 0) {
        document.getElementById("realizado").value = "0,00";
        return;
      }

      const realizado = (moagemRealizada / base) * 100;
      document.getElementById("realizado").value = formatarNumero(realizado);
    }, 300); // Aguarda 300ms antes de calcular (evita erros ao digitar)
  }

  function calcularCanaFornecedor() {
    clearTimeout(timeout); // Evita cálculos repetidos

    timeout = setTimeout(() => {
      let realizadoCanaPropria =
        limparNumero(document.getElementById("realizadoCanaPropria").value) ||
        0;

      if (realizadoCanaPropria === 0)
        document.getElementById("realizadoCanaFornecedor").value = 0;

      const realizadoCanaFornecedor = 100.0 - realizadoCanaPropria;
      document.getElementById("realizadoCanaFornecedor").value = formatarNumero(
        realizadoCanaFornecedor
      );
    }, 300); // Aguarda 300ms antes de calcular (evita erros ao digitar)
  }
});

async function excluirDados() {
  const id = document.querySelector('#dadosId')?.value;

  if (!id) {
    Swal.fire({
      icon: "warning",
      title: "Problemas ao Excluir",
      text: "Nenhum dado agrícola foi selecionado para exclusão.",
      confirmButtonColor: "var(--primary)"
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: "Confirma a exclusão deste<br>Dado Agrícola?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: 'var(--danger)',
      cancelButtonColor: 'var(--primary)',
    });

    if (result.isConfirmed) {
      const response = await fetch(`/dados/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Falha ao excluir os dados agrícolas.");
      }

      await Swal.fire({
        icon: "success",
        title: "Dados Agrícolas Excluídos",
        confirmButtonColor: "var(--primary)",
      });

      // Recarregar a página ou redirecionar para atualizar os dados
      window.location.reload();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erro ao excluir",
      text: error.message || "Tente novamente mais tarde.",
      confirmButtonColor: "var(--primary)",
    });
    console.error("Erro ao excluir os dados agrícolas:", error);
  }
}