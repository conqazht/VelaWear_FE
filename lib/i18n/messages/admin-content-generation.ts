export const adminContentGenerationMessages = {
  en: {
    "admin.contentGeneration.action.generate": "Generate English content",
    "admin.contentGeneration.action.pending": "Generating English...",
    "admin.contentGeneration.model.label": "Gemini model",
    "admin.contentGeneration.model.flashLite.label": "Gemini 3.1 Flash-Lite · Economical",
    "admin.contentGeneration.model.flashLite.description":
      "Fast and economical. Recommended for routine catalog content and bulk entry.",
    "admin.contentGeneration.model.flash.label": "Gemini 3.5 Flash · Balanced",
    "admin.contentGeneration.model.flash.description":
      "Balances response quality, speed, and cost for richer descriptions.",
    "admin.contentGeneration.model.proPreview.label": "Gemini 3.1 Pro Preview · High quality",
    "admin.contentGeneration.model.proPreview.description":
      "Prioritizes writing quality for important content and complex descriptions.",
    "admin.contentGeneration.model.previewWarning":
      "Preview models may change without long-term stability and can cost more. Review the result carefully.",
    "admin.contentGeneration.sourceRequired":
      "Enter the Vietnamese name before generating English content.",
    "admin.contentGeneration.reviewNotice":
      "The suggestion only fills this form. Review it and use Save to persist it.",
    "admin.contentGeneration.confirm.title": "Replace the current English content?",
    "admin.contentGeneration.confirm.description":
      "Generating again will replace every English field currently in this form. Vietnamese content is not affected.",
    "admin.contentGeneration.confirm.cancel": "Keep current content",
    "admin.contentGeneration.confirm.action": "Replace and generate",
    "admin.contentGeneration.success": "English content was generated. Review it before saving.",
    "admin.contentGeneration.failed":
      "Unable to generate English content. The backend API key may be unavailable; your current content was kept and manual entry still works.",
    "admin.contentGeneration.invalidResponse":
      "The generated English name is invalid. Your current content was kept.",
  },
  vi: {
    "admin.contentGeneration.action.generate": "Tạo nội dung English",
    "admin.contentGeneration.action.pending": "Đang tạo nội dung English...",
    "admin.contentGeneration.model.label": "Mô hình Gemini",
    "admin.contentGeneration.model.flashLite.label": "Gemini 3.1 Flash-Lite · Tiết kiệm",
    "admin.contentGeneration.model.flashLite.description":
      "Nhanh và tiết kiệm. Khuyên dùng cho nội dung catalog thông thường hoặc nhập số lượng lớn.",
    "admin.contentGeneration.model.flash.label": "Gemini 3.5 Flash · Cân bằng",
    "admin.contentGeneration.model.flash.description":
      "Cân bằng chất lượng, tốc độ và chi phí cho các mô tả nhiều nội dung hơn.",
    "admin.contentGeneration.model.proPreview.label": "Gemini 3.1 Pro Preview · Chất lượng cao",
    "admin.contentGeneration.model.proPreview.description":
      "Ưu tiên chất lượng câu chữ cho nội dung quan trọng và mô tả phức tạp.",
    "admin.contentGeneration.model.previewWarning":
      "Model Preview có thể thay đổi, chưa đảm bảo ổn định lâu dài và có thể tốn chi phí hơn. Hãy kiểm tra kỹ kết quả.",
    "admin.contentGeneration.sourceRequired": "Nhập tên tiếng Việt trước khi tạo nội dung English.",
    "admin.contentGeneration.reviewNotice":
      "Gợi ý chỉ được điền vào form, chưa tự lưu. Hãy kiểm tra rồi bấm Lưu.",
    "admin.contentGeneration.confirm.title": "Thay nội dung English hiện tại?",
    "admin.contentGeneration.confirm.description":
      "Tạo lại sẽ thay toàn bộ trường English đang có trong form. Nội dung tiếng Việt không bị ảnh hưởng.",
    "admin.contentGeneration.confirm.cancel": "Giữ nội dung hiện tại",
    "admin.contentGeneration.confirm.action": "Thay và tạo lại",
    "admin.contentGeneration.success": "Đã tạo nội dung English. Hãy kiểm tra trước khi lưu.",
    "admin.contentGeneration.failed":
      "Không thể tạo nội dung English. Backend có thể chưa cấu hình API key; nội dung hiện tại vẫn được giữ và bạn vẫn có thể nhập thủ công.",
    "admin.contentGeneration.invalidResponse":
      "Tên English được tạo không hợp lệ. Nội dung hiện tại vẫn được giữ.",
  },
} as const;
