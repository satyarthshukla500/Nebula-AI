# Task 4 Verification Script (PowerShell)
Write-Host "Task 4: Chat History Functionality Verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$ChecksPassed = 0
$ChecksFailed = 0

function Check-Result {
    param (
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "PASS: $Message" -ForegroundColor Green
        $script:ChecksPassed++
    } else {
        Write-Host "FAIL: $Message" -ForegroundColor Red
        $script:ChecksFailed++
    }
}

Write-Host "Check 1: MongoDB URI Configuration"
$mongoUriExists = Select-String -Path ".env.local" -Pattern "MONGODB_URI=" -Quiet -ErrorAction SilentlyContinue
Check-Result $mongoUriExists "MongoDB URI is configured in .env.local"
Write-Host ""

Write-Host "Check 2: Dependencies"
$uuidExists = Test-Path "node_modules\uuid\package.json"
Check-Result $uuidExists "Dependencies are installed (uuid found)"
Write-Host ""

Write-Host "Check 3: TypeScript Compilation"
$typeCheckResult = & npm run type-check 2>&1 | Out-Null
$typeCheckSuccess = $LASTEXITCODE -eq 0
Check-Result $typeCheckSuccess "TypeScript compilation"
Write-Host ""

Write-Host "Check 4: Chat History Service"
$serviceExists = Test-Path "src/lib/chat/history.ts"
Check-Result $serviceExists "Chat History Service file exists"
Write-Host ""

Write-Host "Check 5: API Routes"
$route1 = Test-Path "src\app\api\chat\session\create\route.ts"
$route2 = Test-Path "src\app\api\chat\session\list\route.ts"
$route3 = Get-ChildItem "src\app\api\chat\session" -Recurse -Filter "route.ts" | Where-Object { $_.Directory.Name -eq "[id]" }
$route4 = Test-Path "src\app\api\chat\message\route.ts"
$allRoutesExist = $route1 -and $route2 -and ($null -ne $route3) -and $route4
Check-Result $allRoutesExist "All 4 API route files exist"
Write-Host ""

Write-Host "Check 6: Test Scripts"
$test1 = Test-Path "src/lib/chat/__tests__/history.manual-test.ts"
$test2 = Test-Path "src/app/api/chat/__tests__/api-test.manual.ts"
$allTestsExist = $test1 -and $test2
Check-Result $allTestsExist "Test scripts exist"
Write-Host ""

Write-Host "Check 7: MongoDB Schemas"
$schema1 = Test-Path "src/lib/db/schemas/chatSession.schema.ts"
$schema2 = Test-Path "src/lib/db/schemas/message.schema.ts"
$allSchemasExist = $schema1 -and $schema2
Check-Result $allSchemasExist "MongoDB schemas exist"
Write-Host ""

Write-Host "Check 8: Documentation"
$doc1 = Test-Path "src/lib/chat/README.md"
$doc2 = Test-Path "src/app/api/chat/README.md"
$allDocsExist = $doc1 -and $doc2
Check-Result $allDocsExist "Documentation files exist"
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Summary:"
Write-Host "Passed: $ChecksPassed" -ForegroundColor Green
Write-Host "Failed: $ChecksFailed" -ForegroundColor Red
Write-Host ""

if ($ChecksFailed -eq 0) {
    Write-Host "All checks passed! Ready to run manual tests." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Start dev server: npm run dev"
    Write-Host "2. Run API tests: npx ts-node src/app/api/chat/__tests__/api-test.manual.ts"
    Write-Host "3. Run service tests: npx ts-node src/lib/chat/__tests__/history.manual-test.ts"
    Write-Host ""
    Write-Host "See TASK_4_VERIFICATION_GUIDE.md for detailed instructions."
    exit 0
} else {
    Write-Host "Some checks failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}
