import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import {
  NotificationPreference,
  NotificationPreferenceDocument,
} from '../schemas/preference.schema';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreference.name)
    private readonly preferenceModel: Model<NotificationPreferenceDocument>,
  ) {}

  async create(data: Partial<Notification>): Promise<NotificationDocument> {
    return this.notificationModel.create(data);
  }

  async findByUser(
    userId: string,
    limit = 50,
  ): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      readAt: null,
    });
  }

  async markRead(
    id: string,
    userId: string,
  ): Promise<NotificationDocument | null> {
    return this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { readAt: new Date() },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), readAt: null },
      { readAt: new Date() },
    );
    return result.modifiedCount;
  }

  async setEmailSent(id: string): Promise<void> {
    await this.notificationModel
      .updateOne({ _id: id }, { emailSent: true })
      .exec();
  }

  async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferenceDocument> {
    let pref = await this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    if (!pref) {
      pref = await this.preferenceModel.create({
        userId: new Types.ObjectId(userId),
      });
    }
    return pref;
  }

  async updatePreferences(
    userId: string,
    update: Partial<NotificationPreference>,
  ): Promise<NotificationPreferenceDocument> {
    const pref = await this.preferenceModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        update,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .exec();
    return pref!;
  }
}
