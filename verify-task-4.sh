#!/bin/bash

# Task 4 Verification Script
# This script performs automated checks to verify the chat history functionality

echo "🔍 Task 4: Chat History Functionality Verification"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print check result
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((CHECKS_FAILED++))
    fi
}

# Check 1: MongoDB URI configured
echo "Check 1: MongoDB URI Configuration"
if grep -q "MONGODB_URI=" .env.local 2>/dev/null; then
    check_result 0 "MongoDB URI is configured in .env.local"
else
    check_result 1 "MongoDB URI is NOT configured in .env.local"
fi
echo ""

# Check 2: Dependencies installed
echo "Check 2: Dependencies"
if [ -d "node_modules" ] && [ -f "node_modules/uuid/package.json" ]; then
    check_result 0 "Dependencies are installed (uuid found)"
else
    check_result 1 "Dependencies are NOT installed or uuid is missing"
fi
echo ""

# Check 3: TypeScript compilation
echo "Check 3: TypeScript Compilation"
npm run type-check > /dev/null 2>&1
check_result $? "TypeScript compilation"
echo ""

# Check 4: Service file exists
echo "Check 4: Chat History Service"
if [ -f "src/lib/chat/history.ts" ]; then
    check_result 0 "Chat History Service file exists"
else
    check_result 1 "Chat History Service file NOT found"
fi
echo ""

# Check 5: API routes exist
echo "Check 5: API Routes"
ROUTES_EXIST=0
if [ ! -f "src/app/api/chat/session/create/route.ts" ]; then ROUTES_EXIST=1; fi
if [ ! -f "src/app/api/chat/session/list/route.ts" ]; then ROUTES_EXIST=1; fi
if [ ! -f "src/app/api/chat/session/[id]/route.ts" ]; then ROUTES_EXIST=1; fi
if [ ! -f "src/app/api/chat/message/route.ts" ]; then ROUTES_EXIST=1; fi

if [ $ROUTES_EXIST -eq 0 ]; then
    check_result 0 "All 4 API route files exist"
else
    check_result 1 "Some API route files are missing"
fi
echo ""

# Check 6: Test scripts exist
echo "Check 6: Test Scripts"
TEST_SCRIPTS_EXIST=0
if [ ! -f "src/lib/chat/__tests__/history.manual-test.ts" ]; then TEST_SCRIPTS_EXIST=1; fi
if [ ! -f "src/app/api/chat/__tests__/api-test.manual.ts" ]; then TEST_SCRIPTS_EXIST=1; fi

if [ $TEST_SCRIPTS_EXIST -eq 0 ]; then
    check_result 0 "Test scripts exist"
else
    check_result 1 "Some test scripts are missing"
fi
echo ""

# Check 7: MongoDB schemas exist
echo "Check 7: MongoDB Schemas"
SCHEMAS_EXIST=0
if [ ! -f "src/lib/db/schemas/chatSession.schema.ts" ]; then SCHEMAS_EXIST=1; fi
if [ ! -f "src/lib/db/schemas/message.schema.ts" ]; then SCHEMAS_EXIST=1; fi

if [ $SCHEMAS_EXIST -eq 0 ]; then
    check_result 0 "MongoDB schemas exist"
else
    check_result 1 "Some MongoDB schemas are missing"
fi
echo ""

# Check 8: Documentation exists
echo "Check 8: Documentation"
DOCS_EXIST=0
if [ ! -f "src/lib/chat/README.md" ]; then DOCS_EXIST=1; fi
if [ ! -f "src/app/api/chat/README.md" ]; then DOCS_EXIST=1; fi

if [ $DOCS_EXIST -eq 0 ]; then
    check_result 0 "Documentation files exist"
else
    check_result 1 "Some documentation files are missing"
fi
echo ""

# Summary
echo "=================================================="
echo "Summary:"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to run manual tests.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start dev server: npm run dev"
    echo "2. Run API tests: npx ts-node src/app/api/chat/__tests__/api-test.manual.ts"
    echo "3. Run service tests: npx ts-node src/lib/chat/__tests__/history.manual-test.ts"
    echo ""
    echo "See TASK_4_VERIFICATION_GUIDE.md for detailed instructions."
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
