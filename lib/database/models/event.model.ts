import { model, models, Schema, Document } from "mongoose";

export interface IEvent extends Document {
    _id: string;
    title: string;
    description?: string;
    location?: string;
    createdAt: Date;
    imageURL: string;
    startDatetime: Date;
    endDatetime: Date;
    price?: string;
    isFree: boolean;
    url?: string;
    category: { _id: string; name: string };
    organizer: { _id: string; firstName: string; lastName: string };
}

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now },
    imageURL: { type: String, required: true },
    startDatetime: { type: Date, default: Date.now },
    endDatetime: { type: Date, default: Date.now },
    price: { type: String },
    isFree: { type: Boolean, default: false },
    url: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
