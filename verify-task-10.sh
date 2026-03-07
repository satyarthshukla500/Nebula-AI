#!/bin/bash
# Task 10 Verification Script - File Upload Functionality
# This script verifies that file upload is properly implemented

echo "============================================================"
echo "Task 10: File Upload Functionality Verification"
echo "============================================================"
echo ""

all_passed=true

# Check 1: Verify FileUploadService exists
echo "[1/10] Checking FileUploadService implementation..."
if [ -f "src/lib/upload/file-service.ts" ]; then
    echo "  ✓ file-service.ts exists"
else
    echo "  ✗ file-service.ts not found"
    all_passed=false
fi

# Check 2: Verify API endpoint exists
echo "[2/10] Checking API endpoint..."
if [ -f "src/app/api/upload/file/route.ts" ]; then
    echo "  ✓ API endpoint exists"
else
    echo "  ✗ API endpoint not found"
    all_passed=false
fi

# Check 3: Verify file schema exists
echo "[3/10] Checking file schema..."
if [ -f "src/lib/db/schemas/file.schema.ts" ]; then
    echo "  ✓ File schema exists"
else
    echo "  ✗ File schema not found"
    all_passed=false
fi

# Check 4: Verify service test exists
echo "[4/10] Checking service tests..."
if [ -f "src/lib/upload/__tests__/file-service.manual-test.ts" ]; then
    echo "  ✓ Service test exists"
else
    echo "  ✗ Service test not found"
    all_passed=false
fi

# Check 5: Verify API test exists
echo "[5/10] Checking API tests..."
if [ -f "src/app/api/upload/__tests__/file-upload-api.manual-test.ts" ]; then
    echo "  ✓ API test exists"
else
    echo "  ✗ API test not found"
    all_passed=false
fi

# Check 6: Verify service has required methods
echo "[6/10] Checking service methods..."
methods_found=true
required_methods=("validateFile" "uploadFile" "saveMetadata" "getFileMetadata" "getUserFiles" "processFile")

for method in "${required_methods[@]}"; do
    if ! grep -q "$method" "src/lib/upload/file-service.ts"; then
        echo "  ✗ Missing method: $method"
        methods_found=false
        all_passed=false
    fi
done

if [ "$methods_found" = true ]; then
    echo "  ✓ All required methods present"
fi

# Check 7: Verify API has POST and GET handlers
echo "[7/10] Checking API handlers..."
if grep -q "export const POST" "src/app/api/upload/file/route.ts" && grep -q "export const GET" "src/app/api/upload/file/route.ts"; then
    echo "  ✓ POST and GET handlers present"
else
    echo "  ✗ Missing API handlers"
    all_passed=false
fi

# Check 8: Verify TypeScript compilation
echo "[8/10] Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    echo "  ✓ TypeScript compilation successful"
else
    echo "  ✗ TypeScript compilation failed"
    all_passed=false
fi

# Check 9: Verify documentation exists
echo "[9/10] Checking documentation..."
docs_exist=true

if [ -f "src/lib/upload/README.md" ]; then
    echo "  ✓ Service README exists"
else
    echo "  ✗ Service README not found"
    docs_exist=false
    all_passed=false
fi

if [ -f "src/app/api/upload/README.md" ]; then
    echo "  ✓ API README exists"
else
    echo "  ✗ API README not found"
    docs_exist=false
    all_passed=false
fi

# Check 10: Verify completion summaries
echo "[10/10] Checking completion summaries..."
if [ -f "TASK_8_COMPLETION_SUMMARY.md" ] && [ -f "TASK_9_COMPLETION_SUMMARY.md" ]; then
    echo "  ✓ Completion summaries exist"
else
    echo "  ✗ Completion summaries not found"
    all_passed=false
fi

echo ""
echo "============================================================"
echo "Verification Summary"
echo "============================================================"

if [ "$all_passed" = true ]; then
    echo "✓ All checks passed!"
    echo ""
    echo "Next Steps:"
    echo "1. Ensure MongoDB is configured and running"
    echo "2. Ensure AWS S3 credentials are configured"
    echo "3. Start the dev server: npm run dev"
    echo "4. Run service tests:"
    echo "   npx ts-node src/lib/upload/__tests__/file-service.manual-test.ts"
    echo "5. Run API tests:"
    echo "   npx ts-node src/app/api/upload/__tests__/file-upload-api.manual-test.ts"
    echo ""
    echo "See TASK_10_VERIFICATION_GUIDE.md for detailed testing instructions"
else
    echo "✗ Some checks failed. Please review the output above."
fi

echo ""
