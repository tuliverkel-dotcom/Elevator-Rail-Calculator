import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType, WidthType, ShadingType, Header, Footer, SimpleField, NumberFormat } from "docx";
import FileSaver from "file-saver";
import { CalculationResult, ProjectMetadata, RailProperties, SystemInputs } from "../types";
import { CONSTANTS } from "../constants";

// Helper Colors
const COLOR_PRIMARY = "102A44"; // Dark Navy
const COLOR_ACCENT = "0078D7"; // Blue
const COLOR_FAIL = "D32F2F"; // Red
const COLOR_PASS = "2E7D32"; // Green
const COLOR_LIGHT_BG = "F5F5F5";

export const generateWordReport = async (
  metadata: ProjectMetadata,
  inputs: SystemInputs,
  carRail: RailProperties,
  cwtRail: RailProperties,
  safetyResults: CalculationResult,
  normalResults: CalculationResult,
  cwtResults: CalculationResult,
  aiAnalysis: string
) => {
  
  // --- HELPERS ---
  const createTextCell = (text: string, bold = false, align = AlignmentType.LEFT, size = 22) => {
    return new TableCell({
      children: [new Paragraph({ 
        children: [new TextRun({ text, bold, size })],
        alignment: align
      })],
      verticalAlign: "center",
      margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
  };

  const createBarChartCell = (value: number, limit: number) => {
    const percentage = Math.min((value / limit) * 100, 100);
    const isFail = value > limit;
    const color = isFail ? COLOR_FAIL : COLOR_ACCENT;
    
    // We create a nested table to simulate a progress bar
    return new TableCell({
      children: [
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: percentage, type: WidthType.PERCENTAGE },
                            shading: { fill: color, type: ShadingType.CLEAR, color: "auto" },
                            children: [new Paragraph({ text: "" })],
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                        }),
                        new TableCell({
                             width: { size: 100 - percentage, type: WidthType.PERCENTAGE },
                             children: [new Paragraph({ text: "" })],
                             borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                        })
                    ]
                })
            ],
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
        })
      ]
    });
  };

  const createResultRowWithGraph = (label: string, value: number, unit: string, limit?: number) => {
    const valueStr = value.toFixed(2);
    let statusCell = new TableCell({ children: [] });
    let graphCell = new TableCell({ children: [] });

    if (limit) {
        const isFail = value > limit;
        statusCell = new TableCell({
            children: [new Paragraph({ 
                text: isFail ? "NEVYHOVUJE" : "VYHOVUJE", 
                alignment: AlignmentType.CENTER,
                style: isFail ? "FailText" : "PassText"
            })],
            verticalAlign: "center"
        });
        graphCell = createBarChartCell(value, limit);
    } else {
        statusCell = new TableCell({ children: [new Paragraph({text: "-", alignment: AlignmentType.CENTER})]});
        graphCell = new TableCell({ children: [new Paragraph({text: ""})] });
    }

    return new TableRow({
      children: [
        createTextCell(label, false, AlignmentType.LEFT),
        createTextCell(`${valueStr} ${unit}`, true, AlignmentType.RIGHT),
        limit ? createTextCell(`${limit} ${unit}`, false, AlignmentType.RIGHT) : createTextCell("-", false, AlignmentType.RIGHT),
        graphCell,
        statusCell
      ],
    });
  };

  // --- SECTIONS ---

  // 1. INPUTS TABLE
  const inputsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
            createTextCell("Parameter", true), 
            createTextCell("Hodnota", true), 
            createTextCell("Jednotka", true)
        ],
        shading: { fill: COLOR_LIGHT_BG }
      }),
      new TableRow({ children: [createTextCell("Hmotnosť Kabíny (P)"), createTextCell(String(inputs.P), true), createTextCell("kg")] }),
      new TableRow({ children: [createTextCell("Nosnosť (Q)"), createTextCell(String(inputs.Q), true), createTextCell("kg")] }),
      new TableRow({ children: [createTextCell("Hmotnosť Protiváhy (Mctw)"), createTextCell(String(inputs.Mctw), true), createTextCell("kg")] }),
      new TableRow({ children: [createTextCell("Menovitá Rýchlosť"), createTextCell(String(inputs.v_rated), true), createTextCell("m/s")] }),
      new TableRow({ children: [createTextCell("Rozstup Konzol (L)"), createTextCell(String(inputs.L), true), createTextCell("mm")] }),
      new TableRow({ children: [createTextCell("Typ Vodidla Kabíny"), createTextCell(carRail.name, true), createTextCell("-")] }),
      new TableRow({ children: [createTextCell("Typ Vodidla Protiváhy"), createTextCell(cwtRail.name, true), createTextCell("-")] }),
    ]
  });

  // 2. RESULTS FUNCTION
  const createSectionResults = (title: string, data: CalculationResult, isSafety: boolean) => {
    const limitSigma = isSafety ? CONSTANTS.sigma_perm : CONSTANTS.sigma_perm_normal;
    const limitDef = isSafety ? undefined : CONSTANTS.deflection_perm;

    const rows = [
        new TableRow({
            children: [
                createTextCell("Parameter", true),
                createTextCell("Hodnota", true, AlignmentType.RIGHT),
                createTextCell("Limit", true, AlignmentType.RIGHT),
                createTextCell("Využitie", true, AlignmentType.CENTER),
                createTextCell("Stav", true, AlignmentType.CENTER),
            ],
            shading: { fill: COLOR_LIGHT_BG }
        }),
        createResultRowWithGraph("Fx (Laterálna Sila)", data.forceFx, "N"),
        createResultRowWithGraph("Fy (Vodiaca Sila)", data.forceFy, "N"),
        createResultRowWithGraph("Mx (Ohybový Moment)", data.momentMx, "Nmm"),
        createResultRowWithGraph("My (Ohybový Moment)", data.momentMy, "Nmm"),
        createResultRowWithGraph("Výsledné Napätie (σ)", data.sigmaM, "MPa", limitSigma),
    ];

    if (isSafety) {
        rows.push(createResultRowWithGraph("Štíhlosť (λ)", data.slenderness, ""));
        rows.push(createResultRowWithGraph("Vzperné Napätie", data.sigmaBuckling, "MPa"));
    } else {
        rows.push(createResultRowWithGraph("Priehyb X", data.deflectionX, "mm", limitDef));
        rows.push(createResultRowWithGraph("Priehyb Y", data.deflectionY, "mm", limitDef));
    }

    return [
        new Paragraph({ text: title, heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows,
            borders: {
                insideHorizontal: { style: BorderStyle.SINGLE, color: "DDDDDD" },
                outsideBorder: { style: BorderStyle.SINGLE, color: "AAAAAA" }
            }
        })
    ];
  };

  // --- DOCUMENT STRUCTURE ---
  const doc = new Document({
    styles: {
      default: {
        document: {
            run: {
                font: "Calibri",
                size: 22, // 11pt
            }
        }
      },
      paragraphStyles: [
        {
          id: "TitleStyle",
          name: "Report Title",
          run: { color: COLOR_PRIMARY, size: 48, bold: true }, // 24pt
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 200 } }
        },
        {
          id: "SubtitleStyle",
          name: "Report Subtitle",
          run: { color: "666666", size: 28, italics: true },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 800 } }
        },
        {
            id: "Heading1",
            name: "Heading 1",
            run: { color: COLOR_PRIMARY, size: 32, bold: true },
            paragraph: { spacing: { before: 600, after: 200 }, border: { bottom: { color: COLOR_ACCENT, space: 1, style: BorderStyle.SINGLE, size: 6 } } }
        },
        {
            id: "Heading2",
            name: "Heading 2",
            run: { color: COLOR_ACCENT, size: 26, bold: true },
        },
        {
            id: "PassText",
            name: "Pass Text",
            run: { color: COLOR_PASS, bold: true, size: 18 }
        },
        {
            id: "FailText",
            name: "Fail Text",
            run: { color: COLOR_FAIL, bold: true, size: 18 }
        }
      ]
    },
    sections: [
      {
        properties: {},
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "VÝPOČET VODIDIEL | EN 81-20/50", size: 16, color: "888888" }),
                            new TextRun({ text: "\t" + metadata.projectName, size: 16, bold: true })
                        ],
                        tabStops: [{ type: "right", position: 9000 }] // Right align tab
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Strana ", size: 18 }),
                            new SimpleField("PAGE"),
                            new TextRun({ text: " | Vygenerované automaticky", size: 18, color: "888888" })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ]
            })
        },
        children: [
          // --- COVER PAGE ---
          new Paragraph({ text: "" }), // Spacer
          new Paragraph({ text: "VÝPOČET VODIDIEL VÝŤAHU", style: "TitleStyle" }),
          new Paragraph({ text: "TECHNICKÁ SPRÁVA", style: "SubtitleStyle" }),
          
          new Paragraph({ text: "" }),
          new Table({
            width: { size: 80, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
                new TableRow({ children: [createTextCell("Názov Projektu:", true), createTextCell(metadata.projectName)] }),
                new TableRow({ children: [createTextCell("Zákazník:", true), createTextCell(metadata.customer)] }),
                new TableRow({ children: [createTextCell("Číslo Zákazky:", true), createTextCell(metadata.orderNumber)] }),
                new TableRow({ children: [createTextCell("Vypracoval:", true), createTextCell(metadata.author)] }),
                new TableRow({ children: [createTextCell("Dátum:", true), createTextCell(metadata.date)] }),
            ],
            borders: {
                top: { style: BorderStyle.SINGLE, size: 2 },
                bottom: { style: BorderStyle.SINGLE, size: 2 },
                left: { style: BorderStyle.SINGLE, size: 2 },
                right: { style: BorderStyle.SINGLE, size: 2 },
                insideHorizontal: { style: BorderStyle.DOTTED, size: 1 }
            }
          }),
          
          new Paragraph({ text: "", pageBreakBefore: true }),

          // --- 1. VSTUPY ---
          new Paragraph({ text: "1. VSTUPNÉ PARAMETRE", style: "Heading1" }),
          inputsTable,

          // --- 2. VÝSLEDKY ---
          new Paragraph({ text: "2. VÝSLEDKY VÝPOČTOV", style: "Heading1" }),
          
          ...createSectionResults("2.1 Kabína - Pád (Zachytávače)", safetyResults, true),
          ...createSectionResults("2.2 Kabína - Normálna Jazda", normalResults, false),
          ...createSectionResults("2.3 Protiváha", cwtResults, false),

          // --- 3. AI ANALÝZA ---
          new Paragraph({ text: "", pageBreakBefore: true }),
          new Paragraph({ text: "3. INŽINIERSKA ANALÝZA (AI)", style: "Heading1" }),
          
          new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                  new TableRow({
                      children: [
                          new TableCell({
                              children: [
                                  new Paragraph({
                                      children: [new TextRun({ text: aiAnalysis || "Analýza nebola vygenerovaná.", size: 22 })]
                                  })
                              ],
                              shading: { fill: "F9F9F9" },
                              margins: { top: 200, bottom: 200, left: 200, right: 200 },
                              borders: {
                                  top: { style: BorderStyle.SINGLE, color: COLOR_ACCENT },
                                  bottom: { style: BorderStyle.SINGLE, color: COLOR_ACCENT },
                                  left: { style: BorderStyle.SINGLE, color: COLOR_ACCENT },
                                  right: { style: BorderStyle.SINGLE, color: COLOR_ACCENT },
                              }
                          })
                      ]
                  })
              ]
          }),

          // DISCLAIMER
          new Paragraph({
            text: "\nUpozornenie: Tento výpočet je informatívny a bol vygenerovaný automatizovaným nástrojom. Výsledky musia byť overené kvalifikovaným inžinierom v súlade s platnými normami STN EN 81-20/50.",
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
            run: { italics: true, color: "888888", size: 16 }
          })
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeName = metadata.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'vypocet';
  
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `${safeName}_report.docx`);
};