param(
    [string]$Database = "",
    [string]$User = "",
    [string]$Password = "",
    [int]$Port = 0,
    [string]$DbHost = ""
)

$ErrorActionPreference = "Stop"

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

function Resolve-PostgresTool {
    param([string]$ToolName)

    $command = Get-Command $ToolName -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $programFilesPaths = @(
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)}
    ) | Where-Object { $_ }

    foreach ($base in $programFilesPaths) {
        $match = Get-ChildItem -Path $base -Filter $ToolName -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match "\\PostgreSQL\\.+\\bin\\" } |
            Sort-Object FullName -Descending |
            Select-Object -First 1

        if ($match) {
            return $match.FullName
        }
    }

    throw "Nao foi possivel localizar $ToolName. Adicione o binario do PostgreSQL ao PATH ou instale o PostgreSQL localmente."
}

Import-EnvFile -Path ".\.env"

$dbUrl = if ($env:DB_URL) { $env:DB_URL } else { "jdbc:postgresql://localhost:5432/loja_materiais" }

if (-not $DbHost -or $Port -eq 0 -or -not $Database) {
    $dbUrlPattern = '^jdbc:postgresql://(?<host>[^:/]+)(:(?<port>\d+))?/(?<database>[^?]+)$'
    $dbUrlMatch = [regex]::Match($dbUrl, $dbUrlPattern)

    if ($dbUrlMatch.Success) {
        if (-not $DbHost) {
            $DbHost = $dbUrlMatch.Groups['host'].Value
        }

        if ($Port -eq 0) {
            $portGroup = $dbUrlMatch.Groups['port'].Value
            $Port = if ($portGroup) { [int]$portGroup } else { 5432 }
        }

        if (-not $Database) {
            $Database = $dbUrlMatch.Groups['database'].Value
        }
    }
}

if (-not $DbHost) {
    $DbHost = "localhost"
}

if ($Port -eq 0) {
    $Port = 5432
}

if (-not $Database) {
    $Database = "loja_materiais"
}

if (-not $User) {
    $User = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
}

if (-not $Password) {
    $Password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
}

$psql = Resolve-PostgresTool -ToolName "psql.exe"

if ($Password) {
    $env:PGPASSWORD = $Password
}

$schemaPath = (Resolve-Path ".\sql\01_create_schema.sql").Path
$seedPath = (Resolve-Path ".\sql\02_insert_data.sql").Path

$databaseExists = & $psql -h $DbHost -p $Port -U $User -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$Database';"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao consultar o PostgreSQL. Verifique se o servico esta rodando e se a porta configurada esta correta."
}

$databaseExists = if ($null -eq $databaseExists) { "" } else { [string]$databaseExists }

if (-not $databaseExists.Trim()) {
    & $psql -h $DbHost -p $Port -U $User -d postgres -c "CREATE DATABASE $Database;"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao criar o banco $Database."
    }
}

& $psql -h $DbHost -p $Port -U $User -d $Database -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao recriar o schema public."
}

& $psql -h $DbHost -p $Port -U $User -d $Database -f $schemaPath
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao aplicar 01_create_schema.sql."
}

& $psql -h $DbHost -p $Port -U $User -d $Database -f $seedPath
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao aplicar 02_insert_data.sql."
}

Write-Host "Banco $Database recriado com sucesso em $DbHost`:$Port."
