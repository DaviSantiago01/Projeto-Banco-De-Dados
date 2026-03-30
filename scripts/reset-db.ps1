$ErrorActionPreference = "Stop"

# Carrega as variaveis do .env para o ambiente atual.
function Import-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()

        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            return
        }

        $key = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        Set-Item -Path "Env:$key" -Value $value
    }
}

# Localiza o psql no PATH ou nas pastas padrao do PostgreSQL no Windows.
function Resolve-PostgresTool {
    $comando = Get-Command "psql.exe" -ErrorAction SilentlyContinue
    if ($comando) {
        return $comando.Source
    }

    $candidatos = @(
        "$env:ProgramFiles\PostgreSQL\*\bin\psql.exe",
        "${env:ProgramFiles(x86)}\PostgreSQL\*\bin\psql.exe"
    ) | Where-Object { $_ -and $_ -notmatch '^\s*$' }

    $arquivo = Get-ChildItem -Path $candidatos -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending |
        Select-Object -First 1

    if ($arquivo) {
        return $arquivo.FullName
    }

    throw "Nao foi possivel localizar o psql.exe. Adicione o PostgreSQL ao PATH ou instale o PostgreSQL localmente."
}

# Monta os dados de conexao a partir do .env.
function Resolve-DbSettings {
    $dbUrl = if ($env:DB_URL) { $env:DB_URL } else { "jdbc:postgresql://localhost:5432/loja_materiais" }
    $padrao = '^jdbc:postgresql://(?<host>[^:/]+)(:(?<port>\d+))?/(?<database>[^?]+)$'
    $resultado = [regex]::Match($dbUrl, $padrao)

    if (-not $resultado.Success) {
        throw "DB_URL esta em formato invalido. Use o padrao jdbc:postgresql://host:porta/banco."
    }

    return @{
        Host = $resultado.Groups['host'].Value
        Port = if ($resultado.Groups['port'].Value) { [int]$resultado.Groups['port'].Value } else { 5432 }
        Database = $resultado.Groups['database'].Value
        User = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
        Password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
    }
}

Import-EnvFile -Path ".\.env"

$configuracao = Resolve-DbSettings
$psql = Resolve-PostgresTool
$schemaPath = (Resolve-Path ".\sql\01_create_schema.sql").Path
$seedPath = (Resolve-Path ".\sql\02_insert_data.sql").Path

if ($configuracao.Password) {
    $env:PGPASSWORD = $configuracao.Password
}

# Confere se o banco ja existe antes de aplicar o reset.
$bancoExiste = & $psql -h $configuracao.Host -p $configuracao.Port -U $configuracao.User -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$($configuracao.Database)';"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao consultar o PostgreSQL. Verifique se o servico esta rodando e se a porta configurada esta correta."
}

if (-not ([string]$bancoExiste).Trim()) {
    & $psql -h $configuracao.Host -p $configuracao.Port -U $configuracao.User -d postgres -c "CREATE DATABASE $($configuracao.Database);"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao criar o banco $($configuracao.Database)."
    }
}

# Recria o schema public para deixar o banco limpo antes de aplicar os SQLs.
& $psql -h $configuracao.Host -p $configuracao.Port -U $configuracao.User -d $configuracao.Database -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao recriar o schema public."
}

& $psql -h $configuracao.Host -p $configuracao.Port -U $configuracao.User -d $configuracao.Database -f $schemaPath
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao aplicar 01_create_schema.sql."
}

& $psql -h $configuracao.Host -p $configuracao.Port -U $configuracao.User -d $configuracao.Database -f $seedPath
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao aplicar 02_insert_data.sql."
}

Write-Host "Banco $($configuracao.Database) recriado com sucesso em $($configuracao.Host)`:$($configuracao.Port)."
