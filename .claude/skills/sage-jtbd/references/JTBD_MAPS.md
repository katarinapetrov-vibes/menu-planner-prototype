# JTBD Maps — HelloFresh Enterprise UX Platform

These maps represent the core jobs to be done across the HelloFresh supply chain product domains.
They are used by `/sage-jtbd` to ground design sessions in real user motivation before planning tool structure.

Each map follows the format:
- **Job statement** — When / I want to / So I can
- **Functional job** — The practical task
- **Emotional job** — How it feels when it goes wrong
- **Social job** — How it looks to others
- **Struggling moment** — The specific situation where the job breaks down today

---

## Domain: Ingredient to Product — Recipe Development

Source: Recipe Development AS-IS process map + Short Term improvement plan. Validated July 2026.
Primary users: Recipe Developer, Culinary Manager

---

### Job 1 — Ideate against the brief without doing duplicate work

**Job statement**
> "When I'm given a brief, I want to check what already exists in the recipe pool before I start ideating, so I don't spend time developing a recipe that duplicates something that already covers the gap."

**Functional job**
Receive brief (database gaps, campaigns, partnerships, menu expansion needs) → search recipe pool by protein, cuisine, dietary tag, market → confirm the idea doesn't already exist → proceed to develop only genuinely new recipes.

**Emotional job**
The brief creates urgency. The temptation is to start ideating immediately and skip the pool check — especially under deadline pressure. Discovering a duplicate after hours of work is demoralising and feels avoidable in retrospect.

**Social job**
Analysts brief recipe developers on gaps. Developers are expected to fill those gaps — not recreate what exists. Submitting a duplicate signals poor system awareness and wastes the analyst's briefing effort.

**Struggling moment**
Developer ideates and develops a recipe for three days. During registration (Step 6), a colleague mentions an almost-identical recipe was developed last quarter for a different market. The check that should happen at Step 3 (Ideate) is manual, inconsistent, and easy to skip.

**AS-IS failure**
No structured duplication check at the ideation stage. Compliance and pool checks are requirements stated in the process but not enforced by tooling — they depend entirely on the developer's discipline and memory.

**Short term improvement**
No specific tool targets this step yet. The centralised Recipe Steps Repository (Tool 1) helps downstream but doesn't address ideation-stage duplication.

---

### Job 2 — Register a new recipe without re-entering the same data multiple times

**Job statement**
> "When a recipe is approved, I want to register it in the system once, so I'm not manually entering the same codes, tags, and culinary info across multiple fields and screens."

**Functional job**
Enter recipe code, title, dish type, cuisine, preferences → assign dietary and prep tags (vegetarian, pork-free, quick prep) → enter culinary info → add ingredient list with SKU selections and quantities → enter recipe content and instructions. Currently each of these is a separate manual step.

**Emotional job**
The registration process is long, repetitive, and error-prone. The creative work is done — approval has been given — but the system forces a gauntlet of data entry before the recipe exists officially. It feels like admin that should be automatic.

**Social job**
Registration errors (wrong tag, missing dietary flag, incorrect SKU quantity) surface downstream in menu planning and production. Errors trace back to the developer. Accuracy at registration is a professional expectation with supply chain consequences.

**Struggling moment**
Developer manually enters ingredient list (Step 7), then has to manually verify each ingredient mention in the instructions (Step 11) to ensure they match. These are the same ingredients — but the system doesn't link them. One mismatch between the ingredient list and the instruction text can cause a compliance issue.

**AS-IS failure**
Recipe codes, titles, dietary tags, culinary info, ingredient list, recipe content, and instructions are all entered independently with no auto-population between steps. No system linkage between ingredient selection and instruction content.

**Short term improvement**
Tool 3 (Global Recipe Contents Standardisation): when an ingredient is selected, its content is automatically selected; when deselected, content is automatically deselected. Targets the ingredient-to-instruction linkage gap. Tool 1 (Centralised Recipe Steps Repository) enables step reuse rather than copy-paste from external sources.

---

### Job 3 — Validate nutritional and dietary data without manual cross-checking

**Job statement**
> "When I've entered a recipe's ingredients, I want the system to tell me if the nutritional values and dietary tags are correct, so I don't have to manually verify thresholds for every tag."

**Functional job**
Enter ingredients → system calculates nutritional profile → system validates dietary tag eligibility (calorie smart, keto, vegetarian, pork-free, etc.) → flags inconsistencies → developer reviews and confirms or corrects.

**Emotional job**
Manual validation of nutritional thresholds is tedious and high-stakes. The developer knows the recipe but may not know the precise threshold for every tag. Getting it wrong has compliance consequences that aren't discovered until much later in the chain.

**Social job**
Dietary tag errors reach customers. A recipe tagged "vegetarian" that contains a non-vegetarian ingredient is a customer trust failure and a compliance issue. The error traces back to the developer who validated Step 10.

**Struggling moment**
Developer assigns a "calorie smart" tag based on memory of similar recipes. The nutritional data is borderline and the threshold check is manual. The tag passes through registration, menu planning, and production — and is only questioned when a customer or auditor checks the published recipe.

**AS-IS failure**
Nutritional and dietary tag validation (Step 10) is fully manual. No automated threshold checking. Flags for inconsistencies depend on the developer knowing what to look for and having the correct reference data available.

**Short term improvement**
No specific tool targets automated nutritional validation yet. This remains a manual step in the Short Term state.

---

### Job 4 — Manage SKU substitutions without breaking recipe versions

**Job statement**
> "When a SKU is unavailable or changes, I want to substitute it across all affected recipe versions, so I'm not manually hunting down every version that uses that ingredient."

**Functional job**
Identify SKU change or shortage → find all recipe versions using that SKU across markets and planning weeks → apply substitution consistently → log the change → verify downstream impact on dietary tags and nutritional values.

**Emotional job**
SKU changes arrive unexpectedly and create a cascade of version updates. Each update is a risk of introducing an error. The volume of versions (base → variant → variant version, across markets) makes comprehensive substitution feel unmanageable.

**Social job**
A substitution that's applied to some versions but not others creates inconsistency in the menu. Production teams and planners discover the gap when it's already too late to fix cleanly. The developer is accountable for the completeness of the substitution.

**Struggling moment**
A SKU goes unavailable in DACH. The developer updates the base recipe. Three weeks later, a variant for AU/NZ is still using the old SKU because the substitution wasn't propagated — the developer didn't know that variant was active in the same planning week.

**AS-IS failure**
Version management (Step 12) handles substitutions per version, manually. No parent-to-variant propagation. Change logs exist but are not automatically generated — they require the developer to document each change.

**Short term improvement**
Tool 4 (Parent-to-Variant Changes): enables permanent changes from base to variants, working toward automated variant upload. Tool 5 (SKU Substitution Management): new capabilities to streamline substitution workflows in recipe development and review. Tool 6 (Version Management Enhancement): better change log validation and tracking for operational changes on versions.

---

### Job 5 — Audit every data value before a recipe goes live

**Job statement**
> "When I'm about to publish a recipe, I want to know where every cost, allergen, and nutritional value came from, so I can sign off with confidence."

**Functional job**
Source label on every value: Supplier Spec / Calculated / Manual Override + timestamp. Accessible in one hover or one click — not a multi-system trace.

**Emotional job**
Accountability fear — "if this number is wrong, it's on me." Publishing with unattributed values feels like signing a document you haven't fully read.

**Social job**
Compliance errors are public and auditable. Correctness and traceability signal professional rigour. Getting caught with an unattributed allergen value is reputationally costly.

**Struggling moment**
An auditor asks where a cost or allergen figure came from. The developer has to trace it manually across CPS, a supplier spec spreadsheet, and possibly a manual override — taking 20+ minutes for a single value. Meanwhile the same question could come up for any of the recipe's 10+ ingredients.

**AS-IS failure**
Cost, score, and allergen values are bare numbers with no source indicator in the UI. No `cost2pSource`, no `updatedAt`, no calculation method visible. Numbers appear authoritative but their provenance is unknown.

**Short term improvement**
Not explicitly targeted in the Short Term plan. Tool 3 (Global Recipe Contents Standardisation) improves ingredient linkage traceability but doesn't address cost or allergen source attribution directly.

---

## Domain: Plan to Procure — Menu Planning

Source: Menu Planning AS-IS + Short Term process maps. Validated July 2026.
Primary users: Menu Planner, Procurement, Editorial

---

### Job 6 — Set up GAMP constraints without losing track of what's been applied

**Job statement**
> "When I'm defining constraints for the upcoming 4-week menu, I want to document and verify every rule — recipe type, preferences, global targets — in one place, so GAMP produces a valid output on the first run."

**Functional job**
Consolidate slot structure, preference tags, and protein assignments from Menu Architecture. Define and document constraints for GAMP (recipe type, dietary preferences, global targets, operational constraints from Procurement and Production). Verify constraints are complete and consistent before running the algorithm.

**Emotional job**
Constraints are numerous, interdependent, and arrive from multiple teams. Forgetting one means GAMP produces an infeasible or invalid output, and the planner has to diagnose why — which takes longer than setting the constraint correctly in the first place.

**Social job**
GAMP runs consume time and stakeholder attention. A failed run due to a missing constraint looks like poor preparation. Getting it right first time signals operational competence across procurement, production, and culinary.

**Struggling moment**
Runs GAMP and gets an infeasible output. Spends an hour diagnosing which constraint caused the issue — was it a protein target, a preference conflict, or a missing operational constraint from production? The constraint documentation lives in a separate sheet and doesn't map directly to GAMP's config fields.

**AS-IS failure**
Constraints are manually documented and manually entered into GAMP. No structured constraint library, no infeasibility diagnostics, no analytics on which constraints are regularly violated or redundant.

**Short term improvement**
H2: Analyze/Clean Up Current Constraints, Establish Operational Constraints (Proc, Prod), Analytics on Constraint Management, Infeasibility Search, GAMP Experimentation Tooling.

---

### Job 7 — Prepare recipe and SKU volume data without manual formatting

**Job statement**
> "When I'm preparing inputs for GAMP, I want recipe volume data from the past 12 weeks and box forecasts to be ready to use, so I'm not spending time reformatting spreadsheets before I can run the algorithm."

**Functional job**
Gather recipe volume actuals (past 12 weeks) + box forecasts. Format data to match GAMP input specification. Combine with recipe pool and protein assignments. Upload to GAMP.

**Emotional job**
Formatting data for a tool that should be reading it automatically is friction that accumulates every planning cycle. It's invisible work — nobody asks how long it took, but it delays the actual planning.

**Social job**
The planning cycle has a fixed deadline. Time spent on data formatting is time not spent on actual menu decisions. Planners who spend less time on prep have more time for quality review — a visible difference in output quality.

**Struggling moment**
Volume data arrives in an export format that doesn't match GAMP's input spec. The planner spends 45 minutes reformatting column headers, date formats, and SKU codes before the run can start. This happens every cycle.

**AS-IS failure**
Volume data preparation is entirely manual. No automated extraction or formatting pipeline from actuals to GAMP input.

**Short term improvement**
H2: Improvement planned but not yet specified. Unified Recipe Pool is a related initiative that would reduce input fragmentation.

---

### Job 8 — Evaluate the GAMP output and make swaps with full cost visibility

**Job statement**
> "When GAMP produces a menu output, I want to assess cost, KPIs, and swap options in one view, so I'm not switching between the COGS model, MPS, and CATALYSTS to understand a single menu decision."

**Functional job**
Review GAMP output against budget using COGS model. Check KPIs via Quality Check Tool and CATALYSTS. Identify recipes to swap based on cost, stakeholder feedback, or constraint violations. Document swaps. Finalise and upload to MPS.

**Emotional job**
The evaluation phase involves the most judgment and the most tools simultaneously. Switching context between COGS model, MPS, and CATALYSTS to answer one question ("is this swap worth it?") fragments the decision-making and increases the chance of missing something.

**Social job**
Swaps are visible to stakeholders and require justification. A swap that worsens a KPI the planner didn't check — because it lived in a different tool — is hard to defend in a review.

**Struggling moment**
Identifies a recipe swap that fixes the cost issue. Documents it in Slack (the current swap documentation tool). Two days later, a stakeholder asks why the swap was made — the Slack message is buried in a thread and the rationale is lost. No formal swap log exists.

**AS-IS failure**
Swap documentation happens in Slack — informal, unsearchable, not linked to the menu version. COGS analysis, KPI checking, and swap management each require a different tool with no shared context. Post-GAMP analysis has no dedicated tooling.

**Short term improvement**
H2: Tooling for Post-GAMP Analysis & Visualisation. Menu Change Log Customisation. Multi Criteria Optimisation and Menu Relevance Metric to reduce the number of manual swaps needed.

---

### Job 9 — Manage SKU issues without manually cascading changes across every affected recipe

**Job statement**
> "When procurement identifies a SKU issue, I want to apply the substitution across all affected recipes and versions in one action, so I'm not manually editing picks, ingredients, steps, and tags recipe by recipe."

**Functional job**
Receive SKU issue notification (from Procurement, Editorial, or HelloConnect). Identify all recipes using the affected SKU across active planning weeks. Apply substitution — update picks/quantities, ingredients, steps, subtitle, chef's notes, dietary tags, nutritional data. Verify consistency. Notify downstream teams.

**Emotional job**
SKU issues arrive mid-cycle under time pressure. Each affected recipe requires the same set of edits — none of which are automated. The volume of manual steps per recipe, multiplied by the number of affected recipes, creates a high-stress, error-prone scramble.

**Social job**
A SKU issue that isn't fully resolved before production — one recipe with old picks, one with outdated nutritional data — causes a DC-level incident. The planner is accountable for the completeness of the substitution, even when the root cause was a supplier failure.

**Struggling moment**
Procurement flags a SKU shortage on a Wednesday. The planner uses the Bulk Recipe Change request template to initiate substitution. Manually edits picks, ingredients, steps, subtitle, and tags across 12 affected recipe versions. Misses one version's nutritional data update. The discrepancy is flagged during production prep on Friday.

**AS-IS failure**
SKU substitution management is entirely manual — initiated via a template, executed field-by-field per recipe version. No automated propagation from a single substitution action. Consistency across picks, ingredients, steps, tags, and nutritional data depends entirely on the planner's thoroughness.

**Short term improvement**
Tool 5 (Recipe Development — SKU Substitution Management): new capabilities to streamline substitution in development/review workflows. Tool 6 (Version Management Enhancement): better change log validation. SKU Cap Configuration & Monitoring (US, DACH, AUNZ): proactive supply vs. demand visibility to reduce reactive substitutions.

---

---

## Domain: Ingredient to Product — Editorial & Content Management

Source: INTL Editorial & Content Management AS-IS + Short Term process maps. Validated July 2026.
Primary users: Editorial team, HelloConnect

---

### Job 10 — Catch content errors before they reach the customer without reading every card

**Job statement**
> "When I'm reviewing recipe cards before go-live, I want the system to flag what needs attention, so I can focus my reduced team's time on real issues rather than scanning everything manually."

**Functional job**
Identify cards flagged for attention. Review flagged items for: ingredient list accuracy, instruction-ingredient alignment, nutritional tag correctness, allergen completeness, prep timing, subtitle and description accuracy. Prioritise by risk, not alphabetical order.

**Emotional job**
Reduced staffing means not every card can be checked. The anxiety isn't about thoroughness — it's about choosing where to focus limited attention. Missing a high-risk error because time was spent on a low-risk card is a failure that feels avoidable.

**Social job**
Content errors that reach customers (wrong allergen, missing ingredient in instructions, incorrect calorie-smart tag) are visible, traceable, and damaging to brand trust. Editorial is the last line of defence — being the team that let an error through is a significant professional and reputational cost.

**Struggling moment**
Reviewer checks 40 cards manually. Misses a card where baby spinach was substituted with peapods but the cooking step still says "wilt the spinach." The error reaches a customer who follows the instruction with the wrong ingredient. The flag that should have surfaced this was buried in a manual process.

**AS-IS failure**
Comprehensive checks are fully manual. With reduced staffing, focus must be prioritised — but the current system provides no automated flagging to guide that prioritisation. Every card looks the same until you read it.

**Short term improvement**
H2: Smart Alerting & Suggestions System — automatically flags ingredients not used in cooking steps, cooking steps that don't align with the ingredient section, wrong tags, wrong spiciness level, wrong cooking utensils. Transforms prioritisation from manual to signal-driven.

---

### Job 11 — Update recipe cards after a SKU substitution without re-checking every field manually

**Job statement**
> "When an ingredient substitution is made, I want to update the recipe card once and have the related fields — instructions, subtitle, nutritional tags — reflect the change, so I'm not hunting for every place the old ingredient was mentioned."

**Functional job**
Receive substitution notification (e.g., baby spinach → peapods). Update ingredient list. Find and update every reference to the old ingredient in: cooking steps, subtitle, description, chef's notes. Re-verify nutritional tags (e.g., calorie-smart threshold). Check allergen data. Save and prepare for CCM consumption.

**Emotional job**
Substitutions arrive mid-cycle and require immediate attention. The list of fields that reference an ingredient is not surfaced by the system — the editor has to know where to look. Missing one creates a customer-facing inconsistency that feels like carelessness, even though it was a system gap.

**Social job**
Recipe cards are customer-facing. An instruction that references an ingredient not in the ingredient list is a direct quality failure. HelloConnect implements in CCM based on what editorial provides — errors here propagate downstream without additional checking.

**Struggling moment**
Baby spinach is substituted with peapods. Editor updates the ingredient list and the cooking steps. Forgets the subtitle still says "with wilted spinach." The card goes live. A customer emails to say the subtitle doesn't match the box.

**AS-IS failure**
All substitution-related updates are manual and disconnected. No system linkage between the ingredient list and its mentions in steps, subtitles, or descriptions. No automated check that all references to a changed ingredient have been updated.

**Short term improvement**
H2: Smart Alerting — flags ingredients not appearing in cooking steps and steps that don't align with the ingredient section. Catches the mismatch after the fact, but doesn't auto-propagate the change. Full automation of cross-field updates is not yet planned.

---

### Job 12 — Keep photo, add-on menu, and CCM content in sync without manual coordination

**Job statement**
> "When a recipe card is finalised, I want photos uploaded to CPS and add-on menus built in CCM to happen as part of one workflow, so I'm not coordinating two separate systems and a third-party team to get one card live."

**Functional job**
Upload photos to CPS (so they're consumed by CCM and appear on recipes). Build add-on menus in CCM based on CPS information. Coordinate HelloConnect to implement in CCM. Confirm everything is consistent before the card goes live.

**Emotional job**
The photo upload and CCM implementation steps involve handoffs to HelloConnect — a third-party team. Handoffs introduce latency and dependency. When something is missing or wrong in CCM, tracing whether the issue was in the CPS upload, the add-on menu build, or HelloConnect's implementation takes longer than fixing it.

**Social job**
The recipe card is the customer's primary interaction with the product. A missing photo or a broken add-on menu is immediately visible. Responsibility for the final state is distributed across editorial, HelloConnect, and CPS — but customer perception attributes it to the brand.

**Struggling moment**
Photo is uploaded to CPS. HelloConnect implements in CCM. Card goes live. Photo doesn't appear because the CPS upload was in the wrong format and CCM didn't consume it. The editor discovers this from a customer complaint rather than a system alert.

**AS-IS failure**
Photo upload (CPS) and CCM implementation (HelloConnect) are sequential, manually coordinated steps with no automated verification that the photo was successfully consumed. No feedback loop between CPS and CCM to confirm the card is complete.

**Short term improvement**
No specific tooling targets the CPS-to-CCM photo consumption verification in the Short Term plan. This remains a manual coordination dependency.

---

## Editing notes

- Jobs 1–5 are validated against Recipe Development AS-IS process map (July 2026).
- Jobs 6–9 are validated against Menu Planning AS-IS process map (July 2026).
- Jobs 10–12 are validated against Editorial & Content Management AS-IS process map (July 2026).
- Add new jobs below the last entry. Keep the same format.
- Struggling moments are the most important field — if it doesn't describe a real situation, the job isn't grounded enough to design from.
- Flag jobs with "**needs validation**" if they are derived rather than confirmed with a user.
