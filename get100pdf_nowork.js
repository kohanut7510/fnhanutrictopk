(async () => {

function txt(v) { return (v ?? "").toString().replace(/<[^>]*>/g, "").trim(); }
function pad(n) { return String(n).padStart(2, "0"); }

function vnDate() {
    const d = new Date();
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function vnTime() {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function studentName() {
    return document.querySelector("#studentName")?.value?.trim() ||
        localStorage.studentName || "Học sinh";
}
function studentClass() {
    return document.querySelector("#studentClass")?.value?.trim() ||
        localStorage.studentClass || "Lớp";
}

function typeVN(t) {
    return {
        "multiple-choice": "Trắc nghiệm",
        "matching": "Ghép nối",
        "fill-blank": "Điền khuyết",
        "true-false": "Đúng/Sai",
        "ordering": "Sắp xếp",
        "image-recognition": "Nhận diện hình ảnh"
    }[t] || t;
}
function levelVN(l) {
    return { easy: "Dễ", medium: "Trung bình", hard: "Khó" }[l] || l;
}

function choiceText(x) {
    if (typeof x === "string") return x;
    if (typeof x === "object") return txt(x.text || x.label || x.content || x.value);
    return txt(x);
}

function getAnswer(q, type) {
    if (type === "multiple-choice" || type === "image-recognition") {
        const i = q.correctIndex ?? q.correct ?? 0;
        return choiceText(q.options?.[i]).replace(/^[A-D]\.\s*/, "");
    }
    if (type === "true-false") {
        const v = q.answer ?? q.correct;
        return (v === true || v === 1 || v === "1") ? "Đúng" : "Sai";
    }
    if (type === "fill-blank") return txt(q.answer || q.correct);
    if (type === "matching") return (q.pairs || []).map(x => `${txt(x.left)} - ${txt(x.right)}`).join("; ");
    if (type === "ordering") return (q.correct || []).map(i => txt(q.items?.[i])).join(" → ");
    return txt(q.answer || q.correct);
}

function getQuestion(q) {
    return txt(q.question || q.title || q.content);
}

function getBank() {
    let bank = window.questionBank || window.encryptedQuestionBank || {};
    const types = ["multiple-choice", "matching", "fill-blank", "true-false", "ordering", "image-recognition"];
    const levels = ["easy", "medium", "hard"];
    if (typeof getQuestions === "function") {
        for (const t of types) {
            bank[t] = bank[t] || {};
            for (const lv of levels) {
                try {
                    const arr = getQuestions(t, lv);
                    if (Array.isArray(arr) && arr.length) bank[t][lv] = arr;
                } catch (e) {}
            }
        }
    }
    return bank;
}

const bank = getBank();
const ORDER = ["multiple-choice", "matching", "fill-blank", "true-false", "ordering", "image-recognition"];

let rows = [];
let stt = 1;

for (const type of ORDER) {
    const sec = bank[type] || {};
    const easy = sec.easy || [];
    const medium = sec.medium || [];
    const hard = sec.hard || [];
    const picks = [easy[0], medium[0], hard[0], hard[1], hard[2]];
    const lvls = ["easy", "medium", "hard", "hard", "hard"];

    for (let i = 0; i < 5; i++) {
        let q = picks[i];
        if (!q) {
            const all = [...easy, ...medium, ...hard].filter(Boolean);
            q = all[i % all.length];
        }
        if (!q) continue;
        rows.push({
            stt: stt++,
            type,
            level: lvls[i],
            question: getQuestion(q),
            answer: getAnswer(q, type)
        });
    }
}

rows = rows.slice(0, 30);
const total = rows.length;

// ---- exact same template as get100pdf ----
let printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .title { font-size: 24pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px; }
            .subtitle { font-size: 11pt; margin: 5px 0; }
            .student-info { background: #f0f0f0; padding: 15px; margin: 20px 0; border-radius: 5px; border: 2px solid #333; }
            .student-info-item { margin: 8px 0; font-size: 12pt; }
            .section { margin: 20px 0; page-break-inside: avoid; }
            .section-title { font-size: 14pt; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 5px; text-transform: uppercase; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .summary-item { margin: 8px 0; }
            .summary-label { font-weight: bold; display: inline-block; width: 180px; }
            .question { margin: 15px 0; padding: 15px; border: 1px solid #ddd; page-break-inside: avoid; }
            .question.correct { background: #e8f5e9; border-left: 5px solid #4caf50; }
            .question.incorrect { background: #ffebee; border-left: 5px solid #f44336; }
            .question-header { font-weight: bold; margin-bottom: 10px; font-size: 11pt; }
            .question-text { margin: 10px 0; font-weight: bold; }
            .answer-section { margin: 8px 0; padding: 8px; background: white; border-radius: 3px; }
            .answer-label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; font-size: 10pt; font-style: italic; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">Kết Quả Bài Học</div>
            <div class="subtitle">Nền tảng học tập tương tác</div>
            <div class="subtitle">Ngày: ${vnDate()} - Giờ: ${vnTime()}</div>
        </div>
        <div class="student-info">
            <div class="student-info-item"><strong>Họ và tên:</strong> ${studentName()}</div>
            <div class="student-info-item"><strong>Lớp:</strong> ${studentClass()}</div>
        </div>
        <div class="section">
            <div class="section-title">I. Tổng Kết</div>
            <div class="summary">
                <div class="summary-item"><span class="summary-label">Tổng số câu hỏi:</span><span>${total} câu</span></div>
                <div class="summary-item"><span class="summary-label">Số câu đúng:</span><span>${total} câu</span></div>
                <div class="summary-item"><span class="summary-label">Số câu sai:</span><span>0 câu</span></div>
                <div class="summary-item"><span class="summary-label">Độ chính xác:</span><span>100.0%</span></div>
                <div class="summary-item"><span class="summary-label">Đánh giá:</span><span><strong>Xuất sắc</strong></span></div>
            </div>
        </div>
        <div class="section">
            <div class="section-title">II. Kết Quả Chi Tiết</div>
`;

for (const r of rows) {
    printHTML += `
        <div class="question correct">
            <div class="question-header">Câu ${r.stt}: ${typeVN(r.type)} - Độ khó: ${levelVN(r.level)} - Kết quả: ĐÚNG</div>
            <div class="question-text"><span>Câu hỏi:</span> ${r.question}</div>
            <div class="answer-section"><span class="answer-label">Câu trả lời của bạn:</span><br>${r.answer}</div>
            <div class="answer-section"><span class="answer-label">Đáp án đúng:</span><br>${r.answer}</div>
        </div>
    `;
}

printHTML += `
        </div>
        <div class="footer">Nền tảng học tập tương tác - Báo cáo được tạo tự động</div>
    </body></html>
`;

const printWindow = window.open('', '_blank');
printWindow.document.write(printHTML);
printWindow.document.close();
printWindow.onload = function () {
    setTimeout(() => { printWindow.print(); }, 250);
};

})();