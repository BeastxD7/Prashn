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
export async function exportToPDF(quiz: QuizData, includeAnswers: boolean, includeWatermark = true) {
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
              <span class="question-number">Question ${idx + 1}</span>
              <span class="question-badges">${q.type.replace(/_/g, ' ').toUpperCase()} ${q.difficulty ? `| ${q.difficulty.toUpperCase()}` : ''}</span>
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
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #000;
            background: #fff;
            padding: 30px;
            margin: 0;
          }
          .header {
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .header .description {
            font-size: 12px;
            color: #555;
            margin: 0 0 10px 0;
          }
          .header .meta {
            font-size: 11px;
            color: #666;
          }
          .question-card {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .question-header {
            margin-bottom: 10px;
          }
          .question-number {
            font-weight: bold;
            font-size: 14px;
            display: inline-block;
          }
          .question-badges {
            float: right;
            font-size: 10px;
            text-transform: uppercase;
          }
          .question-content {
            margin: 10px 0;
            font-size: 13px;
          }
          .options-list {
            margin: 10px 0;
            padding-left: 0;
            list-style: none;
          }
          .options-list li {
            margin: 6px 0;
            font-size: 12px;
            padding-left: 5px;
          }
          .answer-box {
            margin-top: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-left: 3px solid #666;
            font-size: 12px;
          }
          .answer-box .answer-text {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 60px;
            color: #f0f0f0;
            opacity: 0.3;
            font-weight: bold;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        ${includeWatermark ? `<div class="watermark">PRASHN</div>` : ''}
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
    const footer = doc.querySelector('.footer')

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const usableWidth = pdfWidth - (margin * 2)
    let currentY = margin

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

    // Add each question card
    for (let i = 0; i < questionCards.length; i++) {
      const card = questionCards[i] as HTMLElement
      const cardCanvas = await html2canvas(card, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: 800 
      })
      const cardImgData = cardCanvas.toDataURL('image/png')
      const cardHeight = (cardCanvas.height * usableWidth) / cardCanvas.width

      // Check if card fits on current page, if not add new page
      if (currentY + cardHeight > pdfHeight - margin - 15) {
        pdf.addPage()
        currentY = margin
      }

      pdf.addImage(cardImgData, 'PNG', margin, currentY, usableWidth, cardHeight)
      currentY += cardHeight + 4 // small gap between questions
    }

    // Add footer on last page
    if (footer && includeWatermark) {
      const footerCanvas = await html2canvas(footer as HTMLElement, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        width: 800 
      })
      const footerImgData = footerCanvas.toDataURL('image/png')
      const footerHeight = (footerCanvas.height * usableWidth) / footerCanvas.width
      
      // Check if footer fits, if not add new page
      if (currentY + footerHeight > pdfHeight - margin) {
        pdf.addPage()
        currentY = margin
      }
      
      pdf.addImage(footerImgData, 'PNG', margin, currentY, usableWidth, footerHeight)
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
export function exportToExcel(quiz: QuizData, includeAnswers: boolean, includeWatermark = true) {
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
export function exportToText(quiz: QuizData, includeAnswers: boolean, includeWatermark = true) {
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
  includeWatermark = true
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
