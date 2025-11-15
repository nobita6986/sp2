import type { VideoData, AnalysisResult } from './types';

export const initialVideoData: VideoData = {
  title: "",
  description: "",
  tags: "",
  transcript: "",
  youtubeLink: "",
};

export const placeholderVideoData: VideoData = {
  title: "Mauna Loa Awakens: The Island's Breath Holding Moment",
  description: "Subscribe for more powerful stories of human resilience and the planet's wonders, and share your thoughts on Mauna Loa's incredible awakening in the comments below!\n\n#MaunaLoa #VolcanoAwakens #Hawaii #EarthPower #Resilience",
  tags: "Mauna Loa Eruption,Hawaii Volcano,Volcano Documentary,Lava Flow",
  transcript: "00:00:15,900 --> 00:00:18,066\nDON'T LOOK BACK OR YOU'LL PASS THROUGH THE BLIND\n\n00:00:18,066 --> 00:00:20,966\nTHE SOUND OF WATER",
  youtubeLink: "https://www.youtube.com/watch?v=FAU4s3wDsoI",
};


// The initialAnalysisResult is commented out as its structure is deprecated 
// and doesn't match the new V2 analysis schema.
/*
export const initialAnalysisResult: AnalysisResult = {
  scores: {
    compliance: { score: 95, explanation: "Nội dung hầu như an toàn, chỉ có một vài từ ngữ nhạy cảm nhẹ có thể được xem xét." },
    thumbnail: { score: 78, explanation: "Độ tương phản tốt và chủ thể rõ ràng, nhưng văn bản có thể khó đọc trên màn hình nhỏ." },
    title: { score: 84, explanation: "Tiêu đề hấp dẫn nhưng hơi dài. Cân nhắc rút ngắn để hiển thị tốt hơn trên các thiết bị." },
    description: { score: 81, explanation: "Mô tả có chứa các hashtag và lời kêu gọi hành động, nhưng thiếu dấu thời gian (chapters) và cấu trúc chưa tối ưu." },
    seoOpportunity: { score: 73, explanation: "Cơ hội SEO tốt với một vài từ khóa được nhắm đến, nhưng có thể cải thiện bằng cách sử dụng các từ khóa đuôi dài." },
  },
  issues: [
    {
      ruleId: "ads-sensitive-language",
      severity: "low",
      evidence: "Cụm từ 'Breath Holding Moment' có thể bị hiểu nhầm.",
      fix: "Đề xuất thay bằng 'A Spectacle of Nature's Power'."
    }
  ],
  recommendations: {
    titles: [
      "Mauna Loa Volcano Erupts: Hawaii's Fiery Awakening",
      "Mauna Loa's Eruption: A Story of Earth's Raw Power",
      "Inside Hawaii's Volcano: The Mauna Loa Eruption Explained"
    ],
    description: "Witness the awe-inspiring power of Mauna Loa as it awakens, a profound story of Earth's raw fury and enduring human spirit. This documentary takes you to Hawaii, where ancient legends intertwine with modern science.\n\nTIMESTAMP\n00:00 - The First Tremors\n02:35 - A River of Fire\n05:10 - The Human Response\n08:00 - Nature's Renewal\n\nSubscribe for more stories on our planet's wonders! #MaunaLoa #Volcano #Hawaii",
    hashtags: [ "#VolcanoEruption", "#NatureDocumentary", "#BigIsland", "#LavaFlow", "#EarthScience" ],
    keywords: [
      { phrase: "mauna loa eruption 2025", intent: "informational", difficulty: "medium" },
      { phrase: "how does a volcano erupt", intent: "how-to", difficulty: "low" },
      { phrase: "hawaii volcano documentary", intent: "entertainment", difficulty: "medium" }
    ],
    thumbnailVariants: [
      { id: "t1", rationale: "Tăng độ tương phản và giảm số từ xuống dưới 4." },
      { id: "t2", rationale: "Tập trung vào cảm xúc của khuôn mặt (nếu có)." }
    ]
  },
};
*/
