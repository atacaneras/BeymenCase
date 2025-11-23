# =====================================
#  E-Ticaret Mikroservis Başlatıcı
# =====================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  E-Ticaret Mikroservis Başlatıcı" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Compose komutunu otomatik algıla
function Get-DockerComposeCommand {
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        return "docker-compose"
    }
    elseif (Get-Command "docker" -ErrorAction SilentlyContinue) {
        return "docker compose"
    }
    else {
        Write-Host "Docker Compose yüklü değil!" -ForegroundColor Red
        exit 1
    }
}

$composeCmd = Get-DockerComposeCommand
Write-Host "Kullanılan Compose Komutu: $composeCmd" -ForegroundColor Yellow
Write-Host ""

# -----------------------------
# Açılan tarayıcıları saklamak için array
# -----------------------------
$script:openedBrowsers = @()

# -----------------------------
# Script durunca çalışacak cleanup
# -----------------------------
$script:cleanup = {
    Write-Host "`nScript durdu, container'lar kapatılıyor..." -ForegroundColor Yellow
    
    # Container'ları durdur (volume’ler korunuyor)
    & $composeCmd down 2>$null
    Write-Host "✓ Servisler kapatıldı (volume’ler korunuyor)" -ForegroundColor Green

    # Açılan tarayıcıları kapat
    foreach ($proc in $script:openedBrowsers) {
        try {
            if (!$proc.HasExited) {
                $proc.Kill()
                Write-Host "✓ Tarayıcı kapatıldı: $($proc.Id)" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "⚠ Tarayıcı zaten kapalı: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Ctrl+C veya script kapanınca cleanup çalıştır
$null = Register-EngineEvent PowerShell.Exiting -Action $script:cleanup

# -----------------------------
# Compose temizliği (yalnızca bu proje)
# -----------------------------
Write-Host "[1] Docker Compose kaynakları temizleniyor (yalnızca bu proje)..." -ForegroundColor Yellow
& $composeCmd down 2>$null
Write-Host "    ✓ Compose temizliği tamamlandı" -ForegroundColor Green
Write-Host ""

# Servisleri başlat
Write-Host "[2] Servisler inşa ediliyor ve başlatılıyor..." -ForegroundColor Yellow
$buildOutput = & $composeCmd up -d --build 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Servisler başlatılamadı!" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}

Write-Host "    ✓ Servisler başlatıldı" -ForegroundColor Green
Write-Host ""

# Bekle
Write-Host "[3] Servislerin başlaması bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Sağlık kontrolü
$services = @(
    @{Display="Sipariş Servisi"; Url="http://localhost:5001/swagger"},
    @{Display="Stok Servisi"; Url="http://localhost:5002/swagger"},
    @{Display="Bildirim Servisi"; Url="http://localhost:5003/swagger"},
    @{Display="RabbitMQ Yönetim"; Url="http://localhost:15672"}
)

Write-Host ""
Write-Host "[4] Sağlık Kontrolü:" -ForegroundColor Yellow

$healthy = @()

foreach ($s in $services) {
    try {
        Invoke-WebRequest -Uri $s.Url -TimeoutSec 5 -UseBasicParsing | Out-Null
        Write-Host "    ✓ $($s.Display) sağlıklı" -ForegroundColor Green
        $healthy += $s
    }
    catch {
        Write-Host "    ⚠ $($s.Display) hazır değil" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Container Durumu"
Write-Host "========================================"
& $composeCmd ps

Write-Host ""
Write-Host "Erişim Noktaları:"
foreach ($s in $services) {
    Write-Host "  $($s.Display): $($s.Url)"
}

Write-Host ""
Write-Host "Sağlıklı servisler açılıyor..."
foreach ($s in $healthy) {
    $proc = Start-Process $s.Url -PassThru
    $script:openedBrowsers += $proc
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "========================================"
Write-Host " Loglar (durdurmak için Ctrl+C)"
Write-Host "========================================"
& $composeCmd logs -f
