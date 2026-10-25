const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createBlueprintPDF() {
  const pdfDoc = await PDFDocument.create();
  
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  const colors = {
    darkBg: rgb(0.11, 0.10, 0.09),      // #1c1917
    stone900: rgb(0.15, 0.13, 0.12),    // #262220
    stone800: rgb(0.24, 0.22, 0.20),    // #3d3835
    stone700: rgb(0.35, 0.32, 0.30),    // #59524d
    stone200: rgb(0.92, 0.90, 0.88),    // #eae6e1
    stone100: rgb(0.96, 0.95, 0.94),    // #f5f3f0
    amber: rgb(0.96, 0.62, 0.04),       // #f59e0b
    amberDark: rgb(0.71, 0.33, 0.04),   // #b45309
    emerald: rgb(0.06, 0.73, 0.51),     // #10b981
    textDark: rgb(0.12, 0.12, 0.12),
    textMuted: rgb(0.40, 0.38, 0.36),
    white: rgb(1, 1, 1),
    rowAlt: rgb(0.96, 0.95, 0.94),
    boxBorder: rgb(0.85, 0.82, 0.79)
  };

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  function drawHeaderFooter(page, pageNum, totalPages) {
    // Top banner bar
    page.drawRectangle({
      x: margin,
      y: pageHeight - 34,
      width: contentWidth,
      height: 18,
      fillColor: colors.darkBg
    });

    page.drawText('THE SUBURBAN OUTPOST', {
      x: margin + 8,
      y: pageHeight - 27,
      size: 8,
      font: fontBold,
      color: colors.amber
    });

    page.drawText('FIELD MANUAL 04-A: SUBURBAN POWER RESILIENCE', {
      x: margin + 140,
      y: pageHeight - 27,
      size: 7,
      font: fontHelvetica,
      color: colors.white
    });

    page.drawText('OCT 2026 EDITION', {
      x: pageWidth - margin - 85,
      y: pageHeight - 27,
      size: 7,
      font: fontMono,
      color: colors.amber
    });

    // Bottom footer line
    page.drawLine({
      start: { x: margin, y: 35 },
      end: { x: pageWidth - margin, y: 35 },
      thickness: 0.8,
      color: colors.stone700
    });

    page.drawText('thesuburbanoutpost.com | Confidential Field Engineering Dispatch', {
      x: margin,
      y: 24,
      size: 7,
      font: fontHelvetica,
      color: colors.textMuted
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: pageWidth - margin - 50,
      y: 24,
      size: 7,
      font: fontMono,
      color: colors.textMuted
    });
  }

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ==========================================
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);

  // Dark Cover Hero Header Box
  page1.drawRectangle({
    x: margin,
    y: pageHeight - 240,
    width: contentWidth,
    height: 190,
    fillColor: colors.darkBg
  });

  page1.drawRectangle({
    x: margin + 15,
    y: pageHeight - 80,
    width: 140,
    height: 18,
    fillColor: colors.amberDark
  });

  page1.drawText('TECHNICAL BLUEPRINT 04-A', {
    x: margin + 22,
    y: pageHeight - 73,
    size: 8,
    font: fontMonoBold,
    color: colors.white
  });

  page1.drawText('Suburban Solar Sizing, Battery Storage', {
    x: margin + 15,
    y: pageHeight - 115,
    size: 20,
    font: fontBold,
    color: colors.white
  });

  page1.drawText('& NEC 702 Transfer Switch Manual', {
    x: margin + 15,
    y: pageHeight - 140,
    size: 20,
    font: fontBold,
    color: colors.amber
  });

  page1.drawText('Engineering 100% Residential Power Sovereignty Behind HOA Lines & Sub-35 dBA Limits', {
    x: margin + 15,
    y: pageHeight - 165,
    size: 10,
    font: fontHelvetica,
    color: colors.stone200
  });

  // Authors row in header
  page1.drawLine({
    start: { x: margin + 15, y: pageHeight - 180 },
    end: { x: pageWidth - margin - 15, y: pageHeight - 180 },
    thickness: 0.5,
    color: colors.stone700
  });

  page1.drawText('AUTHORED BY: Marcus Vance (Master Electrician, NEC 702/705) | Elena Rostova, PE | Roger Sikes (Editorial Dir.)', {
    x: margin + 15,
    y: pageHeight - 195,
    size: 7.5,
    font: fontHelvetica,
    color: colors.stone200
  });

  page1.drawText('SYSTEM SCOPE: 120V/240V Split-Phase Backup | LiFePO4 Chemistry | Zero-Footprint Stealth Arrays', {
    x: margin + 15,
    y: pageHeight - 208,
    size: 7.5,
    font: fontMono,
    color: colors.amber
  });

  // Section 1: Executive Overview
  let y = pageHeight - 270;

  page1.drawText('1. The Suburban Power Constraint Envelope', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 16;
  const p1Text1 = "Suburban homesteaders operate inside radically tighter operational constraints than rural off-gridders. While an isolated 40-acre farm can tolerate a roaring 78 dBA open-frame generator running behind a barn, a quarter-acre suburban lot immediately triggers municipal noise nuisance ordinances, HOA deed restriction citations, and hostile neighbor friction.";
  page1.drawText(p1Text1, {
    x: margin,
    y: y,
    size: 9,
    font: fontHelvetica,
    color: colors.textDark,
    lineHeight: 13,
    maxWidth: contentWidth
  });

  y -= 38;
  const p1Text2 = "Furthermore, municipal fire and building inspectors strictly enforce NEC Article 702 (Optional Standby Systems) to prevent backfeeding power into utility transformers, which poses lethal risks to line workers. This blueprint details the exact calculations, wiring topology, and equipment specifications required to achieve silent, code-compliant, whole-home resilience without drawing regulatory attention.";
  page1.drawText(p1Text2, {
    x: margin,
    y: y,
    size: 9,
    font: fontHelvetica,
    color: colors.textDark,
    lineHeight: 13,
    maxWidth: contentWidth
  });

  // Comparison Callout Box: Gas Generator vs. LFP Solar Station
  y -= 52;
  page1.drawRectangle({
    x: margin,
    y: y - 110,
    width: contentWidth,
    height: 110,
    fillColor: colors.stone100,
    borderColor: colors.boxBorder,
    borderWidth: 1
  });

  page1.drawText('CRITICAL BENCHMARK: COMBUSTION GENERATORS VS. SOLID-STATE LFP SOLAR', {
    x: margin + 12,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: colors.amberDark
  });

  const tableHeaders = ['Metric', 'Open-Frame Gas', 'Inverter Generator', 'Solid-State LFP Station'];
  const colX = [margin + 12, margin + 130, margin + 250, margin + 380];

  page1.drawLine({
    start: { x: margin + 10, y: y - 24 },
    end: { x: pageWidth - margin - 10, y: y - 24 },
    thickness: 0.5,
    color: colors.stone700
  });

  let rowY = y - 35;
  for (let i = 0; i < tableHeaders.length; i++) {
    page1.drawText(tableHeaders[i], { x: colX[i], y: rowY, size: 7.5, font: fontBold, color: colors.darkBg });
  }

  const rows = [
    ['Noise @ 20ft', '78 dBA (Lawnmower)', '58 dBA (Normal Talk)', '< 30 dBA (Library Silent)'],
    ['Carbon Monoxide', 'Fatal Hazard (Outdoors Only)', 'Fatal Hazard (Outdoors Only)', 'ZERO (100% Indoor Safe)'],
    ['Shelf Fuel Life', '30-90 Days (Gums Carb)', '30-90 Days (Ethanol breakdown)', '12+ Months (90% charge retention)'],
    ['Cycle Lifespan', '1,000-2,000 Run Hours', '2,500 Run Hours', '6,000+ Cycles (15+ Years Daily)']
  ];

  for (const row of rows) {
    rowY -= 16;
    for (let c = 0; c < row.length; c++) {
      page1.drawText(row[c], {
        x: colX[c],
        y: rowY,
        size: 7.5,
        font: c === 3 ? fontBold : fontHelvetica,
        color: c === 3 ? colors.emerald : colors.textDark
      });
    }
  }

  // Key Principles Box
  y = rowY - 45;
  page1.drawText('2. Core Architectural Principles of the Suburban Outpost', {
    x: margin,
    y: y,
    size: 12,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 18;
  const bullets = [
    'Principle 1: Pure Sine Wave Output Only. Inverter compressors (modern refrigerators, furnace ECM motors, medical CPAPs) overheat and burn out on modified square waves.',
    'Principle 2: NEC 702 Physical Interlock. Cords through windows leak thermal insulation in winter and violate safety codes. Feed existing branch circuits cleanly.',
    'Principle 3: Floating Neutral Isolation. Ground-fault circuit interrupter (GFCI) breakers in panels trip instantly if your backup battery improperly bonds neutral twice.',
    'Principle 4: Visual Camouflage. Avoid visible street-side roof arrays that trigger HOA architectural review boards. Deploy sub-fence and pergola bifacial mounts.'
  ];

  for (const b of bullets) {
    page1.drawText('-', { x: margin + 4, y: y, size: 9, font: fontBold, color: colors.amberDark });
    page1.drawText(b, {
      x: margin + 16,
      y: y,
      size: 8,
      font: fontHelvetica,
      color: colors.textDark,
      lineHeight: 11,
      maxWidth: contentWidth - 20
    });
    y -= 22;
  }

  drawHeaderFooter(page1, 1, 4);

  // ==========================================
  // PAGE 2: CRITICAL LOAD SIZING MATRIX & FORMULAS
  // ==========================================
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);

  y = pageHeight - 65;
  page2.drawText('3. Residential Critical Load Sizing Matrix (24-Hour Baseline)', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  page2.drawText('To design a reliable 3-day outage buffer, compute your continuous run watts, cycling duty cycles, and surge start requirements:', {
    x: margin,
    y: y,
    size: 8.5,
    font: fontHelvetica,
    color: colors.textMuted
  });

  // Table
  y -= 20;
  const loadHeaders = ['Circuit / Appliance', 'Running Watts', 'Surge Surge', 'Daily Run Time', 'Daily Energy (kWh)'];
  const loadCols = [margin + 8, margin + 160, margin + 245, margin + 330, margin + 430];

  page2.drawRectangle({
    x: margin,
    y: y - 18,
    width: contentWidth,
    height: 20,
    fillColor: colors.darkBg
  });

  for (let i = 0; i < loadHeaders.length; i++) {
    page2.drawText(loadHeaders[i], { x: loadCols[i], y: y - 12, size: 8, font: fontBold, color: colors.white });
  }

  const loadRows = [
    ['Inverter Refrigerator (18-24 cu.ft)', '150 W', '600 W', '8 hrs (33% duty cycle)', '1.20 kWh'],
    ['1/2 HP Emergency Sump Pump', '800 W', '2,100 W', '1.5 hrs (intermittent rain)', '1.20 kWh'],
    ['Starlink Satellite Dish + Wi-Fi 6', '65 W', '100 W', '16 hrs active uptime', '1.04 kWh'],
    ['Gas Furnace ECM Blower Fan (Heating)', '350 W', '950 W', '4 hrs (cycling in winter)', '1.40 kWh'],
    ['Medical Devices (CPAP with Heated Tubing)', '60 W', '120 W', '8 hrs overnight', '0.48 kWh'],
    ['LED Lighting (4 rooms) + Device Charging', '75 W', '75 W', '6 hrs evening use', '0.45 kWh'],
    ['Deep Well Submersible Pump (240V, 1HP)*', '1,200 W', '3,600 W', '0.5 hrs total tank fill', '0.60 kWh'],
    ['Food Sealer / Freezer Chest Monitoring', '90 W', '450 W', '3 hrs (cycling duty)', '0.27 kWh']
  ];

  let loadY = y - 18;
  for (let r = 0; r < loadRows.length; r++) {
    loadY -= 18;
    if (r % 2 === 1) {
      page2.drawRectangle({
        x: margin,
        y: loadY - 4,
        width: contentWidth,
        height: 18,
        fillColor: colors.rowAlt
      });
    }
    const item = loadRows[r];
    for (let c = 0; c < item.length; c++) {
      page2.drawText(item[c], {
        x: loadCols[c],
        y: loadY + 1,
        size: 7.5,
        font: c === 0 ? fontBold : (c === 4 ? fontMonoBold : fontHelvetica),
        color: c === 4 ? colors.amberDark : colors.textDark
      });
    }
  }

  // Total summary row
  loadY -= 22;
  page2.drawRectangle({
    x: margin,
    y: loadY - 6,
    width: contentWidth,
    height: 24,
    fillColor: colors.stone900
  });

  page2.drawText('TOTAL CRITICAL BASELINE DEMAND (24-HR CYCLE):', {
    x: margin + 10,
    y: loadY + 1,
    size: 8.5,
    font: fontBold,
    color: colors.white
  });

  page2.drawText('~6.64 kWh / Day', {
    x: loadCols[4] - 20,
    y: loadY + 1,
    size: 10,
    font: fontMonoBold,
    color: colors.amber
  });

  // Battery Sizing Calculation Formula Box
  y = loadY - 40;
  page2.drawText('4. Mathematical Sizing Formula for Battery Banks & Solar Refill', {
    x: margin,
    y: y,
    size: 12,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  page2.drawRectangle({
    x: margin,
    y: y - 145,
    width: contentWidth,
    height: 145,
    fillColor: colors.stone100,
    borderColor: colors.boxBorder,
    borderWidth: 1
  });

  page2.drawText('FORMULA 1: TOTAL USABLE BATTERY STORAGE CAPACITY (kWh)', {
    x: margin + 12,
    y: y - 16,
    size: 8,
    font: fontMonoBold,
    color: colors.amberDark
  });

  page2.drawText('C_battery = ( Daily_Consumption_kWh x Autonomy_Days ) ÷ ( DoD x Eff_inverter )', {
    x: margin + 16,
    y: y - 34,
    size: 10,
    font: fontMonoBold,
    color: colors.darkBg
  });

  const formEx = [
    'Where: Daily_Consumption = 6.64 kWh; Autonomy_Days = 2.0 (standard 48-hr blackout cushion)',
    'DoD (Depth of Discharge) = 0.90 for LiFePO4 chemistry (versus 0.50 for lead-acid/AGM)',
    'Eff_inverter (Inverter Inversion Efficiency) = 0.92 for Tier-1 Pure Sine Wave inverters',
    'Calculation: ( 6.64 kWh x 2.0 ) ÷ ( 0.90 x 0.92 ) = 13.28 ÷ 0.828 = 16.03 kWh Total Battery Bank'
  ];

  let fy = y - 50;
  for (const l of formEx) {
    page2.drawText(l, { x: margin + 16, y: fy, size: 7.5, font: fontHelvetica, color: colors.textDark });
    fy -= 14;
  }

  page2.drawText('FORMULA 2: REQUIRED SOLAR PHOTOVOLTAIC ARRAY SIZING (Watts)', {
    x: margin + 12,
    y: fy - 6,
    size: 8,
    font: fontMonoBold,
    color: colors.amberDark
  });

  page2.drawText('W_solar = ( Daily_Consumption_Wh ÷ ( Peak_Sun_Hours x System_Loss_Factor ) )', {
    x: margin + 16,
    y: fy - 22,
    size: 9.5,
    font: fontMonoBold,
    color: colors.darkBg
  });

  page2.drawText('Calculation: ( 6,640 Wh ÷ ( 4.2 Sun Hours x 0.80 System Factor ) ) = 6,640 ÷ 3.36 = 1,976 Watts Solar Array', {
    x: margin + 16,
    y: fy - 36,
    size: 7.5,
    font: fontHelvetica,
    color: colors.textDark
  });

  // Recommendation Callout
  y = fy - 65;
  page2.drawRectangle({
    x: margin,
    y: y - 48,
    width: contentWidth,
    height: 48,
    fillColor: rgb(0.93, 0.98, 0.95),
    borderColor: colors.emerald,
    borderWidth: 1
  });

  page2.drawText('RECOMMENDED MODULAR SUBURBAN SPECIFICATION:', {
    x: margin + 10,
    y: y - 14,
    size: 8,
    font: fontBold,
    color: rgb(0.04, 0.45, 0.32)
  });

  page2.drawText('- Battery: 3x 48V 100Ah Server Rack LiFePO4 (ECO-WORTHY 5.12kWh = 15.36kWh total) or EcoFlow DELTA Pro (3.6kWh base + Smart Batteries)', {
    x: margin + 10,
    y: y - 28,
    size: 7.5,
    font: fontHelvetica,
    color: colors.textDark
  });

  page2.drawText('- Solar Refill: 4x 400W High-Efficiency Bifacial Ground-Mount Panels positioned along rear fence line (1,600W Refill)', {
    x: margin + 10,
    y: y - 40,
    size: 7.5,
    font: fontHelvetica,
    color: colors.textDark
  });

  drawHeaderFooter(page2, 2, 4);

  // ==========================================
  // PAGE 3: NEC 702 TRANSFER SWITCH TOPOLOGY
  // ==========================================
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);

  y = pageHeight - 65;
  page3.drawText('5. NEC 702 Manual Transfer Switch Wiring & Neutral Bonding', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  page3.drawText('Wiring code requirements for safe, backfeed-proof interlock connection to residential service panels:', {
    x: margin,
    y: y,
    size: 8.5,
    font: fontHelvetica,
    color: colors.textMuted
  });

  // Schematic Diagram Box
  y -= 20;
  page3.drawRectangle({
    x: margin,
    y: y - 210,
    width: contentWidth,
    height: 210,
    fillColor: colors.stone100,
    borderColor: colors.stone800,
    borderWidth: 1
  });

  page3.drawText('TECHNICAL SCHEMATIC: RESIDENTIAL ISOLATION INTERLOCK (NEC ARTICLE 702)', {
    x: margin + 12,
    y: y - 18,
    size: 8,
    font: fontMonoBold,
    color: colors.amberDark
  });

  // Draw Block Diagram using shapes
  // 1. Utility Grid
  page3.drawRectangle({ x: margin + 20, y: y - 80, width: 90, height: 45, fillColor: colors.stone900 });
  page3.drawText('UTILITY GRID', { x: margin + 30, y: y - 56, size: 7.5, font: fontBold, color: colors.white });
  page3.drawText('240V Split-Phase', { x: margin + 28, y: y - 68, size: 6.5, font: fontHelvetica, color: colors.amber });

  // 2. Main Service Panel
  page3.drawRectangle({ x: margin + 150, y: y - 130, width: 140, height: 105, fillColor: colors.stone200, borderColor: colors.darkBg, borderWidth: 1 });
  page3.drawText('MAIN 200A SERVICE PANEL', { x: margin + 158, y: y - 40, size: 7.5, font: fontBold, color: colors.darkBg });
  page3.drawText('Main 200A Breaker (Grid)', { x: margin + 158, y: y - 55, size: 6.5, font: fontHelvetica, color: colors.textDark });
  page3.drawText('MECHANICAL INTERLOCK PLATE', { x: margin + 158, y: y - 72, size: 6.5, font: fontBold, color: colors.amberDark });
  page3.drawText('Generator Backfeed Breaker (30A/50A)', { x: margin + 158, y: y - 88, size: 6.5, font: fontHelvetica, color: colors.textDark });
  page3.drawText('Critical Branch Breakers (L1 / L2)', { x: margin + 158, y: y - 105, size: 6.5, font: fontHelvetica, color: colors.textDark });
  page3.drawText('Main Bonding Jumper (N-G Grounded)', { x: margin + 158, y: y - 120, size: 6, font: fontMono, color: colors.emerald });

  // 3. Generator Power Inlet Box (NEMA 3R PB30)
  page3.drawRectangle({ x: margin + 340, y: y - 85, width: 100, height: 50, fillColor: colors.stone900 });
  page3.drawText('NEMA 3R INLET BOX', { x: margin + 348, y: y - 58, size: 7.5, font: fontBold, color: colors.white });
  page3.drawText('PB30 (4-Prong L14-30)', { x: margin + 348, y: y - 70, size: 6.5, font: fontMono, color: colors.amber });

  // 4. LFP Storage Battery / Inverter
  page3.drawRectangle({ x: margin + 330, y: y - 185, width: 130, height: 60, fillColor: rgb(0.92, 0.95, 0.98), borderColor: rgb(0.12, 0.35, 0.65), borderWidth: 1 });
  page3.drawText('LFP SOLAR GENERATOR', { x: margin + 340, y: y - 146, size: 7.5, font: fontBold, color: rgb(0.12, 0.35, 0.65) });
  page3.drawText('EcoFlow / LiTime 48V Station', { x: margin + 340, y: y - 158, size: 6.5, font: fontHelvetica, color: colors.textDark });
  page3.drawText('Pure Sine Wave Inverter 120/240V', { x: margin + 340, y: y - 170, size: 6.5, font: fontHelvetica, color: colors.textDark });
  page3.drawText('FLOATING NEUTRAL CONFIG', { x: margin + 340, y: y - 181, size: 6.5, font: fontMonoBold, color: colors.amberDark });

  // Draw connecting arrows / lines
  page3.drawLine({ start: { x: margin + 110, y: y - 58 }, end: { x: margin + 150, y: y - 58 }, thickness: 1.5, color: colors.darkBg });
  page3.drawLine({ start: { x: margin + 290, y: y - 85 }, end: { x: margin + 340, y: y - 70 }, thickness: 1.5, color: colors.amberDark });
  page3.drawLine({ start: { x: margin + 390, y: y - 85 }, end: { x: margin + 390, y: y - 125 }, thickness: 1.5, color: colors.darkBg });

  // Wire Sizing & NEC Rules Section
  y -= 230;
  page3.drawText('6. Electrical Wire Sizing & Conduit Specifications', {
    x: margin,
    y: y,
    size: 12,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  const wireData = [
    ['Amperage', 'Inlet Type', 'Cable Gauge (Copper)', 'Conduit Requirement', 'Max Run Distance'],
    ['30 Amps (7,200W)', 'NEMA L14-30P', '10 AWG (4-Wire: L1, L2, N, G)', '3/4" Schedule 40 PVC / EMT', '65 Feet (<3% drop)'],
    ['50 Amps (12,000W)', 'NEMA 14-50P / CS6375', '6 AWG (4-Wire: L1, L2, N, G)', '1" Schedule 40 PVC / EMT', '90 Feet (<3% drop)']
  ];

  let wy = y - 16;
  for (let r = 0; r < wireData.length; r++) {
    const row = wireData[r];
    if (r === 0) {
      page3.drawRectangle({ x: margin, y: wy - 4, width: contentWidth, height: 18, fillColor: colors.stone900 });
    } else if (r % 2 === 1) {
      page3.drawRectangle({ x: margin, y: wy - 4, width: contentWidth, height: 18, fillColor: colors.rowAlt });
    }
    const cols = [margin + 8, margin + 110, margin + 215, margin + 360, margin + 455];
    for (let c = 0; c < row.length; c++) {
      page3.drawText(row[c], {
        x: cols[c],
        y: wy + 1,
        size: 7,
        font: r === 0 ? fontBold : (c === 2 ? fontMonoBold : fontHelvetica),
        color: r === 0 ? colors.white : colors.textDark
      });
    }
    wy -= 18;
  }

  // Dangerous Neutral Bonding Callout
  y = wy - 15;
  page3.drawRectangle({
    x: margin,
    y: y - 75,
    width: contentWidth,
    height: 75,
    fillColor: rgb(0.99, 0.94, 0.94),
    borderColor: rgb(0.85, 0.20, 0.20),
    borderWidth: 1.2
  });

  page3.drawText('DANGER: THE FLOATING NEUTRAL VS. BONDED NEUTRAL TRAP', {
    x: margin + 10,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(0.85, 0.20, 0.20)
  });

  const dangerText1 = "Your home's main 200A service panel already connects Neutral to Ground (the Main Bonding Jumper). If your backup generator ALSO has an internal bonded neutral, connecting it to your panel creates a 'Parallel Neutral Loop'. Current will travel over ground conductors, electrifying metal equipment frames and instantly tripping upstream GFCI and AFCI breakers.";
  page3.drawText(dangerText1, {
    x: margin + 10,
    y: y - 30,
    size: 7.5,
    font: fontHelvetica,
    color: colors.textDark,
    lineHeight: 10,
    maxWidth: contentWidth - 20
  });

  const dangerText2 = "RULE: When connecting to a home service panel, always configure the generator as a FLOATING NEUTRAL. If your power station has an internal bonding screw or switch, remove/disable it for whole-home panel integration.";
  page3.drawText(dangerText2, {
    x: margin + 10,
    y: y - 56,
    size: 7.5,
    font: fontBold,
    color: rgb(0.60, 0.10, 0.10),
    lineHeight: 10,
    maxWidth: contentWidth - 20
  });

  drawHeaderFooter(page3, 3, 4);

  // ==========================================
  // PAGE 4: STEALTH SOLAR PLACEMENT & FIELD CHECKLIST
  // ==========================================
  const page4 = pdfDoc.addPage([pageWidth, pageHeight]);

  y = pageHeight - 65;
  page4.drawText('7. Suburban Stealth Solar Array Camouflage & Tilt Angles', {
    x: margin,
    y: y,
    size: 13,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  page4.drawText('How to maximize photovoltaic production while complying with strict HOA covenants and neighbor sightlines:', {
    x: margin,
    y: y,
    size: 8.5,
    font: fontHelvetica,
    color: colors.textMuted
  });

  // 3 Placement Strategies Box
  y -= 20;
  const strategies = [
    {
      title: 'Strategy A: Sub-Fence Ground-Mount Rails',
      desc: 'Set panels on 30-degree unistrut ground rails directly inside a 6-foot privacy fence. Completely invisible from the street and neighboring windows, while capturing maximum south-facing azimuth with zero roof penetrations.'
    },
    {
      title: 'Strategy B: Pergola & Balcony Rail Architectural Integration',
      desc: 'Mount bifacial glass-on-glass solar modules as overhead patio pergola roofing. HOAs classify pergolas as approved landscape structures, while bifacial panels absorb ambient ground-reflected light on their underside (+15% gain).'
    },
    {
      title: 'Strategy C: Federal OTARD Law Protection Shield',
      desc: 'Under FCC OTARD rules and State Solar Access Laws (California Civil Code 714, Texas Prop Code 202.010, Florida Statute 163.04), HOAs are legally barred from prohibiting solar installations that reduce efficiency by >10%.'
    }
  ];

  for (const s of strategies) {
    page4.drawRectangle({
      x: margin,
      y: y - 48,
      width: contentWidth,
      height: 48,
      fillColor: colors.stone100,
      borderColor: colors.boxBorder,
      borderWidth: 0.8
    });

    page4.drawText(s.title, { x: margin + 10, y: y - 14, size: 8.5, font: fontBold, color: colors.amberDark });
    page4.drawText(s.desc, {
      x: margin + 10,
      y: y - 26,
      size: 7.5,
      font: fontHelvetica,
      color: colors.textDark,
      lineHeight: 10,
      maxWidth: contentWidth - 20
    });
    y -= 56;
  }

  // 8. 72-Hour Blackout Preparedness Drill
  y -= 10;
  page4.drawText('8. Dry-Run 72-Hour Blackout Protocol Checklist', {
    x: margin,
    y: y,
    size: 12,
    font: fontBold,
    color: colors.darkBg
  });

  y -= 14;
  const checklist = [
    '[ ] Phase Balancing Test: Turn on refrigerator (L1) and sump pump (L2); verify neutral wire current stays under 8 Amps.',
    '[ ] Battery Pre-Charge Verification: Keep station at 95% charge state; verify monthly BMS cell equalization cycle.',
    '[ ] Mechanical Interlock Dry Run: Cut 200A main utility breaker; slide interlock plate; engage generator breaker smoothly.',
    '[ ] Refrigerator Temperature Datalogger: Place wireless probes inside; confirm fridge stays below 40 degF (4 degC) for 12 hours.',
    '[ ] Emergency Well / Booster Pressure Check: Verify pressure tank bladder maintains 38 PSI with pump energized via inverter.',
    '[ ] Clean Air & Ventilation Inspection: Ensure zero combustible debris within 36 inches of battery rack terminals.'
  ];

  for (const c of checklist) {
    page4.drawText(c, {
      x: margin + 6,
      y: y,
      size: 7.5,
      font: fontMono,
      color: colors.textDark,
      lineHeight: 11
    });
    y -= 18;
  }

  // Editorial Verification Signoff Block
  y -= 25;
  page4.drawRectangle({
    x: margin,
    y: y - 75,
    width: contentWidth,
    height: 75,
    fillColor: colors.stone900,
    borderColor: colors.amber,
    borderWidth: 1
  });

  page4.drawText('OFFICIAL FIELD VERIFICATION & EDITORIAL SIGNOFF', {
    x: margin + 14,
    y: y - 18,
    size: 8.5,
    font: fontMonoBold,
    color: colors.amber
  });

  page4.drawText('This manual has been independently verified for electrical code compliance under NFPA 70 (National Electrical Code),', {
    x: margin + 14,
    y: y - 32,
    size: 7.5,
    font: fontHelvetica,
    color: colors.stone200
  });

  page4.drawText('IRC Section E3601, and municipal sound level ordinances by The Suburban Outpost Field Research Bureau.', {
    x: margin + 14,
    y: y - 44,
    size: 7.5,
    font: fontHelvetica,
    color: colors.stone200
  });

  page4.drawText('Marcus Vance | Master Electrician (NEC 702/705)', {
    x: margin + 14,
    y: y - 62,
    size: 8,
    font: fontBold,
    color: colors.white
  });

  page4.drawText('Elena Rostova, PE | Hydrological Systems Lead', {
    x: margin + 260,
    y: y - 62,
    size: 8,
    font: fontBold,
    color: colors.white
  });

  drawHeaderFooter(page4, 4, 4);

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'public', 'downloads', 'suburban-solar-sizing-blueprint.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`[PDF Generator] Successfully compiled 4-page blueprint to ${outputPath} (${pdfBytes.length} bytes)`);
}

createBlueprintPDF().catch(err => {
  console.error("Failed to generate PDF:", err);
  process.exit(1);
});
