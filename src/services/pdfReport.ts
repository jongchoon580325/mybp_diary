import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { MeasurementSession, AgeGroup } from '../types';

interface PdfReportOptions {
  sessions: MeasurementSession[];
  ageGroup: AgeGroup | null;
  period: string;
  chartElementId: string;
  userName?: string;
}

const PERIOD_LABELS: Record<string, string> = {
  '1W':  '최근 1주',
  '2W':  '최근 2주',
  '1M':  '최근 1개월',
  '3M':  '최근 3개월',
  'ALL': '전체 기간',
};

const STATUS_COLOR: Record<string, string> = {
  '정상':       '#16a34a',
  '주의':       '#ca8a04',
  '고혈압 의심': '#dc2626',
};

function calcStats(sessions: MeasurementSession[]) {
  if (sessions.length === 0) return null;
  const sys = sessions.map((s) => s.avg_sys);
  const dia = sessions.map((s) => s.avg_dia);
  const pul = sessions.map((s) => s.avg_pul);
  return {
    avgSys: Math.round(sys.reduce((a, b) => a + b, 0) / sys.length),
    avgDia: Math.round(dia.reduce((a, b) => a + b, 0) / dia.length),
    avgPul: Math.round(pul.reduce((a, b) => a + b, 0) / pul.length),
    maxSys: Math.max(...sys),
    count:  sessions.length,
  };
}

// ── 리포트 HTML 생성 ──────────────────────────────────────────────────────────
function buildReportHtml(
  sessions: MeasurementSession[],
  ageGroup: AgeGroup | null,
  period: string,
  chartImgDataUrl: string | null,
  userName?: string,
): string {
  const now          = new Date();
  const dateStr      = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const periodLabel  = PERIOD_LABELS[period] ?? period;
  const stats        = calcStats(sessions);

  const oldest = sessions.length > 0
    ? new Date(sessions[sessions.length - 1].measured_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';
  const newest = sessions.length > 0
    ? new Date(sessions[0].measured_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

  const rowsHtml = sessions.slice(0, 40).map((s, i) => {
    const color   = STATUS_COLOR[s.ai_status] ?? '#555';
    const dateVal = new Date(s.measured_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    const bg      = i % 2 === 0 ? '#fff' : '#f6fbf7';
    return `
      <tr style="background:${bg};">
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${dateVal}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${s.time_slot}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#1e5530;">${s.avg_sys}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:700;color:#3b82f6;">${s.avg_dia}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:#7c3aed;">${s.avg_pul}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:700;color:${color};">${s.ai_status}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:11px;">${s.memo ?? ''}</td>
      </tr>`;
  }).join('');

  const moreRows = sessions.length > 40
    ? `<tr><td colspan="7" style="padding:8px;text-align:center;color:#9ca3af;font-size:12px;">... 외 ${sessions.length - 40}건</td></tr>`
    : '';

  const statsHtml = stats ? `
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      ${[
        { label: '평균 수축기', value: stats.avgSys, unit: 'mmHg', color: '#1e5530' },
        { label: '평균 이완기', value: stats.avgDia, unit: 'mmHg', color: '#3b82f6' },
        { label: '평균 맥박',  value: stats.avgPul, unit: 'bpm',  color: '#7c3aed' },
        { label: '최고 수축기', value: stats.maxSys, unit: 'mmHg', color: '#dc2626' },
      ].map((item) => `
        <div style="flex:1;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px 10px;">
          <div style="font-size:10px;color:#6b7280;margin-bottom:4px;">${item.label}</div>
          <div style="font-size:22px;font-weight:800;color:${item.color};line-height:1;">${item.value}<span style="font-size:11px;font-weight:400;color:#9ca3af;margin-left:2px;">${item.unit}</span></div>
        </div>`).join('')}
    </div>` : '';

  const chartHtml = chartImgDataUrl
    ? `<div style="margin-bottom:16px;">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px;">혈압 추이 차트</div>
        <img src="${chartImgDataUrl}" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;" />
       </div>`
    : '';

  return `
    <div style="
      font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
      font-size: 12px;
      color: #111;
      background: #fff;
      padding: 32px;
      width: 794px;
      box-sizing: border-box;
    ">
      <!-- 커버 헤더 -->
      <div style="
        background: #154627;
        border-radius: 12px;
        padding: 24px 24px 20px;
        margin-bottom: 16px;
        color: #fff;
      ">
        <div style="font-size: 22px; font-weight: 800; margin-bottom: 6px;">혈압 측정 리포트</div>
        ${userName ? `<div style="font-size: 15px; font-weight: 700; opacity: 0.95; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 2px 10px;">${userName} 님</span>
        </div>` : ''}
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">Blood Pressure Manager · 건강 참고용 · 의료 진단 아님</div>
        <div style="font-size: 12px; opacity: 0.7;">${dateStr} 생성</div>
      </div>

      <!-- 요약 정보 -->
      <div style="
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 14px 16px;
        margin-bottom: 16px;
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      ">
        <div><span style="color:#6b7280;font-size:11px;">기간</span><br/><strong style="color:#154627;">${periodLabel}</strong></div>
        <div><span style="color:#6b7280;font-size:11px;">연령대</span><br/><strong style="color:#154627;">${ageGroup ?? '-'}</strong></div>
        <div><span style="color:#6b7280;font-size:11px;">측정 횟수</span><br/><strong style="color:#154627;">${sessions.length}회</strong></div>
        <div><span style="color:#6b7280;font-size:11px;">측정 기간</span><br/><strong style="color:#154627;">${oldest} ~ ${newest}</strong></div>
      </div>

      <!-- 통계 요약 -->
      ${statsHtml}

      <!-- 차트 이미지 -->
      ${chartHtml}

      <!-- 측정 기록 테이블 -->
      <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px;">측정 기록</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#154627;color:#fff;">
            <th style="padding:8px;text-align:left;font-weight:600;">날짜</th>
            <th style="padding:8px;text-align:left;font-weight:600;">시간대</th>
            <th style="padding:8px;text-align:left;font-weight:600;">수축기</th>
            <th style="padding:8px;text-align:left;font-weight:600;">이완기</th>
            <th style="padding:8px;text-align:left;font-weight:600;">맥박</th>
            <th style="padding:8px;text-align:left;font-weight:600;">판정</th>
            <th style="padding:8px;text-align:left;font-weight:600;">메모</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          ${moreRows}
        </tbody>
      </table>

      <!-- 면책 조항 -->
      <div style="
        margin-top: 20px;
        background: #fefce8;
        border: 1px solid #fde047;
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 11px;
        color: #713f12;
        line-height: 1.6;
      ">
        ⚕ <strong>면책 조항</strong><br/>
        이 리포트는 개인 건강 참고용이며 의료 진단이 아닙니다. 혈압 이상이 의심될 경우 반드시 의료 전문가와 상담하시기 바랍니다.
        참고 기준: AHA / ESH / ESC 가이드라인 기반 연령대별 조정값 적용.
      </div>

      <!-- 푸터 -->
      <div style="margin-top:16px;text-align:center;font-size:10px;color:#9ca3af;">
        Blood Pressure Manager · ${dateStr} · Personal Health Reference Only
      </div>
    </div>`;
}

// ── 메인 PDF 생성 함수 ────────────────────────────────────────────────────────
export async function generatePdfReport({
  sessions,
  ageGroup,
  period,
  chartElementId,
  userName,
}: PdfReportOptions): Promise<void> {

  // 1. 차트 캡처
  let chartImgDataUrl: string | null = null;
  const chartEl = document.getElementById(chartElementId);
  if (chartEl) {
    try {
      const chartCanvas = await html2canvas(chartEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      chartImgDataUrl = chartCanvas.toDataURL('image/png');
    } catch (_) { /* 실패 시 차트 생략 */ }
  }

  // 2. 리포트 HTML을 DOM에 임시 삽입
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;top:-9999px;left:-9999px;z-index:-1;';
  wrapper.innerHTML = buildReportHtml(sessions, ageGroup, period, chartImgDataUrl, userName);
  document.body.appendChild(wrapper);

  // Google Font가 로드될 때까지 잠시 대기
  await document.fonts.ready;

  try {
    // 3. html2canvas로 캡처
    const reportEl = wrapper.firstElementChild as HTMLElement;
    const canvas   = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    // 4. A4 PDF에 삽입 (794px = A4 너비 기준)
    const imgData  = canvas.toDataURL('image/png');
    const pdfW     = 210;  // mm
    const pdfH     = (canvas.height / canvas.width) * pdfW;
    const pageH    = 297;  // A4 높이

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 페이지 분할 (긴 리포트 처리)
    let imgY = 0;
    let remainH = pdfH;
    let isFirst = true;

    while (remainH > 0) {
      if (!isFirst) doc.addPage();
      isFirst = false;

      const sliceH = Math.min(pageH, remainH);
      doc.addImage(imgData, 'PNG', 0, -imgY, pdfW, pdfH);
      imgY     += pageH;
      remainH  -= sliceH;
    }

    const filename = `bp-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  } finally {
    document.body.removeChild(wrapper);
  }
}
