# SDD Workflow Skill

## Purpose
Runs the complete Spec-Driven Development workflow for a feature: Specify → Plan → Tasks → Implement in one go.

## When to Use
When you want to quickly go from a feature idea to implementation without running each step manually.

## Usage
Just ask: "Run SDD workflow for [feature-name]"

Example:
- "Run SDD workflow for console-app"
- "Run SDD workflow for user-authentication"

## What It Does

1. **Check if spec exists**
   - If YES: Continue to step 2
   - If NO: Guide user to create spec first

2. **Clarify Spec** (runs /sp.clarify)
   - Identifies underspecified areas
   - Asks 3-5 targeted clarification questions
   - Updates spec with answers
   - Ensures spec is complete before planning

3. **Generate Plan** (runs /sp.plan)
   - Reads clarified specs/[feature-name]/spec.md
   - Creates specs/[feature-name]/plan.md
   - Shows architecture decisions

4. **Create Tasks** (runs /sp.tasks)
   - Reads spec + plan
   - Creates specs/[feature-name]/tasks.md
   - Breaks down into atomic work units

5. **Ready for Implementation**
   - Summarizes what was created
   - Shows next step: "Run /sp.implement"

## Example Flow

**You say**: "Run SDD workflow for console-app"

**I do**:
```
✓ Found spec: specs/console-app/spec.md

✓ Clarifying spec...
  Questions:
  1. Should tasks persist between sessions?
     → No (Phase I is in-memory only)
  2. Max number of tasks supported?
     → Up to 1000 tasks
  3. Input encoding support?
     → UTF-8 (supports emojis, international chars)

✓ Updated spec with clarifications

✓ Generating plan...
✓ Created: specs/console-app/plan.md

✓ Creating tasks...
✓ Created: specs/console-app/tasks.md (12 tasks)

Ready for implementation!
Next: Tell me "Implement console-app"
```

## Benefits
- ✅ Saves time (no manual /sp.clarify, /sp.plan, /sp.tasks commands)
- ✅ Ensures correct workflow order (Spec → Clarify → Plan → Tasks)
- ✅ Catches underspecified areas before planning
- ✅ One command to go from spec to ready-to-code

## Version
1.0.0
