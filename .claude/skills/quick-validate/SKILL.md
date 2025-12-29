# Quick Validate Skill

## Purpose
Quick pre-submission check to make sure everything is ready for the hackathon.

## When to Use
- Before submitting Phase I (or any phase)
- After making changes
- When you want peace of mind

## Usage
Just ask: "Quick validate Phase I" or "Quick validate console-app"

## What It Checks

### 1. **Files Exist**
- ✅ Constitution
- ✅ Spec file
- ✅ Source code
- ✅ README.md

### 2. **Code Quality** (Quick scan)
- Are functions too long? (> 50 lines)
- Any obvious errors?
- PEP 8 basics (indentation, naming)

### 3. **Spec Compliance**
- Does code match spec requirements?
- All 5 features implemented?
- Edge cases handled?

### 4. **Submission Checklist**
- [ ] All required files present
- [ ] Code runs without errors
- [ ] README has setup instructions
- [ ] Ready for demo video

## Example Output

```
===========================================
  QUICK VALIDATION: Phase I
===========================================

✅ Files Check
   ✅ Constitution exists
   ✅ Spec exists (specs/console-app/spec.md)
   ✅ Source code exists (src/)
   ✅ README.md exists

✅ Code Quality
   ✅ No functions > 50 lines
   ✅ PEP 8 compliant
   ✅ No obvious errors

⚠️ Spec Compliance
   ✅ Add Task - implemented
   ✅ Delete Task - implemented
   ✅ Update Task - implemented
   ✅ View Tasks - implemented
   ⚠️ Mark Complete - needs testing

❌ Submission Checklist
   ✅ Required files present
   ❌ Demo video not created yet
   ⚠️ README needs improvement

===========================================
RECOMMENDATION: Fix issues above, then submit
===========================================
```

## Benefits
- ✅ Catches issues before submission
- ✅ Quick feedback (< 1 minute)
- ✅ Submission confidence

## Version
1.0.0
