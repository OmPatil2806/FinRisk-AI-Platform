import jsPDF from 'jspdf';

const RISK_COLOR = {
  High:   [255, 71,  87],
  Medium: [255, 149, 0],
  Low:    [48,  209, 88],
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

export async function downloadPDFReport(result, formData, currencyFmt, currencyCode) {
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const MARGIN = 18;
  const COL  = W - MARGIN * 2;
  let y      = 0;

  const rc   = RISK_COLOR[result.risk_level] || [108, 99, 255];
  const pr   = result.probabilities || {};
  const ef   = result.engineered_features || {};
  const inv  = result.investment_plan || {};

  // ── Helper functions ───────────────────────────────────────────────────────
  const setFont  = (size, style='normal', color=[232,234,240]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(...color);
  };
  const fillRect = (x, y, w, h, r, g, b) => {
    doc.setFillColor(r, g, b);
    doc.rect(x, y, w, h, 'F');
  };
  const line     = (x1,y1,x2,y2,r=37,g=41,b=47) => {
    doc.setDrawColor(r,g,b);
    doc.setLineWidth(0.3);
    doc.line(x1,y1,x2,y2);
  };

  // ── PAGE 1 ─────────────────────────────────────────────────────────────────

  // Header gradient block
  fillRect(0, 0, W, 52, 19, 21, 28);
  fillRect(0, 0, W, 52, 108, 99, 255);
  // Accent stripe
  doc.setFillColor(...rc);
  doc.rect(0, 48, W, 4, 'F');

  // Logo text
  setFont(22, 'bold', [255,255,255]);
  doc.text('FinRisk AI', MARGIN, 22);
  setFont(9, 'normal', [200,200,255]);
  doc.text('Financial Risk & Intelligence Report', MARGIN, 30);

  // Date
  setFont(8, 'normal', [180,180,220]);
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  doc.text(dateStr, W - MARGIN, 22, { align: 'right' });
  doc.text(`Analysis #${result.analysis_id || '—'}  ·  Currency: ${currencyCode}`, W - MARGIN, 30, { align: 'right' });

  y = 60;

  // ── Risk Hero ──────────────────────────────────────────────────────────────
  fillRect(MARGIN, y, COL, 38, 25, 28, 38);
  doc.setDrawColor(...rc);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN, y, COL, 38);

  setFont(28, 'bold', rc);
  doc.text(result.risk_level?.toUpperCase() + ' RISK', MARGIN + 8, y + 18);

  setFont(10, 'normal', [150,160,180]);
  doc.text('Risk Classification', MARGIN + 8, y + 26);

  // Health score circle (right side)
  const cx = W - MARGIN - 25, cy2 = y + 19;
  doc.setDrawColor(...rc);
  doc.setLineWidth(2);
  doc.circle(cx, cy2, 14);
  setFont(16, 'bold', rc);
  doc.text(String(Math.round(result.health_score)), cx, cy2 + 2, { align: 'center' });
  setFont(6, 'normal', [150,160,180]);
  doc.text('/ 100', cx, cy2 + 8, { align: 'center' });
  doc.text('HEALTH', cx, cy2 - 7, { align: 'center' });

  y += 46;

  // ── Probability bars ───────────────────────────────────────────────────────
  setFont(8, 'bold', [150,160,180]);
  doc.text('CONFIDENCE BREAKDOWN', MARGIN, y + 6);
  y += 10;

  const barData = [
    ['HIGH',   pr.High   || 0, [255, 71,  87]],
    ['MEDIUM', pr.Medium || 0, [255, 149, 0]],
    ['LOW',    pr.Low    || 0, [48,  209, 88]],
  ];
  barData.forEach(([lbl, val, clr]) => {
    setFont(8, 'normal', [180,185,200]);
    doc.text(lbl, MARGIN, y + 4);
    setFont(8, 'bold', clr);
    doc.text(`${(val*100).toFixed(1)}%`, MARGIN + 22, y + 4);
    // track
    fillRect(MARGIN + 34, y, COL - 34, 5, 30, 33, 42);
    // fill
    doc.setFillColor(...clr);
    doc.rect(MARGIN + 34, y, (COL - 34) * val, 5, 'F');
    y += 10;
  });

  y += 4;
  line(MARGIN, y, W - MARGIN, y);
  y += 8;

  // ── Profile table ──────────────────────────────────────────────────────────
  setFont(9, 'bold', [150,160,180]);
  doc.text('FINANCIAL PROFILE', MARGIN, y);
  y += 8;

  const profileRows = [
    ['Age',              formData.age || '—'],
    ['Gender',           formData.gender || '—'],
    ['Education',        formData.education_level || '—'],
    ['Employment',       formData.employment_status || '—'],
    ['Monthly Income',   currencyFmt(formData.monthly_income_usd)],
    ['Monthly Expenses', currencyFmt(formData.monthly_expenses_usd)],
    ['Total Savings',    currencyFmt(formData.savings_usd)],
    ['Credit Score',     formData.credit_score || '—'],
    ['DTI Ratio',        formData.debt_to_income_ratio || '0'],
  ];
  if (formData.has_loan === 'Yes') {
    profileRows.push(
      ['Loan Type',   formData.loan_type || '—'],
      ['Loan Amount', currencyFmt(formData.loan_amount_usd)],
      ['Monthly EMI', currencyFmt(formData.monthly_emi_usd)],
      ['Interest Rate', `${formData.loan_interest_rate_pct}%`],
    );
  }

  profileRows.forEach((row, i) => {
    if (i % 2 === 0) fillRect(MARGIN, y - 4, COL, 8, 22, 25, 34);
    setFont(8, 'normal', [150,160,180]);
    doc.text(row[0], MARGIN + 3, y + 1);
    setFont(8, 'bold', [220,225,235]);
    doc.text(String(row[1]), MARGIN + COL/2, y + 1);
    y += 8;
    if (y > 270) {
      doc.addPage();
      fillRect(0, 0, W, 12, 19, 21, 28);
      setFont(8, 'normal', [100,100,150]);
      doc.text('FinRisk AI Report — continued', MARGIN, 8);
      y = 20;
    }
  });

  // ── PAGE 2 ─────────────────────────────────────────────────────────────────
  doc.addPage();
  fillRect(0, 0, W, 12, 19, 21, 28);
  setFont(8, 'normal', [100,100,150]);
  doc.text('FinRisk AI Report — Financial Metrics', MARGIN, 8);
  y = 20;

  // Engineered Features
  setFont(9, 'bold', [150,160,180]);
  doc.text('ENGINEERED FEATURE MATRIX', MARGIN, y);
  y += 8;

  const featureRows = [
    ['Expense Ratio',         `${(ef.expense_ratio*100).toFixed(1)}%`,              ef.expense_ratio > 0.7],
    ['EMI Ratio',             `${(ef.emi_ratio*100).toFixed(1)}%`,                  ef.emi_ratio > 0.35],
    ['Savings Ratio',         `${(ef.savings_ratio*100).toFixed(1)}%`,              ef.savings_ratio < 0.05],
    ['Financial Stress Index',`${(ef.financial_stress_index*100).toFixed(1)}%`,     ef.financial_stress_index > 0.6],
    ['Net Monthly Savings',   currencyFmt(ef.net_savings),                          ef.net_savings < 0],
    ['Loan Burden',           `${ef.loan_burden?.toFixed(2)}x annual income`,        ef.loan_burden > 3],
    ['Months of Buffer',      `${ef.months_of_expenses_saved?.toFixed(1)} months`,   ef.months_of_expenses_saved < 3],
    ['Interest Burden',       `${(ef.interest_burden*100).toFixed(1)}%`,            ef.interest_burden > 0.15],
    ['Credit Risk Flag',      ef.credit_risk_flag ? 'FLAGGED' : 'CLEAR',            !!ef.credit_risk_flag],
  ];

  featureRows.forEach((row, i) => {
    if (i % 2 === 0) fillRect(MARGIN, y - 4, COL, 8, 22, 25, 34);
    setFont(8, 'normal', [150,160,180]);
    doc.text(row[0], MARGIN + 3, y + 1);
    const warnColor = row[2] ? [255,71,87] : [48,209,88];
    setFont(8, 'bold', warnColor);
    doc.text(String(row[1]), W - MARGIN - 3, y + 1, { align: 'right' });
    y += 8;
  });

  y += 6;
  line(MARGIN, y, W - MARGIN, y);
  y += 10;

  // Insights
  setFont(9, 'bold', [150,160,180]);
  doc.text('AI INSIGHTS', MARGIN, y);
  y += 8;

  (result.insights || []).forEach((txt, i) => {
    fillRect(MARGIN, y - 4, COL, 10, i === 0 ? 30 : 22, i === 0 ? 28 : 25, i === 0 ? 50 : 34);
    // left border accent
    doc.setFillColor(...rc);
    doc.rect(MARGIN, y - 4, 2, 10, 'F');

    setFont(7.5, i === 0 ? 'bold' : 'normal', i === 0 ? [232,234,240] : [160,165,180]);
    const lines = doc.splitTextToSize(txt.replace(/[🔴⚠️✅📊📉📈🚨💳📦🟡🟢]/g,'').trim(), COL - 8);
    doc.text(lines[0] || '', MARGIN + 5, y + 1);
    y += 12;

    if (y > 270) {
      doc.addPage();
      fillRect(0, 0, W, 12, 19, 21, 28);
      setFont(8, 'normal', [100,100,150]);
      doc.text('FinRisk AI Report — continued', MARGIN, 8);
      y = 20;
    }
  });

  // ── PAGE 3 — Investment Plan ───────────────────────────────────────────────
  if (inv && inv.monthly_sip !== undefined) {
    doc.addPage();
    fillRect(0, 0, W, 12, 19, 21, 28);
    setFont(8, 'normal', [100,100,150]);
    doc.text('FinRisk AI Report — Investment Plan', MARGIN, 8);
    y = 20;

    setFont(11, 'bold', [108,99,255]);
    doc.text('PERSONALIZED INVESTMENT PLAN', MARGIN, y);
    y += 10;

    // Key numbers
    const invCards = [
      { label: 'Monthly Investable', value: currencyFmt(inv.monthly_investable) },
      { label: 'Recommended SIP',    value: currencyFmt(inv.monthly_sip) },
      { label: 'Emergency Monthly',  value: currencyFmt(inv.emergency_monthly) },
      { label: 'Emergency Gap',      value: currencyFmt(inv.emergency_gap) },
    ];
    const cw = COL / 2 - 3;
    invCards.forEach((card, i) => {
      const cx2 = MARGIN + (i % 2) * (cw + 6);
      const cy3 = y + Math.floor(i / 2) * 22;
      fillRect(cx2, cy3, cw, 18, 25, 28, 42);
      doc.setDrawColor(108, 99, 255);
      doc.setLineWidth(0.3);
      doc.rect(cx2, cy3, cw, 18);
      setFont(7, 'normal', [150,160,180]);
      doc.text(card.label.toUpperCase(), cx2 + 4, cy3 + 7);
      setFont(10, 'bold', [108,99,255]);
      doc.text(String(card.value), cx2 + 4, cy3 + 14);
    });
    y += 50;

    // Asset Allocation
    setFont(9, 'bold', [150,160,180]);
    doc.text('ASSET ALLOCATION', MARGIN, y);
    y += 8;
    const alloc = inv.allocation || {};
    const allocItems = [
      ['Equity',    alloc.equity || 0,  [108,99,255]],
      ['Debt',      alloc.debt   || 0,  [48,209,88]],
      ['Gold',      alloc.gold   || 0,  [245,200,66]],
      ['Cash',      alloc.cash   || 0,  [100,150,200]],
    ];
    allocItems.forEach(([lbl, pct, clr]) => {
      setFont(8, 'normal', [180,185,200]);
      doc.text(`${lbl}`, MARGIN, y + 4);
      setFont(8, 'bold', clr);
      doc.text(`${pct}%`, MARGIN + 22, y + 4);
      fillRect(MARGIN + 34, y, COL - 34, 5, 30, 33, 42);
      doc.setFillColor(...clr);
      doc.rect(MARGIN + 34, y, (COL - 34) * pct / 100, 5, 'F');
      y += 10;
    });

    y += 6;

    // SIP Projections
    setFont(9, 'bold', [150,160,180]);
    doc.text('SIP GROWTH PROJECTIONS (12% p.a.)', MARGIN, y);
    y += 8;

    const proj = inv.projections || {};
    const projItems = [
      ['1 Year',  proj['1yr']],
      ['3 Years', proj['3yr']],
      ['5 Years', proj['5yr']],
      ['10 Years',proj['10yr']],
    ];
    projItems.forEach(([lbl, val], i) => {
      if (i % 2 === 0) fillRect(MARGIN, y - 4, COL, 8, 22, 25, 34);
      setFont(8, 'normal', [150,160,180]);
      doc.text(lbl, MARGIN + 3, y + 1);
      setFont(8, 'bold', [48,209,88]);
      doc.text(val ? currencyFmt(val) : '—', W - MARGIN - 3, y + 1, { align: 'right' });
      y += 8;
    });

    y += 8;

    // Recommended funds
    setFont(9, 'bold', [150,160,180]);
    doc.text('RECOMMENDED FUNDS', MARGIN, y);
    y += 8;

    (inv.recommended_funds || []).forEach((fund) => {
      fillRect(MARGIN, y - 2, COL, 20, 22, 25, 38);
      doc.setDrawColor(50, 55, 70);
      doc.setLineWidth(0.2);
      doc.rect(MARGIN, y - 2, COL, 20);

      setFont(8, 'bold', [232,234,240]);
      doc.text(fund.name, MARGIN + 4, y + 5);
      setFont(7, 'normal', [150,160,180]);
      doc.text(`${fund.type}  ·  Risk: ${fund.risk}  ·  Min SIP: ${currencyFmt(fund.min_sip)}`, MARGIN + 4, y + 11);
      setFont(7, 'bold', [48,209,88]);
      doc.text(`3Y: ${fund.returns_3yr}%  ·  5Y: ${fund.returns_5yr}%  ·  via ${fund.platform}`, MARGIN + 4, y + 17);
      y += 24;
    });
  }

  // ── Footer on every page ───────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    fillRect(0, 287, W, 10, 15, 17, 24);
    setFont(7, 'normal', [80,85,100]);
    doc.text('FinRisk AI · Powered by Random Forest ML · For informational purposes only · Not financial advice', MARGIN, 293);
    doc.text(`Page ${i} of ${totalPages}`, W - MARGIN, 293, { align: 'right' });
  }

  doc.save(`FinRisk-Report-${new Date().toISOString().slice(0,10)}.pdf`);
}
