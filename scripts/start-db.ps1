param(
    [string]$ServiceName = ""
)

$ErrorActionPreference = "Stop"

# Descobre qual servico do PostgreSQL deve ser usado.
function Resolve-PostgresServiceName {
    param([string]$NomeInformado)

    if ($NomeInformado) {
        return $NomeInformado
    }

    $servicos = @(Get-Service *postgres* -ErrorAction SilentlyContinue | Sort-Object Name)

    if (-not $servicos.Count) {
        throw "Nenhum servico do PostgreSQL foi encontrado. Instale o PostgreSQL ou informe -ServiceName."
    }

    if ($servicos.Count -gt 1) {
        $nomes = ($servicos | Select-Object -ExpandProperty Name) -join ", "
        throw "Mais de um servico do PostgreSQL foi encontrado: $nomes. Informe -ServiceName para escolher o servico correto."
    }

    return $servicos[0].Name
}

$nomeServico = Resolve-PostgresServiceName -NomeInformado $ServiceName
$servico = Get-Service -Name $nomeServico -ErrorAction Stop

if ($servico.Status -ne "Running") {
    Start-Service -Name $nomeServico
    $servico.WaitForStatus("Running", "00:00:15")
}

Write-Host "PostgreSQL em execucao pelo servico: $nomeServico"
