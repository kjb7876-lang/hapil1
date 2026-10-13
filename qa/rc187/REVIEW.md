# RC187 restored laser stroke metadata validation

Static visual/restore review found title(c) indexed any integer rc175StrokeMode, while geometry fell back to cast ID for out-of-range values. A malformed restored mode could therefore produce an undefined warning label with a different valid geometry. One shared validMode/strokeMode rule now drives label and geometry; the native cast validator rejects explicitly malformed mode metadata. Legacy casts with no field and all four valid modes remain accepted. Fresh configure repairs invalid metadata once. No normal line, width, timing, damage or color changed.

CPU test executes the actual native validator prefix: malformed modes fail before the inherited checks, valid modes continue to unchanged native validation. Four mode/legacy headings and fallback/configure behavior pass. Real production map clip/36-layout safe-grid, native DOT and boss-policy regressions pass. This is source/CPU evidence, not real game rendering or save UI.

Extension 84 lists three runtime files and chains to 83. User-approved EGO sources, foot pivots and all generated body masks remain unchanged; local source/normalized composites reviewed without repainting hidden cloak pixels. No main/Pages/StoryWorld or browser retry.
