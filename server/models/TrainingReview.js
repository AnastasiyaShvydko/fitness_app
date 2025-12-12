// models/training-review.model.ts
import mongoose, { Schema } from "mongoose";

const TrainingReviewSchema = new Schema({
  trainingId:   { type: String, required: true, index: true },
  userId:       { type: String, required: true },              // если ревью за конкретное занятие
  instructorId: { type: String },
  rating:       { type: Number, min: 1, max: 5, required: true },
  title:        { type: String, default: "" },
  body:         { type: String, required: true },
}, { timestamps: true, versionKey: false });

// Один отзыв на пользователя за тренировку (или за сессию, если нужно)
TrainingReviewSchema.index({ userId: 1, trainingId: 1 }, { unique: true });
// Альтернатива — уникальность по training+user+sessionDate:
// TrainingReviewSchema.index({ userId: 1, trainingId: 1, sessionDate: 1 }, { unique: true });

TrainingReviewSchema.index({ trainingId: 1, createdAt: -1 });

export const TrainingReviewModel = mongoose.model("TrainingReview", TrainingReviewSchema);
