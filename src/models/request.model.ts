import { model, Schema, models } from "mongoose";
import { User } from "./user.model";
import { Batch } from "./batch.model";
export interface Request {
  sentBy: User;
  batch: Batch;
  status: string;
}
const requestSchema = new Schema<Request>({
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: "Batch",
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

const Request = models.Request || model("Request", requestSchema);

export default Request;
