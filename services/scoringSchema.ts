export const scoringSchema = {
  "version": "2.0.0",
  "name": "clearcue_seo_clip_score_v2",
  "description": "Schema scoring SEO cho 1 clip YouTube — hỗ trợ auto / semi-auto / manual scoring, clamp, và threshold grade rõ ràng.",
  "total_max_score": 100,
  "grading_thresholds": {
    "excellent": { "min_percent": 90 },
    "very_good": { "min_percent": 80 },
    "good": { "min_percent": 70 },
    "average": { "min_percent": 55 },
    "poor": { "min_percent": 0 }
  },
  "categories": [
    {
      "id": "search_intent_fit",
      "label": "Search Intent Fit",
      "description": "Đánh giá mức độ phù hợp giữa intent tìm kiếm và nội dung video/metadata.",
      "max_score": 15,
      "subcriteria": [
        {
          "id": "intent_match",
          "label": "Intent match",
          "description": "Khớp intent (how-to/info/review/entertainment...) giữa keyword, title và 150 ký tự đầu mô tả.",
          "max_score": 10,
          "scoring_bins": [
            { "condition": "High confidence match (>=0.85) and label agrees across title+desc+keyword", "score_range": [8, 10] },
            { "condition": "Moderate match (0.6-0.85) or partial mismatch", "score_range": [4, 7] },
            { "condition": "Low match (<0.6) or clear mismatch", "score_range": [0, 3] }
          ]
        },
        {
          "id": "topic_specificity",
          "label": "Topic specificity",
          "description": "Mức độ cụ thể (có số, đối tượng, phạm vi, bối cảnh...).",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Rất cụ thể (có số, thời gian, đối tượng)", "score_range": [4, 5] },
            { "condition": "Cụ thể vừa đủ", "score_range": [3, 3] },
            { "condition": "Rất chung", "score_range": [0, 2] }
          ]
        }
      ]
    },
    {
      "id": "keyword_targeting",
      "label": "Keyword Targeting & Coverage",
      "description": "Sử dụng main keyword và long-tail trong title, description, tags/hashtags.",
      "max_score": 15,
      "subcriteria": [
        {
          "id": "main_keyword_presence",
          "label": "Main keyword presence",
          "description": "Main keyword xuất hiện ở title + 150 ký tự đầu description + tags/hashtags tối thiểu 1 nơi trong 3.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Có ở title + desc-first-150 + tags", "score_range": [5, 5] },
            { "condition": "Có ở 1 hoặc 2 trong 3 vị trí", "score_range": [1, 4] },
            { "condition": "Không có", "score_range": [0, 0] }
          ]
        },
        {
          "id": "longtail_coverage",
          "label": "Long-tail coverage",
          "description": "Có ít nhất 1–3 long-tail phù hợp với ngữ cảnh.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Main + >=2 relevant long-tails", "score_range": [5, 5] },
            { "condition": "Main + 1 long-tail", "score_range": [3, 4] },
            { "condition": "Chỉ main generic", "score_range": [0, 2] }
          ]
        },
        {
          "id": "no_keyword_stuffing",
          "label": "No keyword stuffing",
          "description": "Kiểm tra mật độ keyword bất thường, tính tự nhiên của câu.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Không nhồi, câu tự nhiên", "score_range": [4, 5] },
            { "condition": "Có lặp nhẹ nhưng vẫn đọc được", "score_range": [3, 3] },
            { "condition": "Nhồi từ khoá, câu khó đọc", "score_range": [0, 2] }
          ]
        }
      ]
    },
    {
      "id": "title_optimization",
      "label": "Title Optimization",
      "description": "Độ dài, rõ ràng, keyword placement và clickbait penalty.",
      "max_score": 20,
      "subcriteria": [
        {
          "id": "title_length",
          "label": "Title length",
          "description": "Độ dài tiêu đề theo ký tự; vùng tối ưu 35–70 ký tự.",
          "max_score": 4,
          "scoring_bins": [
            { "condition": "35–70 chars", "score_range": [4, 4] },
            { "condition": "15–34 or 71–85 chars", "score_range": [2, 3] },
            { "condition": "<15 or >85", "score_range": [0, 1] }
          ]
        },
        {
          "id": "title_keyword_position",
          "label": "Keyword placement in title",
          "description": "Main keyword có ở nửa đầu title hay không.",
          "max_score": 6,
          "scoring_bins": [
            { "condition": "Keyword in first half", "score_range": [5, 6] },
            { "condition": "Keyword present but in second half", "score_range": [2, 4] },
            { "condition": "No keyword", "score_range": [0, 0] }
          ]
        },
        {
          "id": "title_clarity",
          "label": "Title clarity",
          "description": "Rõ ràng, nêu được lợi ích/kết quả mong đợi.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Rõ + nêu lợi ích", "score_range": [5, 5] },
            { "condition": "Khá rõ", "score_range": [3, 4] },
            { "condition": "Mơ hồ hoặc clickbait", "score_range": [0, 2] }
          ]
        },
        {
          "id": "title_clickbait_penalty",
          "label": "Clickbait penalty",
          "description": "Penalty nếu title quá overpromise so với mô tả/nội dung.",
          "max_score": -5,
          "min_score": -5,
          "scoring_bins": [
            { "condition": "No clickbait signs", "score_range": [0, 0] },
            { "condition": "Mild overpromise (1-2 phrases)", "score_range": [-3, -1] },
            { "condition": "Clear false promise / sensational claim", "score_range": [-5, -4] }
          ]
        }
      ]
    },
    {
      "id": "description_optimization",
      "label": "Description Optimization",
      "description": "Hook đầu, keyword distribution, detail level, structure (timestamps / CTA).",
      "max_score": 20,
      "subcriteria": [
        {
          "id": "desc_hook",
          "label": "First 150 chars hook",
          "description": "150 ký tự đầu có tóm tắt chủ đề + lợi ích/đối tượng hay không.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Clear summary + benefit + target", "score_range": [4, 5] },
            { "condition": "Summary but no target or benefit", "score_range": [2, 3] },
            { "condition": "Chỉ links/emoji or empty", "score_range": [0, 1] }
          ]
        },
        {
          "id": "desc_keyword_usage",
          "label": "Keyword usage in description",
          "description": "Main keyword + long-tail xuất hiện tự nhiên trong 2–3 câu đầu.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Main + >=1 long-tail in first 3 sentences", "score_range": [4, 5] },
            { "condition": "Only main keyword", "score_range": [1, 3] },
            { "condition": "No main keyword", "score_range": [0, 0] }
          ]
        },
        {
          "id": "desc_detail_level",
          "label": "Detail level",
          "description": "Mô tả giải thích nội dung, đối tượng, cấu trúc video.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Rõ ràng: nêu phần A/B/C, đối tượng, lợi ích", "score_range": [5, 5] },
            { "condition": "Có thêm thông tin nhưng sơ sài", "score_range": [3, 4] },
            { "condition": "Quá ngắn hoặc lặp title", "score_range": [0, 2] }
          ]
        },
        {
          "id": "desc_structure",
          "label": "Structure & formatting",
          "description": "Downlines, bullets, CTA, timestamps if long video.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "Good structure + timestamps if video_length>=600s", "score_range": [4, 5] },
            { "condition": "Some structure (downlines/CTA) but no timestamps for long vids", "score_range": [2, 3] },
            { "condition": "1 block text no CTA", "score_range": [0, 1] }
          ]
        }
      ]
    },
    {
      "id": "hashtags_tags",
      "label": "Hashtags & Tags",
      "description": "Số lượng, liên quan, đa dạng và tránh duplicate spam.",
      "max_score": 10,
      "subcriteria": [
        {
          "id": "hashtag_count",
          "label": "Hashtag count",
          "description": "Số lượng hashtag (khuyến nghị 1–15).",
          "max_score": 3,
          "scoring_bins": [
            { "condition": "6–15 hashtags", "score_range": [3, 3] },
            { "condition": "1–5 hashtags", "score_range": [2, 2] },
            { "condition": "0 or >20", "score_range": [0, 0] }
          ]
        },
        {
          "id": "hashtag_relevance",
          "label": "Hashtag relevance",
          "description": "Độ liên quan giữa hashtag và chủ đề chính.",
          "max_score": 4,
          "scoring_bins": [
            { "condition": ">=80% relevant", "score_range": [3, 4] },
            { "condition": "50–80% relevant", "score_range": [2, 2] },
            { "condition": "<50% relevant", "score_range": [0, 1] }
          ]
        },
        {
          "id": "tag_usage",
          "label": "Tag usage",
          "description": "Có main keyword trong tags và 3–10 tag liên quan; kiểm tra duplicate/variations.",
          "max_score": 3,
          "scoring_bins": [
            { "condition": "Main keyword present + 3–10 distinct relevant tags", "score_range": [3, 3] },
            { "condition": "1–2 tags only or duplicates", "score_range": [1, 2] },
            { "condition": "No tags or all generic", "score_range": [0, 0] }
          ]
        }
      ]
    },
    {
      "id": "structure_accessibility",
      "label": "Structure & Accessibility",
      "description": "Ngôn ngữ/meta, captions, chapters giúp tiếp cận và hiểu nội dung.",
      "max_score": 10,
      "subcriteria": [
        {
          "id": "language_meta",
          "label": "Language & metadata",
          "description": "Language, region, category set phù hợp.",
          "max_score": 3,
          "scoring_bins": [
            { "condition": "Language/region/category match content", "score_range": [2, 3] },
            { "condition": "Minor mismatch (e.g., category generic)", "score_range": [1, 1] },
            { "condition": "Wrong or default values", "score_range": [0, 0] }
          ]
        },
        {
          "id": "captions",
          "label": "Subtitles / Captions",
          "description": "Có phụ đề chính xác (khuyến nghị edited captions).",
          "max_score": 4,
          "scoring_bins": [
            { "condition": "Edited captions available", "score_range": [4, 4] },
            { "condition": "Auto-caption present but unedited", "score_range": [2, 3] },
            { "condition": "No captions but video ít lời", "score_range": [1, 1] },
            { "condition": "No captions but video nói nhiều", "score_range": [0, 0] }
          ]
        },
        {
          "id": "chapters",
          "label": "Chapters",
          "description": "Chapters (timestamps) cho video dài >=10 phút.",
          "max_score": 3,
          "scoring_bins": [
            { "condition": "Video length >=600s and chapters exist & aligned", "score_range": [2, 3] },
            { "condition": "Video long but chapters absent", "score_range": [0, 1] },
            { "condition": "Video short (<600s), chapters not required", "score_range": [0, 0] }
          ]
        }
      ]
    },
    {
      "id": "channel_context_fit",
      "label": "Channel & Context Fit",
      "description": "Mức độ phù hợp của clip với chủ đề kênh, playlist, internal linking.",
      "max_score": 15,
      "subcriteria": [
        {
          "id": "channel_topic_fit",
          "label": "Channel topic fit",
          "description": "Chủ đề clip nằm trong hệ chủ đề chính của kênh (similarity to top-performing topics).",
          "max_score": 7,
          "scoring_bins": [
            { "condition": "High similarity to top channel themes", "score_range": [5, 7] },
            { "condition": "Moderate similarity", "score_range": [3, 4] },
            { "condition": "Off-topic", "score_range": [0, 2] }
          ]
        },
        {
          "id": "playlist_series",
          "label": "Playlist / series usage",
          "description": "Video có gán playlist/series hợp lý để tăng session watchtime.",
          "max_score": 5,
          "scoring_bins": [
            { "condition": "In a well-named thematic playlist/series", "score_range": [4, 5] },
            { "condition": "In a general playlist", "score_range": [2, 3] },
            { "condition": "Not in any playlist", "score_range": [0, 0] }
          ]
        },
        {
          "id": "internal_linking",
          "label": "Internal linking",
          "description": "Số link nội bộ trong mô tả/pinned comment (1–3 recommended).",
          "max_score": 3,
          "scoring_bins": [
            { "condition": ">=2 relevant internal links", "score_range": [2, 3] },
            { "condition": "1 internal link", "score_range": [1, 1] },
            { "condition": "0 internal link", "score_range": [0, 0] }
          ]
        }
      ]
    }
  ]
};

export const outputExample = {
  "total_score": {
    "value": 88,
    "max": 100,
    "percent": 88,
    "grade": "very_good",
    "summary": "Clip được tối ưu SEO rất tốt; còn 1–2 chỗ có thể tăng cụ thể và cải thiện captions / tags."
  },
  "categories": [
    {
      "id": "search_intent_fit",
      "label": "Search Intent Fit",
      "score": {
        "value": 14,
        "max": 15,
        "percent_of_category": 93.3
      },
      "summary": "Intent khớp mạnh giữa keyword, title và phần đầu mô tả.",
      "subcriteria": [
        {
          "id": "intent_match",
          "label": "Intent match",
          "score": {
            "value": 9,
            "max": 10
          },
          "explanation": "Title và 150 ký tự đầu mô tả thể hiện rõ intent 'how_to' / 'tutorial'.",
          "suggestions": []
        },
        {
          "id": "topic_specificity",
          "label": "Topic specificity",
          "score": {
            "value": 5,
            "max": 5
          },
          "explanation": "Chủ đề có phạm vi/đối tượng rõ (có bối cảnh và mục tiêu).",
          "suggestions": [
            "Nếu muốn tăng 1 điểm: thêm con số cụ thể (ví dụ: '3 bước', 'trong 7 ngày')."
          ]
        }
      ]
    }
  ],
  "recommendations": {
    "priority_order": [
      "description_optimization (add timestamps, structure)",
      "captions (edit auto-captions)",
      "tag_usage (add main kw + long-tail)"
    ],
    "quick_wins": [
      "Thêm 1–2 hashtag chứa main keyword.",
      "Chỉnh sửa auto-caption để giảm lỗi nhận dạng.",
      "Thêm 3–5 tag ẩn (main + long-tail)."
    ],
    "by_category": {
      "title_optimization": [
        "Giữ keyword ở nửa đầu, rút gọn cụm phụ phía sau để giảm cảm giác clickbait.",
        "Nếu phù hợp, thêm con số/thời gian cụ thể."
      ]
    }
  }
};