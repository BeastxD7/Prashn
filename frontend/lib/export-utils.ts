/**
 * Export utilities for quiz data
 * Supports PDF, Excel (XLSX), and DOCX formats
 */

interface Question {
  id?: number
  content: string
  type: string
  options?: string[]
  answer: string | string[]
  explanation?: string
  difficulty?: string
}

interface QuizData {
  title: string
  description?: string
  questions: Question[]
}

// Static ES module imports for PDF generation (html2canvas + jsPDF)
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Export quiz to PDF using browser's print functionality
 */
export async function exportToPDF(quiz: QuizData, includeAnswers: boolean, includeWatermark = false) {
  // Generate a PDF directly in-browser using html2canvas + jsPDF (static ES imports).

  // Build the same HTML content inside a hidden container we can render to canvas
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.width = '800px'
  wrapper.style.padding = '20px'
  wrapper.style.background = '#fff'
  wrapper.style.color = '#111827'
  wrapper.innerHTML = (() => {
    const questionsHTML = quiz.questions
      .map((q, idx) => {
        const optionsHTML = q.options?.length
          ? `<ul class="options-list">${q.options.map((opt, oi) => `<li><strong>${String.fromCharCode(65 + oi)}.</strong> ${opt}</li>`).join('')}</ul>`
          : ''

        const answerHTML = includeAnswers
          ? `<div class="answer-box">
               <strong>Answer:</strong> <span class="answer-text">${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</span>
               ${q.explanation ? `<br><strong>Explanation:</strong> ${q.explanation}` : ''}
             </div>`
          : ''

        return `
          <div class="question-card">
            <div class="question-header">
              <div class="question-number">Question ${idx + 1}</div>
              <div class="question-badges">${q.type.replace(/_/g, ' ')} ${q.difficulty ? `• ${q.difficulty}` : ''}</div>
            </div>
            <div class="question-content">${q.content}</div>
            ${optionsHTML}
            ${answerHTML}
          </div>`
      })
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${quiz.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #ffffff;
            padding: 20px 30px;
          }
          .header {
            margin-bottom: 25px;
            padding-bottom: 18px;
            border-bottom: 2px solid #e5e7eb;
          }
          .header h1 {
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #111827;
            line-height: 1.3;
          }
          .header .description {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 12px;
            line-height: 1.5;
          }
          .header .meta {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 500;
          }
          .question-card {
            margin-bottom: 28px;
            page-break-inside: avoid;
            padding: 16px 0;
            background: transparent;
          }
          .question-header {
            margin-bottom: 10px;
          }
          .question-number {
            font-weight: 700;
            font-size: 14px;
            color: #111827;
            display: inline-block;
          }
          .question-badges {
            float: right;
            font-size: 9px;
            text-transform: uppercase;
            color: #9ca3af;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .question-content {
            margin: 14px 0;
            font-size: 14px;
            color: #374151;
            line-height: 1.7;
            clear: both;
          }
          .options-list {
            margin: 12px 0;
            padding-left: 0;
            list-style: none;
          }
          .options-list li {
            margin: 6px 0;
            font-size: 13px;
            color: #4b5563;
            padding: 6px 0;
          }
          .options-list li strong {
            color: #111827;
            margin-right: 8px;
          }
          .answer-box {
            margin-top: 14px;
            padding: 10px 0 10px 14px;
            border-left: 3px solid #3b82f6;
            font-size: 13px;
          }
          .answer-box strong {
            color: #1e40af;
            font-weight: 600;
          }
          .answer-box .answer-text {
            color: #1e40af;
            font-weight: 600;
          }
          .footer {
            position: fixed;
            bottom: 15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
            padding: 8px 40px;
            width: 100%;
          }
          .footer strong {
            color: #6b7280;
            font-weight: 600;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
            opacity: 0.15;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .watermark-text {
            font-family: Arial, sans-serif;
            font-size: 96px;
            font-weight: 800;
            color: #000000;
            text-align: center;
            transform: rotate(-25deg);
            white-space: nowrap;
            letter-spacing: 4px;
            padding: 40px;
          }
        </style>
      </head>
      <body>
        ${includeWatermark ? `<div class="watermark"><div class="watermark-text">प्रश्न - Prashn</div></div>` : ''}
        <div class="header">
          <h1>${quiz.title}</h1>
          ${quiz.description ? `<p class="description">${quiz.description}</p>` : ''}
          <div class="meta">Total Questions: ${quiz.questions.length} | Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ${questionsHTML}
        ${includeWatermark ? `<div class="footer">Exported by <strong>Prashn</strong> — prashn.swastify.life</div>` : ''}
      </body>
      </html>`
  })()

  // Use an isolated iframe with srcdoc to avoid inheriting site/global styles that may
  // contain unsupported color functions (like lab()). html2canvas will render the
  // iframe body which contains only the HTML we provide.
  const html = wrapper.innerHTML

  const iframe = document.createElement('iframe') as HTMLIFrameElement
  iframe.style.position = 'fixed'
  iframe.style.left = '-9999px'
  iframe.style.top = '0'
  iframe.style.width = '800px'
  iframe.style.height = '1120px'
  iframe.style.border = '0'
  iframe.srcdoc = html
  document.body.appendChild(iframe)

  try {
    // Wait for iframe to load content. Use onload but also a timeout fallback.
    await new Promise<void>((resolve) => {
      const done = () => resolve()
      iframe.addEventListener('load', done)
      // Fallback: resolve after 700ms in case load doesn't fire reliably
      setTimeout(() => {
        try { resolve() } catch { /* ignore */ }
      }, 700)
    })

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) throw new Error('Failed to access iframe document for PDF export')

    // Capture each question card separately to prevent page breaks in the middle of questions
    const questionCards = doc.querySelectorAll('.question-card')
    const header = doc.querySelector('.header')
    const watermark = doc.querySelector('.watermark')
    const footer = doc.querySelector('.footer')

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const usableWidth = pdfWidth - (margin * 2)
    let currentY = margin

    // Capture watermark as a transparent layer (to be added to each page)
    let watermarkImgData: string | null = null
    let watermarkWidth = 0
    let watermarkHeight = 0
    if (watermark && includeWatermark) {
      // Get the actual dimensions of the watermark element
      const wmRect = (watermark as HTMLElement).getBoundingClientRect()
      const watermarkCanvas = await html2canvas(watermark as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // transparent background
        width: Math.max(800, wmRect.width * 1.5), // ensure enough width
        height: Math.max(400, wmRect.height * 1.5), // ensure enough height
        windowWidth: 800,
        windowHeight: 1120
      })
      watermarkImgData = watermarkCanvas.toDataURL('image/png')
      watermarkWidth = usableWidth
      watermarkHeight = (watermarkCanvas.height * usableWidth) / watermarkCanvas.width
    }

    // Capture footer as a transparent layer (to be added to each page at bottom)
    let footerImgData: string | null = null
    let footerWidth = 0
    let footerHeight = 0
    if (footer && includeWatermark) {
      // Get the actual dimensions of the footer element
      const footerRect = (footer as HTMLElement).getBoundingClientRect()
      const footerCanvas = await html2canvas(footer as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, // transparent background
        width: Math.max(800, footerRect.width * 1.2), // ensure enough width for full text
        height: Math.max(50, footerRect.height * 1.5), // ensure enough height
        windowWidth: 800,
        windowHeight: 1120
      })
      footerImgData = footerCanvas.toDataURL('image/png')
      footerWidth = usableWidth
      footerHeight = (footerCanvas.height * usableWidth) / footerCanvas.width
    }

    // Add header on first page
    if (header) {
      const headerCanvas = await html2canvas(header as HTMLElement, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: 800 
      })
      const headerImgData = headerCanvas.toDataURL('image/png')
      const headerHeight = (headerCanvas.height * usableWidth) / headerCanvas.width
      
      pdf.addImage(headerImgData, 'PNG', margin, currentY, usableWidth, headerHeight)
      currentY += headerHeight + 5
    }

    // Add watermark to first page (centered)
    if (watermarkImgData && includeWatermark) {
      const wmX = (pdfWidth - watermarkWidth) / 2
      const wmY = (pdfHeight - watermarkHeight) / 2
      pdf.addImage(watermarkImgData, 'PNG', wmX, wmY, watermarkWidth, watermarkHeight)
    }

    // Add footer to first page (at bottom)
    if (footerImgData && includeWatermark) {
      const footerY = pdfHeight - footerHeight - 5
      pdf.addImage(footerImgData, 'PNG', margin, footerY, footerWidth, footerHeight)
    }

    // Add each question card
    for (let i = 0; i < questionCards.length; i++) {
      const card = questionCards[i] as HTMLElement
      const cardCanvas = await html2canvas(card, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: null, // transparent to show watermark behind
        width: 800 
      })
      const cardImgData = cardCanvas.toDataURL('image/png')
      const cardHeight = (cardCanvas.height * usableWidth) / cardCanvas.width

      // Check if card fits on current page, if not add new page (reserve space for footer)
      if (currentY + cardHeight > pdfHeight - margin - footerHeight - 5) {
        pdf.addPage()
        currentY = margin
        
        // Add watermark to new page
        if (watermarkImgData && includeWatermark) {
          const wmX = (pdfWidth - watermarkWidth) / 2
          const wmY = (pdfHeight - watermarkHeight) / 2
          pdf.addImage(watermarkImgData, 'PNG', wmX, wmY, watermarkWidth, watermarkHeight)
        }

        // Add footer to new page
        if (footerImgData && includeWatermark) {
          const footerY = pdfHeight - footerHeight - 5
          pdf.addImage(footerImgData, 'PNG', margin, footerY, footerWidth, footerHeight)
        }
      }

      pdf.addImage(cardImgData, 'PNG', margin, currentY, usableWidth, cardHeight)
      currentY += cardHeight + 4 // small gap between questions
    }

    pdf.save(`${sanitizeFilename(quiz.title)}.pdf`)
  } finally {
    // clean up
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
  }
}

/**
 * Export quiz to Excel (CSV format for broad compatibility)
 */
export function exportToExcel(quiz: QuizData, includeAnswers: boolean, includeWatermark = false) {
  const rows: string[][] = [
    ...(includeWatermark ? [['Exported by:', 'प्रश्न | Prashn'], ['URL:', 'https://prashn.swastify.life'], []] : []),
    ['Quiz Title:', quiz.title],
    ['Description:', quiz.description || ''],
    ['Total Questions:', String(quiz.questions.length)],
    ['Generated:', new Date().toLocaleDateString()],
    [], // blank row
    [
      'Question #',
      'Type',
      'Difficulty',
      'Question',
      'Options',
      ...(includeAnswers ? ['Answer', 'Explanation'] : []),
    ],
  ]

  quiz.questions.forEach((q, idx) => {
    const options = q.options?.join(' | ') || ''
    const answer = includeAnswers ? (Array.isArray(q.answer) ? q.answer.join(', ') : q.answer) : ''
    const explanation = includeAnswers ? (q.explanation || '') : ''

    rows.push([
      String(idx + 1),
      q.type.replace(/_/g, ' '),
      q.difficulty || '',
      q.content,
      options,
      ...(includeAnswers ? [answer, explanation] : []),
    ])
  })

  // Convert to CSV
  const csvContent = rows
    .map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = String(cell).replace(/"/g, '""')
        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
      }).join(',')
    )
    .join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${sanitizeFilename(quiz.title)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export quiz to plain text file (fallback for DOCX)
 */
export function exportToText(quiz: QuizData, includeAnswers: boolean, includeWatermark = false) {
  let content = ''
  if (includeWatermark) {
    content += `Exported by: Prashn - https://prashn.swastify.life\n\n`
  }
  content += `${quiz.title}\n${'='.repeat(quiz.title.length)}\n\n`
  
  if (quiz.description) {
    content += `${quiz.description}\n\n`
  }
  
  content += `Total Questions: ${quiz.questions.length}\n`
  content += `Generated: ${new Date().toLocaleDateString()}\n\n`
  content += `${'-'.repeat(60)}\n\n`

  quiz.questions.forEach((q, idx) => {
    content += `Question ${idx + 1}\n`
    content += `Type: ${q.type.replace(/_/g, ' ')}`
    if (q.difficulty) {
      content += ` | Difficulty: ${q.difficulty}`
    }
    content += '\n\n'
    content += `${q.content}\n\n`

    if (q.options?.length) {
      q.options.forEach((opt, oi) => {
        content += `  ${String.fromCharCode(65 + oi)}. ${opt}\n`
      })
      content += '\n'
    }

    if (includeAnswers) {
      const answer = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer
      content += `✓ Answer: ${answer}\n`
      if (q.explanation) {
        content += `  Explanation: ${q.explanation}\n`
      }
      content += '\n'
    }

    content += `${'-'.repeat(60)}\n\n`
  })

  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${sanitizeFilename(quiz.title)}.txt`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Sanitize filename to remove invalid characters
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-\s]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100) || 'quiz'
}

/**
 * Main export function that routes to the appropriate export method
 */
export function exportQuiz(
  quiz: QuizData,
  format: 'pdf' | 'excel' | 'docx' | 'text',
  includeAnswers: boolean,
  includeWatermark = false
) {
  switch (format) {
    case 'pdf':
      return exportToPDF(quiz, includeAnswers, includeWatermark)
    case 'excel':
      return exportToExcel(quiz, includeAnswers, includeWatermark)
    case 'text':
    case 'docx':
      // For now, use text format as DOCX fallback
      // Can be enhanced later with docx library
      return exportToText(quiz, includeAnswers, includeWatermark)
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}
