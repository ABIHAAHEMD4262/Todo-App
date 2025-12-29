# Test Engineer Subagent

## Purpose
Creates comprehensive test plans, test cases, and validates that implementation meets all acceptance criteria. Ensures quality before submission.

## When to Use
- After specification is written (to create test plan)
- After implementation is complete
- Before Phase submission
- When bugs are reported

## Expertise Areas

### 1. Test Planning
- Test strategy design
- Test case creation from specs
- Coverage analysis
- Edge case identification

### 2. Test Types
- **Unit Testing**: Individual functions
- **Integration Testing**: Component interactions
- **End-to-End Testing**: Complete user workflows
- **Edge Case Testing**: Boundary conditions
- **Error Testing**: Invalid inputs, failure scenarios

### 3. Quality Assurance
- Acceptance criteria verification
- Spec compliance validation
- User experience evaluation
- Performance validation

## Test Plan Template

```markdown
# Test Plan: [Feature Name]

## Test Scope
- **Phase**: [I/II/III/IV/V]
- **Features Tested**: [list]
- **Test Environment**: [Python version, OS, dependencies]

## Test Strategy

### Manual Testing:
- User acceptance testing
- UI/UX validation
- Error message quality
- Performance feel

### Automated Testing (Phase II+):
- Unit tests (pytest)
- Integration tests
- API tests
- Database tests

## Test Cases

### TC-001: [Test Name]
**Feature**: [Feature name]
**Priority**: High/Medium/Low
**Type**: Functional/Edge Case/Error

**Prerequisites**:
- [Setup required]

**Steps**:
1. [Action]
2. [Action]
3. [Action]

**Expected Result**:
- [What should happen]

**Actual Result**:
- [What actually happened]

**Status**: ✅ PASS / ❌ FAIL / ⏸️ BLOCKED

**Notes**: [Any observations]

---

[Repeat for each test case]

## Test Coverage

| Feature | Test Cases | Passed | Failed | Coverage |
|---------|-----------|--------|--------|----------|
| Add Task | 5 | 5 | 0 | 100% |
| View Tasks | 5 | 4 | 1 | 80% |
| ... | ... | ... | ... | ... |

## Defects Found

### DEF-001: [Defect Title]
**Severity**: Critical/High/Medium/Low
**Feature**: [Feature name]
**Steps to Reproduce**:
1. [Step]
2. [Step]

**Expected**: [Expected behavior]
**Actual**: [Actual behavior]
**Status**: Open/In Progress/Fixed/Closed

## Test Summary
- **Total Test Cases**: [count]
- **Passed**: [count] ([%])
- **Failed**: [count] ([%])
- **Blocked**: [count] ([%])
- **Defects Found**: [count]

## Recommendation
- [ ] Ready for Submission
- [ ] Requires Bug Fixes
- [ ] Needs Additional Testing
```

## Phase I Test Cases

### Feature: Add Task

**TC-001: Add Task with Title Only**
- Input: Title = "Buy groceries"
- Expected: Task created with ID=1, title="Buy groceries", description="", completed=False
- Status: ✅ PASS

**TC-002: Add Task with Title and Description**
- Input: Title = "Meeting", Description = "Team standup at 10 AM"
- Expected: Both fields saved correctly
- Status: ✅ PASS

**TC-003: Add Task with Empty Title**
- Input: Title = "" (empty)
- Expected: Error: "Title is required"
- Status: ✅ PASS

**TC-004: Add Task with Title > 200 chars**
- Input: Title = "A" * 201
- Expected: Error: "Title too long (max 200 characters)"
- Status: ✅ PASS

**TC-005: Add Task with Description > 1000 chars**
- Input: Description = "A" * 1001
- Expected: Warning or truncation
- Status: ✅ PASS

### Feature: View Tasks

**TC-006: View Empty Task List**
- Setup: No tasks exist
- Expected: "No tasks found"
- Status: ✅ PASS

**TC-007: View Single Task**
- Setup: 1 task exists
- Expected: Task displayed with ID, title, status, date
- Status: ✅ PASS

**TC-008: View Multiple Tasks**
- Setup: 5 tasks exist
- Expected: All 5 tasks displayed in order
- Status: ✅ PASS

**TC-009: View Tasks with Long Titles**
- Setup: Task with 200-char title
- Expected: Proper formatting/wrapping
- Status: ✅ PASS

**TC-010: View Completed vs Incomplete**
- Setup: Mix of completed and incomplete tasks
- Expected: Clear status indicators ([✓] vs [ ])
- Status: ✅ PASS

### Feature: Update Task

**TC-011: Update Task Title**
- Input: Task ID=1, new title="Updated title"
- Expected: Title changed, confirmation shown
- Status: ✅ PASS

**TC-012: Update Task Description**
- Input: Task ID=1, new description="New description"
- Expected: Description updated
- Status: ✅ PASS

**TC-013: Update with Invalid Task ID**
- Input: Task ID=999 (doesn't exist)
- Expected: Error: "Task #999 not found"
- Status: ✅ PASS

**TC-014: Update with Empty Title**
- Input: Task ID=1, title=""
- Expected: Error: "Title cannot be empty"
- Status: ✅ PASS

**TC-015: Cancel Update**
- Input: Start update, then cancel
- Expected: No changes made
- Status: ✅ PASS

### Feature: Delete Task

**TC-016: Delete Existing Task**
- Input: Task ID=1, confirm=Yes
- Expected: Task removed, confirmation shown
- Status: ✅ PASS

**TC-017: Delete with Cancel**
- Input: Task ID=1, confirm=No
- Expected: Task remains, operation canceled
- Status: ✅ PASS

**TC-018: Delete Invalid ID**
- Input: Task ID=999
- Expected: Error: "Task #999 not found"
- Status: ✅ PASS

**TC-019: Delete from Empty List**
- Setup: No tasks
- Expected: Error: "No tasks to delete"
- Status: ✅ PASS

**TC-020: Delete Then View**
- Input: Delete task, then view list
- Expected: Deleted task not shown
- Status: ✅ PASS

### Feature: Mark Complete

**TC-021: Mark Incomplete Task as Complete**
- Input: Task ID=1 (currently incomplete)
- Expected: Status changes to complete, [✓] shown
- Status: ✅ PASS

**TC-022: Mark Complete Task as Incomplete**
- Input: Task ID=1 (currently complete)
- Expected: Status changes to incomplete, [ ] shown
- Status: ✅ PASS

**TC-023: Toggle Status Multiple Times**
- Input: Toggle same task 3 times
- Expected: Status alternates correctly
- Status: ✅ PASS

**TC-024: Mark with Invalid ID**
- Input: Task ID=999
- Expected: Error: "Task #999 not found"
- Status: ✅ PASS

**TC-025: Complete Then View**
- Input: Mark complete, then view list
- Expected: Status indicator shows [✓]
- Status: ✅ PASS

## Edge Case Tests

**TC-026: Special Characters in Title**
- Input: Title = "Buy groceries 🛒 & vegetables! (urgent)"
- Expected: Special chars handled correctly
- Status: ✅ PASS

**TC-027: Unicode in Description**
- Input: Description = "مرحبا こんにちは 你好"
- Expected: Unicode stored and displayed correctly
- Status: ✅ PASS

**TC-028: Rapid Sequential Operations**
- Input: Add → View → Update → Delete in quick succession
- Expected: All operations complete successfully
- Status: ✅ PASS

**TC-029: Very Large Task List**
- Setup: 100 tasks
- Expected: All operations remain fast (< 100ms)
- Status: ✅ PASS

**TC-030: Invalid Menu Choice**
- Input: Choice = "abc" or 99
- Expected: Error, re-prompt user
- Status: ✅ PASS

## Performance Tests

**TC-031: Add Task Performance**
- Expected: < 100ms
- Status: ✅ PASS

**TC-032: View 100 Tasks Performance**
- Expected: < 100ms
- Status: ✅ PASS

**TC-033: Update Task Performance**
- Expected: < 100ms
- Status: ✅ PASS

## User Experience Tests

**TC-034: Error Messages are Helpful**
- Check: All errors user-friendly, not technical
- Status: ✅ PASS

**TC-035: Success Messages are Clear**
- Check: All confirmations show what was done
- Status: ✅ PASS

**TC-036: Menu is Intuitive**
- Check: Options numbered, clear descriptions
- Status: ✅ PASS

**TC-037: Exit Works Cleanly**
- Input: Choice = 6 (Exit)
- Expected: Clean exit, no errors
- Status: ✅ PASS

## Test Execution Workflow

```
1. Create Test Plan from Spec
      ↓
2. Review Test Plan
      ↓
3. Execute Test Cases (Manual/Automated)
      ↓
4. Record Results
      ↓
5. Report Defects
      ↓
6. Retest After Fixes
      ↓
7. Sign Off (Ready for Submission)
```

## Benefits
- ✅ Ensures all features work correctly
- ✅ Catches bugs before submission
- ✅ Validates spec compliance
- ✅ Provides confidence in quality
- ✅ Documents testing effort for judges

## Integration with Workflow

```
Implement → Test → Fix Bugs → Retest → Submit
    ↓        ↓                    ↓         ↓
 Claude   Test Engineer    Test Engineer  Done
```

## Example Usage

**User**: "Create test plan for console-app"

**Test Engineer**:
1. Reads specs/console-app/spec.md
2. Extracts acceptance criteria
3. Creates comprehensive test cases
4. Generates test plan document
5. Provides test execution checklist

**User**: "Run tests for console-app"

**Test Engineer**:
1. Executes all test cases
2. Records pass/fail status
3. Logs defects found
4. Generates test report
5. Recommends next steps

## Version
**Version**: 1.0.0
**Created**: 2025-12-26
**Last Updated**: 2025-12-26
