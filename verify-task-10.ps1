# Task 10 Verification Script - File Upload Functionality
# This script verifies that file upload is properly implemented

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Task 10: File Upload Functionality Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: Verify FileUploadService exists
Write-Host "[1/10] Checking FileUploadService implementation..." -ForegroundColor Yellow
if (Test-Path "src/lib/upload/file-service.ts") {
    Write-Host "  ✓ file-service.ts exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ file-service.ts not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Verify API endpoint exists
Write-Host "[2/10] Checking API endpoint..." -ForegroundColor Yellow
if (Test-Path "src/app/api/upload/file/route.ts") {
    Write-Host "  ✓ API endpoint exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ API endpoint not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Verify file schema exists
Write-Host "[3/10] Checking file schema..." -ForegroundColor Yellow
if (Test-Path "src/lib/db/schemas/file.schema.ts") {
    Write-Host "  ✓ File schema exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ File schema not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Verify service test exists
Write-Host "[4/10] Checking service tests..." -ForegroundColor Yellow
if (Test-Path "src/lib/upload/__tests__/file-service.manual-test.ts") {
    Write-Host "  ✓ Service test exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Service test not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Verify API test exists
Write-Host "[5/10] Checking API tests..." -ForegroundColor Yellow
if (Test-Path "src/app/api/upload/__tests__/file-upload-api.manual-test.ts") {
    Write-Host "  ✓ API test exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ API test not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: Verify service has required methods
Write-Host "[6/10] Checking service methods..." -ForegroundColor Yellow
$serviceContent = Get-Content "src/lib/upload/file-service.ts" -Raw
$requiredMethods = @("validateFile", "uploadFile", "saveMetadata", "getFileMetadata", "getUserFiles", "processFile")
$methodsFound = $true

foreach ($method in $requiredMethods) {
    if ($serviceContent -notmatch $method) {
        Write-Host "  ✗ Missing method: $method" -ForegroundColor Red
        $methodsFound = $false
        $allPassed = $false
    }
}

if ($methodsFound) {
    Write-Host "  ✓ All required methods present" -ForegroundColor Green
}

# Check 7: Verify API has POST and GET handlers
Write-Host "[7/10] Checking API handlers..." -ForegroundColor Yellow
$apiContent = Get-Content "src/app/api/upload/file/route.ts" -Raw
if ($apiContent -match "export const POST" -and $apiContent -match "export const GET") {
    Write-Host "  ✓ POST and GET handlers present" -ForegroundColor Green
} else {
    Write-Host "  ✗ Missing API handlers" -ForegroundColor Red
    $allPassed = $false
}

# Check 8: Verify TypeScript compilation
Write-Host "[8/10] Running TypeScript type check..." -ForegroundColor Yellow
$typeCheckOutput = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "  ✗ TypeScript compilation failed" -ForegroundColor Red
    Write-Host "  Error: $typeCheckOutput" -ForegroundColor Red
    $allPassed = $false
}

# Check 9: Verify documentation exists
Write-Host "[9/10] Checking documentation..." -ForegroundColor Yellow
$docsExist = $true

if (Test-Path "src/lib/upload/README.md") {
    Write-Host "  ✓ Service README exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Service README not found" -ForegroundColor Red
    $docsExist = $false
    $allPassed = $false
}

if (Test-Path "src/app/api/upload/README.md") {
    Write-Host "  ✓ API README exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ API README not found" -ForegroundColor Red
    $docsExist = $false
    $allPassed = $false
}

# Check 10: Verify completion summaries
Write-Host "[10/10] Checking completion summaries..." -ForegroundColor Yellow
if ((Test-Path "TASK_8_COMPLETION_SUMMARY.md") -and (Test-Path "TASK_9_COMPLETION_SUMMARY.md")) {
    Write-Host "  ✓ Completion summaries exist" -ForegroundColor Green
} else {
    Write-Host "  ✗ Completion summaries not found" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Ensure MongoDB is configured and running" -ForegroundColor White
    Write-Host "2. Ensure AWS S3 credentials are configured" -ForegroundColor White
    Write-Host "3. Start the dev server: npm run dev" -ForegroundColor White
    Write-Host "4. Run service tests:" -ForegroundColor White
    Write-Host "   npx ts-node src/lib/upload/__tests__/file-service.manual-test.ts" -ForegroundColor White
    Write-Host "5. Run API tests:" -ForegroundColor White
    Write-Host "   npx ts-node src/app/api/upload/__tests__/file-upload-api.manual-test.ts" -ForegroundColor White
    Write-Host ""
    Write-Host "See TASK_10_VERIFICATION_GUIDE.md for detailed testing instructions" -ForegroundColor Cyan
} else {
    Write-Host "✗ Some checks failed. Please review the output above." -ForegroundColor Red
}

Write-Host ""
