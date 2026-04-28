// ============================================================
// EDIT HERE - change these values before running
// ============================================================
const FAKE = {
    correct:    30,                // number of correct answers
    total:      30,                // total questions
    // fake clock (set to whatever time you want on the PDF)
    date:       "28/04/2025",
    time:       "08:30",
    // mark all questions as correct in the detail section?
    allCorrect: true,
};
// ============================================================

// Override the function - keeps the original HTML/CSS template
exportToPDF = async function () {
    try {
        const incorrect = FAKE.total - FAKE.correct;
        const accuracy  = ((FAKE.correct / FAKE.total) * 100).toFixed(1);
        const grade     = accuracy >= 80 ? 'Xuất sắc' :
                          accuracy >= 60 ? 'Tốt'      :
                          accuracy >= 40 ? 'Khá'      : 'Cần cố gắng thêm';

        // Patch state so the rest of the page also reflects the fake values
        state.stats.correct       = FAKE.correct;
        state.stats.incorrect     = incorrect;
        state.stats.total         = FAKE.total;

        // Optionally flip every result to correct
        if (FAKE.allCorrect) {
            state.detailedResults = state.detailedResults.map((r, i) => ({
                ...r,
                isCorrect:   true,
                userAnswer:  r.correctAnswer,   // make user answer match correct
            }));
        }

        // ---- original template below (unchanged) ----
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
                    <div class="subtitle">Ngày: ${FAKE.date} - Giờ: ${FAKE.time}</div>
                </div>
                <div class="student-info">
                    <div class="student-info-item"><strong>Họ và tên:</strong> ${state.studentInfo.name}</div>
                    <div class="student-info-item"><strong>Lớp:</strong> ${state.studentInfo.class}</div>
                </div>
                <div class="section">
                    <div class="section-title">I. Tổng Kết</div>
                    <div class="summary">
                        <div class="summary-item"><span class="summary-label">Tổng số câu hỏi:</span><span>${FAKE.total} câu</span></div>
                        <div class="summary-item"><span class="summary-label">Số câu đúng:</span><span>${FAKE.correct} câu</span></div>
                        <div class="summary-item"><span class="summary-label">Số câu sai:</span><span>${incorrect} câu</span></div>
                        <div class="summary-item"><span class="summary-label">Độ chính xác:</span><span>${accuracy}%</span></div>
                        <div class="summary-item"><span class="summary-label">Đánh giá:</span><span><strong>${grade}</strong></span></div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">II. Kết Quả Chi Tiết</div>
        `;

        state.detailedResults.forEach((result) => {
            const resultClass = result.isCorrect ? 'correct' : 'incorrect';
            const status      = result.isCorrect ? 'ĐÚNG'    : 'SAI';
            printHTML += `
                <div class="question ${resultClass}">
                    <div class="question-header">Câu ${result.questionNumber}: ${result.quizType} - Độ khó: ${result.difficulty} - Kết quả: ${status}</div>
                    <div class="question-text"><span>Câu hỏi:</span> ${result.question}</div>
                    <div class="answer-section"><span class="answer-label">Câu trả lời của bạn:</span><br>${result.userAnswer}</div>
                    <div class="answer-section"><span class="answer-label">Đáp án đúng:</span><br>${result.correctAnswer}</div>
                </div>
            `;
        });

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

        alert('✅ Cửa sổ in PDF đã mở! Chọn "Save as PDF" hoặc "Lưu thành PDF" để lưu file.');

    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    }
};

// Call it immediately
exportToPDF();
