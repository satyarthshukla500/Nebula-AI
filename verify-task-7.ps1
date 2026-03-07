# Task 7 Verification Script - Workspace Guard Functionality
# This script verifies that the workspace guard is properly integrated

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Task 7: Workspace Guard Functionality Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Check 1: Verify workspace guard file exists
Write-Host "[1/8] Checking workspace guard implementation..." -ForegroundColor Yellow
if (Test-Path "src/lib/ai/workspace-guard.ts") {
    Write-Host "  ✓ workspace-guard.ts exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ workspace-guard.ts not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 2: Verify AI service integration
Write-Host "[2/8] Checking AI service integration..." -ForegroundColor Yellow
$aiContent = Get-Content "src/lib/ai.ts" -Raw
if ($aiContent -match "workspaceGuard" -and $aiContent -match "guardWarning" -and $aiContent -match "suggestedWorkspace") {
    Write-Host "  ✓ AI service has workspace guard integration" -ForegroundColor Green
} else {
    Write-Host "  ✗ AI service missing workspace guard integration" -ForegroundColor Red
    $allPassed = $false
}

# Check 3: Verify API route enhancement
Write-Host "[3/8] Checking API route enhancement..." -ForegroundColor Yellow
$apiContent = Get-Content "src/app/api/workspaces/chat/route.ts" -Raw
if ($apiContent -match "guardWarning" -and $apiContent -match "suggestedWorkspace") {
    Write-Host "  ✓ API route includes guard fields in response" -ForegroundColor Green
} else {
    Write-Host "  ✗ API route missing guard fields" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Verify integration test exists
Write-Host "[4/8] Checking integration test..." -ForegroundColor Yellow
if (Test-Path "src/app/api/workspaces/__tests__/guard-integration.manual-test.ts") {
    Write-Host "  ✓ Integration test file exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Integration test file not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 5: Verify manual test for workspace guard
Write-Host "[5/8] Checking workspace guard manual test..." -ForegroundColor Yellow
if (Test-Path "src/lib/ai/__tests__/workspace-guard.manual-test.ts") {
    Write-Host "  ✓ Workspace guard manual test exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Workspace guard manual test not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 6: Verify TypeScript compilation
Write-Host "[6/8] Running TypeScript type check..." -ForegroundColor Yellow
$typeCheckOutput = npm run type-check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "  ✗ TypeScript compilation failed" -ForegroundColor Red
    Write-Host "  Error: $typeCheckOutput" -ForegroundColor Red
    $allPassed = $false
}

# Check 7: Verify documentation exists
Write-Host "[7/8] Checking documentation..." -ForegroundColor Yellow
if (Test-Path "WORKSPACE_GUARD_INTEGRATION.md") {
    Write-Host "  ✓ Integration documentation exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Integration documentation not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 8: Verify completion summary
Write-Host "[8/8] Checking completion summary..." -ForegroundColor Yellow
if (Test-Path "TASK_6_COMPLETION_SUMMARY.md") {
    Write-Host "  ✓ Task 6 completion summary exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ Task 6 completion summary not found" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Start the dev server: npm run dev" -ForegroundColor White
    Write-Host "2. Run manual integration test:" -ForegroundColor White
    Write-Host "   npx ts-node src/app/api/workspaces/__tests__/guard-integration.manual-test.ts" -ForegroundColor White
    Write-Host "3. Run workspace guard manual test:" -ForegroundColor White
    Write-Host "   npx ts-node src/lib/ai/__tests__/workspace-guard.manual-test.ts" -ForegroundColor White
    Write-Host ""
    Write-Host "See TASK_7_VERIFICATION_GUIDE.md for detailed testing instructions" -ForegroundColor Cyan
} else {
    Write-Host "Some checks failed. Please review the output above." -ForegroundColor Red
}

Write-Host ""
