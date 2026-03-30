param(
    [string]$ServiceName = ""
)

$ErrorActionPreference = "Stop"

function Resolve-PostgresServiceName {
    param([string]$ExplicitName)

    if ($ExplicitName) {
        return $ExplicitName
    }

    $service = Get-Service *postgres* -ErrorAction SilentlyContinue |
        Sort-Object Name |
        Select-Object -First 1

    if (-not $service) {
        throw "Nenhum servico do PostgreSQL foi encontrado. Instale o PostgreSQL ou informe -ServiceName."
    }

    return $service.Name
}

$resolvedServiceName = Resolve-PostgresServiceName -ExplicitName $ServiceName
$service = Get-Service -Name $resolvedServiceName -ErrorAction Stop

if ($service.Status -ne "Running") {
    Start-Service -Name $resolvedServiceName
    $service.WaitForStatus("Running", "00:00:15")
}

Write-Host "PostgreSQL em execucao pelo servico: $resolvedServiceName"
