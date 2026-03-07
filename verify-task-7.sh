#!/bin/bash
# Task 7 Verification Script - Workspace Guard Functionality
# This script verifies that the workspace guard is properly integrated

echo "============================================================"
echo "Task 7: Workspace Guard Functionality Verification"
echo "============================================================"
echo ""

all_passed=true

# Check 1: Verify workspace guard file exists
echo "[1/8] Checking workspace guard implementation..."
if [ -f "src/lib/ai/workspace-guard.ts" ]; then
    echo "  ✓ workspace-guard.ts exists"
else
    echo "  ✗ workspace-guard.ts not found"
    all_passed=false
fi

# Check 2: Verify AI service integration
echo "[2/8] Checking AI service integration..."
if grep -q "workspaceGuard" "src/lib/ai.ts" && grep -q "guardWarning" "src/lib/ai.ts" && grep -q "suggestedWorkspace" "src/lib/ai.ts"; then
    echo "  ✓ AI service has workspace guard integration"
else
    echo "  ✗ AI service missing workspace guard integration"
    all_passed=false
fi

# Check 3: Verify API route enhancement
echo "[3/8] Checking API route enhancement..."
if grep -q "guardWarning" "src/app/api/workspaces/chat/route.ts" && grep -q "suggestedWorkspace" "src/app/api/workspaces/chat/route.ts"; then
    echo "  ✓ API route includes guard fields in response"
else
    echo "  ✗ API route missing guard fields"
    all_passed=false
fi

# Check 4: Verify integration test exists
echo "[4/8] Checking integration test..."
if [ -f "src/app/api/workspaces/__tests__/guard-integration.manual-test.ts" ]; then
    echo "  ✓ Integration test file exists"
else
    echo "  ✗ Integration test file not found"
    all_passed=false
fi

# Check 5: Verify manual test for workspace guard
echo "[5/8] Checking workspace guard manual test..."
if [ -f "src/lib/ai/__tests__/workspace-guard.manual-test.ts" ]; then
    echo "  ✓ Workspace guard manual test exists"
else
    echo "  ✗ Workspace guard manual test not found"
    all_passed=false
fi

# Check 6: Verify TypeScript compilation
echo "[6/8] Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    echo "  ✓ TypeScript compilation successful"
else
    echo "  ✗ TypeScript compilation failed"
    all_passed=false
fi

# Check 7: Verify documentation exists
echo "[7/8] Checking documentation..."
if [ -f "WORKSPACE_GUARD_INTEGRATION.md" ]; then
    echo "  ✓ Integration documentation exists"
else
    echo "  ✗ Integration documentation not found"
    all_passed=false
fi

# Check 8: Verify completion summary
echo "[8/8] Checking completion summary..."
if [ -f "TASK_6_COMPLETION_SUMMARY.md" ]; then
    echo "  ✓ Task 6 completion summary exists"
else
    echo "  ✗ Task 6 completion summary not found"
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
    echo "1. Start the dev server: npm run dev"
    echo "2. Run manual integration test:"
    echo "   npx ts-node src/app/api/workspaces/__tests__/guard-integration.manual-test.ts"
    echo "3. Run workspace guard manual test:"
    echo "   npx ts-node src/lib/ai/__tests__/workspace-guard.manual-test.ts"
    echo ""
    echo "See TASK_7_VERIFICATION_GUIDE.md for detailed testing instructions"
else
    echo "✗ Some checks failed. Please review the output above."
fi

echo ""
