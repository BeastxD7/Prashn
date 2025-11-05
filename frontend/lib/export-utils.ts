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

/**
 * Export quiz to PDF using browser's print functionality
 */
export function exportToPDF(quiz: QuizData, includeAnswers: boolean, includeWatermark = true) {
  // Create a new window with formatted content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.')
  }

  const questionsHTML = quiz.questions
    .map((q, idx) => {
      const optionsHTML = q.options?.length
        ? `<ul style="margin: 8px 0; padding-left: 20px;">
            ${q.options.map((opt, oi) => `<li style="margin: 4px 0;">${String.fromCharCode(65 + oi)}. ${opt}</li>`).join('')}
           </ul>`
        : ''

      const answerHTML = includeAnswers
        ? `<div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-left: 3px solid #0ea5e9;">
             <strong>Answer:</strong> ${Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
             ${q.explanation ? `<br/><strong>Explanation:</strong> ${q.explanation}` : ''}
           </div>`
        : ''

      return `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #334155;">Question ${idx + 1}</strong>
            <div style="display: flex; gap: 8px;">
              <span style="padding: 2px 8px; background: #e0e7ff; border-radius: 4px; font-size: 11px; text-transform: uppercase;">${q.type.replace(/_/g, ' ')}</span>
              ${q.difficulty ? `<span style="padding: 2px 8px; background: #fef3c7; border-radius: 4px; font-size: 11px;">${q.difficulty}</span>` : ''}
            </div>
          </div>
          <p style="margin: 12px 0; color: #1e293b;">${q.content}</p>
          ${optionsHTML}
          ${answerHTML}
        </div>
      `
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${quiz.title}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          /* Watermark layer placed beneath content */
          .watermark {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            opacity: 0.06;
            z-index: 0;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 48px;
            color: #94a3b8;
          }
          .content { position: relative; z-index: 1; }
        </style>
      </head>
      <body>
        ${includeWatermark ? `
        <div class="watermark">
          <img src="/logo.svg" alt="logo" style="width:120px;height:120px;object-fit:contain;opacity:0.9;" />
          <div>Created by Prashn — prashn.swastify.life</div>
        </div>
        ` : ''}
        <div class="content" style="margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
          <h1 style="margin: 0 0 8px 0; color: #0f172a; font-size: 28px;">${quiz.title}</h1>
          ${quiz.description ? `<p style="margin: 0; color: #64748b;">${quiz.description}</p>` : ''}
          <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">
            Total Questions: ${quiz.questions.length} | Generated on ${new Date().toLocaleDateString()}
          </p>
        </div>
        ${questionsHTML}
        ${includeWatermark ? `
        <div class="content" style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
          Exported by Prashn — https://prashn.swastify.life
        </div>
        ` : ''}
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  
  // Small delay to ensure content is loaded before triggering print
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

/**
 * Export quiz to Excel (CSV format for broad compatibility)
 */
export function exportToExcel(quiz: QuizData, includeAnswers: boolean, includeWatermark = true) {
  const rows: string[][] = [
    ...(includeWatermark ? [['Exported by:', 'Prashn'], ['URL:', 'https://prashn.swastify.life'], []] : []),
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
