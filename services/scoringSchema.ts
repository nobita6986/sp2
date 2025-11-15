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
        { "id": "intent_match", "label": "Intent match", "max_score": 10 },
        { "id": "topic_specificity", "label": "Topic specificity", "max_score": 5 }
      ]
    },
    {
      "id": "keyword_targeting",
      "label": "Keyword Targeting & Coverage",
      "max_score": 15,
      "subcriteria": [
        { "id": "main_keyword_presence", "label": "Main keyword presence", "max_score": 5 },
        { "id": "longtail_coverage", "label": "Long-tail coverage", "max_score": 5 },
        { "id": "no_keyword_stuffing", "label": "No keyword stuffing", "max_score": 5 }
      ]
    },
    {
      "id": "title_optimization",
      "label": "Title Optimization",
      "max_score": 20,
      "subcriteria": [
        { "id": "title_length", "label": "Title length", "max_score": 4 },
        { "id": "title_keyword_position", "label": "Keyword placement in title", "max_score": 6 },
        { "id": "title_clarity", "label": "Title clarity", "max_score": 5 },
        { "id": "title_clickbait_penalty", "label": "Clickbait penalty", "max_score": -5, "min_score": -5 }
      ]
    },
    {
      "id": "description_optimization",
      "label": "Description Optimization",
      "max_score": 20,
      "subcriteria": [
        { "id": "desc_hook", "label": "First 150 chars hook", "max_score": 5 },
        { "id": "desc_keyword_usage", "label": "Keyword usage in description", "max_score": 5 },
        { "id": "desc_detail_level", "label": "Detail level", "max_score": 5 },
        { "id": "desc_structure", "label": "Structure & formatting", "max_score": 5 }
      ]
    },
    {
      "id": "hashtags_tags",
      "label": "Hashtags & Tags",
      "max_score": 10,
      "subcriteria": [
        { "id": "hashtag_count", "label": "Hashtag count", "max_score": 3 },
        { "id": "hashtag_relevance", "label": "Hashtag relevance", "max_score": 4 },
        { "id": "tag_usage", "label": "Tag usage", "max_score": 3 }
      ]
    },
    {
      "id": "structure_accessibility",
      "label": "Structure & Accessibility",
      "max_score": 10,
      "subcriteria": [
        { "id": "language_meta", "label": "Language & metadata", "max_score": 3 },
        { "id": "captions", "label": "Subtitles / Captions", "max_score": 4 },
        { "id": "chapters", "label": "Chapters", "max_score": 3 }
      ]
    },
    {
      "id": "channel_context_fit",
      "label": "Channel & Context Fit",
      "max_score": 15,
      "subcriteria": [
        { "id": "channel_topic_fit", "label": "Channel topic fit", "max_score": 7 },
        { "id": "playlist_series", "label": "Playlist / series usage", "max_score": 5 },
        { "id": "internal_linking", "label": "Internal linking", "max_score": 3 }
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
